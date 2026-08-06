import test from 'node:test';
import assert from 'node:assert/strict';

import {
  HandoffError,
  type ControlledRuntimeHandoffRequest,
  type HandoffRouterPort,
  type HandoffRuntimePort,
} from '../integration/intent-runtime-handoff-contract.ts';
import { validateAndFreezeHandoffRequest } from '../integration/intent-runtime-handoff-validation.ts';
import { ControlledRuntimeHandoffService } from '../integration/controlled-runtime-handoff-service.ts';
import type {
  RoutingRecommendation,
  RoutingRequest,
} from '../routing/execution-routing-contract.ts';
import type { RuntimeRunResult } from '../services/runtime-foundation-service.ts';
import type { CreateWorkflowInput } from '../workflow/workflow-service.ts';
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
