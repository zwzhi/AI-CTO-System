import type { WorkflowInstance } from '../models/runtime-types.ts';
import type { WorkflowRepositoryPort } from './workflow-repository-port.ts';

function snapshot(workflow: WorkflowInstance): WorkflowInstance {
  return structuredClone(workflow);
}

export class InMemoryWorkflowRepository implements WorkflowRepositoryPort {
  readonly #workflows = new Map<string, WorkflowInstance>();

  create(workflow: WorkflowInstance): WorkflowInstance {
    this.#workflows.set(workflow.workflowId, snapshot(workflow));
    return snapshot(workflow);
  }

  getById(workflowId: string): WorkflowInstance | undefined {
    const workflow = this.#workflows.get(workflowId);
    return workflow === undefined ? undefined : snapshot(workflow);
  }

  update(workflow: WorkflowInstance): WorkflowInstance {
    this.#workflows.set(workflow.workflowId, snapshot(workflow));
    return snapshot(workflow);
  }
}
