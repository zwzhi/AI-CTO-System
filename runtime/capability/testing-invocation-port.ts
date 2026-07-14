import type {
  TestingExecutionOutcome,
  TestingInvocationRequest,
} from './testing-execution-contract.ts';

export interface TestingInvocationPort {
  invoke(invocation: TestingInvocationRequest): TestingExecutionOutcome;
}
