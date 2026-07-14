import type { Evidence } from '../models/runtime-types.ts';
import type { CodexInvocationPort } from './codex-invocation-port.ts';
import type { CodexExecutionOutcome, CodexExecutionRequest } from './codex-execution-contract.ts';

export class MockCodexCapability implements CodexInvocationPort {
  private readonly now: () => string;

  constructor(now: () => string = () => new Date().toISOString()) {
    this.now = now;
  }

  invoke(request: CodexExecutionRequest): CodexExecutionOutcome {
    const timestamp = this.now();
    if (request.operation === 'APPLY_CHANGE' || request.operation === 'CREATE_COMMIT') {
      return this.outcome(request, timestamp, 'BLOCKED', 'operation is not implemented by local mock', [], 'EXECUTION_FAILED');
    }
    if (request.fixture === 'failure') {
      return this.outcome(request, timestamp, 'FAILURE', 'mock capability fixture failed', [], 'EXECUTION_FAILED');
    }
    const proposed = request.operation === 'PROPOSE_CHANGE'
      ? [{ path: 'proposed/example.ts', rationale: 'deterministic fixture proposal', state: 'PROPOSED' as const }]
      : [];
    return this.outcome(request, timestamp, 'SUCCESS', request.operation === 'ANALYZE_CODE' ? 'mock analysis completed' : 'mock change proposal completed', proposed);
  }

  private outcome(request: CodexExecutionRequest, timestamp: string, status: CodexExecutionOutcome['status'], summary: string, changedFilesProposal: CodexExecutionOutcome['changedFilesProposal'], failureCategory?: 'EXECUTION_FAILED'): CodexExecutionOutcome {
    const evidence: Evidence = { evidenceId: `codex-mock-evidence-${request.taskId}`, source: 'mock-codex-capability', summary, confidence: 'L3', timestamp, reference: request.taskId };
    return { status, result: { resultRef: `codex-mock-result-${request.taskId}`, summary, assumptions: ['local deterministic fixture'] }, evidence: [evidence], changedFilesProposal, confidence: 'L3', timestamp, usage: { tokenUsed: 0, toolUsed: 0, timeUsedMs: 0, costUsed: 0 }, ...(failureCategory === undefined ? {} : { failure: { category: failureCategory, stage: 'INVOCATION', reason: summary } }) };
  }
}
