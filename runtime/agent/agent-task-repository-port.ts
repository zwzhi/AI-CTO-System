import type { AgentTask } from '../models/runtime-types.ts';

export interface AgentTaskRepositoryPort {
  create(task: AgentTask): AgentTask;
  getById(agentTaskId: string): AgentTask | undefined;
  getByWorkflowId(workflowId: string): AgentTask | undefined;
  update(task: AgentTask): AgentTask;
}
