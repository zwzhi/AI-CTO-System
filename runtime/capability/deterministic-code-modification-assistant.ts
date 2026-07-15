import type { CodeModificationInvocationPort } from './code-modification-invocation-port.ts';
import type {
  AuthorizedChangeContext,
  CodeModificationInvocationRequest,
  ModificationExecutionOutcome,
} from './code-modification-execution-contract.ts';

function hasVersion(context: AuthorizedChangeContext): boolean {
  return context.versionRef !== undefined && context.versionRef.trim() !== '';
}

function firstSupportedContext(contexts: readonly AuthorizedChangeContext[]): AuthorizedChangeContext | undefined {
  return contexts.find((context) => context.content.includes('console.log('));
}

function supportedLine(context: AuthorizedChangeContext): string {
  return context.content.split(/\r?\n/).find((line) => line.includes('console.log('))!;
}

export class DeterministicCodeModificationAssistant implements CodeModificationInvocationPort {
  private readonly now: () => string;

  constructor(now: () => string = () => new Date().toISOString()) {
    this.now = now;
  }

  invoke(invocation: CodeModificationInvocationRequest): ModificationExecutionOutcome {
    const { request, evidence } = invocation;
    const target = firstSupportedContext(request.authorizedChangeContexts);
    const confidence = request.authorizedChangeContexts.every(hasVersion) ? 'L3' as const : 'L2' as const;

    if (target === undefined) {
      return {
        status: 'FAILURE',
        evidence,
        confidence,
        timestamp: this.now(),
        usage: { tokenUsed: 0, toolUsed: 0, timeUsedMs: 0, costUsed: 0 },
        failure: {
          category: 'EXECUTION_FAILED',
          stage: 'INVOCATION',
          reason: 'No supported in-memory console.log marker was found for a proposal-only change.',
        },
      };
    }

    const originalLine = supportedLine(target);
    const proposedLine = originalLine.replace('console.log(', 'logger.info(');
    const evidenceRefs = evidence.map((item) => item.evidenceRef);
    const limitations = [
      'This is a display-only proposal; no source mutation, patch application, commit, or deployment occurred.',
      'Human confirmation is required before any future application.',
      'Downstream testing and validation are required before any future application.',
      ...(confidence === 'L2' ? ['One or more authorised change contexts lack a version reference; confidence is limited to L2.'] : []),
    ];

    return {
      status: 'SUCCESS',
      result: {
        resultRef: `code-modification-result-${request.taskId}`,
        changeProposal: {
          changeId: `change-proposal-${request.taskId}`,
          goal: request.changeGoal,
          scope: [target.sourceRef],
          originalSummary: 'One authorised diagnostic logging call was identified for a proposal-only replacement.',
          proposedChange: 'Replace the displayed console.log call prefix with logger.info.',
          risk: 'LOW',
          impact: 'The proposed change affects only the explicitly identified logging call if approved and applied later.',
          rollback: 'No repository mutation occurred. Any future approved application must use its own change record, testing evidence, approval, and rollback procedure.',
          evidenceRefs,
          approvalStatus: 'CONFIRM_REQUIRED',
          confidence,
          limitations,
        },
        proposedDiff: {
          diffId: `proposed-diff-${request.taskId}`,
          targetRef: target.sourceRef,
          displayText: `--- ${target.location}\n+++ ${target.location}\n-${originalLine}\n+${proposedLine}`,
          evidenceRefs,
        },
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
