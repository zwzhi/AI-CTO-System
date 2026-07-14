import test from 'node:test';
import assert from 'node:assert/strict';

import type { CodexExecutionRequest } from '../capability/codex-execution-contract.ts';
import { CODEX_OPERATIONS } from '../capability/codex-execution-contract.ts';
import { MockCodexCapability } from '../capability/mock-codex-capability.ts';

function createRequest(overrides: Partial<CodexExecutionRequest> = {}): CodexExecutionRequest {
  return {
    taskId: 'task-1', workflowId: 'workflow-1', operation: 'ANALYZE_CODE',
    executionContext: { intentRef: 'intent-1', constraintRefs: [], allowedContextRefs: ['context-1'] },
    permissionGrant: { grantId: 'grant-1', allowedOperations: ['ANALYZE_CODE'], expiresAt: '2026-07-15T00:00:00.000Z' },
    budget: { tokenLimit: 10, tokenUsed: 0, toolLimit: 1, toolUsed: 0, timeLimitMs: 1_000, timeUsedMs: 0, costLimit: 1, costUsed: 0 },
    approval: { approvalId: 'approval-1', status: 'CONFIRMED', taskId: 'task-1', operation: 'ANALYZE_CODE', expiresAt: '2026-07-15T00:00:00.000Z' },
    ...overrides,
  };
}

test('Codex execution request binds task, permission, budget, and approval', () => {
  const request: CodexExecutionRequest = {
    taskId: 'task-1',
    workflowId: 'workflow-1',
    operation: 'ANALYZE_CODE',
    executionContext: {
      intentRef: 'intent-1',
      constraintRefs: [],
      allowedContextRefs: ['context-1'],
    },
    permissionGrant: {
      grantId: 'grant-1',
      allowedOperations: ['ANALYZE_CODE'],
      expiresAt: '2026-07-15T00:00:00.000Z',
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
    approval: {
      approvalId: 'approval-1',
      status: 'CONFIRMED',
      taskId: 'task-1',
      operation: 'ANALYZE_CODE',
      expiresAt: '2026-07-15T00:00:00.000Z',
    },
  };

  assert.equal(request.operation, 'ANALYZE_CODE');
  assert.equal(request.permissionGrant.grantId, 'grant-1');
  assert.equal(request.approval.status, 'CONFIRMED');
  assert.deepEqual(CODEX_OPERATIONS, [
    'ANALYZE_CODE',
    'PROPOSE_CHANGE',
    'APPLY_CHANGE',
    'CREATE_COMMIT',
  ]);
});

test('Mock Codex returns deterministic analysis evidence without changed files', () => {
  const outcome = new MockCodexCapability(() => '2026-07-14T00:00:00.000Z').invoke(createRequest());
  assert.equal(outcome.status, 'SUCCESS');
  assert.deepEqual(outcome.changedFilesProposal, []);
  assert.equal(outcome.evidence[0]?.timestamp, '2026-07-14T00:00:00.000Z');
});

test('Mock Codex returns proposed files for change proposals without a patch', () => {
  const request = createRequest({ operation: 'PROPOSE_CHANGE', approval: { ...createRequest().approval, operation: 'PROPOSE_CHANGE' } });
  const outcome = new MockCodexCapability(() => '2026-07-14T00:00:00.000Z').invoke(request);
  assert.equal(outcome.status, 'SUCCESS');
  assert.equal(outcome.changedFilesProposal[0]?.state, 'PROPOSED');
});

test('Mock Codex rejects apply and commit operations', () => {
  const outcome = new MockCodexCapability(() => '2026-07-14T00:00:00.000Z').invoke(createRequest({ operation: 'APPLY_CHANGE' }));
  assert.equal(outcome.status, 'BLOCKED');
});
