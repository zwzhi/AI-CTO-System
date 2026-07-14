import type { AuditEvent } from '../models/runtime-types.ts';
import type { AuditRepositoryPort } from './audit-repository-port.ts';

function snapshot(event: AuditEvent): AuditEvent {
  return structuredClone(event);
}

export class InMemoryAuditRepository implements AuditRepositoryPort {
  readonly #events: AuditEvent[] = [];

  append(event: AuditEvent): AuditEvent {
    this.#events.push(snapshot(event));
    return snapshot(event);
  }

  listByWorkflowId(workflowId: string): AuditEvent[] {
    return this.#events
      .filter((event) => event.workflowId === workflowId)
      .map(snapshot);
  }
}
