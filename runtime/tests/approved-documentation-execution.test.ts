import test from 'node:test';
import assert from 'node:assert/strict';

import type { AuthorizedDocumentationSource } from '../capability/documentation-execution-contract.ts';
import type { DocumentationExecutionRequest } from '../capability/documentation-execution-contract.ts';
import type { DocumentationInvocationPort } from '../capability/documentation-invocation-port.ts';
import { DocumentationCapabilityAdapter } from '../capability/documentation-capability-adapter.ts';
import { DeterministicDocumentationAssistant } from '../capability/deterministic-documentation-assistant.ts';
import type { DocumentationCapabilityActivationSnapshot } from '../capability/documentation-capability-activation-contract.ts';
import type { DocumentationCapabilityActivationPort } from '../capability/documentation-capability-activation-port.ts';
import { InMemoryDocumentationCapabilityActivationRepository } from '../capability/in-memory-documentation-capability-activation-repository.ts';
import { AuditService } from '../audit/audit-service.ts';
import { InMemoryAuditRepository } from '../audit/in-memory-audit-repository.ts';
import { InMemoryTaskRepository } from '../task/in-memory-task-repository.ts';
import { TaskService } from '../task/task-service.ts';
import { InMemoryWorkflowRepository } from '../workflow/in-memory-workflow-repository.ts';
import { WorkflowService } from '../workflow/workflow-service.ts';
import { PermissionBudgetGuard } from '../permission/permission-budget-guard.ts';
import {
  DocumentationCapabilityRuntimeService,
  type DocumentationRuntimeExecutionResult,
} from '../services/documentation-capability-runtime-service.ts';
import type {
  ApprovedDocumentationExecutionRequest,
  DocumentationExecutionApproval,
  DocumentationExecutionPort,
} from '../integration/approved-documentation-execution-contract.ts';
import { ApprovedDocumentationExecutionService } from '../integration/approved-documentation-execution-service.ts';
import { createDocumentationSourceScopeFingerprint } from '../integration/documentation-source-scope-fingerprint.ts';

const NOW = '2026-08-06T00:00:00.000Z';

function activeSnapshot(): DocumentationCapabilityActivationSnapshot {
  return {
    capabilityId: 'CAP-DOC-0001',
    version: '1.0.0-internal',
    registryStatus: 'ACTIVE',
    sourceCommit: '9876764',
    allowedOperations: ['GENERATE_DRAFT'],
    allowedEnvironment: 'INTERNAL_LOCAL',
    activationScope: [
      'INTERNAL_NON_PRODUCTION',
      'EXPLICIT_CONFIRMATION_REQUIRED',
      'AUTHORIZED_IN_MEMORY_SOURCES_ONLY',
      'DRAFT_OUTPUT_ONLY',
      'NO_FILESYSTEM_NETWORK_PROVIDER_TOOL_OR_KNOWLEDGE_WRITE',
    ],
    lastReviewAt: NOW,
    nextReviewAt: '2026-09-05T00:00:00.000Z',
  };
}

function sourceA(): AuthorizedDocumentationSource {
  return {
    sourceRef: 'source-a',
    location: 'docs/source-a.md',
    content: '# Source A\nEvidence A.',
    versionRef: 'v1',
  };
}

function sourceB(): AuthorizedDocumentationSource {
  return {
    sourceRef: 'source-b',
    location: 'docs/source-b.md',
    content: '# Source B\nEvidence B.',
    versionRef: 'v3',
  };
}

test('AD-01 activation repository returns only immutable trusted projections', () => {
  const repository = new InMemoryDocumentationCapabilityActivationRepository(activeSnapshot());
  const first = repository.getById('CAP-DOC-0001')!;

  assert.equal(first.registryStatus, 'ACTIVE');
  assert.equal(Object.isFrozen(first), true);
  assert.equal(Object.isFrozen(first.activationScope), true);
  assert.equal(repository.getById('CAP-DOC-9999'), undefined);
  assert.notEqual(repository.getById('CAP-DOC-0001'), first);
});

test('AD-02 source fingerprint is deterministic and source-order independent', () => {
  const left = createDocumentationSourceScopeFingerprint([sourceB(), sourceA()]);
  const right = createDocumentationSourceScopeFingerprint([sourceA(), sourceB()]);

  assert.equal(left, right);
  assert.match(left, /^[a-f0-9]{64}$/);
});

