import type { AuditEvent } from '../models/runtime-types.ts';

export interface AuditRepositoryPort {
  append(event: AuditEvent): AuditEvent;
  listByWorkflowId(workflowId: string): AuditEvent[];
}
