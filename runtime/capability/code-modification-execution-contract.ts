import type {
  BudgetSnapshot,
  CapabilityStatus,
  ConfidenceLevel,
  ExecutionContext,
} from '../models/runtime-types.ts';

export const CODE_MODIFICATION_OPERATIONS = ['PROPOSE_CHANGE'] as const;

export type CodeModificationOperation = (typeof CODE_MODIFICATION_OPERATIONS)[number];
export type ModificationFailureCategory =
  | 'PERMISSION_DENIED'
  | 'BUDGET_EXCEEDED'
  | 'CANCELLED'
  | 'SOURCE_SCOPE_INVALID'
  | 'EVIDENCE_INSUFFICIENT'
  | 'OUTPUT_INVALID'
  | 'EXECUTION_FAILED';

export interface AuthorizedChangeContext {
  readonly sourceRef: string;
  readonly location: string;
  readonly content: string;
  readonly versionRef?: string;
}

export interface ChangeEvidenceBinding {
  readonly evidenceRef: string;
  readonly source: string;
  readonly summary: string;
  readonly confidence: ConfidenceLevel;
  readonly timestamp: string;
}

export interface ModificationPermissionGrant {
  readonly grantId: string;
  readonly allowedOperations: readonly CodeModificationOperation[];
  readonly expiresAt: string;
}

export interface ChangeProposal {
  readonly changeId: string;
  readonly goal: string;
  readonly scope: readonly string[];
  readonly originalSummary: string;
  readonly proposedChange: string;
  readonly risk: 'LOW' | 'MEDIUM' | 'HIGH';
  readonly impact: string;
  readonly rollback: string;
  readonly evidenceRefs: readonly string[];
  readonly approvalStatus: 'CONFIRM_REQUIRED';
  readonly confidence: ConfidenceLevel;
  readonly limitations: readonly string[];
}

export interface ProposedDiff {
  readonly diffId: string;
  readonly targetRef: string;
  readonly displayText: string;
  readonly evidenceRefs: readonly string[];
}

export interface ModificationResult {
  readonly resultRef: string;
  readonly changeProposal: ChangeProposal;
  readonly proposedDiff: ProposedDiff;
  readonly evidence: readonly ChangeEvidenceBinding[];
  readonly confidence: ConfidenceLevel;
  readonly limitations: readonly string[];
}

export interface ModificationFailure {
  readonly category: ModificationFailureCategory;
  readonly stage: 'PREFLIGHT' | 'INVOCATION' | 'VALIDATION';
  readonly reason: string;
}

export interface ModificationExecutionRequest {
  readonly taskId: string;
  readonly workflowId: string;
  readonly operation: CodeModificationOperation;
  readonly changeGoal: string;
  readonly authorizedChangeContexts: readonly AuthorizedChangeContext[];
  readonly codeAnalysisEvidence: readonly ChangeEvidenceBinding[];
  readonly testEvidence: readonly ChangeEvidenceBinding[];
  readonly executionContext: ExecutionContext;
  readonly permissionGrant: ModificationPermissionGrant;
  readonly budget: BudgetSnapshot;
  readonly cancelled?: boolean;
}

export interface CodeModificationInvocationRequest {
  readonly request: ModificationExecutionRequest;
  readonly evidence: readonly ChangeEvidenceBinding[];
}

export interface ModificationExecutionOutcome {
  readonly status: CapabilityStatus;
  readonly result?: ModificationResult;
  readonly evidence: readonly ChangeEvidenceBinding[];
  readonly confidence: ConfidenceLevel;
  readonly timestamp: string;
  readonly usage: {
    readonly tokenUsed: number;
    readonly toolUsed: number;
    readonly timeUsedMs: number;
    readonly costUsed: number;
  };
  readonly failure?: ModificationFailure;
}
