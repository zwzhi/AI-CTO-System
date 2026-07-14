import type { Evidence } from '../models/runtime-types.ts';
import type { PermissionBudgetGuard } from '../permission/permission-budget-guard.ts';
import type { DocumentationInvocationPort } from './documentation-invocation-port.ts';
import type {
  AuthorizedDocumentationSource,
  DocumentationExecutionOutcome,
  DocumentationExecutionRequest,
  DocumentationFailureCategory,
  DocumentationResult,
} from './documentation-execution-contract.ts';

export class DocumentationCapabilityAdapter {
  private readonly invocationPort: DocumentationInvocationPort;
  private readonly guard: PermissionBudgetGuard;
  private readonly now: () => string;

  constructor(
    invocationPort: DocumentationInvocationPort,
    guard: PermissionBudgetGuard,
    now: () => string = () => new Date().toISOString(),
  ) {
    this.invocationPort = invocationPort;
    this.guard = guard;
    this.now = now;
  }

  invoke(request: DocumentationExecutionRequest): DocumentationExecutionOutcome {
    const preflight = this.preflight(request);
    if (preflight !== undefined) return preflight;

    const immutableRequest = this.snapshotRequest(request);
    const evidence = this.buildSourceEvidence(immutableRequest);
    let outcome: DocumentationExecutionOutcome;
    try {
      outcome = this.invocationPort.invoke({ request: immutableRequest, evidence });
    } catch {
      return this.failed(immutableRequest, 'EXECUTION_FAILED', 'INVOCATION', 'local documentation invocation failed');
    }
    if (outcome.status !== 'SUCCESS') return outcome;
    if (!this.hasValidResult(immutableRequest, outcome.result, evidence, outcome.evidence, outcome.confidence)) {
      return this.failed(immutableRequest, 'OUTPUT_INVALID', 'VALIDATION', 'successful output is incomplete, lacks evidence, or exceeds the authorized source scope');
    }
    return outcome;
  }

  private preflight(request: DocumentationExecutionRequest): DocumentationExecutionOutcome | undefined {
    if (request.cancelled === true) return this.blocked(request, 'CANCELLED', 'request cancelled');
    if (
      request.operation !== 'GENERATE_DRAFT'
      || !request.permissionGrant.allowedOperations.includes('GENERATE_DRAFT')
      || request.permissionGrant.expiresAt <= this.now()
    ) {
      return this.blocked(request, 'PERMISSION_DENIED', 'generate-draft permission is missing or expired');
    }
    if (request.authorizedSources.length === 0) return this.blocked(request, 'SOURCE_SCOPE_INVALID', 'authorized source scope is empty');
    if (request.authorizedSources.some((source) =>
      source.sourceRef.trim() === ''
      || source.location.trim() === ''
      || source.content.trim() === ''
      || !request.executionContext.allowedContextRefs.includes(source.sourceRef),
    )) {
      return this.blocked(request, 'SOURCE_SCOPE_INVALID', 'each source must be locatable, contain in-memory content, and be allowed by the execution context');
    }
    if (new Set(request.authorizedSources.map((source) => source.sourceRef)).size !== request.authorizedSources.length) {
      return this.blocked(request, 'SOURCE_SCOPE_INVALID', 'authorized source references must be unique');
    }

    const decision = this.guard.evaluate({ budget: request.budget, controlMode: 'AUTO' });
    if (decision.kind === 'DENY') {
      return this.blocked(request, decision.reasonCode === 'BUDGET_EXCEEDED' ? 'BUDGET_EXCEEDED' : 'CANCELLED', decision.reasonCode);
    }
    return undefined;
  }

  private snapshotRequest(request: DocumentationExecutionRequest): DocumentationExecutionRequest {
    const authorizedSources = Object.freeze(request.authorizedSources.map((source) => Object.freeze({ ...source })));
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
    return Object.freeze({ ...request, authorizedSources, executionContext, permissionGrant, budget });
  }

  private buildSourceEvidence(request: DocumentationExecutionRequest): Evidence[] {
    const confidence = this.sourceConfidence(request);
    const timestamp = this.now();
    return request.authorizedSources.map((source, index) => ({
      evidenceId: `documentation-source-evidence-${request.taskId}-${index + 1}`,
      source: 'authorized-documentation-source',
      summary: `Authorized source evidence reviewed at ${source.location}.`,
      confidence,
      timestamp,
      reference: source.sourceRef,
    }));
  }

  private hasVersion(source: AuthorizedDocumentationSource): boolean {
    return source.versionRef !== undefined && source.versionRef.trim() !== '';
  }

