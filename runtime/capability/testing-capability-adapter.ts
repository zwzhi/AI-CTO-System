import type { Evidence } from '../models/runtime-types.ts';
import type { PermissionBudgetGuard } from '../permission/permission-budget-guard.ts';
import type { TestingInvocationPort } from './testing-invocation-port.ts';
import type {
  AuthorizedTestContext,
  TestingExecutionOutcome,
  TestingExecutionRequest,
  TestingFailureCategory,
  TestingResult,
} from './testing-execution-contract.ts';

export class TestingCapabilityAdapter {
  private readonly invocationPort: TestingInvocationPort;
  private readonly guard: PermissionBudgetGuard;
  private readonly now: () => string;

  constructor(
    invocationPort: TestingInvocationPort,
    guard: PermissionBudgetGuard,
    now: () => string = () => new Date().toISOString(),
  ) {
    this.invocationPort = invocationPort;
    this.guard = guard;
    this.now = now;
  }

  invoke(request: TestingExecutionRequest): TestingExecutionOutcome {
    const preflight = this.preflight(request);
    if (preflight !== undefined) return preflight;

    const immutableRequest = this.snapshotRequest(request);
    const evidence = this.buildEvidence(immutableRequest);
    let outcome: TestingExecutionOutcome;
    try {
      outcome = this.invocationPort.invoke({ request: immutableRequest, evidence });
    } catch {
      return this.failed(immutableRequest, 'EXECUTION_FAILED', 'INVOCATION', 'local testing invocation failed');
    }
    if (outcome.status !== 'SUCCESS') {
      return this.failed(immutableRequest, 'EXECUTION_FAILED', 'INVOCATION', 'invocation port returned a non-success result');
    }
    if (!this.hasValidResult(immutableRequest, outcome.result, evidence, outcome.evidence, outcome.confidence)) {
      return this.failed(immutableRequest, 'OUTPUT_INVALID', 'VALIDATION', 'successful testing output is incomplete, lacks canonical evidence, or exceeds the authorised source scope');
    }
    return outcome;
  }

  private preflight(request: TestingExecutionRequest): TestingExecutionOutcome | undefined {
    if (request.cancelled === true) return this.blocked(request, 'CANCELLED', 'request cancelled');
    if (
      request.operation !== 'ANALYZE_TEST_CONTEXT'
      || !request.permissionGrant.allowedOperations.includes('ANALYZE_TEST_CONTEXT')
      || this.isMissingOrExpired(request.permissionGrant.expiresAt)
    ) return this.blocked(request, 'PERMISSION_DENIED', 'read-only test analysis permission is missing or expired');
    if (request.testingObjective.trim() === '') {
      return this.blocked(request, 'SOURCE_SCOPE_INVALID', 'testing objective must not be blank');
    }
    if (request.authorizedTestContexts.length === 0) {
      return this.blocked(request, 'SOURCE_SCOPE_INVALID', 'authorised test scope is empty');
    }
    if (request.authorizedTestContexts.some((context) =>
      context.sourceRef.trim() === ''
      || context.location.trim() === ''
      || context.content.trim() === ''
      || !request.executionContext.allowedContextRefs.includes(context.sourceRef),
    )) return this.blocked(request, 'SOURCE_SCOPE_INVALID', 'each test context must be locatable, non-empty, and explicitly allowed');
    if (new Set(request.authorizedTestContexts.map((context) => context.sourceRef)).size !== request.authorizedTestContexts.length) {
      return this.blocked(request, 'SOURCE_SCOPE_INVALID', 'authorised test context references must be unique');
    }

    const decision = this.guard.evaluate({ budget: request.budget, controlMode: 'AUTO' });
    if (decision.kind === 'DENY') {
      return this.blocked(request, decision.reasonCode === 'BUDGET_EXCEEDED' ? 'BUDGET_EXCEEDED' : 'CANCELLED', decision.reasonCode);
    }
    return undefined;
  }

  private snapshotRequest(request: TestingExecutionRequest): TestingExecutionRequest {
    const authorizedTestContexts = Object.freeze(request.authorizedTestContexts.map((context) => Object.freeze({ ...context })));
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
    return Object.freeze({ ...request, authorizedTestContexts, executionContext, permissionGrant, budget });
  }

