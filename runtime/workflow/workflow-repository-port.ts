import type { WorkflowInstance } from '../models/runtime-types.ts';

export interface WorkflowRepositoryPort {
  create(workflow: WorkflowInstance): WorkflowInstance;
  getById(workflowId: string): WorkflowInstance | undefined;
  update(workflow: WorkflowInstance): WorkflowInstance;
}
