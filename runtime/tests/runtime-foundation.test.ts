import test from 'node:test';
import assert from 'node:assert/strict';

import { RuntimeError } from '../models/runtime-error.ts';
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
