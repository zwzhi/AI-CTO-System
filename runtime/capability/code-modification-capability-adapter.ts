import type { PermissionBudgetGuard } from '../permission/permission-budget-guard.ts';
import type { CodeModificationInvocationPort } from './code-modification-invocation-port.ts';
import type {
  AuthorizedChangeContext,
  ChangeEvidenceBinding,
  CodeModificationInvocationRequest,
  ModificationExecutionOutcome,
  ModificationExecutionRequest,
  ModificationFailureCategory,
  ModificationResult,
} from './code-modification-execution-contract.ts';

export class CodeModificationCapabilityAdapter {
  private readonly invocationPort: CodeModificationInvocationPort;
  private readonly guard: PermissionBudgetGuard;
  private readonly now: () => string;

  constructor(
    invocationPort: CodeModificationInvocationPort,
    guard: PermissionBudgetGuard,
    now: () => string = () => new Date().toISOString(),
  ) {
    this.invocationPort = invocationPort;
    this.guard = guard;
    this.now = now;
  }

  invoke(request: ModificationExecutionRequest): ModificationExecutionOutcome {
    const preflight = this.preflight(request);
    if (preflight !== undefined) return preflight;

    const immutableRequest = this.snapshotRequest(request);
    const evidence = this.buildCanonicalEvidence(immutableRequest);
    let outcome: ModificationExecutionOutcome;
    try {
      outcome = this.invocationPort.invoke({ request: immutableRequest, evidence });
    } catch {
      return this.failed(immutableRequest, 'EXECUTION_FAILED', 'INVOCATION', 'local modification proposal invocation failed');
    }
    if (!this.isRecord(outcome) || outcome.status !== 'SUCCESS') {
      return this.failed(immutableRequest, 'EXECUTION_FAILED', 'INVOCATION', 'invocation port returned a non-success result');
    }
    if (!this.hasValidResult(immutableRequest, outcome.result, evidence, outcome.evidence, outcome.confidence, outcome.usage)) {
      return this.failed(immutableRequest, 'OUTPUT_INVALID', 'VALIDATION', 'successful modification proposal output is invalid or exceeds the proposal-only boundary');
    }
    return outcome;
  }

  private preflight(request: ModificationExecutionRequest): ModificationExecutionOutcome | undefined {
    if (request.cancelled === true) return this.blocked(request, 'CANCELLED', 'request cancelled');
    if (
      request.operation !== 'PROPOSE_CHANGE'
      || !request.permissionGrant.allowedOperations.includes('PROPOSE_CHANGE')
      || this.isMissingOrExpired(request.permissionGrant.expiresAt)
    ) return this.blocked(request, 'PERMISSION_DENIED', 'proposal-only permission is missing or expired');
    if (request.changeGoal.trim() === '') return this.blocked(request, 'SOURCE_SCOPE_INVALID', 'change goal must not be blank');
    if (request.authorizedChangeContexts.length === 0) return this.blocked(request, 'SOURCE_SCOPE_INVALID', 'authorised change scope is empty');
    if (request.authorizedChangeContexts.some((context) =>
      context.sourceRef.trim() === ''
      || context.location.trim() === ''
      || context.content.trim() === ''
      || !request.executionContext.allowedContextRefs.includes(context.sourceRef),
    )) return this.blocked(request, 'SOURCE_SCOPE_INVALID', 'each change context must be locatable, non-empty, and explicitly allowed');
    if (new Set(request.authorizedChangeContexts.map((context) => context.sourceRef)).size !== request.authorizedChangeContexts.length) {
      return this.blocked(request, 'SOURCE_SCOPE_INVALID', 'authorised change context references must be unique');
    }

    const evidenceFailure = this.validateEvidence(request);
    if (evidenceFailure !== undefined) return this.blocked(request, 'EVIDENCE_INSUFFICIENT', evidenceFailure);

    const decision = this.guard.evaluate({ budget: request.budget, controlMode: 'AUTO' });
    if (decision.kind === 'DENY') {
      return this.blocked(request, decision.reasonCode === 'BUDGET_EXCEEDED' ? 'BUDGET_EXCEEDED' : 'CANCELLED', decision.reasonCode);
    }
    return undefined;
  }

