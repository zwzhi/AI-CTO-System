import type {
  BudgetSnapshot,
  CapabilityStatus,
  ConfidenceLevel,
  Evidence,
  ExecutionContext,
} from '../models/runtime-types.ts';

export const DOCUMENTATION_OPERATIONS = ['GENERATE_DRAFT'] as const;

export type DocumentationOperation = (typeof DOCUMENTATION_OPERATIONS)[number];
export type DocumentationFailureCategory =
  | 'PERMISSION_DENIED'
  | 'BUDGET_EXCEEDED'
  | 'CANCELLED'
  | 'SOURCE_SCOPE_INVALID'
  | 'OUTPUT_INVALID'
  | 'EXECUTION_FAILED';

export interface AuthorizedDocumentationSource {
  readonly sourceRef: string;
  readonly location: string;
  readonly content: string;
  readonly versionRef?: string;
}

export interface DocumentationPermissionGrant {
  readonly grantId: string;
  readonly allowedOperations: readonly DocumentationOperation[];
  readonly expiresAt: string;
}

export interface DocumentationSourceReference {
  readonly sourceRef: string;
  readonly location: string;
  readonly versionRef?: string;
}

export interface DocumentationResult {
  readonly resultRef: string;
  readonly draft: string;
  readonly sourceReferences: readonly DocumentationSourceReference[];
  readonly confidence: ConfidenceLevel;
  readonly evidence: readonly Evidence[];
  readonly limitations: readonly string[];
}

export interface DocumentationFailure {
  readonly category: DocumentationFailureCategory;
  readonly stage: 'PREFLIGHT' | 'INVOCATION' | 'VALIDATION';
  readonly reason: string;
}

export interface DocumentationExecutionRequest {
  readonly taskId: string;
  readonly workflowId: string;
  readonly operation: DocumentationOperation;
  readonly taskObjective: string;
  readonly authorizedSources: readonly AuthorizedDocumentationSource[];
  readonly executionContext: ExecutionContext;
  readonly permissionGrant: DocumentationPermissionGrant;
  readonly budget: BudgetSnapshot;
  readonly cancelled?: boolean;
}

export interface DocumentationInvocationRequest {
  readonly request: DocumentationExecutionRequest;
  readonly evidence: readonly Evidence[];
}

export interface DocumentationExecutionOutcome {
  readonly status: CapabilityStatus;
  readonly result?: DocumentationResult;
  readonly evidence: readonly Evidence[];
  readonly confidence: ConfidenceLevel;
  readonly timestamp: string;
  readonly usage: {
    readonly tokenUsed: number;
    readonly toolUsed: number;
    readonly timeUsedMs: number;
    readonly costUsed: number;
  };
  readonly failure?: DocumentationFailure;
}
