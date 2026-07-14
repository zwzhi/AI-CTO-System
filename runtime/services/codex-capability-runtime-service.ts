import type { AuditService } from '../audit/audit-service.ts';
import type { CodexCapabilityAdapter } from '../capability/codex-capability-adapter.ts';
import type { CodexExecutionRequest } from '../capability/codex-execution-contract.ts';
import type { AuditEvent } from '../models/runtime-types.ts';

export interface CodexRuntimeExecutionResult {
  readonly outcome: ReturnType<CodexCapabilityAdapter['invoke']>;
  readonly auditEvent: AuditEvent;
}

export class CodexCapabilityRuntimeService {
  private readonly adapter: CodexCapabilityAdapter;
  private readonly auditService: AuditService;
  private readonly now: () => string;
  private nextAuditId = 1;

  constructor(adapter: CodexCapabilityAdapter, auditService: AuditService, now: () => string = () => new Date().toISOString()) {
    this.adapter = adapter;
    this.auditService = auditService;
    this.now = now;
  }

  execute(request: CodexExecutionRequest): CodexRuntimeExecutionResult {
    const outcome = this.adapter.invoke(request);
    const failed = outcome.failure;
    const auditEvent = this.auditService.append({
      auditId: `codex-audit-${this.nextAuditId++}`,
      workflowId: request.workflowId,
      taskId: request.taskId,
      eventType: outcome.status === 'SUCCESS' ? 'CODEX_CAPABILITY_COMPLETED' : 'CODEX_CAPABILITY_REJECTED',
      status: outcome.status,
      evidence: outcome.evidence,
      timestamp: this.now(),
      result: outcome.result.summary,
      inputRefs: [request.executionContext.intentRef, request.permissionGrant.grantId, request.approval.approvalId],
      outputRef: outcome.result.resultRef,
      budgetSnapshot: request.budget,
      ...(failed === undefined ? {} : { failureReason: failed.category, failureStage: failed.stage === 'INVOCATION' ? 'EXECUTION' as const : failed.stage }),
    });
    return { outcome, auditEvent };
  }
}
