import type { AuditService } from '../audit/audit-service.ts';
import type { AgentTaskService } from '../agent/agent-task-service.ts';
import type { PlannerAgentPort } from '../agent/planner-agent-port.ts';
import type {
  AgentTask,
  AgentFailureStage,
  AgentPermissionScope,
  ApprovalStatus,
  AuditEvent,
  Evidence,
  ExecutionPlan,
  PlannerInput,
  WorkflowInstance,
} from '../models/runtime-types.ts';
import type { PermissionBudgetGuard } from '../permission/permission-budget-guard.ts';
import type { CreateWorkflowInput, WorkflowService } from '../workflow/workflow-service.ts';

export interface SingleAgentRuntimeDependencies {
  readonly workflowService: WorkflowService;
  readonly agentTaskService: AgentTaskService;
  readonly guard: PermissionBudgetGuard;
  readonly planner: PlannerAgentPort;
  readonly auditService: AuditService;
  readonly now?: () => string;
}

export interface PlannerRunOptions {
  readonly cancelled?: boolean;
}

export interface PlannerRunResult {
  readonly workflow: WorkflowInstance;
  readonly agentTask: AgentTask;
  readonly executionPlan?: ExecutionPlan;
  readonly auditEvents: AuditEvent[];
  readonly capabilityInvocation?: undefined;
  readonly executionRecord?: undefined;
  readonly followUpExecutionCreated: false;
}

interface AgentAuditDetails {
  readonly outputRef?: string;
  readonly failureReason?: string;
  readonly failureStage?: AgentFailureStage;
}

export class SingleAgentRuntimeService {
  readonly #workflowService: WorkflowService;
  readonly #agentTaskService: AgentTaskService;
  readonly #guard: PermissionBudgetGuard;
  readonly #planner: PlannerAgentPort;
  readonly #auditService: AuditService;
  readonly #now: () => string;
  #nextAuditId = 1;

  constructor(dependencies: SingleAgentRuntimeDependencies) {
    this.#workflowService = dependencies.workflowService;
    this.#agentTaskService = dependencies.agentTaskService;
    this.#guard = dependencies.guard;
    this.#planner = dependencies.planner;
    this.#auditService = dependencies.auditService;
    this.#now = dependencies.now ?? (() => new Date().toISOString());
  }

  plan(
    workflowInput: CreateWorkflowInput,
    input: PlannerInput,
    options: PlannerRunOptions = {},
  ): PlannerRunResult {
    let workflow = this.#workflowService.create(workflowInput);
    this.#audit(workflow, 'WORKFLOW_CREATED', workflow.state, 'workflow created');
    workflow = this.#workflowService.transition(workflow.workflowId, 'PLANNING');
    this.#audit(workflow, 'WORKFLOW_PLANNING', workflow.state, 'workflow entered planning');

    let agentTask = this.#agentTaskService.create(
      workflow.workflowId,
      this.#planner.agentId,
      input,
      workflow.budget,
    );
    this.#audit(workflow, 'AGENT_TASK_CREATED', agentTask.status, 'planner agent task created', agentTask);
    agentTask = this.#agentTaskService.transition(agentTask.agentTaskId, 'ASSIGNED');
    this.#audit(workflow, 'PLANNER_ASSIGNED', agentTask.status, 'planner assigned', agentTask);

