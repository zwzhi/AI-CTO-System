import type {
  BudgetSnapshot,
  CapabilityStatus,
  ConfidenceLevel,
  Evidence,
  ExecutionContext,
} from '../models/runtime-types.ts';

export const CODE_ANALYSIS_OPERATIONS = ['ANALYZE_READ_ONLY_CODE'] as const;

export type CodeAnalysisOperation = (typeof CODE_ANALYSIS_OPERATIONS)[number];
export type CodeAnalysisFailureCategory =
  | 'PERMISSION_DENIED'
  | 'BUDGET_EXCEEDED'
  | 'CANCELLED'
  | 'SOURCE_SCOPE_INVALID'
  | 'OUTPUT_INVALID'
  | 'EXECUTION_FAILED';

export interface AuthorizedCodeContext {
  readonly sourceRef: string;
  readonly location: string;
  readonly content: string;
  readonly versionRef?: string;
}

export interface RepositoryContext {
  readonly repositoryRef: string;
  readonly revisionRef?: string;
}

export interface CodeAnalysisPermissionGrant {
  readonly grantId: string;
  readonly allowedOperations: readonly CodeAnalysisOperation[];
  readonly expiresAt: string;
}

export interface ArchitectureFinding {
  readonly findingId: string;
  readonly summary: string;
  readonly evidenceRefs: readonly string[];
}

export interface RiskFinding {
  readonly findingId: string;
  readonly severity: 'LOW' | 'MEDIUM' | 'HIGH';
  readonly summary: string;
  readonly evidenceRefs: readonly string[];
}

export interface TechnicalDebtFinding {
  readonly findingId: string;
  readonly summary: string;
  readonly evidenceRefs: readonly string[];
}

export interface CodeAnalysisResult {
  readonly resultRef: string;
  readonly analysisReport: string;
  readonly architectureFindings: readonly ArchitectureFinding[];
  readonly riskFindings: readonly RiskFinding[];
  readonly technicalDebt: readonly TechnicalDebtFinding[];
  readonly evidence: readonly Evidence[];
  readonly confidence: ConfidenceLevel;
  readonly limitations: readonly string[];
}

export interface CodeAnalysisFailure {
  readonly category: CodeAnalysisFailureCategory;
  readonly stage: 'PREFLIGHT' | 'INVOCATION' | 'VALIDATION';
  readonly reason: string;
}

export interface CodeAnalysisExecutionRequest {
  readonly taskId: string;
  readonly workflowId: string;
  readonly operation: CodeAnalysisOperation;
  readonly taskObjective: string;
  readonly authorizedCodeContexts: readonly AuthorizedCodeContext[];
  readonly repositoryContext: RepositoryContext;
  readonly executionContext: ExecutionContext;
  readonly permissionGrant: CodeAnalysisPermissionGrant;
  readonly budget: BudgetSnapshot;
  readonly cancelled?: boolean;
}

export interface CodeAnalysisInvocationRequest {
  readonly request: CodeAnalysisExecutionRequest;
  readonly evidence: readonly Evidence[];
}

export interface CodeAnalysisExecutionOutcome {
  readonly status: CapabilityStatus;
  readonly result?: CodeAnalysisResult;
  readonly evidence: readonly Evidence[];
  readonly confidence: ConfidenceLevel;
  readonly timestamp: string;
  readonly usage: {
    readonly tokenUsed: number;
    readonly toolUsed: number;
    readonly timeUsedMs: number;
    readonly costUsed: number;
  };
  readonly failure?: CodeAnalysisFailure;
}
