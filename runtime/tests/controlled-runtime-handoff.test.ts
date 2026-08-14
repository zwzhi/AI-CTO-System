import test from 'node:test';
import assert from 'node:assert/strict';

import {
  HandoffError,
  type ControlledRuntimeHandoffRequest,
  type HandoffRouterPort,
  type HandoffRuntimePort,
} from '../integration/intent-runtime-handoff-contract.ts';
import type { TaskExecutionEnvelope } from '../task/task-execution-envelope-contract.ts';
import { validateAndFreezeHandoffRequest } from '../integration/intent-runtime-handoff-validation.ts';
import { ControlledRuntimeHandoffService } from '../integration/controlled-runtime-handoff-service.ts';
import { AuditService } from '../audit/audit-service.ts';
import { InMemoryAuditRepository } from '../audit/in-memory-audit-repository.ts';
import { InMemoryExecutionRepository } from '../audit/in-memory-execution-repository.ts';
import { MockCapabilityAdapter } from '../capability/mock-capability-adapter.ts';
import { PermissionBudgetGuard } from '../permission/permission-budget-guard.ts';
import { AdvisoryExecutionRouter } from '../routing/advisory-execution-router.ts';
import type {
  RoutingRecommendation,
  RoutingRequest,
} from '../routing/execution-routing-contract.ts';
import {
  RuntimeFoundationService,
  type RuntimeRunResult,
} from '../services/runtime-foundation-service.ts';
import { InMemoryTaskRepository } from '../task/in-memory-task-repository.ts';
import { TaskService } from '../task/task-service.ts';
import { InMemoryWorkflowRepository } from '../workflow/in-memory-workflow-repository.ts';
import { WorkflowService, type CreateWorkflowInput } from '../workflow/workflow-service.ts';
import type { RunOptions } from '../services/runtime-foundation-service.ts';
import type { TaskInput } from '../models/runtime-types.ts';

const NOW = '2026-08-06T00:00:00.000Z';

function validHandoffRequest(): ControlledRuntimeHandoffRequest {
  return {
    intentResult: {
      schemaVersion: '1.0',
      classificationId: 'intent-001',
      status: 'CLASSIFIED',
      intentType: 'FEATURE_REQUEST',
      confidence: 'L3',
      complexity: 'L1',
      taskKind: 'DOCUMENTATION',
      riskLevel: 'LOW',
      reversibility: 'REVERSIBLE',
      hasApplicableGate: false,
      requiresCurrentEvidence: false,
      suggestedWorkflow: 'ENGINEERING',
      requiredCapabilityRefs: ['documentation'],
      taskObjective: 'Create a traceable documentation update plan.',
      evidenceInputs: [{
        evidenceRef: 'evidence-input-001',
        scopeRefs: ['docs/guide.md'],
        fingerprint: { method: 'CONTENT_HASH', value: 'sha256:abc' },
        observedAt: NOW,
      }],
      evidenceObservations: [{
        evidenceRef: 'evidence-input-001',
        scopeRefs: ['docs/guide.md'],
        fingerprint: { method: 'CONTENT_HASH', value: 'sha256:abc' },
      }],
    },
    executionContext: {
      userRef: 'user-001',
      projectRef: 'project-001',
      intentRef: 'intent-001',
      constraintRefs: ['constraint-001'],
      allowedContextRefs: ['docs/guide.md'],
    },
    budget: {
      tokenLimit: 100,
      tokenUsed: 0,
      toolLimit: 0,
      toolUsed: 0,
      timeLimitMs: 1_000,
      timeUsedMs: 0,
      costLimit: 0,
      costUsed: 0,
    },
  };
}