  private buildEvidence(request: TestingExecutionRequest): readonly Evidence[] {
    const confidence = this.contextConfidence(request);
    const timestamp = this.now();
    return Object.freeze(request.authorizedTestContexts.map((context, index) => Object.freeze({
      evidenceId: `testing-source-evidence-${request.taskId}-${index + 1}`,
      source: 'authorised-test-context',
      summary: `Authorised in-memory test context reviewed at ${context.location}.`,
      confidence,
      timestamp,
      reference: context.sourceRef,
    })));
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

  private contextConfidence(request: TestingExecutionRequest): 'L2' | 'L3' {
    return request.authorizedTestContexts.every((context) => this.hasVersion(context)) ? 'L3' : 'L2';
  }

  private hasVersion(context: AuthorizedTestContext): boolean {
    return context.versionRef !== undefined && context.versionRef.trim() !== '';
  }

  private hasValidResult(
    request: TestingExecutionRequest,
    result: TestingResult | undefined,
    expectedEvidence: readonly Evidence[],
    outcomeEvidence: readonly Evidence[],
    outcomeConfidence: TestingExecutionOutcome['confidence'],
  ): result is TestingResult {
    if (
      result === undefined
      || result.resultRef.trim() === ''
      || result.testAnalysisReport.trim() === ''
      || result.coverageFindings.length === 0
      || result.riskFindings.length === 0
      || result.testRecommendations.length === 0
      || result.evidence.length === 0
      || result.limitations.length === 0
      || result.limitations.some((limitation) => limitation.trim() === '')
    ) return false;

    const contextsByRef = new Map(request.authorizedTestContexts.map((context) => [context.sourceRef, context]));
    const findingsAreAuthorised = [
      ...result.coverageFindings,
      ...result.riskFindings,
      ...result.testRecommendations,
    ].every((finding) =>
      finding.findingId.trim() !== ''
      && finding.summary.trim() !== ''
      && finding.evidenceRefs.length > 0
      && finding.evidenceRefs.every((reference) => contextsByRef.has(reference)),
    );
    const expectedConfidence = this.contextConfidence(request);
    const evidenceMatches = this.sameEvidenceSequence(expectedEvidence, result.evidence)
      && this.sameEvidenceSequence(expectedEvidence, outcomeEvidence);
    const confidenceMatches = result.confidence === expectedConfidence && outcomeConfidence === expectedConfidence;
    const outputDoesNotLeakSource = this.doesNotLeakSourceContent(request, result, outcomeEvidence);
    return findingsAreAuthorised && evidenceMatches && confidenceMatches && outputDoesNotLeakSource;
  }

  private doesNotLeakSourceContent(
    request: TestingExecutionRequest,
    result: TestingResult,
    outcomeEvidence: readonly Evidence[],
  ): boolean {
    const outputTexts = [
      result.resultRef,
      result.testAnalysisReport,
      ...result.coverageFindings.flatMap((finding) => [finding.findingId, finding.summary]),
      ...result.riskFindings.flatMap((finding) => [finding.findingId, finding.summary]),
      ...result.testRecommendations.flatMap((finding) => [finding.findingId, finding.summary]),
      ...result.limitations,
      ...result.evidence.map((evidence) => evidence.summary),
      ...outcomeEvidence.map((evidence) => evidence.summary),
    ];
    return outputTexts.every((text) => request.authorizedTestContexts
      .filter((context) => context.content.length >= 16)
      .every((context) => !text.includes(context.content)));
  }

  private sameEvidenceSequence(expected: readonly Evidence[], actual: readonly Evidence[]): boolean {
    return expected.length === actual.length && expected.every((item, index) => {
      const candidate = actual[index];
      return candidate !== undefined
        && item.evidenceId === candidate.evidenceId
        && item.source === candidate.source
        && item.summary === candidate.summary
        && item.confidence === candidate.confidence
        && item.timestamp === candidate.timestamp
        && item.reference === candidate.reference;
    });
  }

  private blocked(
    request: TestingExecutionRequest,
    category: Extract<TestingFailureCategory, 'PERMISSION_DENIED' | 'BUDGET_EXCEEDED' | 'CANCELLED' | 'SOURCE_SCOPE_INVALID'>,
    reason: string,
  ): TestingExecutionOutcome {
    return this.outcome(request, 'BLOCKED', category, 'PREFLIGHT', reason);
  }

  private failed(
    request: TestingExecutionRequest,
    category: Extract<TestingFailureCategory, 'OUTPUT_INVALID' | 'EXECUTION_FAILED'>,
    stage: 'INVOCATION' | 'VALIDATION',
    reason: string,
  ): TestingExecutionOutcome {
    return this.outcome(request, 'FAILURE', category, stage, reason);
  }

  private outcome(
    request: TestingExecutionRequest,
    status: 'BLOCKED' | 'FAILURE',
    category: TestingFailureCategory,
    stage: 'PREFLIGHT' | 'INVOCATION' | 'VALIDATION',
    reason: string,
  ): TestingExecutionOutcome {
    const timestamp = this.now();
    const evidence: Evidence = {
      evidenceId: `testing-adapter-evidence-${request.taskId}`,
      source: 'testing-capability-adapter',
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
