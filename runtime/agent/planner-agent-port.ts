import type {
  ExecutionContext,
  PlannerAgentResult,
  PlannerInput,
} from '../models/runtime-types.ts';

export interface PlannerExecutionInput extends PlannerInput {
  readonly agentTaskId: string;
  readonly workflowId: string;
  readonly executionContext: ExecutionContext;
}

export interface PlannerAgentPort {
  readonly agentId: string;
  readonly agentType: 'PLANNER';
  readonly plannerVersion: string;
  readonly planSchemaVersion: string;
  execute(input: PlannerExecutionInput): PlannerAgentResult;
}
