import test from 'node:test';
import assert from 'node:assert/strict';

import { AuditService } from '../audit/audit-service.ts';
import { InMemoryAuditRepository } from '../audit/in-memory-audit-repository.ts';
import { TestingCapabilityAdapter } from '../capability/testing-capability-adapter.ts';
import { DeterministicTestingAssistant } from '../capability/deterministic-testing-assistant.ts';
import {
  TESTING_OPERATIONS,
  type TestingExecutionOutcome,
  type TestingExecutionRequest,
  type TestingInvocationRequest,
} from '../capability/testing-execution-contract.ts';
import type { TestingInvocationPort } from '../capability/testing-invocation-port.ts';
import { PermissionBudgetGuard } from '../permission/permission-budget-guard.ts';
import { TestingCapabilityRuntimeService } from '../services/testing-capability-runtime-service.ts';

const NOW = '2026-07-15T00:00:00.000Z';

function createInvocation(overrides: Partial<TestingInvocationRequest> = {}): TestingInvocationRequest {
  const request = {
    taskId: 'task-testing-1',
    workflowId: 'workflow-testing-1',
    operation: 'ANALYZE_TEST_CONTEXT' as const,
    testingObjective: 'Identify static test signals and limitations in the authorised test context.',
    authorizedTestContexts: [{
      sourceRef: 'source-test-1',
      location: 'runtime/tests/sample.test.ts',
      content: 'test("sample", () => { assert.equal(true, true); }); // fixture',
      versionRef: 'v1',
    }],
    executionContext: {
      intentRef: 'intent-testing-1',
      constraintRefs: [],
      allowedContextRefs: ['source-test-1'],
    },
    permissionGrant: {
      grantId: 'grant-testing-1',
      allowedOperations: ['ANALYZE_TEST_CONTEXT'] as const,
      expiresAt: '2026-07-16T00:00:00.000Z',
    },
    budget: {
      tokenLimit: 10,
      tokenUsed: 0,
      toolLimit: 0,
      toolUsed: 0,
      timeLimitMs: 1_000,
      timeUsedMs: 0,
      costLimit: 1,
      costUsed: 0,
    },
  };

  return {
    request: { ...request, ...overrides.request },
    evidence: [{
      evidenceId: 'evidence-test-1',
      source: 'authorised-test-context',
      summary: 'Explicitly authorised in-memory test context.',
      confidence: 'L3',
      timestamp: NOW,
      reference: 'source-test-1',
    }],
    ...overrides,
  };
}

function createRequest(overrides: Partial<TestingExecutionRequest> = {}): TestingExecutionRequest {
  return { ...createInvocation().request, ...overrides };
}

class CountingPort implements TestingInvocationPort {
  calls = 0;
  lastInvocation?: TestingInvocationRequest;
  private readonly delegate: TestingInvocationPort;

  constructor(delegate: TestingInvocationPort = new DeterministicTestingAssistant(() => NOW)) {
    this.delegate = delegate;
  }

  invoke(invocation: TestingInvocationRequest): TestingExecutionOutcome {
    this.calls += 1;
    this.lastInvocation = invocation;
    return this.delegate.invoke(invocation);
  }
}

function createAdapter(port: TestingInvocationPort = new DeterministicTestingAssistant(() => NOW)): TestingCapabilityAdapter {
  return new TestingCapabilityAdapter(port, new PermissionBudgetGuard(), () => NOW);
}

test('TC-01 declares the sole read-only testing operation', () => {
  assert.deepEqual(TESTING_OPERATIONS, ['ANALYZE_TEST_CONTEXT']);
});

test('TC-02 produces static findings without asserting execution or runtime coverage', () => {
  const outcome = new DeterministicTestingAssistant(() => NOW).invoke(createInvocation());

  assert.equal(outcome.status, 'SUCCESS');
  assert.match(outcome.result!.testAnalysisReport, /static/i);
  assert.ok(outcome.result!.coverageFindings.length > 0);
  assert.ok(outcome.result!.riskFindings.length > 0);
  assert.ok(outcome.result!.testRecommendations.length > 0);
  assert.match(outcome.result!.limitations.join(' '), /not executed/i);
  assert.match(outcome.result!.limitations.join(' '), /runtime coverage.*not verified/i);
  assert.equal(outcome.result!.confidence, 'L3');
  assert.deepEqual(outcome.result!.evidence, createInvocation().evidence);
});

test('TC-03 caps confidence at L2 when a test context lacks a version reference', () => {
  const invocation = createInvocation({
    request: {
      ...createInvocation().request,
      authorizedTestContexts: [{
        ...createInvocation().request.authorizedTestContexts[0]!,
        versionRef: undefined,
      }],
    },
  });
  const outcome = new DeterministicTestingAssistant(() => NOW).invoke(invocation);

  assert.equal(outcome.status, 'SUCCESS');
  assert.equal(outcome.result!.confidence, 'L2');
  assert.match(outcome.result!.limitations.join(' '), /L2/);
});

