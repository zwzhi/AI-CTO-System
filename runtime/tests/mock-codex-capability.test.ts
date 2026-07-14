import test from 'node:test';
import assert from 'node:assert/strict';

import type { CodexExecutionRequest } from '../capability/codex-execution-contract.ts';
import { CODEX_OPERATIONS } from '../capability/codex-execution-contract.ts';

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
