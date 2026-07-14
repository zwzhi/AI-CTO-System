import test from 'node:test';
import assert from 'node:assert/strict';

import { DeterministicTestingAssistant } from '../capability/deterministic-testing-assistant.ts';
import {
  TESTING_OPERATIONS,
  type TestingInvocationRequest,
} from '../capability/testing-execution-contract.ts';

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