test('TC-04 blocks empty, duplicate, blank, and out-of-scope test contexts before the port is invoked', () => {
  const context = createRequest().authorizedTestContexts[0]!;
  const invalidRequests = [
    createRequest({ authorizedTestContexts: [] }),
    createRequest({ authorizedTestContexts: [context, { ...context, location: 'runtime/tests/duplicate.test.ts' }] }),
    createRequest({ authorizedTestContexts: [{ ...context, sourceRef: '' }] }),
    createRequest({ authorizedTestContexts: [{ ...context, location: '' }] }),
    createRequest({ authorizedTestContexts: [{ ...context, content: '  ' }] }),
    createRequest({ executionContext: { ...createRequest().executionContext, allowedContextRefs: [] } }),
  ];

  for (const request of invalidRequests) {
    const port = new CountingPort();
    const outcome = createAdapter(port).invoke(request);

    assert.equal(outcome.status, 'BLOCKED');
    assert.equal(outcome.failure?.category, 'SOURCE_SCOPE_INVALID');
    assert.equal(port.calls, 0);
  }
});

test('TC-05 blocks wrong operation, permission, expiration, blank objective, budget, and cancellation before invocation', () => {
  const request = createRequest();
  const blockedRequests = [
    createRequest({ operation: 'NOT_A_TESTING_OPERATION' as TestingExecutionRequest['operation'] }),
    createRequest({ permissionGrant: { ...request.permissionGrant, allowedOperations: [] } }),
    createRequest({ permissionGrant: { ...request.permissionGrant, expiresAt: '2026-07-14T23:59:59.999Z' } }),
    createRequest({ permissionGrant: { ...request.permissionGrant, expiresAt: 'not-a-timestamp' } }),
    createRequest({ permissionGrant: { ...request.permissionGrant, expiresAt: '2026-02-30T00:00:00.000Z' } }),
    createRequest({ testingObjective: '  ' }),
    createRequest({ budget: { ...request.budget, tokenLimit: 0, tokenUsed: 1 } }),
    createRequest({ cancelled: true }),
  ];

  for (const blockedRequest of blockedRequests) {
    const port = new CountingPort();
    const outcome = createAdapter(port).invoke(blockedRequest);

    assert.equal(outcome.status, 'BLOCKED');
    assert.equal(port.calls, 0);
  }
});

test('TC-06 rejects incomplete, tampered, leaking, and overconfident successful output', () => {
  const request = createRequest();
  const sourceContent = request.authorizedTestContexts[0]!.content;
  const valid = (invocation: TestingInvocationRequest) => new DeterministicTestingAssistant(() => NOW).invoke(invocation);
  const invalidPorts: readonly TestingInvocationPort[] = [
    { invoke: (invocation) => ({ ...valid(invocation), result: undefined }) },
    {
      invoke: (invocation) => {
        const outcome = valid(invocation);
        return { ...outcome, evidence: [] };
      },
    },
    {
      invoke: (invocation) => {
        const outcome = valid(invocation);
        return {
          ...outcome,
          confidence: 'L4',
          result: outcome.result === undefined ? undefined : { ...outcome.result, confidence: 'L4' },
        };
      },
    },
    {
      invoke: (invocation) => {
        const outcome = valid(invocation);
        return {
          ...outcome,
          result: outcome.result === undefined ? undefined : {
            ...outcome.result,
            testAnalysisReport: `Static summary: ${sourceContent}`,
          },
        };
      },
    },
  ];

  for (const port of invalidPorts) {
    const outcome = createAdapter(port).invoke(request);

    assert.equal(outcome.status, 'FAILURE');
    assert.equal(outcome.failure?.category, 'OUTPUT_INVALID');
  }
});

test('TC-07 normalises a non-successful port response to an execution failure', () => {
  const port: TestingInvocationPort = {
    invoke: (invocation) => ({
      status: 'FAILURE',
      evidence: invocation.evidence,
      confidence: 'L3',
      timestamp: NOW,
      usage: { tokenUsed: 0, toolUsed: 0, timeUsedMs: 0, costUsed: 0 },
    }),
  };

  const outcome = createAdapter(port).invoke(createRequest());

  assert.equal(outcome.status, 'FAILURE');
  assert.equal(outcome.failure?.category, 'EXECUTION_FAILED');
  assert.equal(outcome.failure?.stage, 'INVOCATION');
});

