import type { DocumentationInvocationPort } from './documentation-invocation-port.ts';
import type {
  DocumentationExecutionOutcome,
  DocumentationInvocationRequest,
} from './documentation-execution-contract.ts';

function hasVersion(source: DocumentationInvocationRequest['request']['authorizedSources'][number]): boolean {
  return source.versionRef?.trim() !== '' && source.versionRef !== undefined;
}

export class DeterministicDocumentationAssistant implements DocumentationInvocationPort {
  private readonly now: () => string;

  constructor(now: () => string = () => new Date().toISOString()) {
    this.now = now;
  }

  invoke(invocation: DocumentationInvocationRequest): DocumentationExecutionOutcome {
    const { request, evidence } = invocation;
    const timestamp = this.now();
    const confidence = request.authorizedSources.every(hasVersion) ? 'L3' as const : 'L2' as const;
    const sourceReferences = request.authorizedSources.map(({ sourceRef, location, versionRef }) => ({
      sourceRef,
      location,
      ...(versionRef === undefined ? {} : { versionRef }),
    }));
    const limitations = [
      'Draft is limited to the immutable authorized source scope supplied in this request.',
      ...(request.authorizedSources.some((source) => !hasVersion(source))
        ? ['One or more sources lack a version reference; confidence is limited to L2.']
        : ['No external verification, file access, or state changes were performed.']),
    ];
    const draft = [
      `DRAFT: ${request.taskObjective}`,
      '',
      'Evidence-backed source references:',
      ...request.authorizedSources.map((source) => `- [${source.sourceRef} @ ${source.location}] authorized source evidence was reviewed.`),
      '',
      'This is a draft for human review and does not modify any document or runtime state.',
    ].join('\n');

    return {
      status: 'SUCCESS',
      result: {
        resultRef: `documentation-result-${request.taskId}`,
        draft,
        sourceReferences,
        confidence,
        evidence,
        limitations,
      },
      evidence,
      confidence,
      timestamp,
      usage: { tokenUsed: 0, toolUsed: 0, timeUsedMs: 0, costUsed: 0 },
    };
  }
}
