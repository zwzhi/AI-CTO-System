import type {
  AuditEvent,
  BudgetSnapshot,
  Evidence,
  ExecutionContext,
  Task,
  TaskInput,
  WorkflowInstance,
} from '../models/runtime-types.ts';
import type {
  EvidenceFreshnessInput,
  EvidenceFreshnessObservation,
  Reversibility,
  RiskLevel,
  RoutingRecommendation,
  RoutingRequest,
  TaskComplexity,
  TaskKind,
} from '../routing/execution-routing-contract.ts';
import type { RunOptions, RuntimeRunResult } from '../services/runtime-foundation-service.ts';
import type { CreateWorkflowInput } from '../workflow/workflow-service.ts';
import type { TaskExecutionEnvelope } from '../task/task-execution-envelope-contract.ts';
import type { TaskCheckpoint } from '../checkpoint/checkpoint-contract.ts';

export type IntentClassificationStatus =
  | 'CLASSIFIED'
  | 'AMBIGUOUS'
  | 'OUT_OF_SCOPE'
  | 'INSUFFICIENT_EVIDENCE';

export type IntentType =
  | 'NEW_PROJECT'
  | 'FEATURE_REQUEST'
  | 'BUG_FIX'
  | 'INCIDENT'
  | 'REFACTOR'
  | 'ARCHITECTURE_CHANGE'
  | 'RESEARCH_REQUEST'
  | 'KNOWLEDGE_UPDATE'
  | 'PROJECT_STATUS_QUERY'
  | 'GENERAL_CONVERSATION';

export type SuggestedWorkflow = 'INSTANT' | 'ENGINEERING' | 'CTO';

export type HandoffDecision =
  | 'WAITING_APPROVAL'
  | 'INTENT_REJECTED'
  | 'ROUTING_BLOCKED'
  | 'ENVELOPE_BLOCKED'
  | 'RUNTIME_BLOCKED'
  | 'INTEGRATION_FAILED';

export type HandoffErrorCode =
  | 'INVALID_HANDOFF_REQUEST'
  | 'HANDOFF_INVARIANT_VIOLATION';

export interface StructuredIntentClassificationResult {
  readonly schemaVersion: '1.0';
  readonly classificationId: string;
  readonly status: IntentClassificationStatus;
  readonly intentType: IntentType;
  readonly confidence: 'L1' | 'L2' | 'L3' | 'L4';
  readonly complexity: TaskComplexity;
  readonly taskKind: TaskKind;
  readonly riskLevel: RiskLevel;
  readonly reversibility: Reversibility;
  readonly hasApplicableGate: boolean;
  readonly requiresCurrentEvidence: boolean;
  readonly suggestedWorkflow: SuggestedWorkflow;
  readonly requiredCapabilityRefs: readonly string[];
  readonly taskObjective: string;
  readonly evidenceInputs: readonly EvidenceFreshnessInput[];
  readonly evidenceObservations: readonly EvidenceFreshnessObservation[];
}

export interface ControlledRuntimeHandoffRequest {
  readonly intentResult: StructuredIntentClassificationResult;
  readonly executionContext: ExecutionContext;
  readonly budget: BudgetSnapshot;
  readonly executionEnvelope?: TaskExecutionEnvelope;
  readonly checkpoint?: TaskCheckpoint;
  readonly cancelled?: boolean;
}

export interface ControlledRuntimeHandoffResult {
  readonly handoffDecision: HandoffDecision;
  readonly intentResult: StructuredIntentClassificationResult;
  readonly routingRecommendation?: RoutingRecommendation;
  readonly checkpoint?: TaskCheckpoint;
  readonly workflow?: WorkflowInstance;
  readonly task?: Task;
  readonly auditEvents: readonly AuditEvent[];
  readonly evidence: readonly Evidence[];
  readonly limitations: readonly string[];
}

export interface HandoffRouterPort {
  route(request: RoutingRequest): RoutingRecommendation;
}

export interface HandoffRuntimePort {
  run(
    workflowInput: CreateWorkflowInput,
    taskInput: TaskInput,
    options?: RunOptions,
  ): RuntimeRunResult;
}

export class HandoffError extends Error {
  readonly code: HandoffErrorCode;
  readonly details: Readonly<Record<string, unknown>>;

  constructor(
    code: HandoffErrorCode,
    message: string,
    details: Readonly<Record<string, unknown>> = Object.freeze({}),
  ) {
    super(message);
    this.name = 'HandoffError';
    this.code = code;
    this.details = Object.freeze({ ...details });
  }
}

