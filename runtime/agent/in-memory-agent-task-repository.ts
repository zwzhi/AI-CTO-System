import type { AgentTask } from '../models/runtime-types.ts';
import type { AgentTaskRepositoryPort } from './agent-task-repository-port.ts';

function snapshot(task: AgentTask): AgentTask {
  return structuredClone(task);
}

export class InMemoryAgentTaskRepository implements AgentTaskRepositoryPort {
  readonly #tasks = new Map<string, AgentTask>();

  create(task: AgentTask): AgentTask {
    this.#tasks.set(task.agentTaskId, snapshot(task));
    return snapshot(task);
  }

  getById(agentTaskId: string): AgentTask | undefined {
    const task = this.#tasks.get(agentTaskId);
    return task === undefined ? undefined : snapshot(task);
  }

  getByWorkflowId(workflowId: string): AgentTask | undefined {
    for (const task of this.#tasks.values()) {
      if (task.workflowId === workflowId) {
        return snapshot(task);
      }
    }
    return undefined;
  }

  update(task: AgentTask): AgentTask {
    this.#tasks.set(task.agentTaskId, snapshot(task));
    return snapshot(task);
  }
}
