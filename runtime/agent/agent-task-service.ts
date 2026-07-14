import { RuntimeError } from '../models/runtime-error.ts';
import type {
  AgentTask,
  AgentTaskState,
  BudgetSnapshot,
  PlannerAgentResult,
  PlannerInput,
} from '../models/runtime-types.ts';
import type { AgentTaskRepositoryPort } from './agent-task-repository-port.ts';

const transitions: Readonly<Record<AgentTaskState, readonly AgentTaskState[]>> = {
  CREATED: ['ASSIGNED', 'CANCELLED'],
  ASSIGNED: ['RUNNING', 'FAILED', 'CANCELLED'],
  RUNNING: ['VALIDATING', 'FAILED', 'CANCELLED'],
  VALIDATING: ['COMPLETED', 'FAILED'],
  COMPLETED: [],
  FAILED: [],
  CANCELLED: [],
};

export class AgentTaskService {
  #nextId = 1;
  readonly #repository: AgentTaskRepositoryPort;
  readonly #now: () => string;

  constructor(repository: AgentTaskRepositoryPort, now: () => string = () => new Date().toISOString()) {
    this.#repository = repository;
    this.#now = now;
  }

  create(
    workflowId: string,
    agentId: string,
    input: PlannerInput,
    budget: BudgetSnapshot,
  ): AgentTask {
    if (this.#repository.getByWorkflowId(workflowId) !== undefined) {
      throw new RuntimeError('AGENT_TASK_ALREADY_EXISTS', 'workflow already has an agent task', { workflowId });
    }

    const timestamp = this.#now();
    return this.#repository.create({
      agentTaskId: `agent-task-${this.#nextId++}`,
      workflowId,
      agentId,
      agentType: 'PLANNER',
      input,
      status: 'CREATED',
      permissionScope: input.permissionScope,
      budget,
      evidence: [],
      createdAt: timestamp,
      updatedAt: timestamp,
    });
  }

  get(agentTaskId: string): AgentTask {
    const task = this.#repository.getById(agentTaskId);
    if (task === undefined) {
      throw new RuntimeError('AGENT_TASK_NOT_FOUND', 'agent task not found', { agentTaskId });
    }
    return task;
  }

  transition(agentTaskId: string, targetState: AgentTaskState): AgentTask {
    const task = this.get(agentTaskId);
    if (targetState === 'COMPLETED' || !transitions[task.status].includes(targetState)) {
      throw new RuntimeError('INVALID_AGENT_TASK_TRANSITION', 'agent task transition is not allowed', {
        from: task.status,
        to: targetState,
      });
    }
    return this.#repository.update({ ...task, status: targetState, updatedAt: this.#now() });
  }

  complete(agentTaskId: string, output: PlannerAgentResult): AgentTask {
    const task = this.get(agentTaskId);
    if (task.status !== 'VALIDATING' || output.status !== 'COMPLETED' || output.executionPlan === undefined) {
      throw new RuntimeError('INVALID_AGENT_TASK_TRANSITION', 'agent task completion requires a valid planner result', {
        from: task.status,
        to: 'COMPLETED',
      });
    }
    return this.#repository.update({
      ...task,
      status: 'COMPLETED',
      output,
      evidence: output.evidence,
      updatedAt: this.#now(),
    });
  }
}
