import type {
  CapabilityResult,
  ExecutionContext,
  TaskInput,
} from '../models/runtime-types.ts';

export interface CapabilityRequest {
  readonly taskId: string;
  readonly input: TaskInput;
  readonly executionContext: ExecutionContext;
}

export interface CapabilityAdapterPort {
  invoke(request: CapabilityRequest): CapabilityResult;
}