test('AD-03 source fingerprint changes for content, location, or version drift', () => {
  const baseline = createDocumentationSourceScopeFingerprint([sourceA()]);
  const changedSources: AuthorizedDocumentationSource[] = [
    { ...sourceA(), content: 'changed' },
    { ...sourceA(), location: 'docs/other.md' },
    { ...sourceA(), versionRef: 'v2' },
  ];

  for (const source of changedSources) {
    assert.notEqual(createDocumentationSourceScopeFingerprint([source]), baseline);
  }
});

test('AD-04 source fingerprint rejects empty, duplicate, and blank source fields', () => {
  assert.throws(() => createDocumentationSourceScopeFingerprint([]), TypeError);
  assert.throws(() => createDocumentationSourceScopeFingerprint([sourceA(), sourceA()]), TypeError);
  assert.throws(
    () => createDocumentationSourceScopeFingerprint([{ ...sourceA(), content: ' ' }]),
    TypeError,
  );
});

class CountingDocumentationExecutionPort implements DocumentationExecutionPort {
  calls = 0;
  readonly #delegate?: DocumentationExecutionPort;

  constructor(delegate?: DocumentationExecutionPort) {
    this.#delegate = delegate;
  }

  execute(request: DocumentationExecutionRequest): DocumentationRuntimeExecutionResult {
    this.calls += 1;
    if (this.#delegate === undefined) {
      throw new Error('Capability must not be called during preflight tests.');
    }
    return this.#delegate.execute(request);
  }
}

interface ExecutionFixture {
  readonly service: ApprovedDocumentationExecutionService;
  readonly workflowService: WorkflowService;
  readonly taskService: TaskService;
  readonly port: CountingDocumentationExecutionPort;
  readonly auditService: AuditService;
  readonly request: ApprovedDocumentationExecutionRequest;
}

function documentationRequest(
  workflowId: string,
  taskId: string,
  overrides: Partial<DocumentationExecutionRequest> = {},
): DocumentationExecutionRequest {
  return {
    workflowId,
    taskId,
    operation: 'GENERATE_DRAFT',
    taskObjective: 'Create an evidence-backed draft.',
    authorizedSources: [sourceA()],
    executionContext: {
      intentRef: 'classification-001',
      constraintRefs: [],
      allowedContextRefs: ['source-a'],
    },
    permissionGrant: {
      grantId: 'grant-doc-001',
      allowedOperations: ['GENERATE_DRAFT'],
      expiresAt: '2026-08-07T00:00:00.000Z',
    },
    budget: {
      tokenLimit: 10,
      tokenUsed: 0,
      toolLimit: 1,
      toolUsed: 0,
      timeLimitMs: 1_000,
      timeUsedMs: 0,
      costLimit: 1,
      costUsed: 0,
    },
    ...overrides,
  };
}

function confirmedApproval(
  workflowId: string,
  taskId: string,
  sources: readonly AuthorizedDocumentationSource[] = [sourceA()],
): DocumentationExecutionApproval {
  return {
    approvalId: 'approval-doc-001',
    status: 'CONFIRMED',
    classificationId: 'classification-001',
    routingId: 'routing-intent-001',
    workflowId,
    taskId,
    capabilityId: 'CAP-DOC-0001',
    capabilityVersion: '1.0.0-internal',
    operation: 'GENERATE_DRAFT',
    sourceScopeFingerprint: createDocumentationSourceScopeFingerprint(sources),
    confirmedAt: NOW,
    expiresAt: '2026-08-07T00:00:00.000Z',
  };
}

