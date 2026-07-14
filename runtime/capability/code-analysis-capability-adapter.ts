import type { Evidence } from '../models/runtime-types.ts';
import type { PermissionBudgetGuard } from '../permission/permission-budget-guard.ts';
import type { CodeAnalysisInvocationPort } from './code-analysis-invocation-port.ts';
import type {
  AuthorizedCodeContext,
  CodeAnalysisExecutionOutcome,
  CodeAnalysisExecutionRequest,
  CodeAnalysisFailureCategory,
  CodeAnalysisResult,
} from './code-analysis-execution-contract.ts';

export class CodeAnalysisCapabilityAdapter {
  private readonly invocationPort: CodeAnalysisInvocationPort;
  private readonly guard: PermissionBudgetGuard;
  private readonly now: () => string;

  constructor(invocationPort: CodeAnalysisInvocationPort, guard: PermissionBudgetGuard, now: () => string = () => new Date().toISOString()) {
    this.invocationPort = invocationPort;
    this.guard = guard;
    this.now = now;
  }

  invoke(request: CodeAnalysisExecutionRequest): CodeAnalysisExecutionOutcome {
    const preflight = this.preflight(request);
    if (preflight !== undefined) return preflight;

    const immutableRequest = this.snapshotRequest(request);
    const evidence = this.buildEvidence(immutableRequest);
    let outcome: CodeAnalysisExecutionOutcome;
    try {
      outcome = this.invocationPort.invoke({ request: immutableRequest, evidence });
    } catch {
      return this.failed(immutableRequest, 'EXECUTION_FAILED', 'INVOCATION', 'local code analysis invocation failed');
    }
    if (outcome.status !== 'SUCCESS') {
      return this.failed(immutableRequest, 'EXECUTION_FAILED', 'INVOCATION', 'invocation port returned a non-success result');
    }
    if (!this.hasValidResult(immutableRequest, outcome.result, evidence, outcome.evidence, outcome.confidence)) {
      return this.failed(immutableRequest, 'OUTPUT_INVALID', 'VALIDATION', 'successful analysis output is incomplete, lacks authorised evidence, or exceeds the confidence bound');
    }
    return outcome;
  }

  private preflight(request: CodeAnalysisExecutionRequest): CodeAnalysisExecutionOutcome | undefined {
    if (request.cancelled === true) return this.blocked(request, 'CANCELLED', 'request cancelled');
    if (
      request.operation !== 'ANALYZE_READ_ONLY_CODE'
      || !request.permissionGrant.allowedOperations.includes('ANALYZE_READ_ONLY_CODE')
      || this.isMissingOrExpired(request.permissionGrant.expiresAt)
    ) return this.blocked(request, 'PERMISSION_DENIED', 'read-only analysis permission is missing or expired');
    if (request.authorizedCodeContexts.length === 0) return this.blocked(request, 'SOURCE_SCOPE_INVALID', 'authorised code scope is empty');
    if (request.repositoryContext.repositoryRef.trim() === '') {
      return this.blocked(request, 'SOURCE_SCOPE_INVALID', 'repository context must identify a repository without granting repository access');
    }
    if (request.authorizedCodeContexts.some((context) =>
      context.sourceRef.trim() === ''
      || context.location.trim() === ''
      || context.content.trim() === ''
      || !request.executionContext.allowedContextRefs.includes(context.sourceRef),
    )) return this.blocked(request, 'SOURCE_SCOPE_INVALID', 'every code context must be locatable, non-empty, and explicitly allowed');
    if (new Set(request.authorizedCodeContexts.map((context) => context.sourceRef)).size !== request.authorizedCodeContexts.length) {
      return this.blocked(request, 'SOURCE_SCOPE_INVALID', 'authorised code context references must be unique');
    }
    const decision = this.guard.evaluate({ budget: request.budget, controlMode: 'AUTO' });
    if (decision.kind === 'DENY') return this.blocked(request, decision.reasonCode === 'BUDGET_EXCEEDED' ? 'BUDGET_EXCEEDED' : 'CANCELLED', decision.reasonCode);
    return undefined;
  }

  private snapshotRequest(request: CodeAnalysisExecutionRequest): CodeAnalysisExecutionRequest {
    const authorizedCodeContexts = Object.freeze(request.authorizedCodeContexts.map((context) => Object.freeze({ ...context })));
    const repositoryContext = Object.freeze({ ...request.repositoryContext });
    const executionContext = Object.freeze({
      ...request.executionContext,
      constraintRefs: Object.freeze([...request.executionContext.constraintRefs]),
      allowedContextRefs: Object.freeze([...request.executionContext.allowedContextRefs]),
    });
    const permissionGrant = Object.freeze({ ...request.permissionGrant, allowedOperations: Object.freeze([...request.permissionGrant.allowedOperations]) });
    const budget = Object.freeze({ ...request.budget });
    return Object.freeze({ ...request, authorizedCodeContexts, repositoryContext, executionContext, permissionGrant, budget });
  }

  private isMissingOrExpired(expiresAt: string): boolean {
    const expiresAtMs = Date.parse(expiresAt);
    const nowMs = Date.parse(this.now());
    return !Number.isFinite(expiresAtMs) || !Number.isFinite(nowMs) || expiresAtMs <= nowMs;
  }

