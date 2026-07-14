import type {
  BudgetSnapshot,
  CapabilityStatus,
  ConfidenceLevel,
  Evidence,
  ExecutionContext,
} from '../models/runtime-types.ts';

export const CODEX_OPERATIONS = [
  'ANALYZE_CODE',
  'PROPOSE_CHANGE',
  'APPLY_CHANGE',
  'CREATE_COMMIT',
] as const;

export type CodexOperation = (typeof CODEX_OPERATIONS)[number];
export type CodexApprovalStatus = 'CONFIRMED' | 'REJECTED' | 'EXPIRED';
export type CodexFailureCategory =
  | 'PERMISSION_DENIED'
  | 'APPROVAL_REQUIRED'
  | 'BUDGET_EXCEEDED'
  | 'CANCELLED'
  | 'OUTPUT_INVALID'
  | 'EXECUTION_FAILED';

export interface CodexPermissionGrant {
  readonly grantId: string;
  readonly allowedOperations: readonly CodexOperation[];
  readonly expiresAt: string;
}

export interface CodexApproval {
  readonly approvalId: string;
  readonly status: CodexApprovalStatus;
  readonly taskId: string;
  readonly operation: CodexOperation;
  readonly expiresAt: string;
}

export interface ChangedFileProposal {
  readonly path: string;
  readonly rationale: string;
  readonly state: 'PROPOSED';
}

export interface CodexResult {
  readonly resultRef: string;
  readonly summary: string;
  readonly assumptions: readonly string[];
}

export interface CodexFailure {
  readonly category: CodexFailureCategory;
  readonly stage: 'PREFLIGHT' | 'INVOCATION' | 'VALIDATION';
  readonly reason: string;
}

export interface CodexExecutionRequest {
  readonly taskId: string;
  readonly workflowId: string;
  readonly operation: CodexOperation;
  readonly executionContext: ExecutionContext;
  readonly permissionGrant: CodexPermissionGrant;
  readonly budget: BudgetSnapshot;
  readonly approval: CodexApproval;
  readonly cancelled?: boolean;
  readonly fixture?: 'success' | 'failure' | 'invalid-output';
}

export interface CodexExecutionOutcome {
  readonly status: CapabilityStatus;
  readonly result: CodexResult;
  readonly evidence: readonly Evidence[];
  readonly changedFilesProposal: readonly ChangedFileProposal[];
  readonly confidence: ConfidenceLevel;
  readonly timestamp: string;
  readonly usage: {
    readonly tokenUsed: number;
    readonly toolUsed: number;
    readonly timeUsedMs: number;
    readonly costUsed: number;
  };
  readonly failure?: CodexFailure;
}
