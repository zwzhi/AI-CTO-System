import test from 'node:test';
import assert from 'node:assert/strict';

import { InMemoryAgentTaskRepository } from '../agent/in-memory-agent-task-repository.ts';
import { AgentTaskService } from '../agent/agent-task-service.ts';
import { DeterministicPlanner } from '../agent/deterministic-planner.ts';
import { InMemoryAuditRepository } from '../audit/in-memory-audit-repository.ts';
import { AuditService } from '../audit/audit-service.ts';
import { PermissionBudgetGuard } from '../permission/permission-budget-guard.ts';
import { SingleAgentRuntimeService } from '../services/single-agent-runtime-service.ts';
import { InMemoryWorkflowRepository } from '../workflow/in-memory-workflow-repository.ts';
import { WorkflowService } from '../workflow/workflow-service.ts';

const timestamp = '2026-07-14T00:00:00.000Z';

function createWorkflowInput(overrides: Record<string, unknown> = {}) {
  return {
    intentRef: 'intent-1',
    executionContext: {
      intentRef: 'intent-1',
      constraintRefs: ['constraint-1'],
      allowedContextRefs: ['context-1'],
    },
    controlMode: 'CONFIRM' as const,
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
    ...overrides,
  };
}

function createPlannerInput(overrides: Record<string, unknown> = {}) {
  return {
    userRequest: 'Create a bounded delivery plan',
    intentResultRef: 'intent-result-1',
    intentType: 'FEATURE_REQUEST' as const,
    permissionScope: {
      allowedActions: ['GENERATE_PLAN'] as const,
      deniedActions: [] as const,
    },
    ...overrides,
  };
}

function createRuntime() {
  return new SingleAgentRuntimeService({
    workflowService: new WorkflowService(new InMemoryWorkflowRepository(), () => timestamp),
    agentTaskService: new AgentTaskService(new InMemoryAgentTaskRepository()),
    guard: new PermissionBudgetGuard(),
    planner: new DeterministicPlanner({
      plannerVersion: '1.0.0',
      planSchemaVersion: '1.0',
      now: () => timestamp,
    }),
    auditService: new AuditService(new InMemoryAuditRepository()),
    now: () => timestamp,
  });
}

test('DeterministicPlanner returns the same versioned plan for the same input', () => {
  const planner = new DeterministicPlanner({
    plannerVersion: '1.0.0',
    planSchemaVersion: '1.0',
    now: () => timestamp,
  });
  const input = {
    agentTaskId: 'agent-task-1',
    workflowId: 'workflow-1',
    executionContext: createWorkflowInput().executionContext,
    ...createPlannerInput(),
  };

  const first = planner.execute(input);
  const second = planner.execute(input);

  assert.equal(first.status, 'COMPLETED');
  assert.deepEqual(first.executionPlan, second.executionPlan);
  assert.equal(first.executionPlan?.plannerVersion, '1.0.0');
  assert.equal(first.executionPlan?.planSchemaVersion, '1.0');
  assert.equal(first.executionPlan?.status, 'PROPOSED');
  assert.equal(first.executionPlan?.approvalRequired, true);
  assert.ok(first.evidence.length > 0);
});

test('DeterministicPlanner returns bounded failure evidence for an unsupported intent type', () => {
  const result = new DeterministicPlanner({
    plannerVersion: '1.0.0',
    planSchemaVersion: '1.0',
    now: () => timestamp,
  }).execute({
    agentTaskId: 'agent-task-unsupported',
    workflowId: 'workflow-1',
    executionContext: createWorkflowInput().executionContext,
    ...createPlannerInput({ intentType: 'UNKNOWN' }),
  });

  assert.equal(result.status, 'FAILED');
  assert.equal(result.executionPlan, undefined);
  assert.match(result.failure ?? '', /unsupported/);
  assert.ok(result.evidence.length > 0);
});