  private buildEvidence(request: CodeAnalysisExecutionRequest): readonly Evidence[] {
    const confidence = this.contextConfidence(request);
    const timestamp = this.now();
    return Object.freeze(request.authorizedCodeContexts.map((context, index) => Object.freeze({
      evidenceId: `code-analysis-source-evidence-${request.taskId}-${index + 1}`,
      source: 'authorised-code-context',
      summary: `Authorised in-memory code context reviewed at ${context.location}.`,
      confidence,
      timestamp,
      reference: context.sourceRef,
    })));
  }

  private contextConfidence(request: CodeAnalysisExecutionRequest): 'L2' | 'L3' {
    return request.authorizedCodeContexts.every((context) => context.versionRef !== undefined && context.versionRef.trim() !== '') ? 'L3' : 'L2';
  }

  private hasValidResult(
    request: CodeAnalysisExecutionRequest,
    result: CodeAnalysisResult | undefined,
    expectedEvidence: readonly Evidence[],
    outcomeEvidence: readonly Evidence[],
    outcomeConfidence: CodeAnalysisExecutionOutcome['confidence'],
  ): result is CodeAnalysisResult {
    if (
      result === undefined
      || result.resultRef.trim() === ''
      || result.analysisReport.trim() === ''
      || result.architectureFindings.length === 0
      || result.riskFindings.length === 0
      || result.technicalDebt.length === 0
      || result.evidence.length === 0
      || result.limitations.length === 0
      || result.limitations.some((limitation) => limitation.trim() === '')
    ) return false;
    const contextsByRef = new Map(request.authorizedCodeContexts.map((context) => [context.sourceRef, context]));
    const findingReferencesAreAuthorised = [
      ...result.architectureFindings,
      ...result.riskFindings,
      ...result.technicalDebt,
    ].every((finding) => finding.findingId.trim() !== '' && finding.summary.trim() !== '' && finding.evidenceRefs.length > 0 && finding.evidenceRefs.every((reference) => contextsByRef.has(reference)));
    const expectedConfidence = this.contextConfidence(request);
    const evidenceMatches = [result.evidence, outcomeEvidence].every((items) => this.sameEvidenceSequence(expectedEvidence, items));
    const outputDoesNotEchoSourceContent = [
      result.analysisReport,
      ...result.architectureFindings.map((finding) => finding.summary),
      ...result.riskFindings.map((finding) => finding.summary),
      ...result.technicalDebt.map((finding) => finding.summary),
      ...result.limitations,
      ...result.evidence.map((item) => item.summary),
      ...outcomeEvidence.map((item) => item.summary),
    ].every((text) => request.authorizedCodeContexts
      .filter((context) => context.content.length >= 16)
      .every((context) => !text.includes(context.content)));
    return findingReferencesAreAuthorised
      && evidenceMatches
      && result.confidence === expectedConfidence
      && outcomeConfidence === expectedConfidence
      && outputDoesNotEchoSourceContent;
  }

  private sameEvidence(expected: Evidence, actual: Evidence): boolean {
    return expected.evidenceId === actual.evidenceId
      && expected.source === actual.source
      && expected.summary === actual.summary
      && expected.confidence === actual.confidence
      && expected.timestamp === actual.timestamp
      && expected.reference === actual.reference;
  }

  private sameEvidenceSequence(expected: readonly Evidence[], actual: readonly Evidence[]): boolean {
    return expected.length === actual.length && expected.every((item, index) => {
      const candidate = actual[index];
      return candidate !== undefined && this.sameEvidence(item, candidate);
    });
  }

  private blocked(request: CodeAnalysisExecutionRequest, category: Extract<CodeAnalysisFailureCategory, 'PERMISSION_DENIED' | 'BUDGET_EXCEEDED' | 'CANCELLED' | 'SOURCE_SCOPE_INVALID'>, reason: string): CodeAnalysisExecutionOutcome {
    return this.outcome(request, 'BLOCKED', category, 'PREFLIGHT', reason);
  }

  private failed(request: CodeAnalysisExecutionRequest, category: Extract<CodeAnalysisFailureCategory, 'OUTPUT_INVALID' | 'EXECUTION_FAILED'>, stage: 'INVOCATION' | 'VALIDATION', reason: string): CodeAnalysisExecutionOutcome {
    return this.outcome(request, 'FAILURE', category, stage, reason);
  }

  private outcome(
    request: CodeAnalysisExecutionRequest,
    status: 'BLOCKED' | 'FAILURE',
    category: CodeAnalysisFailureCategory,
    stage: 'PREFLIGHT' | 'INVOCATION' | 'VALIDATION',
    reason: string,
  ): CodeAnalysisExecutionOutcome {
    const timestamp = this.now();
    const evidence: Evidence = {
      evidenceId: `code-analysis-adapter-evidence-${request.taskId}`,
      source: 'code-analysis-capability-adapter',
      summary: reason,
      confidence: 'L1',
      timestamp,
      reference: request.taskId,
    };
    return {
      status,
      evidence: [evidence],
      confidence: 'L1',
      timestamp,
      usage: { tokenUsed: 0, toolUsed: 0, timeUsedMs: 0, costUsed: 0 },
      failure: { category, stage, reason },
    };
  }
}