function createExecutionFixture(options: {
  readonly workflowState?: 'PLANNING' | 'WAITING_APPROVAL';
  readonly taskRequest?: string;
  readonly activationPort?: DocumentationCapabilityActivationPort;
  readonly executionPortFactory?: (auditService: AuditService) => DocumentationExecutionPort;
} = {}): ExecutionFixture {
  const workflowService = new WorkflowService(new InMemoryWorkflowRepository(), () => NOW);
  const taskService = new TaskService(new InMemoryTaskRepository());
  const workflow = workflowService.create({
    intentRef: 'classification-001',
    executionContext: {
      intentRef: 'classification-001',
      constraintRefs: [],
      allowedContextRefs: ['source-a'],
    },
    controlMode: 'CONFIRM',
    budget: documentationRequest('unused', 'unused').budget,
  });
  workflowService.transition(workflow.workflowId, 'PLANNING');
  if ((options.workflowState ?? 'WAITING_APPROVAL') === 'WAITING_APPROVAL') {
    workflowService.transition(workflow.workflowId, 'WAITING_APPROVAL');
  }
  const task = taskService.create(workflow.workflowId, {
    request:
      options.taskRequest ??
      'handoff:v1:{"routingId":"routing-intent-001","objective":"Create an evidence-backed draft."}',
  });
  const requestBody = documentationRequest(workflow.workflowId, task.taskId);
  const auditService = new AuditService(new InMemoryAuditRepository());
  const port = new CountingDocumentationExecutionPort(options.executionPortFactory?.(auditService));
  const service = new ApprovedDocumentationExecutionService({
    workflowService,
    taskService,
    activationPort:
      options.activationPort ??
      new InMemoryDocumentationCapabilityActivationRepository(activeSnapshot()),
    documentationExecutionPort: port,
    auditService,
    now: () => NOW,
  });

  return {
    service,
    workflowService,
    taskService,
    port,
    auditService,
    request: {
      classificationId: 'classification-001',
      routingId: 'routing-intent-001',
      executionEnvironment: 'INTERNAL_LOCAL',
      approval: confirmedApproval(workflow.workflowId, task.taskId),
      documentationRequest: requestBody,
    },
  };
}

test('AD-05 workflow, task, and handoff prerequisites block before execution', () => {
  const cases: Array<{
    readonly name: string;
    readonly fixture: ExecutionFixture;
    readonly request: ApprovedDocumentationExecutionRequest;
    readonly expectedCode: string;
  }> = [];

  const missingWorkflow = createExecutionFixture();
  cases.push({
    name: 'workflow missing',
    fixture: missingWorkflow,
    request: {
      ...missingWorkflow.request,
      documentationRequest: { ...missingWorkflow.request.documentationRequest, workflowId: 'workflow-missing' },
      approval: { ...missingWorkflow.request.approval!, workflowId: 'workflow-missing' },
    },
    expectedCode: 'WORKFLOW_NOT_FOUND',
  });

  const wrongState = createExecutionFixture({ workflowState: 'PLANNING' });
  cases.push({ name: 'workflow wrong state', fixture: wrongState, request: wrongState.request, expectedCode: 'WORKFLOW_NOT_WAITING_APPROVAL' });

  const missingTask = createExecutionFixture();
  cases.push({
    name: 'task missing',
    fixture: missingTask,
    request: {
      ...missingTask.request,
      documentationRequest: { ...missingTask.request.documentationRequest, taskId: 'task-missing' },
      approval: { ...missingTask.request.approval!, taskId: 'task-missing' },
    },
    expectedCode: 'TASK_NOT_FOUND',
  });

  const mismatch = createExecutionFixture();
  const secondWorkflow = mismatch.workflowService.create({
    intentRef: 'classification-001',
    executionContext: mismatch.request.documentationRequest.executionContext,
    controlMode: 'CONFIRM',
    budget: mismatch.request.documentationRequest.budget,
  });
  const mismatchedTask = mismatch.taskService.create(secondWorkflow.workflowId, { request: 'handoff:v1:{}' });
  cases.push({
    name: 'task workflow mismatch',
    fixture: mismatch,
    request: {
      ...mismatch.request,
      documentationRequest: { ...mismatch.request.documentationRequest, taskId: mismatchedTask.taskId },
      approval: { ...mismatch.request.approval!, taskId: mismatchedTask.taskId },
    },
    expectedCode: 'TASK_MISMATCH',
  });

  const malformed = createExecutionFixture({ taskRequest: 'not-a-handoff' });
  cases.push({ name: 'malformed handoff', fixture: malformed, request: malformed.request, expectedCode: 'HANDOFF_REFERENCE_MISMATCH' });

  for (const item of cases) {
    const result = item.fixture.service.execute(item.request);
    assert.equal(result.decision, 'BLOCKED', item.name);
    assert.equal(result.failure?.code, item.expectedCode, item.name);
    assert.equal(item.fixture.port.calls, 0, item.name);
  }
});

