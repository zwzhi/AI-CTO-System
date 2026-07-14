import type { AuditService } from '../audit/audit-service.ts';
import type { ExecutionRepositoryPort } from '../audit/execution-repository-port.ts';
import type { CapabilityAdapterPort } from '../capability/capability-adapter-port.ts';
import type {
  AuditEvent,
  CapabilityInvocation,
  Evidence,
  ExecutionRecord,
  Task,
  TaskInput,
  WorkflowInstance,
  WorkflowState,
} from '../models/runtime-types.ts';
import type { GuardDecision, PermissionBudgetGuard } from '../permission/permission-budget-guard.ts';
import type { TaskService } from '../task/task-service.ts';
import type { CreateWorkflowInput, WorkflowService } from '../workflow/workflow-service.ts';

export interface RuntimeFoundationDependencies {
  readonly workflowService: WorkflowService;
  readonly taskService: TaskService;
  readonly guard: PermissionBudgetGuard;
  readonly capabilityAdapter: CapabilityAdapterPort;
  readonly executionRepository: ExecutionRepositoryPort;
  readonly auditService: AuditService;
  readonly now?: () => string;
}

export interface RunOptions {
  readonly cancelled?: boolean;
  readonly markForRollback?: boolean;
}

export interface RuntimeRunResult {
  readonly workflow: WorkflowInstance;
  readonly task: Task;
  readonly capabilityInvocation?: CapabilityInvocation;
  readonly executionRecord?: ExecutionRecord;
  readonly auditEvents: AuditEvent[];
}

export class RuntimeFoundationService {
  readonly #workflowService: WorkflowService;
  readonly #taskService: TaskService;
  readonly #guard: PermissionBudgetGuard;
  readonly #capabilityAdapter: CapabilityAdapterPort;
  readonly #executionRepository: ExecutionRepositoryPort;
  readonly #auditService: AuditService;
  readonly #now: () => string;
  #nextAuditId = 1;
  #nextExecutionId = 1;
  #nextInvocationId = 1;
  #nextEvidenceId = 1;

  constructor(dependencies: RuntimeFoundationDependencies) {
    this.#workflowService = dependencies.workflowService;
    this.#taskService = dependencies.taskService;
    this.#guard = dependencies.guard;
    this.#capabilityAdapter = dependencies.capabilityAdapter;
    this.#executionRepository = dependencies.executionRepository;
    this.#auditService = dependencies.auditService;
    this.#now = dependencies.now ?? (() => new Date().toISOString());
  }

  run(
    workflowInput: CreateWorkflowInput,
    taskInput: TaskInput,
    options: RunOptions = {},
  ): RuntimeRunResult {
    let workflow = this.#workflowService.create(workflowInput);
    this.#audit(workflow, 'WORKFLOW_CREATED', workflow.state, 'workflow created');

    workflow = this.#workflowService.transition(workflow.workflowId, 'PLANNING');
    this.#audit(workflow, 'WORKFLOW_PLANNING', workflow.state, 'workflow entered planning');

    const task = this.#taskService.create(workflow.workflowId, taskInput);
    this.#audit(workflow, 'TASK_CREATED', task.state, 'single task created', task.taskId);

    const decision = this.#guard.evaluate({
      budget: workflow.budget,
      controlMode: workflow.controlMode,
      cancelled: options.cancelled,
    });

    if (decision.kind === 'DENY') {
      workflow = this.#workflowService.transition(workflow.workflowId, 'CANCELLED');
      this.#audit(workflow, 'EXECUTION_DENIED', workflow.state, decision.reasonCode, task.taskId);
      return this.#result(workflow, task);
    }

    if (decision.kind === 'CONFIRM_REQUIRED') {
      workflow = this.#workflowService.transition(workflow.workflowId, 'WAITING_APPROVAL');
      this.#audit(workflow, 'WAITING_APPROVAL', workflow.state, decision.reasonCode, task.taskId);
      return this.#result(workflow, task);
    }

    workflow = this.#workflowService.transition(workflow.workflowId, 'EXECUTING');
    this.#audit(workflow, 'WORKFLOW_EXECUTING', workflow.state, 'guard allowed execution', task.taskId);

    if (options.markForRollback === true) {
      workflow = this.#workflowService.transition(workflow.workflowId, 'ROLLING_BACK');
      this.#audit(workflow, 'WORKFLOW_ROLLING_BACK', workflow.state, 'rollback recorded without external action', task.taskId);
      workflow = this.#workflowService.transition(workflow.workflowId, 'CANCELLED');
      this.#audit(workflow, 'WORKFLOW_CANCELLED', workflow.state, 'rollback process closed', task.taskId);
      return this.#result(workflow, task);
    }

    const result = this.#capabilityAdapter.invoke({
      taskId: task.taskId,
      input: task.input,
      executionContext: workflow.executionContext,
    });
    const invocation: CapabilityInvocation = {
      invocationId: `invocation-${this.#nextInvocationId++}`,
      taskId: task.taskId,
      adapterId: 'mock',
      status: result.status,
      result,
      tokenUsed: 0,
    };
    const timestamp = this.#now();
    const executionRecord: ExecutionRecord = this.#executionRepository.append({
      executionId: `execution-${this.#nextExecutionId++}`,
      workflowId: workflow.workflowId,
      taskId: task.taskId,
      status: result.status,
      startedAt: timestamp,
      endedAt: timestamp,
      result,
    });
    const completedTask = this.#taskService.complete(task.taskId, result);
    this.#audit(workflow, 'CAPABILITY_COMPLETED', result.status, result.status === 'SUCCESS' ? 'mock capability succeeded' : 'mock capability failed', task.taskId, result.evidence);

    if (result.status === 'SUCCESS') {
      workflow = this.#workflowService.transition(workflow.workflowId, 'VALIDATING');
      this.#audit(workflow, 'WORKFLOW_VALIDATING', workflow.state, 'result validation started', task.taskId);
      workflow = this.#workflowService.transition(workflow.workflowId, 'COMPLETED');
      this.#audit(workflow, 'WORKFLOW_COMPLETED', workflow.state, 'workflow completed', task.taskId);
    } else {
      workflow = this.#workflowService.transition(workflow.workflowId, 'FAILED');
      this.#audit(workflow, 'WORKFLOW_FAILED', workflow.state, 'capability failure stopped execution', task.taskId, result.evidence);
    }

    return this.#result(workflow, completedTask, invocation, executionRecord);
  }

  #result(
    workflow: WorkflowInstance,
    task: Task,
    capabilityInvocation?: CapabilityInvocation,
    executionRecord?: ExecutionRecord,
  ): RuntimeRunResult {
    return {
      workflow,
      task,
      capabilityInvocation,
      executionRecord,
      auditEvents: this.#auditService.listByWorkflowId(workflow.workflowId),
    };
  }

  #audit(
    workflow: WorkflowInstance,
    eventType: string,
    status: AuditEvent['status'],
    summary: string,
    taskId?: string,
    evidence: readonly Evidence[] = [this.#evidence('runtime-foundation', summary)],
  ): void {
    this.#auditService.append({
      auditId: `audit-${this.#nextAuditId++}`,
      workflowId: workflow.workflowId,
      ...(taskId === undefined ? {} : { taskId }),
      eventType,
      status,
      evidence,
      timestamp: this.#now(),
      result: summary,
    });
  }

  #evidence(source: string, summary: string): Evidence {
    return {
      evidenceId: `evidence-${this.#nextEvidenceId++}`,
      source,
      summary,
      confidence: 'L3',
      timestamp: this.#now(),
    };
  }
}
