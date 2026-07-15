import type { AuditService } from '../audit/audit-service.ts';
import type { CodeModificationCapabilityAdapter } from '../capability/code-modification-capability-adapter.ts';
import type {
  ChangeEvidenceBinding,
  ModificationExecutionRequest,
} from '../capability/code-modification-execution-contract.ts';
import type { AuditEvent, Evidence } from '../models/runtime-types.ts';

export interface CodeModificationCapabilityRuntimeExecutionResult {
  readonly outcome: ReturnType<CodeModificationCapabilityAdapter['invoke']>;
  readonly auditEvent: AuditEvent;
}

function toAuditEvidence(bindings: readonly ChangeEvidenceBinding[]): readonly Evidence[] {
  return bindings.map((binding) => ({
    evidenceId: binding.evidenceRef,
    source: binding.source,
    summary: binding.summary,
    confidence: binding.confidence,
    timestamp: binding.timestamp,
    reference: binding.evidenceRef,
  }));
}

export class CodeModificationCapabilityRuntimeService {
  private readonly adapter: CodeModificationCapabilityAdapter;
  private readonly auditService: AuditService;
  private readonly now: () => string;
  private nextAuditId = 1;

  constructor(
    adapter: CodeModificationCapabilityAdapter,
    auditService: AuditService,
    now: () => string = () => new Date().toISOString(),
  ) {
    this.adapter = adapter;
    this.auditService = auditService;
    this.now = now;
  }

  execute(request: ModificationExecutionRequest): CodeModificationCapabilityRuntimeExecutionResult {
    const outcome = this.adapter.invoke(request);
    const failure = outcome.failure;
    const proposal = outcome.result?.changeProposal;
    const proposedDiff = outcome.result?.proposedDiff;
    const auditEvent = this.auditService.append({
      auditId: `code-modification-capability-audit-${this.nextAuditId++}`,
      workflowId: request.workflowId,
      taskId: request.taskId,
      eventType: outcome.status === 'SUCCESS' ? 'CODE_MODIFICATION_CAPABILITY_PROPOSED' : 'CODE_MODIFICATION_CAPABILITY_REJECTED',
      status: outcome.status,
      evidence: toAuditEvidence(outcome.evidence),
      timestamp: this.now(),
      result: proposal === undefined || proposedDiff === undefined
        ? undefined
        : `proposal=${proposal.changeId};diff=${proposedDiff.diffId};approval=${proposal.approvalStatus}`,
      inputRefs: [
        request.executionContext.intentRef,
        request.permissionGrant.grantId,
        ...request.authorizedChangeContexts.map((context) => context.sourceRef),
        ...request.codeAnalysisEvidence.map((binding) => binding.evidenceRef),
        ...request.testEvidence.map((binding) => binding.evidenceRef),
      ],
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
