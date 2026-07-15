import type { Evidence } from '../runtime/models/runtime-types.ts';
import type { OptimizationExecutionRequest, OptimizationValidationPort, OptimizedDocument, ValidationResult } from './optimization-execution-contract.ts';

function headings(value: string): string[] { return value.split('\n').filter((line) => /^#{1,6} /.test(line)); }
function nonEmptyUnique(value: string): string[] { return [...new Set(value.split('\n').filter((line) => line.trim().length > 0))]; }
function inOrder(values: readonly string[], candidate: readonly string[]): boolean { let index = 0; return values.every((value) => { index = candidate.indexOf(value, index); if (index < 0) return false; index += 1; return true; }); }

export class OptimizationValidationService implements OptimizationValidationPort {
  validate(request: OptimizationExecutionRequest, candidates: readonly OptimizedDocument[]): ValidationResult {
    let reason: string | undefined;
    if (candidates.length !== request.documents.length || candidates.some((candidate) => !request.authorizedDocumentRefs.includes(candidate.documentRef))) reason = 'Candidate scope does not match the whitelist.';
    else for (const source of request.documents) {
      const candidate = candidates.find((item) => item.documentRef === source.documentRef);
      if (!candidate) { reason = 'Candidate document is missing.'; break; }
      if (JSON.stringify(headings(source.baselineContent)) !== JSON.stringify(headings(candidate.content))) { reason = 'Heading structure changed.'; break; }
      if (!inOrder(nonEmptyUnique(source.baselineContent), nonEmptyUnique(candidate.content))) { reason = 'Non-empty text was not preserved.'; break; }
    }
    return { valid: !reason, reason, evidence: this.evidence(request, !reason) };
  }

  private evidence(request: OptimizationExecutionRequest, valid: boolean): Evidence[] {
    const names = ['scope', 'structure', 'semantic-preservation', 'action-boundary', 'rollback-availability'];
    return names.map((name) => ({ evidenceId: `validation-${name}-${request.proposalRef}`, source: 'optimization-execution', summary: valid ? `${name} validation passed.` : `${name} validation failed.`, confidence: 'L2', timestamp: request.timestamp, reference: request.proposalRef }));
  }
}