test('TC-08 passes an immutable request snapshot and canonical evidence to the port', () => {
  let received: TestingInvocationRequest | undefined;
  const port: TestingInvocationPort = {
    invoke: (invocation) => {
      received = invocation;
      return new DeterministicTestingAssistant(() => NOW).invoke(invocation);
    },
  };

  const outcome = createAdapter(port).invoke(createRequest());

  assert.equal(outcome.status, 'SUCCESS');
  assert.ok(Object.isFrozen(received?.request));
  assert.ok(Object.isFrozen(received?.request.authorizedTestContexts));
  assert.ok(Object.isFrozen(received?.request.authorizedTestContexts[0]));
  assert.ok(Object.isFrozen(received?.request.executionContext));
  assert.ok(Object.isFrozen(received?.request.executionContext.allowedContextRefs));
  assert.ok(Object.isFrozen(received?.request.permissionGrant.allowedOperations));
  assert.ok(Object.isFrozen(received?.request.budget));
  assert.ok(Object.isFrozen(received?.evidence));
  assert.throws(() => {
    (received!.request.authorizedTestContexts as Array<{ content: string }>)[0]!.content = 'mutated';
  }, TypeError);
  assert.throws(() => {
    (received!.evidence as Array<{ summary: string }>)[0]!.summary = 'mutated';
  }, TypeError);
  assert.deepEqual(outcome.evidence, received?.evidence);
  assert.deepEqual(outcome.result?.evidence, received?.evidence);
});

test('TC-09 accepts a short ordinary context without treating it as a source leak', () => {
  const request = createRequest({
    authorizedTestContexts: [{
      ...createRequest().authorizedTestContexts[0]!,
      content: 'ok',
    }],
  });

  const outcome = createAdapter().invoke(request);

  assert.equal(outcome.status, 'SUCCESS');
  assert.equal(outcome.failure, undefined);
});

test('TC-10 normalises malformed nested result fields into controlled output validation failures', () => {
  const valid = (invocation: TestingInvocationRequest) => new DeterministicTestingAssistant(() => NOW).invoke(invocation);
  const malformedPorts: readonly TestingInvocationPort[] = [
    {
      invoke: (invocation) => {
        const outcome = valid(invocation);
        return {
          ...outcome,
          result: outcome.result === undefined ? undefined : {
            ...outcome.result,
            coverageFindings: undefined as unknown as typeof outcome.result.coverageFindings,
          },
        };
      },
    },
    {
      invoke: (invocation) => {
        const outcome = valid(invocation);
        return {
          ...outcome,
          result: outcome.result === undefined ? undefined : {
            ...outcome.result,
            riskFindings: [{}] as unknown as typeof outcome.result.riskFindings,
          },
        };
      },
    },
    {
      invoke: (invocation) => {
        const outcome = valid(invocation);
        return {
          ...outcome,
          result: outcome.result === undefined ? undefined : {
            ...outcome.result,
            resultRef: undefined as unknown as string,
          },
        };
      },
    },
  ];

  for (const port of malformedPorts) {
    const outcome = createAdapter(port).invoke(createRequest());

    assert.equal(outcome.status, 'FAILURE');
    assert.equal(outcome.failure?.category, 'OUTPUT_INVALID');
  }
});

test('TC-11 rejects a risk finding outside the LOW, MEDIUM, HIGH severity vocabulary', () => {
  const port: TestingInvocationPort = {
    invoke: (invocation) => {
      const outcome = new DeterministicTestingAssistant(() => NOW).invoke(invocation);
      return {
        ...outcome,
        result: outcome.result === undefined ? undefined : {
          ...outcome.result,
          riskFindings: [{
            ...outcome.result.riskFindings[0]!,
            severity: 'SEVERE' as unknown as 'LOW',
          }],
        },
      };
    },
  };

  const outcome = createAdapter(port).invoke(createRequest());

  assert.equal(outcome.status, 'FAILURE');
  assert.equal(outcome.failure?.category, 'OUTPUT_INVALID');
});

test('TC-12 rejects successful static output that reports non-zero resource usage', () => {
  const port: TestingInvocationPort = {
    invoke: (invocation) => ({
      ...new DeterministicTestingAssistant(() => NOW).invoke(invocation),
      usage: { tokenUsed: 1, toolUsed: 0, timeUsedMs: 0, costUsed: 0 },
    }),
  };

  const outcome = createAdapter(port).invoke(createRequest());

  assert.equal(outcome.status, 'FAILURE');
  assert.equal(outcome.failure?.category, 'OUTPUT_INVALID');
});

test('TC-13 records complete audit evidence for successful and rejected analysis without changing runtime state', () => {
  const repository = new InMemoryAuditRepository();
  const service = new TestingCapabilityRuntimeService(createAdapter(), new AuditService(repository), () => NOW);
  const succeeded = service.execute(createRequest());
  const blocked = service.execute(createRequest({ cancelled: true }));

  assert.equal(succeeded.auditEvent.eventType, 'TESTING_CAPABILITY_COMPLETED');
  assert.equal(succeeded.auditEvent.result, succeeded.outcome.result?.testAnalysisReport);
  assert.equal(succeeded.auditEvent.outputRef, succeeded.outcome.result?.resultRef);
  assert.deepEqual(succeeded.auditEvent.budgetSnapshot, createRequest().budget);
  assert.equal(blocked.auditEvent.eventType, 'TESTING_CAPABILITY_REJECTED');
  assert.equal(blocked.auditEvent.failureReason, 'CANCELLED');
  assert.equal(blocked.auditEvent.failureStage, 'PREFLIGHT');
  assert.equal(repository.listByWorkflowId('workflow-testing-1').length, 2);
});