test('AD-06 approval must be current, canonical, and bound to every execution reference', () => {
  const cases: Array<{ readonly name: string; readonly mutate: (request: ApprovedDocumentationExecutionRequest) => ApprovedDocumentationExecutionRequest }> = [
    { name: 'missing approval', mutate: (request) => ({ ...request, approval: undefined }) },
    { name: 'expired approval', mutate: (request) => ({ ...request, approval: { ...request.approval!, expiresAt: NOW } }) },
    { name: 'noncanonical date', mutate: (request) => ({ ...request, approval: { ...request.approval!, confirmedAt: '2026-08-06' } }) },
    { name: 'classification mismatch', mutate: (request) => ({ ...request, approval: { ...request.approval!, classificationId: 'other' } }) },
    { name: 'routing mismatch', mutate: (request) => ({ ...request, approval: { ...request.approval!, routingId: 'other' } }) },
    { name: 'workflow mismatch', mutate: (request) => ({ ...request, approval: { ...request.approval!, workflowId: 'other' } }) },
    { name: 'task mismatch', mutate: (request) => ({ ...request, approval: { ...request.approval!, taskId: 'other' } }) },
  ];

  for (const item of cases) {
    const fixture = createExecutionFixture();
    const result = fixture.service.execute(item.mutate(fixture.request));
    assert.equal(result.decision, 'BLOCKED', item.name);
    assert.equal(result.failure?.code, 'APPROVAL_REJECTED', item.name);
    assert.equal(fixture.workflowService.get(fixture.request.documentationRequest.workflowId).state, 'WAITING_APPROVAL', item.name);
    assert.equal(fixture.port.calls, 0, item.name);
  }
});

test('AD-07 activation identity, operation, and environment are enforced before execution', () => {
  const malformedActivation = (snapshot: DocumentationCapabilityActivationSnapshot): DocumentationCapabilityActivationPort => ({
    getById: () => structuredClone(snapshot),
  });
  const cases: Array<{ readonly name: string; readonly fixture: ExecutionFixture; readonly mutate?: (request: ApprovedDocumentationExecutionRequest) => ApprovedDocumentationExecutionRequest; readonly code: string }> = [];

  const evaluating = createExecutionFixture({ activationPort: malformedActivation({ ...activeSnapshot(), registryStatus: 'EVALUATING' }) });
  cases.push({ name: 'not active', fixture: evaluating, code: 'CAPABILITY_NOT_ACTIVE' });
  const wrongVersion = createExecutionFixture({ activationPort: malformedActivation({ ...activeSnapshot(), version: 'wrong' } as unknown as DocumentationCapabilityActivationSnapshot) });
  cases.push({ name: 'wrong version', fixture: wrongVersion, code: 'CAPABILITY_NOT_ACTIVE' });
  const wrongOperation = createExecutionFixture();
  cases.push({
    name: 'wrong operation',
    fixture: wrongOperation,
    mutate: (request) => ({
      ...request,
      approval: { ...request.approval!, operation: 'OTHER' } as unknown as DocumentationExecutionApproval,
      documentationRequest: { ...request.documentationRequest, operation: 'OTHER' } as unknown as DocumentationExecutionRequest,
    }),
    code: 'ACTIVATION_SCOPE_MISMATCH',
  });
  const wrongEnvironment = createExecutionFixture();
  cases.push({ name: 'wrong environment', fixture: wrongEnvironment, mutate: (request) => ({ ...request, executionEnvironment: 'OTHER' } as unknown as ApprovedDocumentationExecutionRequest), code: 'ACTIVATION_SCOPE_MISMATCH' });

  for (const item of cases) {
    const result = item.fixture.service.execute(item.mutate?.(item.fixture.request) ?? item.fixture.request);
    assert.equal(result.failure?.code, item.code, item.name);
    assert.equal(item.fixture.port.calls, 0, item.name);
  }
});

test('AD-08 confirmed source scope rejects content, location, and version drift', () => {
  const changedSources: AuthorizedDocumentationSource[][] = [
    [{ ...sourceA(), content: 'changed' }],
    [{ ...sourceA(), location: 'docs/changed.md' }],
    [{ ...sourceA(), versionRef: 'v2' }],
  ];

  for (const sources of changedSources) {
    const fixture = createExecutionFixture();
    const result = fixture.service.execute({
      ...fixture.request,
      documentationRequest: { ...fixture.request.documentationRequest, authorizedSources: sources },
    });
    assert.equal(result.failure?.code, 'SOURCE_SCOPE_CHANGED');
    assert.equal(fixture.port.calls, 0);
  }
});