  private validateEvidence(request: ModificationExecutionRequest): string | undefined {
    if (request.codeAnalysisEvidence.length === 0 || request.testEvidence.length === 0) {
      return 'both code-analysis and test evidence are required before a proposal can be invoked';
    }
    const groups: readonly [readonly ChangeEvidenceBinding[], string][] = [
      [request.codeAnalysisEvidence, 'code-analysis'],
      [request.testEvidence, 'testing-analysis'],
    ];
    for (const [bindings, expectedSource] of groups) {
      if (bindings.some((binding) =>
        binding.evidenceRef.trim() === ''
        || binding.source !== expectedSource
        || binding.summary.trim() === ''
        || !this.isConfidence(binding.confidence)
        || this.parseStrictIsoTimestamp(binding.timestamp) === undefined,
      )) return 'evidence bindings must be non-blank, attributable, confidence-bound, and strictly timestamped';
    }
    const evidenceRefs = [...request.codeAnalysisEvidence, ...request.testEvidence].map((binding) => binding.evidenceRef);
    return new Set(evidenceRefs).size === evidenceRefs.length ? undefined : 'evidence references must be unique across both evidence groups';
  }

  private snapshotRequest(request: ModificationExecutionRequest): ModificationExecutionRequest {
    const authorizedChangeContexts = Object.freeze(request.authorizedChangeContexts.map((context) => Object.freeze({ ...context })));
    const codeAnalysisEvidence = Object.freeze(request.codeAnalysisEvidence.map((binding) => Object.freeze({ ...binding })));
    const testEvidence = Object.freeze(request.testEvidence.map((binding) => Object.freeze({ ...binding })));
    const executionContext = Object.freeze({
      ...request.executionContext,
      constraintRefs: Object.freeze([...request.executionContext.constraintRefs]),
      allowedContextRefs: Object.freeze([...request.executionContext.allowedContextRefs]),
    });
    const permissionGrant = Object.freeze({
      ...request.permissionGrant,
      allowedOperations: Object.freeze([...request.permissionGrant.allowedOperations]),
    });
    const budget = Object.freeze({ ...request.budget });
    return Object.freeze({
      ...request,
      authorizedChangeContexts,
      codeAnalysisEvidence,
      testEvidence,
      executionContext,
      permissionGrant,
      budget,
    });
  }

  private buildCanonicalEvidence(request: ModificationExecutionRequest): readonly ChangeEvidenceBinding[] {
    const confidence = this.contextConfidence(request);
    const timestamp = this.now();
    const sourceEvidence = request.authorizedChangeContexts.map((context) => Object.freeze({
      evidenceRef: context.sourceRef,
      source: 'authorised-change-context',
      summary: `Authorised in-memory change context reviewed at ${context.location}.`,
      confidence,
      timestamp,
    }));
    return Object.freeze([
      ...sourceEvidence,
      ...request.codeAnalysisEvidence.map((binding) => Object.freeze({ ...binding })),
      ...request.testEvidence.map((binding) => Object.freeze({ ...binding })),
    ]);
  }