    if (!this.#hasPlannerPermission(agentTask)) {
      agentTask = this.#agentTaskService.transition(agentTask.agentTaskId, 'FAILED');
      workflow = this.#workflowService.transition(workflow.workflowId, 'FAILED');
      this.#audit(workflow, 'AGENT_PERMISSION_DENIED', agentTask.status, 'planner lacks GENERATE_PLAN permission', agentTask, undefined, 'NOT_REQUESTED', undefined, {
        failureReason: 'planner lacks GENERATE_PLAN permission',
        failureStage: 'PREFLIGHT',
      });
      return this.#result(workflow, agentTask);
    }

    const decision = this.#guard.evaluatePlannerPreflight({
      budget: workflow.budget,
      controlMode: workflow.controlMode,
      cancelled: options.cancelled,
    });
    if (decision.kind === 'DENY') {
      if (decision.reasonCode === 'OPERATION_CANCELLED') {
        agentTask = this.#agentTaskService.transition(agentTask.agentTaskId, 'CANCELLED');
        workflow = this.#workflowService.transition(workflow.workflowId, 'CANCELLED');
        this.#audit(workflow, 'PLANNER_CANCELLED', agentTask.status, decision.reasonCode, agentTask, undefined, 'CANCELLED', undefined, {
          failureReason: decision.reasonCode,
          failureStage: 'PREFLIGHT',
        });
      } else {
        agentTask = this.#agentTaskService.transition(agentTask.agentTaskId, 'FAILED');
        workflow = this.#workflowService.transition(workflow.workflowId, 'FAILED');
        this.#audit(
          workflow,
          decision.reasonCode === 'BUDGET_EXCEEDED' ? 'AGENT_BUDGET_DENIED' : 'AGENT_GUARD_DENIED',
          agentTask.status,
          decision.reasonCode,
          agentTask,
          undefined,
          'NOT_REQUESTED',
          undefined,
          { failureReason: decision.reasonCode, failureStage: 'PREFLIGHT' },
        );
      }
      return this.#result(workflow, agentTask);
    }

    agentTask = this.#agentTaskService.transition(agentTask.agentTaskId, 'RUNNING');
    const startedAt = this.#now();
    this.#audit(workflow, 'PLANNER_STARTED', agentTask.status, 'deterministic planner started', agentTask);
    const plannerResult = this.#planner.execute({
      agentTaskId: agentTask.agentTaskId,
      workflowId: workflow.workflowId,
      executionContext: workflow.executionContext,
      ...input,
    });
    const endedAt = this.#now();

    if (plannerResult.status !== 'COMPLETED' || plannerResult.executionPlan === undefined) {
      agentTask = this.#agentTaskService.transition(agentTask.agentTaskId, 'FAILED');
      workflow = this.#workflowService.transition(workflow.workflowId, 'FAILED');
      this.#audit(workflow, 'PLANNER_FAILED', agentTask.status, plannerResult.failure ?? 'planner failed', agentTask, plannerResult.evidence, 'NOT_REQUESTED', this.#duration(startedAt, endedAt), {
        failureReason: plannerResult.failure ?? 'planner failed',
        failureStage: 'EXECUTION',
      });
      return this.#result(workflow, agentTask);
    }

    agentTask = this.#agentTaskService.transition(agentTask.agentTaskId, 'VALIDATING');
    if (!this.#isValidPlan(plannerResult.executionPlan, workflow, agentTask)) {
      agentTask = this.#agentTaskService.transition(agentTask.agentTaskId, 'FAILED');
      workflow = this.#workflowService.transition(workflow.workflowId, 'FAILED');
      this.#audit(workflow, 'PLANNER_FAILED', agentTask.status, 'invalid execution plan contract', agentTask, plannerResult.evidence, 'NOT_REQUESTED', this.#duration(startedAt, endedAt), {
        failureReason: 'invalid execution plan contract',
        failureStage: 'VALIDATION',
      });
      return this.#result(workflow, agentTask);
    }

    agentTask = this.#agentTaskService.complete(agentTask.agentTaskId, plannerResult);
    workflow = this.#workflowService.transition(workflow.workflowId, 'WAITING_APPROVAL');
    const duration = this.#duration(startedAt, endedAt);
    this.#audit(workflow, 'PLAN_PROPOSED', agentTask.status, 'deterministic plan proposed', agentTask, plannerResult.evidence, 'WAITING_APPROVAL', duration, {
      outputRef: plannerResult.executionPlan.executionPlanId,
    });
    this.#audit(workflow, 'WORKFLOW_WAITING_APPROVAL', workflow.state, 'human confirmation required', agentTask, plannerResult.evidence, 'WAITING_APPROVAL', duration, {
      outputRef: plannerResult.executionPlan.executionPlanId,
    });
    return this.#result(workflow, agentTask, plannerResult.executionPlan);
  }

  #result(workflow: WorkflowInstance, agentTask: AgentTask, executionPlan?: ExecutionPlan): PlannerRunResult {
    return {
      workflow,
      agentTask,
      ...(executionPlan === undefined ? {} : { executionPlan }),
      auditEvents: this.#auditService.listByWorkflowId(workflow.workflowId),
      followUpExecutionCreated: false,
    };
  }

  #hasPlannerPermission(task: AgentTask): boolean {
    return task.permissionScope.allowedActions.includes('GENERATE_PLAN')
      && !task.permissionScope.deniedActions.includes('GENERATE_PLAN');
  }

  #isValidPlan(plan: ExecutionPlan, workflow: WorkflowInstance, agentTask: AgentTask): boolean {
    return plan.status === 'PROPOSED'
      && plan.approvalRequired === true
      && plan.workflowId === workflow.workflowId
      && plan.agentTaskId === agentTask.agentTaskId
      && plan.plannerVersion === this.#planner.plannerVersion
      && plan.planSchemaVersion === this.#planner.planSchemaVersion
      && plan.constraintRefs.every((constraintRef) => workflow.executionContext.constraintRefs.includes(constraintRef))
      && plan.evidence.length > 0;
  }

  #audit(
    workflow: WorkflowInstance,
    eventType: string,
    status: AuditEvent['status'],
    summary: string,
    agentTask?: AgentTask,
    evidence: readonly Evidence[] = [this.#evidence(summary)],
    approvalStatus: ApprovalStatus = 'NOT_REQUESTED',
    executionDurationMs?: number,
    details: AgentAuditDetails = {},
  ): void {
    this.#auditService.append({
      auditId: `agent-audit-${this.#nextAuditId++}`,
      workflowId: workflow.workflowId,
      ...(agentTask === undefined ? {} : {
        agent: {
          agentTaskId: agentTask.agentTaskId,
          agentId: agentTask.agentId,
          agentType: agentTask.agentType,
          plannerVersion: this.#planner.plannerVersion,
          planSchemaVersion: this.#planner.planSchemaVersion,
        },
        inputRefs: [agentTask.input.intentResultRef, ...workflow.executionContext.allowedContextRefs],
        permissionSnapshot: this.#permissionSnapshot(agentTask.permissionScope),
        budgetSnapshot: { ...workflow.budget },
      }),
      eventType,
      status,
      evidence,
      timestamp: this.#now(),
      result: summary,
      approvalStatus,
      ...(executionDurationMs === undefined ? {} : { executionDurationMs }),
      ...(details.outputRef === undefined ? {} : { outputRef: details.outputRef }),
      ...(details.failureReason === undefined ? {} : { failureReason: details.failureReason }),
      ...(details.failureStage === undefined ? {} : { failureStage: details.failureStage }),
    });
  }

  #evidence(summary: string): Evidence {
    return {
      evidenceId: `agent-runtime-evidence-${this.#nextAuditId}`,
      source: 'single-agent-runtime',
      summary,
      confidence: 'L3',
      timestamp: this.#now(),
    };
  }

  #duration(startedAt: string, endedAt: string): number {
    return Math.max(0, Date.parse(endedAt) - Date.parse(startedAt));
  }

  #permissionSnapshot(scope: AgentPermissionScope): AgentPermissionScope {
    return {
      allowedActions: [...scope.allowedActions],
      deniedActions: [...scope.deniedActions],
    };
  }
}