test('AgentTaskService permits only declared lifecycle transitions', () => {
  const service = new AgentTaskService(new InMemoryAgentTaskRepository());
  const task = service.create('workflow-1', 'planner-deterministic', createPlannerInput(), createWorkflowInput().budget);
  const assigned = service.transition(task.agentTaskId, 'ASSIGNED');
  const running = service.transition(assigned.agentTaskId, 'RUNNING');
  const validating = service.transition(running.agentTaskId, 'VALIDATING');
  assert.throws(
    () => service.transition(validating.agentTaskId, 'COMPLETED'),
    { code: 'INVALID_AGENT_TASK_TRANSITION' },
  );
  const completed = service.complete(
    validating.agentTaskId,
    new DeterministicPlanner({
      plannerVersion: '1.0.0',
      planSchemaVersion: '1.0',
      now: () => timestamp,
    }).execute({
      agentTaskId: validating.agentTaskId,
      workflowId: validating.workflowId,
      executionContext: createWorkflowInput().executionContext,
      ...createPlannerInput(),
    }),
  );

  assert.equal(completed.status, 'COMPLETED');
  assert.ok(completed.output?.executionPlan);
  assert.throws(
    () => service.transition(completed.agentTaskId, 'RUNNING'),
    { code: 'INVALID_AGENT_TASK_TRANSITION' },
  );
});

test('SingleAgentRuntimeService lets Workflow Engine place a valid plan in WAITING_APPROVAL', () => {
  const result = createRuntime().plan(createWorkflowInput(), createPlannerInput());

  assert.equal(result.workflow.state, 'WAITING_APPROVAL');
  assert.equal(result.agentTask.status, 'COMPLETED');
  assert.equal(result.executionPlan?.status, 'PROPOSED');
  assert.equal(result.executionPlan?.approvalRequired, true);
  assert.equal(result.executionPlan?.workflowId, result.workflow.workflowId);
});

test('WAITING_APPROVAL blocks all follow-up execution after plan generation', () => {
  const result = createRuntime().plan(createWorkflowInput(), createPlannerInput());

  assert.equal(result.workflow.state, 'WAITING_APPROVAL');
  assert.equal(result.capabilityInvocation, undefined);
  assert.equal(result.executionRecord, undefined);
  assert.equal(result.followUpExecutionCreated, false);
});

test('SingleAgentRuntimeService rejects Planner execution without GENERATE_PLAN permission', () => {
  const result = createRuntime().plan(
    createWorkflowInput(),
    createPlannerInput({
      permissionScope: { allowedActions: [], deniedActions: ['GENERATE_PLAN'] },
    }),
  );

  assert.equal(result.workflow.state, 'FAILED');
  assert.equal(result.agentTask.status, 'FAILED');
  assert.equal(result.executionPlan, undefined);
  assert.ok(result.auditEvents.some((event) => event.eventType === 'AGENT_PERMISSION_DENIED'));
});

test('SingleAgentRuntimeService records complete agent audit evidence for a proposed plan', () => {
  const result = createRuntime().plan(createWorkflowInput(), createPlannerInput());
  const proposed = result.auditEvents.find((event) => event.eventType === 'PLAN_PROPOSED');

  assert.equal(proposed?.agent?.agentId, 'planner-deterministic');
  assert.equal(proposed?.agent?.agentType, 'PLANNER');
  assert.equal(proposed?.agent?.plannerVersion, '1.0.0');
  assert.equal(proposed?.agent?.planSchemaVersion, '1.0');
  assert.equal(proposed?.approvalStatus, 'WAITING_APPROVAL');
  assert.ok((proposed?.executionDurationMs ?? 0) >= 0);
  assert.ok((proposed?.evidence.length ?? 0) > 0);
});

test('SingleAgentRuntimeService cancels AgentTask before Planner execution when Workflow is cancelled', () => {
  const result = createRuntime().plan(
    createWorkflowInput(),
    createPlannerInput(),
    { cancelled: true },
  );

  assert.equal(result.workflow.state, 'CANCELLED');
  assert.equal(result.agentTask.status, 'CANCELLED');
  assert.equal(result.executionPlan, undefined);
  assert.ok(result.auditEvents.some((event) => event.eventType === 'PLANNER_CANCELLED'));
});

test('SingleAgentRuntimeService stops Planner work when the budget is exceeded', () => {
  const result = createRuntime().plan(
    createWorkflowInput({
      budget: { ...createWorkflowInput().budget, tokenLimit: 1, tokenUsed: 2 },
    }),
    createPlannerInput(),
  );

  assert.equal(result.workflow.state, 'FAILED');
  assert.equal(result.agentTask.status, 'FAILED');
  assert.equal(result.executionPlan, undefined);
  assert.ok(result.auditEvents.some((event) => event.eventType === 'AGENT_BUDGET_DENIED'));
});