  private hasValidResult(
    request: ModificationExecutionRequest,
    result: ModificationResult | undefined,
    expectedEvidence: readonly ChangeEvidenceBinding[],
    outcomeEvidence: readonly ChangeEvidenceBinding[],
    outcomeConfidence: ModificationExecutionOutcome['confidence'],
    usage: ModificationExecutionOutcome['usage'],
  ): result is ModificationResult {
    if (!this.isRecord(result)
      || !this.isNonBlankString(result.resultRef)
      || !this.isRecord(result.changeProposal)
      || !this.isRecord(result.proposedDiff)
      || !Array.isArray(result.evidence)
      || !Array.isArray(result.limitations)
      || result.limitations.length === 0
      || !result.limitations.every((item) => this.isNonBlankString(item))
      || !this.hasZeroUsage(usage)) return false;

    const contextsByRef = new Map(request.authorizedChangeContexts.map((context) => [context.sourceRef, context]));
    const canonicalRefs = new Set(expectedEvidence.map((binding) => binding.evidenceRef));
    const proposal = result.changeProposal;
    const proposalIsValid = this.isNonBlankString(proposal.changeId)
      && this.isNonBlankString(proposal.goal)
      && Array.isArray(proposal.scope)
      && proposal.scope.length > 0
      && proposal.scope.every((reference) => typeof reference === 'string' && contextsByRef.has(reference))
      && this.isNonBlankString(proposal.originalSummary)
      && this.isNonBlankString(proposal.proposedChange)
      && this.isValidRisk(proposal.risk)
      && this.isNonBlankString(proposal.impact)
      && this.isNonBlankString(proposal.rollback)
      && Array.isArray(proposal.evidenceRefs)
      && proposal.evidenceRefs.length > 0
      && proposal.evidenceRefs.every((reference) => typeof reference === 'string' && canonicalRefs.has(reference))
      && proposal.approvalStatus === 'CONFIRM_REQUIRED'
      && this.isConfidence(proposal.confidence)
      && Array.isArray(proposal.limitations)
      && proposal.limitations.length > 0
      && proposal.limitations.every((item) => this.isNonBlankString(item));
    const diffIsValid = this.hasValidSingleHunkDiff(result.proposedDiff, contextsByRef, canonicalRefs);
    const expectedConfidence = this.contextConfidence(request);
    const evidenceMatches = this.sameEvidenceSequence(expectedEvidence, result.evidence)
      && this.sameEvidenceSequence(expectedEvidence, outcomeEvidence);
    const confidenceMatches = result.confidence === expectedConfidence
      && outcomeConfidence === expectedConfidence
      && proposal.confidence === expectedConfidence;
    return proposalIsValid
      && diffIsValid
      && evidenceMatches
      && confidenceMatches
      && this.doesNotLeakFullSource(request, result);
  }

  private hasValidSingleHunkDiff(
    diff: Record<string, unknown>,
    contextsByRef: ReadonlyMap<string, AuthorizedChangeContext>,
    canonicalRefs: ReadonlySet<string>,
  ): boolean {
    if (!this.isNonBlankString(diff.diffId)
      || !this.isNonBlankString(diff.targetRef)
      || !this.isNonBlankString(diff.displayText)
      || !Array.isArray(diff.evidenceRefs)
      || diff.evidenceRefs.length === 0
      || !diff.evidenceRefs.every((reference) => typeof reference === 'string' && canonicalRefs.has(reference))) return false;
    const target = contextsByRef.get(diff.targetRef);
    if (target === undefined) return false;
    const lines = diff.displayText.split('\n');
    if (lines.length !== 4
      || lines[0] !== `--- ${target.location}`
      || lines[1] !== `+++ ${target.location}`
      || lines[2] === undefined
      || lines[3] === undefined
      || !lines[2].startsWith('-')
      || !lines[3].startsWith('+')) return false;
    const removedLine = lines[2].slice(1);
    const addedLine = lines[3].slice(1);
    return target.content.split(/\r?\n/).includes(removedLine)
      && removedLine.includes('console.log(')
      && addedLine === removedLine.replace('console.log(', 'logger.info(');
  }

  private doesNotLeakFullSource(request: ModificationExecutionRequest, result: ModificationResult): boolean {
    const outputTexts = [
      result.resultRef,
      result.changeProposal.changeId,
      result.changeProposal.goal,
      result.changeProposal.originalSummary,
      result.changeProposal.proposedChange,
      result.changeProposal.impact,
      result.changeProposal.rollback,
      ...result.changeProposal.limitations,
      ...result.limitations,
      ...result.evidence.map((binding) => binding.summary),
    ];
    return outputTexts.every((text) => request.authorizedChangeContexts
      .filter((context) => context.content.length >= 16)
      .every((context) => !text.includes(context.content)));
  }