function validTaskEnvelope(overrides: Partial<TaskExecutionEnvelope> = {}): TaskExecutionEnvelope {
  return {
    schemaVersion: '1.0',
    envelopeId: 'envelope-001',
    taskRef: 'intent-001',
    title: 'Controlled architecture change',
    project: {
      name: 'AI-CTO-System',
      repoPath: 'D:/AI Project/AI-CTO-System',
      branch: 'main',
      baselineCommit: 'abc123',
    },
    execution: {
      mode: 'analysis',
      profile: 'STRICT',
      phase: 'REVIEW',
      riskLevel: 'HIGH',
      complexity: 'L3',
      reversibility: 'CONDITIONALLY_REVERSIBLE',
    },
    authorization: {
      modifyFiles: false,
      createCommit: false,
      push: false,
      deploy: false,
      restart: false,
      databaseWrite: false,
      cacheOrMqWrite: false,
    },
    scope: {
      goals: ['Produce a controlled architecture change plan.'],
      nonGoals: ['Deploy the change.'],
      allowedPaths: ['runtime/'],
      forbiddenPaths: ['.env'],
    },
    gates: {
      required: ['architecture-review'],
      completed: ['architecture-review'],
    },
    stopConditions: ['Current evidence becomes stale.'],
    rollbackConditions: ['Approval is withdrawn.'],
    acceptanceCriteria: ['The plan identifies affected runtime boundaries.'],
    evidence: {
      repoFingerprint: { method: 'CONTENT_HASH', value: 'sha256:baseline' },
      validations: ['envelope-validated'],
      reviews: ['architecture-review'],
      staleItems: [],
    },
    nextAction: 'Wait for explicit approval.',
    ...overrides,
  };
}

function assertDeepFrozen(value: unknown): void {
  if (value === null || typeof value !== 'object') {
    return;
  }
  assert.equal(Object.isFrozen(value), true);
  for (const nested of Object.values(value)) {
    assertDeepFrozen(nested);
  }
}

function routingRecommendation(
  decision: RoutingRecommendation['decision'] = 'ROUTE_RECOMMENDED',
): RoutingRecommendation {
  return {
    routingId: 'routing-intent-001',
    decision,
    profile: decision === 'OUT_OF_SCOPE' ? undefined : 'LIGHT',
    reasoningBudget: decision === 'OUT_OF_SCOPE' ? 'R0' : 'R1',
    modelCategory: decision === 'OUT_OF_SCOPE' ? 'NONE' : 'FAST',
    validationObligation: decision === 'OUT_OF_SCOPE' ? 'NONE' : 'TARGETED',
    escalationConditions: [],
    evidenceFreshness: [],
    evidence: [{
      evidenceId: 'routing-evidence-routing-intent-001',
      source: 'execution-routing',
      summary: `Decision ${decision}`,
      confidence: 'L2',
      timestamp: NOW,
      reference: 'routing-intent-001',
    }],
    limitations: ['Recommendation only; no execution authorisation is created.'],
  };
}

function waitingRuntimeResult(): RuntimeRunResult {
  return {
    workflow: {
      workflowId: 'workflow-1',
      intentRef: 'intent-001',
      executionContext: validHandoffRequest().executionContext,
      controlMode: 'CONFIRM',
      budget: validHandoffRequest().budget,
      state: 'WAITING_APPROVAL',
      createdAt: NOW,
      updatedAt: NOW,
    },
    task: {
      taskId: 'task-1',
      workflowId: 'workflow-1',
      input: {
        request: 'handoff:v1:{"routingId":"routing-intent-001","objective":"Create a traceable documentation update plan."}',
      },
      state: 'CREATED',
    },
    auditEvents: [],
  };
}

class CountingRouter implements HandoffRouterPort {
  calls = 0;
  lastRequest?: RoutingRequest;
  readonly recommendation: RoutingRecommendation;

  constructor(recommendation: RoutingRecommendation) {
    this.recommendation = recommendation;
  }

  route(request: RoutingRequest): RoutingRecommendation {
    this.calls += 1;
    this.lastRequest = request;
    return this.recommendation;
  }
}

class CountingRuntime implements HandoffRuntimePort {
  calls = 0;
  lastWorkflowInput?: CreateWorkflowInput;
  lastTaskInput?: TaskInput;
  lastOptions?: RunOptions;
  readonly result: RuntimeRunResult;

  constructor(result: RuntimeRunResult) {
    this.result = result;
  }

  run(
    workflowInput: CreateWorkflowInput,
    taskInput: TaskInput,
    options: RunOptions = {},
  ): RuntimeRunResult {
    this.calls += 1;
    this.lastWorkflowInput = workflowInput;
    this.lastTaskInput = taskInput;
    this.lastOptions = options;
    return this.result;
  }
}

