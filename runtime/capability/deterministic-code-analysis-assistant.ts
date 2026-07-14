import type { CodeAnalysisInvocationPort } from './code-analysis-invocation-port.ts';
import type {
  AuthorizedCodeContext,
  CodeAnalysisExecutionOutcome,
  CodeAnalysisInvocationRequest,
} from './code-analysis-execution-contract.ts';

function hasVersion(context: AuthorizedCodeContext): boolean {
  return context.versionRef !== undefined && context.versionRef.trim() !== '';
}

function containsRiskMarker(context: AuthorizedCodeContext): boolean {
  return /\beval\s*\(|process\.env|\bany\b/.test(context.content);
}

function containsDebtMarker(context: AuthorizedCodeContext): boolean {
  return /TODO|FIXME|console\.log/.test(context.content);
}

export class DeterministicCodeAnalysisAssistant implements CodeAnalysisInvocationPort {
  private readonly now: () => string;

  constructor(now: () => string = () => new Date().toISOString()) {
    this.now = now;
  }

  invoke(invocation: CodeAnalysisInvocationRequest): CodeAnalysisExecutionOutcome {
    const { request, evidence } = invocation;
    const contextRefs = request.authorizedCodeContexts.map((context) => context.sourceRef);
    const confidence = request.authorizedCodeContexts.every(hasVersion) ? 'L3' as const : 'L2' as const;
    const riskSummary = request.authorizedCodeContexts.some(containsRiskMarker)
      ? 'Potentially risky static marker detected in the authorised code scope.'
      : 'No configured high-risk static marker was detected in the authorised code scope.';
    const debtSummary = request.authorizedCodeContexts.some(containsDebtMarker)
      ? 'Maintainability marker detected in the authorised code scope.'
      : 'Repository-wide technical debt was not assessed from the limited authorised scope.';
    const limitations = [
      'Analysis is restricted to the immutable authorised in-memory code context supplied in this request.',
      'No filesystem scan, dependency resolution, external verification, patch generation, or state change was performed.',
      ...(confidence === 'L2' ? ['One or more authorised contexts lack a version reference; confidence is limited to L2.'] : []),
    ];

    return {
      status: 'SUCCESS',
      result: {
        resultRef: `code-analysis-result-${request.taskId}`,
        analysisReport: `READ-ONLY ANALYSIS: ${request.taskObjective} Analysed ${contextRefs.length} explicitly authorised code context(s).`,
        architectureFindings: [{
          findingId: `architecture-${request.taskId}-1`,
          summary: 'The analysis treats each supplied context as an explicit module boundary; relationships outside the authorised scope are unknown.',
          evidenceRefs: contextRefs,
        }],
        riskFindings: [{
          findingId: `risk-${request.taskId}-1`,
          severity: request.authorizedCodeContexts.some(containsRiskMarker) ? 'MEDIUM' : 'LOW',
          summary: riskSummary,
          evidenceRefs: contextRefs,
        }],
        technicalDebt: [{
          findingId: `technical-debt-${request.taskId}-1`,
          summary: debtSummary,
          evidenceRefs: contextRefs,
        }],
        evidence,
        confidence,
        limitations,
      },
      evidence,
      confidence,
      timestamp: this.now(),
      usage: { tokenUsed: 0, toolUsed: 0, timeUsedMs: 0, costUsed: 0 },
    };
  }
}