  private sourceConfidence(request: DocumentationExecutionRequest): 'L2' | 'L3' {
    return request.authorizedSources.every((source) => this.hasVersion(source)) ? 'L3' : 'L2';
  }

  private hasValidResult(
    request: DocumentationExecutionRequest,
    result: DocumentationResult | undefined,
    expectedEvidence: readonly Evidence[],
    outcomeEvidence: readonly Evidence[],
    outcomeConfidence: DocumentationExecutionOutcome['confidence'],
  ): result is DocumentationResult {
    if (
      result === undefined
      || result.resultRef.trim() === ''
      || result.draft.trim() === ''
      || result.sourceReferences.length === 0
      || result.evidence.length === 0
      || result.limitations.length === 0
      || result.limitations.some((limitation) => limitation.trim() === '')
    ) return false;

    const sourcesByRef = new Map(request.authorizedSources.map((source) => [source.sourceRef, source]));
    const referencesAreAuthorized = result.sourceReferences.every((reference) => {
      const source = sourcesByRef.get(reference.sourceRef);
      return source !== undefined && source.location === reference.location && source.versionRef === reference.versionRef;
    });
    const evidenceIsAuthorized = this.hasAuthorizedEvidence(sourcesByRef, result.evidence)
      && this.hasAuthorizedEvidence(sourcesByRef, outcomeEvidence);
    const referencedEvidenceExists = result.sourceReferences.every((reference) =>
      result.evidence.some((evidence) => evidence.reference === reference.sourceRef),
    );
    const preservesPrebuiltEvidence = [result.evidence, outcomeEvidence].every((evidenceSet) =>
      evidenceSet.length === expectedEvidence.length
      && evidenceSet.every((evidence) => expectedEvidence.some((expected) => this.sameEvidence(expected, evidence))),
    );
    const expectedConfidence = this.sourceConfidence(request);
    const confidenceMatchesEvidence = result.confidence === expectedConfidence && outcomeConfidence === expectedConfidence;
    const outputDoesNotEchoSourceContent = this.doesNotEchoSourceContent(request, result, outcomeEvidence);
    return referencesAreAuthorized && evidenceIsAuthorized && referencedEvidenceExists && preservesPrebuiltEvidence && confidenceMatchesEvidence && outputDoesNotEchoSourceContent;
  }

  private doesNotEchoSourceContent(
    request: DocumentationExecutionRequest,
    result: DocumentationResult,
    outcomeEvidence: readonly Evidence[],
  ): boolean {
    const sourceContents = request.authorizedSources.map((source) => source.content);
    const outputTexts = [
      result.draft,
      ...result.limitations,
      ...result.evidence.map((evidence) => evidence.summary),
      ...outcomeEvidence.map((evidence) => evidence.summary),
    ];
    return outputTexts.every((text) => sourceContents.every((content) => !text.includes(content)));
  }

  private sameEvidence(expected: Evidence, actual: Evidence): boolean {
    return expected.evidenceId === actual.evidenceId
      && expected.source === actual.source
      && expected.summary === actual.summary
      && expected.confidence === actual.confidence
      && expected.timestamp === actual.timestamp
      && expected.reference === actual.reference;
  }

  private hasAuthorizedEvidence(sourcesByRef: ReadonlyMap<string, AuthorizedDocumentationSource>, evidence: readonly Evidence[]): boolean {
    return evidence.length > 0 && evidence.every((item) => item.reference !== undefined && sourcesByRef.has(item.reference));
  }

  private blocked(request: DocumentationExecutionRequest, category: Exclude<DocumentationFailureCategory, 'OUTPUT_INVALID' | 'EXECUTION_FAILED'>, reason: string): DocumentationExecutionOutcome {
    return this.outcome(request, 'BLOCKED', category, 'PREFLIGHT', reason);
  }

  private failed(request: DocumentationExecutionRequest, category: Extract<DocumentationFailureCategory, 'OUTPUT_INVALID' | 'EXECUTION_FAILED'>, stage: 'INVOCATION' | 'VALIDATION', reason: string): DocumentationExecutionOutcome {
    return this.outcome(request, 'FAILURE', category, stage, reason);
  }

  private outcome(
    request: DocumentationExecutionRequest,
    status: 'BLOCKED' | 'FAILURE',
    category: DocumentationFailureCategory,
    stage: 'PREFLIGHT' | 'INVOCATION' | 'VALIDATION',
    reason: string,
  ): DocumentationExecutionOutcome {
    const timestamp = this.now();
    const evidence: Evidence = {
      evidenceId: `documentation-adapter-evidence-${request.taskId}`,
      source: 'documentation-capability-adapter',
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
