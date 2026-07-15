import type {
  CodeModificationInvocationRequest,
  ModificationExecutionOutcome,
} from './code-modification-execution-contract.ts';

export interface CodeModificationInvocationPort {
  invoke(invocation: CodeModificationInvocationRequest): ModificationExecutionOutcome;
}
