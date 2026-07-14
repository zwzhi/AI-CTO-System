import type { AuditService } from '../audit/audit-service.ts';
import type { DocumentationCapabilityAdapter } from '../capability/documentation-capability-adapter.ts';
import type { DocumentationExecutionRequest } from '../capability/documentation-execution-contract.ts';
import type { AuditEvent } from '../models/runtime-types.ts';

export interface DocumentationRuntimeExecutionResult {
  readonly outcome: ReturnType<DocumentationCapabilityAdapter['invoke']>;
  readonly auditEvent: AuditEvent;
}

export class DocumentationCapabilityRuntimeService {
  private readonly adapter: DocumentationCapabilityAdapter;
  private readonly auditService: AuditService;
  private readonly now: () => string;
  private nextAuditId = 1;

  constructor(adapter: DocumentationCapabilityAdapter, auditService: AuditService, now: () => string = () => new Date().toISOString()) {
    this.adapter = adapter;
    this.auditService = auditService;
    this.now = now;
  }

  execute(request: DocumentationExecutionRequest): DocumentationRuntimeExecutionResult {
    const outcome = this.adapter.invoke(request);
    const failure = outcome.failure;
    const auditEvent = this.auditService.append({
      auditId: `documentation-audit-${this.nextAuditId++}`,
      workflowId: request.workflowId,
      taskId: request.taskId,
      eventType: outcome.status === 'SUCCESS' ? 'DOCUMENTATION_CAPABILITY_COMPLETED' : 'DOCUMENTATION_CAPABILITY_REJECTED',
      status: outcome.status,
      evidence: outcome.evidence,
      timestamp: this.now(),
      result: outcome.result?.draft,
      inputRefs: [request.executionContext.intentRef, request.permissionGrant.grantId, ...request.authorizedSources.map((source) => source.sourceRef)],
      outputRef: outcome.result?.resultRef,
      budgetSnapshot: request.budget,
      ...(failure === undefined ? {} : {
        failureReason: failure.category,
        failureStage: failure.stage === 'INVOCATION' ? 'EXECUTION' as const : failure.stage,
      }),
    });
    return { outcome, auditEvent };
  }
}
