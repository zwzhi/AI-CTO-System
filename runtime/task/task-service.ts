import { RuntimeError } from '../models/runtime-error.ts';
import type { CapabilityResult, Task, TaskInput } from '../models/runtime-types.ts';
import type { TaskRepositoryPort } from './task-repository-port.ts';

export class TaskService {
  #nextId = 1;
  private readonly repository: TaskRepositoryPort;

  constructor(repository: TaskRepositoryPort) {
    this.repository = repository;
  }

  create(workflowId: string, input: TaskInput): Task {
    if (this.repository.getByWorkflowId(workflowId) !== undefined) {
      throw new RuntimeError('TASK_ALREADY_EXISTS', 'workflow already has a task', { workflowId });
    }

    return this.repository.create({
      taskId: `task-${this.#nextId++}`,
      workflowId,
      input,
      state: 'CREATED',
    });
  }

  get(taskId: string): Task {
    const task = this.repository.getById(taskId);
    if (task === undefined) {
      throw new RuntimeError('TASK_NOT_FOUND', 'task not found', { taskId });
    }
    return task;
  }

  complete(taskId: string, result: CapabilityResult): Task {
    const task = this.get(taskId);
    return this.repository.update({
      ...task,
      result,
      state: result.status === 'SUCCESS' ? 'COMPLETED' : 'FAILED',
    });
  }
}
