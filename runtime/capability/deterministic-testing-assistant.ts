import type { TestingInvocationPort } from './testing-invocation-port.ts';
import type {
  AuthorizedTestContext,
  TestingExecutionOutcome,
  TestingInvocationRequest,
} from './testing-execution-contract.ts';

function hasVersion(context: AuthorizedTestContext): boolean {
  return context.versionRef !== undefined && context.versionRef.trim() !== '';
}

function contextRefs(invocation: TestingInvocationRequest): readonly string[] {
  return invocation.request.authorizedTestContexts.map((context) => context.sourceRef);
}

function countContextsWith(
  contexts: readonly AuthorizedTestContext[],
  marker: (content: string) => boolean,
): number {
  return contexts.filter((context) => marker(context.content)).length;
}

export class DeterministicTestingAssistant implements TestingInvocationPort {
  private readonly now: () => string;

  constructor(now: () => string = () => new Date().toISOString()) {
    this.now = now;
  }

  invoke(invocation: TestingInvocationRequest): TestingExecutionOutcome {
    const { request, evidence } = invocation;
    const contexts = request.authorizedTestContexts;
    const references = contextRefs(invocation);
    const declarationContexts = countContextsWith(contexts, (content) => /\b(?:test|it|describe)\s*\(/.test(content));
    const assertionContexts = countContextsWith(contexts, (content) => /\b(?:assert(?:\.|\s*\()|expect\s*\()/.test(content));
    const skippedOrPlaceholderContexts = countContextsWith(
      contexts,
      (content) => /\b(?:test|it|describe)\.skip\s*\(|\b(?:TODO|FIXME)\b|throw new Error\s*\(/.test(content),
    );
    const fixtureContexts = countContextsWith(contexts, (content) => /\b(?:fixture|mock|stub)\b/i.test(content));
    const confidence = contexts.every(hasVersion) ? 'L3' as const : 'L2' as const;

    return {
      status: 'SUCCESS',
      result: {
        resultRef: `testing-analysis-result-${request.taskId}`,
        testAnalysisReport: `STATIC TEST ANALYSIS: inspected ${contexts.length} explicitly authorised in-memory test context(s); ${declarationContexts} contain test declarations and ${assertionContexts} contain assertion markers.`,
        coverageFindings: [{
          findingId: `testing-coverage-${request.taskId}-1`,
          summary: `Static inspection found test declaration markers in ${declarationContexts} authorised context(s) and assertion markers in ${assertionContexts}. This is not executed coverage.`,
          evidenceRefs: references,
        }],
        riskFindings: [{
          findingId: `testing-risk-${request.taskId}-1`,
          severity: skippedOrPlaceholderContexts > 0 ? 'MEDIUM' : 'LOW',
          summary: skippedOrPlaceholderContexts > 0
            ? `Static skipped or placeholder markers appear in ${skippedOrPlaceholderContexts} authorised context(s).`
            : 'No configured skipped or placeholder marker was found in the authorised context.',
          evidenceRefs: references,
        }],
        testRecommendations: [{
          findingId: `testing-recommendation-${request.taskId}-1`,
          summary: fixtureContexts > 0
            ? `Review the ${fixtureContexts} context(s) containing fixture or mock markers when preparing an executed test plan.`
            : 'Define executed test cases separately before drawing conclusions about runtime behaviour or coverage.',
          evidenceRefs: references,
        }],
        evidence,
        confidence,
        limitations: [
          'Static analysis only: tests were not executed.',
          'Runtime coverage and production behaviour were not verified.',
          'Only explicitly authorised in-memory test contexts were inspected; no filesystem, network, Provider, patch, commit, or deployment operation was used.',
          ...(confidence === 'L2' ? ['One or more authorised test contexts lack a version reference; confidence is limited to L2.'] : []),
        ],
      },
      evidence,
      confidence,
      timestamp: this.now(),
      usage: { tokenUsed: 0, toolUsed: 0, timeUsedMs: 0, costUsed: 0 },
    };
  }
}
