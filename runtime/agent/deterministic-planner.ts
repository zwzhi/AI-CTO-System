import type { Evidence, PlannerAgentResult } from '../models/runtime-types.ts';
import type { PlannerAgentPort, PlannerExecutionInput } from './planner-agent-port.ts';

const templates: Readonly<Record<PlannerExecutionInput['intentType'], readonly string[]>> = {
  NEW_PROJECT: ['Clarify candidate scope and constraints', 'Prepare governed discovery inputs', 'Request human approval before any execution'],
  FEATURE_REQUEST: ['Confirm requirement scope and constraints', 'Prepare a bounded design and task proposal', 'Request human approval before any execution'],
  BUG_FIX: ['Capture reproducible problem evidence', 'Prepare a bounded remediation proposal', 'Request human approval before any execution'],
};

export interface DeterministicPlannerOptions {
  readonly plannerVersion: string;
  readonly planSchemaVersion: string;
  readonly now?: () => string;
}

export class DeterministicPlanner implements PlannerAgentPort {
  readonly agentId = 'planner-deterministic';
  readonly agentType = 'PLANNER' as const;
  readonly plannerVersion: string;
  readonly planSchemaVersion: string;
  readonly #now: () => string;

  constructor(options: DeterministicPlannerOptions) {
    this.plannerVersion = options.plannerVersion;
    this.planSchemaVersion = options.planSchemaVersion;
    this.#now = options.now ?? (() => new Date().toISOString());
  }

  execute(input: PlannerExecutionInput): PlannerAgentResult {
    const timestamp = this.#now();
    const request = input.userRequest.trim();
    if (request.length === 0) {
      return this.#failure(input.agentTaskId, timestamp, 'planner requires a non-empty user request');
    }

    const template = templates[input.intentType];
    if (template === undefined) {
      return this.#failure(input.agentTaskId, timestamp, `unsupported intent type: ${input.intentType}`);
    }

    const evidence = [this.#evidence(input.agentTaskId, timestamp, `deterministic template for ${input.intentType}`)];
    return {
      status: 'COMPLETED',
      executionPlan: {
        executionPlanId: `plan-${input.agentTaskId}`,
        planSchemaVersion: this.planSchemaVersion,
        plannerVersion: this.plannerVersion,
        workflowId: input.workflowId,
        agentTaskId: input.agentTaskId,
        status: 'PROPOSED',
        objective: request,
        scope: {
          included: [request],
          excluded: ['capability invocation', 'automatic execution', 'code modification'],
        },
        orderedSteps: template,
        dependencies: [],
        assumptions: input.executionContext.constraintRefs,
        risks: ['Human confirmation is required before follow-up execution.'],
        requiredCapabilityTypes: [],
        approvalRequired: true,
        evidence,
        confidence: 'L3',
        createdAt: timestamp,
      },
      evidence,
      confidence: 'L3',
      timestamp,
    };
  }

  #failure(agentTaskId: string, timestamp: string, failure: string): PlannerAgentResult {
    const evidence = [this.#evidence(agentTaskId, timestamp, failure)];
    return { status: 'FAILED', evidence, confidence: 'L3', timestamp, failure };
  }

  #evidence(agentTaskId: string, timestamp: string, summary: string): Evidence {
    return {
      evidenceId: `planner-evidence-${agentTaskId}`,
      source: 'deterministic-planner',
      summary,
      confidence: 'L3',
      timestamp,
    };
  }
}
