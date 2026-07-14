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
  | 'CAPABILITY_FAILED';

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
  readonly status: WorkflowState | TaskState | CapabilityStatus;
  readonly evidence: readonly Evidence[];
  readonly timestamp: string;
  readonly result?: string;
}
