import type { AuditEvent } from '../models/runtime-types.ts';
import type { AuditRepositoryPort } from './audit-repository-port.ts';

export class AuditService {
  private readonly repository: AuditRepositoryPort;

  constructor(repository: AuditRepositoryPort) {
    this.repository = repository;
  }

  append(event: AuditEvent): AuditEvent {
    return this.repository.append(event);
  }

  listByWorkflowId(workflowId: string): AuditEvent[] {
    return this.repository.listByWorkflowId(workflowId);
  }
}
