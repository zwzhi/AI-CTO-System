import type {
  CodexExecutionOutcome,
  CodexExecutionRequest,
} from './codex-execution-contract.ts';

export interface CodexInvocationPort {
  invoke(request: CodexExecutionRequest): CodexExecutionOutcome;
}