  private contextConfidence(request: ModificationExecutionRequest): 'L2' | 'L3' {
    return request.authorizedChangeContexts.every((context) => context.versionRef !== undefined && context.versionRef.trim() !== '') ? 'L3' : 'L2';
  }

  private isMissingOrExpired(expiresAt: string): boolean {
    const expiresAtMs = this.parseStrictIsoTimestamp(expiresAt);
    const nowMs = this.parseStrictIsoTimestamp(this.now());
    return expiresAtMs === undefined || nowMs === undefined || expiresAtMs <= nowMs;
  }

  private parseStrictIsoTimestamp(value: string): number | undefined {
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)) return undefined;
    const milliseconds = Date.parse(value);
    if (!Number.isFinite(milliseconds) || new Date(milliseconds).toISOString() !== value) return undefined;
    return milliseconds;
  }

  private sameEvidenceSequence(expected: readonly ChangeEvidenceBinding[], actual: readonly ChangeEvidenceBinding[]): boolean {
    if (!Array.isArray(actual) || expected.length !== actual.length) return false;
    return expected.every((item, index) => {
      const candidate = actual[index];
      return this.isRecord(candidate)
        && item.evidenceRef === candidate.evidenceRef
        && item.source === candidate.source
        && item.summary === candidate.summary
        && item.confidence === candidate.confidence
        && item.timestamp === candidate.timestamp;
    });
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return value !== null && typeof value === 'object';
  }

  private isNonBlankString(value: unknown): value is string {
    return typeof value === 'string' && value.trim() !== '';
  }

  private isConfidence(value: unknown): value is 'L1' | 'L2' | 'L3' | 'L4' {
    return value === 'L1' || value === 'L2' || value === 'L3' || value === 'L4';
  }

  private isValidRisk(value: unknown): value is 'LOW' | 'MEDIUM' | 'HIGH' {
    return value === 'LOW' || value === 'MEDIUM' || value === 'HIGH';
  }

  private hasZeroUsage(usage: unknown): boolean {
    return this.isRecord(usage)
      && usage.tokenUsed === 0
      && usage.toolUsed === 0
      && usage.timeUsedMs === 0
      && usage.costUsed === 0;
  }

  private blocked(
    request: ModificationExecutionRequest,
    category: Extract<ModificationFailureCategory, 'PERMISSION_DENIED' | 'BUDGET_EXCEEDED' | 'CANCELLED' | 'SOURCE_SCOPE_INVALID' | 'EVIDENCE_INSUFFICIENT'>,
    reason: string,
  ): ModificationExecutionOutcome {
    return this.outcome(request, 'BLOCKED', category, 'PREFLIGHT', reason);
  }

  private failed(
    request: ModificationExecutionRequest,
    category: Extract<ModificationFailureCategory, 'OUTPUT_INVALID' | 'EXECUTION_FAILED'>,
    stage: 'INVOCATION' | 'VALIDATION',
    reason: string,
  ): ModificationExecutionOutcome {
    return this.outcome(request, 'FAILURE', category, stage, reason);
  }

  private outcome(
    request: ModificationExecutionRequest,
    status: 'BLOCKED' | 'FAILURE',
    category: ModificationFailureCategory,
    stage: 'PREFLIGHT' | 'INVOCATION' | 'VALIDATION',
    reason: string,
  ): ModificationExecutionOutcome {
    const timestamp = this.now();
    const evidence: ChangeEvidenceBinding = {
      evidenceRef: `code-modification-adapter-evidence-${request.taskId}`,
      source: 'code-modification-capability-adapter',
      summary: reason,
      confidence: 'L1',
      timestamp,
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
