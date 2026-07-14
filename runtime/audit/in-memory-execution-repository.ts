import type { ExecutionRecord } from '../models/runtime-types.ts';
import type { ExecutionRepositoryPort } from './execution-repository-port.ts';

function snapshot(record: ExecutionRecord): ExecutionRecord {
  return structuredClone(record);
}

export class InMemoryExecutionRepository implements ExecutionRepositoryPort {
  readonly #records: ExecutionRecord[] = [];

  append(record: ExecutionRecord): ExecutionRecord {
    this.#records.push(snapshot(record));
    return snapshot(record);
  }

  listByWorkflowId(workflowId: string): ExecutionRecord[] {
    return this.#records
      .filter((record) => record.workflowId === workflowId)
      .map(snapshot);
  }
}