function realService(): ControlledRuntimeHandoffService {
  const workflowRepository = new InMemoryWorkflowRepository();
  const taskRepository = new InMemoryTaskRepository();
  const auditRepository = new InMemoryAuditRepository();
  const executionRepository = new InMemoryExecutionRepository();
  const auditService = new AuditService(auditRepository);
  const runtime = new RuntimeFoundationService({
    workflowService: new WorkflowService(workflowRepository, () => NOW),
    taskService: new TaskService(taskRepository),
    guard: new PermissionBudgetGuard(),
    capabilityAdapter: new MockCapabilityAdapter(() => NOW),
    executionRepository,
    auditService,
    now: () => NOW,
  });
  return new ControlledRuntimeHandoffService({
    router: new AdvisoryExecutionRouter(() => NOW),
    runtime,
    now: () => NOW,
  });
}

test('IH-01 reconstructs and deeply freezes a valid handoff request without mutating caller input', () => {
  const input = validHandoffRequest();
  const baseline = structuredClone(input);

  const result = validateAndFreezeHandoffRequest(input);

  assert.deepEqual(input, baseline);
  assert.notEqual(result, input);
  assert.notEqual(result.intentResult, input.intentResult);
  assert.notEqual(result.executionContext, input.executionContext);
  assert.notEqual(result.budget, input.budget);
  assert.deepEqual(result, baseline);
  assertDeepFrozen(result);
  assert.equal(Object.isFrozen(input), false);
});

test('IH-02 rejects malformed handoff fields at the integration boundary', () => {
  const cases: readonly {
    readonly name: string;
    readonly mutate: (request: Record<string, any>) => void;
  }[] = [
    { name: 'schema version', mutate: request => { request.intentResult.schemaVersion = '2.0'; } },
    { name: 'classification identifier', mutate: request => { request.intentResult.classificationId = '../escape'; request.executionContext.intentRef = '../escape'; } },
    { name: 'blank objective', mutate: request => { request.intentResult.taskObjective = '   '; } },
    { name: 'overlong objective', mutate: request => { request.intentResult.taskObjective = 'x'.repeat(1_001); } },
    { name: 'duplicate capability references', mutate: request => { request.intentResult.requiredCapabilityRefs = ['documentation', 'documentation']; } },
    { name: 'duplicate evidence input references', mutate: request => { request.intentResult.evidenceInputs.push(structuredClone(request.intentResult.evidenceInputs[0])); } },
    { name: 'invalid timestamp', mutate: request => { request.intentResult.evidenceInputs[0].observedAt = '2026-02-30T00:00:00.000Z'; } },
    { name: 'blank fingerprint', mutate: request => { request.intentResult.evidenceInputs[0].fingerprint.value = ' '; } },
    { name: 'negative budget', mutate: request => { request.budget.tokenLimit = -1; } },
    { name: 'non-finite budget', mutate: request => { request.budget.timeLimitMs = Number.POSITIVE_INFINITY; } },
    { name: 'mismatched intent reference', mutate: request => { request.executionContext.intentRef = 'intent-other'; } },
  ];

  for (const entry of cases) {
    const request = validHandoffRequest() as unknown as Record<string, any>;
    entry.mutate(request);

    assert.throws(
      () => validateAndFreezeHandoffRequest(request as unknown as ControlledRuntimeHandoffRequest),
      error => error instanceof HandoffError && error.code === 'INVALID_HANDOFF_REQUEST',
      entry.name,
    );
  }
});

test('IH-03 rejects non-classified or low-confidence intent before routing and runtime', () => {
  const cases = [
    { status: 'AMBIGUOUS', confidence: 'L3' },
    { status: 'OUT_OF_SCOPE', confidence: 'L3' },
    { status: 'INSUFFICIENT_EVIDENCE', confidence: 'L3' },
    { status: 'CLASSIFIED', confidence: 'L1' },
    { status: 'CLASSIFIED', confidence: 'L2' },
  ] as const;

  for (const entry of cases) {
    const router = new CountingRouter(routingRecommendation());
    const runtime = new CountingRuntime(waitingRuntimeResult());
    const service = new ControlledRuntimeHandoffService({ router, runtime, now: () => NOW });
    const baseline = validHandoffRequest();
    const request: ControlledRuntimeHandoffRequest = {
      ...baseline,
      intentResult: { ...baseline.intentResult, ...entry },
    };

    const result = service.handoff(request);

    assert.equal(result.handoffDecision, 'INTENT_REJECTED');
    assert.equal(router.calls, 0);
    assert.equal(runtime.calls, 0);
    assert.equal(result.routingRecommendation, undefined);
    assert.equal(result.workflow, undefined);
    assert.equal(result.task, undefined);
  }
});

