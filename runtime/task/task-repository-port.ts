import type { Task } from '../models/runtime-types.ts';

export interface TaskRepositoryPort {
  create(task: Task): Task;
  getById(taskId: string): Task | undefined;
  getByWorkflowId(workflowId: string): Task | undefined;
  update(task: Task): Task;
}
