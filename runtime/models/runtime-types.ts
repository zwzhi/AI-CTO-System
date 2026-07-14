export type WorkflowState =
  | 'CREATED'
  | 'PLANNING'
  | 'WAITING_APPROVAL'
  | 'EXECUTING'
  | 'VALIDATING'
  | 'COMPLETED'
  | 'FAILED'
  | 'PAUSED'
  | 'ROLLING_BACK'
  | 'CANCELLED';

export type TaskState = 'CREATED' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
export type AgentTaskState =
  | 'CREATED'
  | 'ASSIGNED'
  | 'RUNNING'
  | 'VALIDATING'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED';
export type AgentType = 'PLANNER';
export type AgentAction = 'GENERATE_PLAN';
export type ExecutionPlanStatus = 'PROPOSED';
export type ApprovalStatus =
  | 'NOT_REQUESTED'
  | 'WAITING_APPROVAL'
  | 'CONFIRMED'
  | 'REJECTED'
  | 'CANCELLED';
export type AgentFailureStage = 'PREFLIGHT' | 'EXECUTION' | 'VALIDATION';
export type CapabilityStatus = 'SUCCESS' | 'FAILURE' | 'CANCELLED' | 'BLOCKED';
export type GuardDecisionKind = 'ALLOW' | 'CONFIRM_REQUIRED' | 'DENY';
export type ControlMode = 'AUTO' | 'CONFIRM' | 'BLOCK';
export type ConfidenceLevel = 'L1' | 'L2' | 'L3' | 'L4';
export type RuntimeErrorCode =
  | 'WORKFLOW_NOT_FOUND'
  | 'TASK_NOT_FOUND'
  | 'TASK_ALREADY_EXISTS'
  | 'INVALID_TRANSITION'
  | 'GUARD_DENIED'
  | 'CONFIRMATION_REQUIRED'
  | 'BUDGET_EXCEEDED'
  | 'OPERATION_CANCELLED'
  | 'CAPABILITY_FAILED'
  | 'AGENT_TASK_NOT_FOUND'
  | 'AGENT_TASK_ALREADY_EXISTS'
  | 'INVALID_AGENT_TASK_TRANSITION';

export interface BudgetSnapshot {
  readonly tokenLimit: number;
  readonly tokenUsed: number;
  readonly toolLimit: number;
  readonly toolUsed: number;
  readonly timeLimitMs: number;
  readonly timeUsedMs: number;
  readonly costLimit: number;
  readonly costUsed: number;
}

export interface ExecutionContext {
  readonly userRef?: string;
  readonly projectRef?: string;
  readonly intentRef: string;
  readonly constraintRefs: readonly string[];
  readonly allowedContextRefs: readonly string[];
}

export interface Evidence {
  readonly evidenceId: string;
  readonly source: string;
  readonly summary: string;
  readonly confidence: ConfidenceLevel;
  readonly timestamp: string;
  readonly reference?: string;
}

export interface CapabilityResult {
  readonly status: CapabilityStatus;
  readonly output: string;
  readonly evidence: readonly Evidence[];
  readonly confidence: ConfidenceLevel;
  readonly timestamp: string;
  readonly error?: string;
}

export interface WorkflowInstance {
  readonly workflowId: string;
  readonly intentRef: string;
  readonly executionContext: ExecutionContext;
  readonly controlMode: ControlMode;
  readonly budget: BudgetSnapshot;
  readonly state: WorkflowState;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface TaskInput {
  readonly request: string;
  readonly mode?: 'success' | 'failure';
}

export interface Task {
  readonly taskId: string;
  readonly workflowId: string;
  readonly input: TaskInput;
  readonly state: TaskState;
  readonly result?: CapabilityResult;
}

export interface AgentPermissionScope {
  readonly allowedActions: readonly AgentAction[];
  readonly deniedActions: readonly AgentAction[];
}

export interface PlannerInput {
  readonly userRequest: string;
  readonly intentResultRef: string;
  readonly intentType: 'NEW_PROJECT' | 'FEATURE_REQUEST' | 'BUG_FIX';
  readonly permissionScope: AgentPermissionScope;
}

export interface ExecutionPlan {
  readonly executionPlanId: string;
  readonly planSchemaVersion: string;
  readonly plannerVersion: string;
  readonly workflowId: string;
  readonly agentTaskId: string;
  readonly status: ExecutionPlanStatus;
  readonly objective: string;
  readonly scope: {
    readonly included: readonly string[];
    readonly excluded: readonly string[];
  };
  readonly orderedSteps: readonly string[];
  readonly dependencies: readonly string[];
  readonly constraintRefs: readonly string[];
  readonly assumptions: readonly string[];
  readonly risks: readonly string[];
  readonly requiredCapabilityTypes: readonly string[];
  readonly approvalRequired: true;
  readonly evidence: readonly Evidence[];
  readonly confidence: ConfidenceLevel;
  readonly createdAt: string;
}

export interface PlannerAgentResult {
  readonly status: Extract<AgentTaskState, 'COMPLETED' | 'FAILED' | 'CANCELLED'>;
  readonly executionPlan?: ExecutionPlan;
  readonly evidence: readonly Evidence[];
  readonly confidence: ConfidenceLevel;
  readonly timestamp: string;
  readonly failure?: string;
}

export interface AgentTask {
  readonly agentTaskId: string;
  readonly workflowId: string;
  readonly agentId: string;
  readonly agentType: AgentType;
  readonly input: PlannerInput;
  readonly status: AgentTaskState;
  readonly permissionScope: AgentPermissionScope;
  readonly budget: BudgetSnapshot;
  readonly evidence: readonly Evidence[];
  readonly output?: PlannerAgentResult;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface ExecutionRecord {
  readonly executionId: string;
  readonly workflowId: string;
  readonly taskId: string;
  readonly status: CapabilityStatus;
  readonly startedAt: string;
  readonly endedAt: string;
  readonly result: CapabilityResult;
}

export interface CapabilityInvocation {
  readonly invocationId: string;
  readonly taskId: string;
  readonly adapterId: 'mock';
  readonly status: CapabilityStatus;
  readonly result: CapabilityResult;
  readonly tokenUsed: number;
}

export interface AuditEvent {
  readonly auditId: string;
  readonly workflowId: string;
  readonly taskId?: string;
  readonly eventType: string;
  readonly status: WorkflowState | TaskState | CapabilityStatus | AgentTaskState | ExecutionPlanStatus;
  readonly evidence: readonly Evidence[];
  readonly timestamp: string;
  readonly result?: string;
  readonly agent?: {
    readonly agentTaskId: string;
    readonly agentId: string;
    readonly agentType: AgentType;
    readonly plannerVersion: string;
    readonly planSchemaVersion: string;
  };
  readonly approvalStatus?: ApprovalStatus;
  readonly executionDurationMs?: number;
  readonly inputRefs?: readonly string[];
  readonly outputRef?: string;
  readonly permissionSnapshot?: AgentPermissionScope;
  readonly budgetSnapshot?: BudgetSnapshot;
  readonly failureReason?: string;
  readonly failureStage?: AgentFailureStage;
}