test('IH-04 keeps blocked routing decisions out of runtime', () => {
  for (const decision of ['OUT_OF_SCOPE', 'INSUFFICIENT_EVIDENCE'] as const) {
    const router = new CountingRouter(routingRecommendation(decision));
    const runtime = new CountingRuntime(waitingRuntimeResult());
    const service = new ControlledRuntimeHandoffService({ router, runtime, now: () => NOW });

    const result = service.handoff(validHandoffRequest());

    assert.equal(result.handoffDecision, 'ROUTING_BLOCKED');
    assert.equal(router.calls, 1);
    assert.equal(runtime.calls, 0);
    assert.equal(result.routingRecommendation?.decision, decision);
    assert.equal(result.workflow, undefined);
    assert.equal(result.task, undefined);
  }
});

test('IH-05 maps structured intent to routing and controlled runtime without reinterpretation', () => {
  const router = new CountingRouter(routingRecommendation());
  const runtime = new CountingRuntime(waitingRuntimeResult());
  const service = new ControlledRuntimeHandoffService({ router, runtime, now: () => NOW });
  const request = validHandoffRequest();

  const result = service.handoff(request);

  assert.deepEqual(router.lastRequest, {
    routingId: 'routing-intent-001',
    taskKind: 'DOCUMENTATION',
    complexity: 'L1',
    riskLevel: 'LOW',
    reversibility: 'REVERSIBLE',
    hasApplicableGate: false,
    requiresCurrentEvidence: false,
    evidenceInputs: request.intentResult.evidenceInputs,
    evidenceObservations: request.intentResult.evidenceObservations,
  });
  assert.equal(runtime.calls, 1);
  assert.equal(runtime.lastWorkflowInput?.controlMode, 'CONFIRM');
  assert.equal(runtime.lastWorkflowInput?.intentRef, 'intent-001');
  assert.deepEqual(runtime.lastTaskInput, {
    request: 'handoff:v1:{"routingId":"routing-intent-001","objective":"Create a traceable documentation update plan."}',
  });
  assert.deepEqual(runtime.lastOptions, { cancelled: undefined });
  assert.equal(result.handoffDecision, 'WAITING_APPROVAL');
});

test('IH-06 sends a low-risk documentation request through the real control plane to WAITING_APPROVAL', () => {
  const result = realService().handoff(validHandoffRequest());

  assert.equal(result.handoffDecision, 'WAITING_APPROVAL');
  assert.equal(result.routingRecommendation?.decision, 'ROUTE_RECOMMENDED');
  assert.equal(result.routingRecommendation?.profile, 'LIGHT');
  assert.equal(result.routingRecommendation?.reasoningBudget, 'R1');
  assert.equal(result.routingRecommendation?.modelCategory, 'FAST');
  assert.equal(result.workflow?.controlMode, 'CONFIRM');
  assert.equal(result.workflow?.state, 'WAITING_APPROVAL');
  assert.equal(result.task?.state, 'CREATED');
  assert.equal(result.auditEvents.some(event => event.eventType === 'CAPABILITY_COMPLETED'), false);
});

test('IH-07 escalates high-risk architecture work but still stops at WAITING_APPROVAL', () => {
  const baseline = validHandoffRequest();
  const request: ControlledRuntimeHandoffRequest = {
    ...baseline,
    intentResult: {
      ...baseline.intentResult,
      intentType: 'ARCHITECTURE_CHANGE',
      complexity: 'L3',
      taskKind: 'ARCHITECTURE',
      riskLevel: 'HIGH',
      suggestedWorkflow: 'CTO',
    },
    executionEnvelope: validTaskEnvelope(),
  };

  const result = realService().handoff(request);

  assert.equal(result.routingRecommendation?.decision, 'ESCALATE_FOR_REVIEW');
  assert.equal(result.routingRecommendation?.profile, 'STRICT');
  assert.equal(result.routingRecommendation?.reasoningBudget, 'R3');
  assert.equal(result.routingRecommendation?.modelCategory, 'HIGH_REASONING');
  assert.equal(result.workflow?.state, 'WAITING_APPROVAL');
  assert.equal(result.auditEvents.some(event => event.eventType === 'CAPABILITY_COMPLETED'), false);
});

