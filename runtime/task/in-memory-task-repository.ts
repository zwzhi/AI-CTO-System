import type { Task } from '../models/runtime-types.ts';
import type { TaskRepositoryPort } from './task-repository-port.ts';

function snapshot(task: Task): Task {
  return structuredClone(task);
}

export class InMemoryTaskRepository implements TaskRepositoryPort {
  readonly #tasks = new Map<string, Task>();

  create(task: Task): Task {
    this.#tasks.set(task.taskId, snapshot(task));
    return snapshot(task);
  }

  getById(taskId: string): Task | undefined {
    const task = this.#tasks.get(taskId);
    return task === undefined ? undefined : snapshot(task);
  }

  getByWorkflowId(workflowId: string): Task | undefined {
    for (const task of this.#tasks.values()) {
      if (task.workflowId === workflowId) {
        return snapshot(task);
      }
    }
    return undefined;
  }

  update(task: Task): Task {
    this.#tasks.set(task.taskId, snapshot(task));
    return snapshot(task);
  }
}
