import type { Evidence } from '../runtime/models/runtime-types.ts';
import type { EligibilityResult, OptimizationAction, OptimizationExecutionRequest } from './optimization-execution-contract.ts';

const ALLOWED_ACTIONS: readonly OptimizationAction[] = ['DEDUPLICATE_EXACT_BLOCKS', 'NORMALIZE_FORMATTING', 'NORMALIZE_HEADINGS'];
const blank = (value: string) => value.trim().length === 0;

export class OptimizationEligibilityService {
  check(request: OptimizationExecutionRequest): EligibilityResult {
    let reason: string | undefined;
    if (request.autonomyDecision !== 'AUTO_EXECUTE' || !request.autoExecuteTestAuthorization) reason = 'Explicit AUTO_EXECUTE test authorization is required.';
    else if ([request.workflowId, request.taskId, request.proposalRef, request.riskAssessmentRef, request.validationPlanRef, request.rollbackPlanRef].some(blank)) reason = 'Required execution references must be present.';
    else if (request.documents.length === 0 || request.authorizedDocumentRefs.length === 0) reason = 'Document whitelist must be present.';
    else if (new Set(request.authorizedDocumentRefs).size !== request.authorizedDocumentRefs.length) reason = 'Document whitelist references must be unique.';
    else if (request.documents.some((document) => blank(document.documentRef) || blank(document.content) || blank(document.baselineContent) || document.authority !== 'NON_AUTHORITATIVE' || !request.authorizedDocumentRefs.includes(document.documentRef))) reason = request.documents.some((document) => document.authority !== 'NON_AUTHORITATIVE') ? 'Only non-authoritative documents are eligible.' : 'Every document must be in the explicit whitelist.';
    else if (request.documents.length !== request.authorizedDocumentRefs.length) reason = 'Document scope must exactly match the whitelist.';
    else if (request.allowedActions.length === 0 || request.allowedActions.some((action) => !ALLOWED_ACTIONS.includes(action))) reason = 'Only deterministic allowlisted actions are eligible.';
    return { allowed: !reason, reason, evidence: [this.evidence(request, reason ?? 'Eligibility check passed.')] };
  }

  private evidence(request: OptimizationExecutionRequest, summary: string): Evidence {
    return { evidenceId: `eligibility-${request.proposalRef}`, source: 'optimization-execution', summary, confidence: 'L2', timestamp: request.timestamp, reference: request.proposalRef };
  }
}
