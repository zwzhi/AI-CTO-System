import type { AuditService } from '../audit/audit-service.ts';
import type { CodeAnalysisCapabilityAdapter } from '../capability/code-analysis-capability-adapter.ts';
import type { CodeAnalysisExecutionRequest } from '../capability/code-analysis-execution-contract.ts';
import type { AuditEvent } from '../models/runtime-types.ts';

export interface CodeAnalysisRuntimeExecutionResult {
  readonly outcome: ReturnType<CodeAnalysisCapabilityAdapter['invoke']>;
  readonly auditEvent: AuditEvent;
}

export class CodeAnalysisCapabilityRuntimeService {
  private readonly adapter: CodeAnalysisCapabilityAdapter;
  private readonly auditService: AuditService;
  private readonly now: () => string;
  private nextAuditId = 1;

  constructor(adapter: CodeAnalysisCapabilityAdapter, auditService: AuditService, now: () => string = () => new Date().toISOString()) {
    this.adapter = adapter;
    this.auditService = auditService;
    this.now = now;
  }

  execute(request: CodeAnalysisExecutionRequest): CodeAnalysisRuntimeExecutionResult {
    const outcome = this.adapter.invoke(request);
    const failure = outcome.failure;
    const auditEvent = this.auditService.append({
      auditId: `code-analysis-audit-${this.nextAuditId++}`,
      workflowId: request.workflowId,
      taskId: request.taskId,
      eventType: outcome.status === 'SUCCESS' ? 'CODE_ANALYSIS_CAPABILITY_COMPLETED' : 'CODE_ANALYSIS_CAPABILITY_REJECTED',
      status: outcome.status,
      evidence: outcome.evidence,
      timestamp: this.now(),
      result: outcome.result?.analysisReport,
      inputRefs: [request.executionContext.intentRef, request.permissionGrant.grantId, request.repositoryContext.repositoryRef, ...request.authorizedCodeContexts.map((context) => context.sourceRef)],
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
