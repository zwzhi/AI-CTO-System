import type {
  DocumentationExecutionOutcome,
  DocumentationInvocationRequest,
} from './documentation-execution-contract.ts';

export interface DocumentationInvocationPort {
  invoke(invocation: DocumentationInvocationRequest): DocumentationExecutionOutcome;
}