test('IH-08 blocks missing current evidence before Runtime creates Workflow or Task', () => {
  const router = new AdvisoryExecutionRouter(() => NOW);
  const runtime = new CountingRuntime(waitingRuntimeResult());
  const service = new ControlledRuntimeHandoffService({ router, runtime, now: () => NOW });
  const baseline = validHandoffRequest();
  const request: ControlledRuntimeHandoffRequest = {
    ...baseline,
    intentResult: {
      ...baseline.intentResult,
      requiresCurrentEvidence: true,
      evidenceInputs: [],
      evidenceObservations: [],
    },
  };

  const result = service.handoff(request);

  assert.equal(result.handoffDecision, 'ROUTING_BLOCKED');
  assert.equal(result.routingRecommendation?.decision, 'INSUFFICIENT_EVIDENCE');
  assert.equal(runtime.calls, 0);
  assert.equal(result.workflow, undefined);
  assert.equal(result.task, undefined);
});

test('IH-09 keeps cancellation and budget denial non-executing', () => {
  const baseline = validHandoffRequest();
  const requests: readonly ControlledRuntimeHandoffRequest[] = [
    { ...baseline, cancelled: true },
    {
      ...baseline,
      budget: { ...baseline.budget, tokenUsed: 101 },
    },
  ];

  for (const request of requests) {
    const result = realService().handoff(request);
    assert.equal(result.handoffDecision, 'RUNTIME_BLOCKED');
    assert.equal(result.workflow?.state, 'CANCELLED');
    assert.equal(result.task?.state, 'CREATED');
    assert.equal(result.auditEvents.some(event => event.eventType === 'CAPABILITY_COMPLETED'), false);
    assert.equal(result.auditEvents.some(event => event.eventType === 'EXECUTION_DENIED'), true);
  }
});

test('IH-10 preserves the classification to routing to workflow to task correlation chain', () => {
  const result = realService().handoff(validHandoffRequest());

  assert.equal(result.intentResult.classificationId, 'intent-001');
  assert.equal(result.routingRecommendation?.routingId, 'routing-intent-001');
  assert.equal(result.workflow?.intentRef, 'intent-001');
  assert.equal(result.task?.workflowId, result.workflow?.workflowId);
  assert.match(result.task?.input.request ?? '', /"routingId":"routing-intent-001"/);
  assert.equal(
    result.evidence.some(evidence => evidence.reference === 'routing-intent-001'),
    true,
  );
});

test('IH-11 preserves caller input and returns a deeply frozen result', () => {
  const input = validHandoffRequest();
  const baseline = structuredClone(input);

  const result = realService().handoff(input);

  assert.deepEqual(input, baseline);
  assertDeepFrozen(result);
  assert.equal(Object.isFrozen(input), false);
});

test('IH-12 rejects Runtime results that cross the approval-only invariant', () => {
  const resultWithInvocation = {
    ...waitingRuntimeResult(),
    capabilityInvocation: {
      invocationId: 'invocation-1',
      taskId: 'task-1',
      adapterId: 'mock',
      status: 'SUCCESS',
      result: {
        status: 'SUCCESS',
        output: 'unexpected',
        evidence: [],
        confidence: 'L3',
        timestamp: NOW,
      },
      tokenUsed: 0,
    },
  } as const satisfies RuntimeRunResult;
  const resultWithExecution = {
    ...waitingRuntimeResult(),
    executionRecord: {
      executionId: 'execution-1',
      workflowId: 'workflow-1',
      taskId: 'task-1',
      status: 'SUCCESS',
      startedAt: NOW,
      endedAt: NOW,
      result: {
        status: 'SUCCESS',
        output: 'unexpected',
        evidence: [],
        confidence: 'L3',
        timestamp: NOW,
      },
    },
  } as const satisfies RuntimeRunResult;
  const resultCompleted = {
    ...waitingRuntimeResult(),
    workflow: { ...waitingRuntimeResult().workflow, state: 'COMPLETED' },
  } as const satisfies RuntimeRunResult;

  for (const runtimeResult of [resultWithInvocation, resultWithExecution, resultCompleted]) {
    const service = new ControlledRuntimeHandoffService({
      router: new CountingRouter(routingRecommendation()),
      runtime: new CountingRuntime(runtimeResult),
      now: () => NOW,
    });
    assert.throws(
      () => service.handoff(validHandoffRequest()),
      error => error instanceof HandoffError && error.code === 'HANDOFF_INVARIANT_VIOLATION',
    );
  }
});

