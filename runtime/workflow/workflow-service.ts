import { RuntimeError } from '../models/runtime-error.ts';
import type {
  BudgetSnapshot,
  ControlMode,
  ExecutionContext,
  WorkflowInstance,
  WorkflowState,
} from '../models/runtime-types.ts';
import type { WorkflowRepositoryPort } from './workflow-repository-port.ts';

export interface CreateWorkflowInput {
  readonly intentRef: string;
  readonly executionContext: ExecutionContext;
  readonly controlMode: ControlMode;
  readonly budget: BudgetSnapshot;
}

const transitions: Readonly<Record<WorkflowState, readonly WorkflowState[]>> = {
  CREATED: ['PLANNING'],
  PLANNING: ['WAITING_APPROVAL', 'EXECUTING', 'CANCELLED', 'FAILED'],
  WAITING_APPROVAL: ['EXECUTING', 'CANCELLED'],
  EXECUTING: ['VALIDATING', 'FAILED', 'PAUSED', 'CANCELLED', 'ROLLING_BACK'],
  VALIDATING: ['COMPLETED', 'FAILED', 'ROLLING_BACK'],
  COMPLETED: [],
  FAILED: [],
  PAUSED: ['EXECUTING', 'CANCELLED'],
  ROLLING_BACK: ['CANCELLED'],
  CANCELLED: [],
};

export class WorkflowService {
  #nextId = 1;
  private readonly repository: WorkflowRepositoryPort;
  private readonly now: () => string;

  constructor(repository: WorkflowRepositoryPort, now: () => string = () => new Date().toISOString()) {
    this.repository = repository;
    this.now = now;
  }

  create(input: CreateWorkflowInput): WorkflowInstance {
    const timestamp = this.now();
    const workflow: WorkflowInstance = {
      workflowId: `workflow-${this.#nextId++}`,
      intentRef: input.intentRef,
      executionContext: input.executionContext,
      controlMode: input.controlMode,
      budget: input.budget,
      state: 'CREATED',
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    return this.repository.create(workflow);
  }

  get(workflowId: string): WorkflowInstance {
    const workflow = this.repository.getById(workflowId);
    if (workflow === undefined) {
      throw new RuntimeError('WORKFLOW_NOT_FOUND', 'workflow not found', { workflowId });
    }
    return workflow;
  }

  transition(workflowId: string, targetState: WorkflowState): WorkflowInstance {
    const workflow = this.get(workflowId);
    if (!transitions[workflow.state].includes(targetState)) {
      throw new RuntimeError('INVALID_TRANSITION', 'workflow transition is not allowed', {
        from: workflow.state,
        to: targetState,
      });
    }

    return this.repository.update({
      ...workflow,
      state: targetState,
      updatedAt: this.now(),
    });
  }
}
