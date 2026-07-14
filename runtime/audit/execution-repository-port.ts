import type { ExecutionRecord } from '../models/runtime-types.ts';

export interface ExecutionRepositoryPort {
  append(record: ExecutionRecord): ExecutionRecord;
  listByWorkflowId(workflowId: string): ExecutionRecord[];
}