test('IH-13 never emits execution authorization or invokes downstream execution', () => {
  const result = realService().handoff(validHandoffRequest());

  assert.equal('executionAuthorization' in result, false);
  assert.equal(result.limitations.includes('No execution authorization was created.'), true);
  assert.equal(
    result.limitations.includes('No capability, tool, model, or agent was invoked.'),
    true,
  );
  assert.equal(result.auditEvents.some(event => event.eventType === 'CAPABILITY_COMPLETED'), false);
});

test('IH-14 blocks L3/L4 handoff without a task execution envelope before runtime', () => {
  const baseline = validHandoffRequest();
  const request: ControlledRuntimeHandoffRequest = {
    ...baseline,
    intentResult: {
      ...baseline.intentResult,
      complexity: 'L3',
      taskKind: 'ARCHITECTURE',
      riskLevel: 'HIGH',
      suggestedWorkflow: 'CTO',
    },
  };
  const router = new CountingRouter(routingRecommendation('ESCALATE_FOR_REVIEW'));
  const runtime = new CountingRuntime(waitingRuntimeResult());
  const result = new ControlledRuntimeHandoffService({ router, runtime, now: () => NOW }).handoff(request);

  assert.equal(result.handoffDecision, 'ENVELOPE_BLOCKED');
  assert.equal(router.calls, 1);
  assert.equal(runtime.calls, 0);
  assert.equal(result.workflow, undefined);
  assert.equal(result.task, undefined);
  assert.equal(result.evidence.some(evidence => evidence.reference === 'intent-001'), true);
  assert.equal(result.limitations.includes('No execution authorization was created.'), true);
});

test('IH-15 allows a valid task execution envelope to reach the existing approval checkpoint', () => {
  const baseline = validHandoffRequest();
  const request: ControlledRuntimeHandoffRequest = {
    ...baseline,
    intentResult: {
      ...baseline.intentResult,
      complexity: 'L3',
      taskKind: 'ARCHITECTURE',
      riskLevel: 'HIGH',
      suggestedWorkflow: 'CTO',
    },
    executionEnvelope: validTaskEnvelope(),
  };
  const runtime = new CountingRuntime(waitingRuntimeResult());
  const result = new ControlledRuntimeHandoffService({
    router: new CountingRouter(routingRecommendation('ESCALATE_FOR_REVIEW')),
    runtime,
    now: () => NOW,
  }).handoff(request);

  assert.equal(result.handoffDecision, 'WAITING_APPROVAL');
  assert.equal(runtime.calls, 1);
  assert.equal(result.workflow?.state, 'WAITING_APPROVAL');
  assert.equal(result.evidence.some(evidence => evidence.source === 'task-execution-envelope'), true);
  assert.equal('executionAuthorization' in result, false);
});

test('IH-16 blocks a stale or incomplete task execution envelope without invoking runtime', () => {
  const baseline = validHandoffRequest();
  const request: ControlledRuntimeHandoffRequest = {
    ...baseline,
    intentResult: {
      ...baseline.intentResult,
      complexity: 'L3',
      taskKind: 'ARCHITECTURE',
      riskLevel: 'HIGH',
      suggestedWorkflow: 'CTO',
    },
    executionEnvelope: validTaskEnvelope({
      evidence: {
        repoFingerprint: { method: 'CONTENT_HASH', value: 'sha256:baseline' },
        validations: [],
        reviews: [],
        staleItems: ['runtime/'],
      },
      gates: { required: ['architecture-review'], completed: [] },
    }),
  };
  const runtime = new CountingRuntime(waitingRuntimeResult());
  const result = new ControlledRuntimeHandoffService({
    router: new CountingRouter(routingRecommendation('ESCALATE_FOR_REVIEW')),
    runtime,
    now: () => NOW,
  }).handoff(request);

  assert.equal(result.handoffDecision, 'ENVELOPE_BLOCKED');
  assert.equal(runtime.calls, 0);
  assert.equal(result.evidence.some(evidence => evidence.source === 'task-execution-envelope'), true);
});