test('AD-09 permission, budget, source, and request correlations fail closed', () => {
  const cases: Array<{ readonly name: string; readonly code: string; readonly mutate: (request: ApprovedDocumentationExecutionRequest) => ApprovedDocumentationExecutionRequest }> = [
    { name: 'permission missing', code: 'PERMISSION_DENIED', mutate: (request) => ({ ...request, documentationRequest: { ...request.documentationRequest, permissionGrant: { ...request.documentationRequest.permissionGrant, allowedOperations: [] } } }) },
    { name: 'permission expired', code: 'PERMISSION_DENIED', mutate: (request) => ({ ...request, documentationRequest: { ...request.documentationRequest, permissionGrant: { ...request.documentationRequest.permissionGrant, expiresAt: NOW } } }) },
    { name: 'budget exceeded', code: 'BUDGET_EXCEEDED', mutate: (request) => ({ ...request, documentationRequest: { ...request.documentationRequest, budget: { ...request.documentationRequest.budget, tokenUsed: 11 } } }) },
    { name: 'budget invalid', code: 'BUDGET_EXCEEDED', mutate: (request) => ({ ...request, documentationRequest: { ...request.documentationRequest, budget: { ...request.documentationRequest.budget, costLimit: -1 } } }) },
    { name: 'source empty', code: 'SOURCE_SCOPE_INVALID', mutate: (request) => ({ ...request, approval: { ...request.approval!, sourceScopeFingerprint: 'irrelevant' }, documentationRequest: { ...request.documentationRequest, authorizedSources: [] } }) },
    { name: 'source duplicate', code: 'SOURCE_SCOPE_INVALID', mutate: (request) => ({ ...request, approval: { ...request.approval!, sourceScopeFingerprint: 'irrelevant' }, documentationRequest: { ...request.documentationRequest, authorizedSources: [sourceA(), sourceA()] } }) },
    { name: 'source unallowed', code: 'SOURCE_SCOPE_INVALID', mutate: (request) => ({ ...request, documentationRequest: { ...request.documentationRequest, executionContext: { ...request.documentationRequest.executionContext, allowedContextRefs: [] } } }) },
    { name: 'request workflow mismatch', code: 'WORKFLOW_NOT_FOUND', mutate: (request) => ({ ...request, documentationRequest: { ...request.documentationRequest, workflowId: 'other' } }) },
    { name: 'request task mismatch', code: 'TASK_NOT_FOUND', mutate: (request) => ({ ...request, documentationRequest: { ...request.documentationRequest, taskId: 'other' } }) },
    { name: 'execution context mismatch', code: 'HANDOFF_REFERENCE_MISMATCH', mutate: (request) => ({ ...request, documentationRequest: { ...request.documentationRequest, executionContext: { ...request.documentationRequest.executionContext, intentRef: 'other' } } }) },
  ];

  for (const item of cases) {
    const fixture = createExecutionFixture();
    const result = fixture.service.execute(item.mutate(fixture.request));
    assert.equal(result.failure?.code, item.code, item.name);
    assert.equal(fixture.port.calls, 0, item.name);
  }
});

test('AD-10 cancellation after valid preflight stops before capability invocation', () => {
  const fixture = createExecutionFixture();
  const result = fixture.service.execute({ ...fixture.request, cancelled: true });

  assert.equal(result.decision, 'CANCELLED');
  assert.equal(result.failure?.code, 'CANCELLED');
  assert.equal(result.workflow?.state, 'CANCELLED');
  assert.equal(result.auditEvents.at(-1)?.eventType, 'DOCUMENTATION_EXECUTION_CANCELLED');
  assert.equal(fixture.port.calls, 0);
});

function successfulExecutionPort(auditService: AuditService): DocumentationExecutionPort {
  return new DocumentationCapabilityRuntimeService(
    new DocumentationCapabilityAdapter(
      new DeterministicDocumentationAssistant(() => NOW),
      new PermissionBudgetGuard(),
      () => NOW,
    ),
    auditService,
    () => NOW,
  );
}

function failedExecutionPort(auditService: AuditService): DocumentationExecutionPort {
  const throwingInvocation: DocumentationInvocationPort = {
    invoke: () => {
      throw new Error('controlled local failure');
    },
  };
  return new DocumentationCapabilityRuntimeService(
    new DocumentationCapabilityAdapter(throwingInvocation, new PermissionBudgetGuard(), () => NOW),
    auditService,
    () => NOW,
  );
}

