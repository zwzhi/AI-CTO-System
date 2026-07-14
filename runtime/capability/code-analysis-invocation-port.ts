import type {
  CodeAnalysisExecutionOutcome,
  CodeAnalysisInvocationRequest,
} from './code-analysis-execution-contract.ts';

export interface CodeAnalysisInvocationPort {
  invoke(invocation: CodeAnalysisInvocationRequest): CodeAnalysisExecutionOutcome;
}
