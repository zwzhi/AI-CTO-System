import test from 'node:test';
import assert from 'node:assert/strict';

import { RuntimeError } from '../models/runtime-error.ts';
import { InMemoryAuditRepository } from '../audit/in-memory-audit-repository.ts';
import { AuditService } from '../audit/audit-service.ts';
import { MockCapabilityAdapter } from '../capability/mock-capability-adapter.ts';
import { PermissionBudgetGuard } from '../permission/permission-budget-guard.ts';
import { InMemoryTaskRepository } from '../task/in-memory-task-repository.ts';
import { TaskService } from '../task/task-service.ts';
import { InMemoryWorkflowRepository } from '../workflow/in-memory-workflow-repository.ts';
import { WorkflowService } from '../workflow/workflow-service.ts';

function createWorkflowInput() {
  return {
    intentRef: 'intent-1',
    executionContext: {
      intentRef: 'intent-1',
      constraintRefs: [],
      allowedContextRefs: [],
    },
    controlMode: 'AUTO' as const,
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
  };
}

test('RuntimeError preserves code, message, and safe details', () => {
  const error = new RuntimeError(
    'INVALID_TRANSITION',
    'cannot transition',
    { from: 'CREATED', to: 'COMPLETED' },
  );

  assert.equal(error.code, 'INVALID_TRANSITION');
  assert.equal(error.message, 'cannot transition');
  assert.deepEqual(error.details, { from: 'CREATED', to: 'COMPLETED' });
});

test('WorkflowService allows only declared transitions', () => {
  const service = new WorkflowService(new InMemoryWorkflowRepository());
  const workflow = service.create(createWorkflowInput());
  const planning = service.transition(workflow.workflowId, 'PLANNING');

  assert.equal(planning.state, 'PLANNING');
  assert.throws(
    () => service.transition(workflow.workflowId, 'COMPLETED'),
    { code: 'INVALID_TRANSITION' },
  );
});

test('TaskService rejects a second task for the same workflow', () => {
  const workflow = new WorkflowService(new InMemoryWorkflowRepository()).create(
    createWorkflowInput(),
  );
  const tasks = new TaskService(new InMemoryTaskRepository());

  tasks.create(workflow.workflowId, { request: 'mock' });

  assert.throws(
    () => tasks.create(workflow.workflowId, { request: 'second' }),
    { code: 'TASK_ALREADY_EXISTS' },
  );
});

test('PermissionBudgetGuard denies an over-budget invocation', () => {
  const decision = new PermissionBudgetGuard().evaluate({
    budget: {
      ...createWorkflowInput().budget,
      tokenUsed: 2,
      tokenLimit: 1,
    },
    controlMode: 'AUTO',
  });

  assert.deepEqual(decision, { kind: 'DENY', reasonCode: 'BUDGET_EXCEEDED' });
});

test('MockCapabilityAdapter returns deterministic success evidence', () => {
  const adapter = new MockCapabilityAdapter(() => '2026-07-14T00:00:00.000Z');
  const result = adapter.invoke({
    taskId: 'task-1',
    input: { request: 'mock', mode: 'success' },
    executionContext: createWorkflowInput().executionContext,
  });

  assert.equal(result.status, 'SUCCESS');
  assert.equal(result.evidence[0]?.confidence, 'L3');
  assert.equal(result.timestamp, '2026-07-14T00:00:00.000Z');
});

test('MockCapabilityAdapter returns controlled failure evidence', () => {
  const result = new MockCapabilityAdapter(() => '2026-07-14T00:00:00.000Z').invoke({
    taskId: 'task-1',
    input: { request: 'mock', mode: 'failure' },
    executionContext: createWorkflowInput().executionContext,
  });

  assert.equal(result.status, 'FAILURE');
  assert.equal(result.error, 'mock capability failed');
  assert.equal(result.evidence[0]?.timestamp, '2026-07-14T00:00:00.000Z');
});

test('AuditService appends evidence without replacing prior events', () => {
  const audit = new AuditService(new InMemoryAuditRepository());
  audit.append({
    auditId: 'audit-1',
    workflowId: 'workflow-1',
    eventType: 'WORKFLOW_CREATED',
    status: 'CREATED',
    evidence: [],
    timestamp: '2026-07-14T00:00:00.000Z',
  });
  audit.append({
    auditId: 'audit-2',
    workflowId: 'workflow-1',
    eventType: 'CAPABILITY_COMPLETED',
    status: 'SUCCESS',
    evidence: [{
      evidenceId: 'evidence-1',
      source: 'mock-capability',
      summary: 'mock result',
      confidence: 'L3',
      timestamp: '2026-07-14T00:00:00.000Z',
    }],
    timestamp: '2026-07-14T00:00:00.000Z',
  });

  const events = audit.listByWorkflowId('workflow-1');
  assert.equal(events.length, 2);
  assert.equal(events[1]?.evidence[0]?.confidence, 'L3');
});
