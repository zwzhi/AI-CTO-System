import test from 'node:test';
import assert from 'node:assert/strict';

import type { CodexExecutionRequest } from '../capability/codex-execution-contract.ts';
import { CODEX_OPERATIONS } from '../capability/codex-execution-contract.ts';
import { MockCodexCapability } from '../capability/mock-codex-capability.ts';
import { CodexCapabilityAdapter } from '../capability/codex-capability-adapter.ts';
import { PermissionBudgetGuard } from '../permission/permission-budget-guard.ts';
import { AuditService } from '../audit/audit-service.ts';
import { InMemoryAuditRepository } from '../audit/in-memory-audit-repository.ts';
import { CodexCapabilityRuntimeService } from '../services/codex-capability-runtime-service.ts';

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

test('Adapter rejects a missing operation permission before Mock invocation', () => {
  const adapter = new CodexCapabilityAdapter(new MockCodexCapability(), new PermissionBudgetGuard(), () => '2026-07-14T00:00:00.000Z');
  const outcome = adapter.invoke(createRequest({ permissionGrant: { ...createRequest().permissionGrant, allowedOperations: [] } }));
  assert.equal(outcome.status, 'BLOCKED');
  assert.equal(outcome.failure?.category, 'PERMISSION_DENIED');
});

test('Adapter rejects an unconfirmed change proposal before Mock invocation', () => {
  const adapter = new CodexCapabilityAdapter(new MockCodexCapability(), new PermissionBudgetGuard(), () => '2026-07-14T00:00:00.000Z');
  const outcome = adapter.invoke(createRequest({ operation: 'PROPOSE_CHANGE', permissionGrant: { ...createRequest().permissionGrant, allowedOperations: ['PROPOSE_CHANGE'] }, approval: { ...createRequest().approval, operation: 'PROPOSE_CHANGE', status: 'REJECTED' } }));
  assert.equal(outcome.status, 'BLOCKED');
  assert.equal(outcome.failure?.category, 'APPROVAL_REQUIRED');
});

test('Adapter rejects an exceeded budget before Mock invocation', () => {
  const adapter = new CodexCapabilityAdapter(new MockCodexCapability(), new PermissionBudgetGuard(), () => '2026-07-14T00:00:00.000Z');
  const outcome = adapter.invoke(createRequest({ budget: { ...createRequest().budget, tokenLimit: 1, tokenUsed: 2 } }));
  assert.equal(outcome.status, 'BLOCKED');
  assert.equal(outcome.failure?.category, 'BUDGET_EXCEEDED');
});

test('Codex runtime appends Result and Evidence audit without changing workflow state', () => {
  const service = new CodexCapabilityRuntimeService(
    new CodexCapabilityAdapter(new MockCodexCapability(), new PermissionBudgetGuard(), () => '2026-07-14T00:00:00.000Z'),
    new AuditService(new InMemoryAuditRepository()),
    () => '2026-07-14T00:00:00.000Z',
  );
  const result = service.execute(createRequest());
  assert.equal(result.outcome.status, 'SUCCESS');
  assert.equal(result.auditEvent.eventType, 'CODEX_CAPABILITY_COMPLETED');
  assert.equal(result.auditEvent.outputRef, result.outcome.result.resultRef);
});