test('AD-11 valid approval completes the bounded Documentation Capability loop', () => {
  const fixture = createExecutionFixture({ executionPortFactory: successfulExecutionPort });
  const result = fixture.service.execute(fixture.request);

  assert.equal(result.decision, 'COMPLETED');
  assert.equal(result.workflow?.state, 'COMPLETED');
  assert.equal(result.task?.state, 'COMPLETED');
  assert.equal(fixture.port.calls, 1);
  assert.ok(result.documentationOutcome?.result?.draft.startsWith('DRAFT:'));
  assert.ok((result.documentationOutcome?.result?.sourceReferences.length ?? 0) > 0);
  assert.ok((result.documentationOutcome?.result?.evidence.length ?? 0) > 0);
  assert.ok((result.documentationOutcome?.result?.limitations.length ?? 0) > 0);
  assert.equal(result.documentationOutcome?.result?.confidence, 'L3');
});

test('AD-12 controlled Documentation Capability failure terminates without retry or fallback', () => {
  const fixture = createExecutionFixture({ executionPortFactory: failedExecutionPort });
  const result = fixture.service.execute(fixture.request);

  assert.equal(result.decision, 'FAILED');
  assert.equal(result.failure?.code, 'CAPABILITY_FAILED');
  assert.equal(result.workflow?.state, 'FAILED');
  assert.equal(result.task?.state, 'FAILED');
  assert.equal(fixture.port.calls, 1);
});

test('AD-13 terminal approval replay cannot execute the Capability twice', () => {
  const fixture = createExecutionFixture({ executionPortFactory: successfulExecutionPort });
  const first = fixture.service.execute(fixture.request);
  const replay = fixture.service.execute(fixture.request);

  assert.equal(first.decision, 'COMPLETED');
  assert.equal(replay.decision, 'BLOCKED');
  assert.equal(replay.failure?.code, 'WORKFLOW_NOT_WAITING_APPROVAL');
  assert.equal(replay.workflow?.state, 'COMPLETED');
  assert.equal(fixture.port.calls, 1);
});

test('AD-14 audit chain preserves approval, execution, Capability, and terminal evidence', () => {
  const successFixture = createExecutionFixture({ executionPortFactory: successfulExecutionPort });
  const succeeded = successFixture.service.execute(successFixture.request);
  assert.deepEqual(
    succeeded.auditEvents.map((event) => event.eventType),
    [
      'DOCUMENTATION_APPROVAL_VERIFIED',
      'DOCUMENTATION_EXECUTION_STARTED',
      'DOCUMENTATION_CAPABILITY_COMPLETED',
      'DOCUMENTATION_WORKFLOW_COMPLETED',
    ],
  );
  assert.equal(succeeded.auditEvents[0]?.approvalStatus, 'CONFIRMED');
  assert.ok(succeeded.auditEvents.every((event) => event.workflowId === successFixture.request.documentationRequest.workflowId));
  assert.ok(succeeded.auditEvents.some((event) => event.outputRef === succeeded.documentationOutcome?.result?.resultRef));
  assert.ok(succeeded.auditEvents.every((event) => (event.evidence.length ?? 0) > 0));

  const failedFixture = createExecutionFixture({ executionPortFactory: failedExecutionPort });
  const failed = failedFixture.service.execute(failedFixture.request);
  const failureAudit = failed.auditEvents.at(-1);
  assert.equal(failureAudit?.eventType, 'DOCUMENTATION_WORKFLOW_FAILED');
  assert.ok(failureAudit?.failureReason);
  assert.ok(failureAudit?.failureStage);
});

test('AD-15 execution preserves caller input, freezes results, and exposes no external side effects', () => {
  const fixture = createExecutionFixture({ executionPortFactory: successfulExecutionPort });
  const before = structuredClone(fixture.request);
  const result = fixture.service.execute(fixture.request);

  assert.deepEqual(fixture.request, before);
  assert.equal(Object.isFrozen(result), true);
  assert.equal(Object.isFrozen(result.auditEvents), true);
  assert.equal(Object.isFrozen(result.documentationOutcome), true);
  assert.equal(Object.isFrozen(result.documentationOutcome?.result), true);
  assert.equal(fixture.port.calls, 1);
  assert.equal('writeFile' in fixture.service, false);
  assert.equal('fetch' in fixture.service, false);
  assert.equal('activate' in fixture.service, false);
});
