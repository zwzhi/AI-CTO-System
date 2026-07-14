import type {
  BudgetSnapshot,
  CapabilityStatus,
  ConfidenceLevel,
  Evidence,
  ExecutionContext,
} from '../models/runtime-types.ts';

export const TESTING_OPERATIONS = ['ANALYZE_TEST_CONTEXT'] as const;

export type TestingOperation = (typeof TESTING_OPERATIONS)[number];
export type TestingFailureCategory =
  | 'PERMISSION_DENIED'
  | 'BUDGET_EXCEEDED'
  | 'CANCELLED'
  | 'SOURCE_SCOPE_INVALID'
  | 'OUTPUT_INVALID'
  | 'EXECUTION_FAILED';

export interface AuthorizedTestContext {
  readonly sourceRef: string;
  readonly location: string;
  readonly content: string;
  readonly versionRef?: string;
}

export interface TestingPermissionGrant {
  readonly grantId: string;
  readonly allowedOperations: readonly TestingOperation[];
  readonly expiresAt: string;
}

export interface CoverageFinding {
  readonly findingId: string;
  readonly summary: string;
  readonly evidenceRefs: readonly string[];
}

export interface TestingRiskFinding {
  readonly findingId: string;
  readonly severity: 'LOW' | 'MEDIUM' | 'HIGH';
  readonly summary: string;
  readonly evidenceRefs: readonly string[];
}

export interface TestingRecommendation {
  readonly findingId: string;
  readonly summary: string;
  readonly evidenceRefs: readonly string[];
}

export interface TestingResult {
  readonly resultRef: string;
  readonly testAnalysisReport: string;
  readonly coverageFindings: readonly CoverageFinding[];
  readonly riskFindings: readonly TestingRiskFinding[];
  readonly testRecommendations: readonly TestingRecommendation[];
  readonly evidence: readonly Evidence[];
  readonly confidence: ConfidenceLevel;
  readonly limitations: readonly string[];
}

export interface TestingFailure {
  readonly category: TestingFailureCategory;
  readonly stage: 'PREFLIGHT' | 'INVOCATION' | 'VALIDATION';
  readonly reason: string;
}

export interface TestingExecutionRequest {
  readonly taskId: string;
  readonly workflowId: string;
  readonly operation: TestingOperation;
  readonly testingObjective: string;
  readonly authorizedTestContexts: readonly AuthorizedTestContext[];
  readonly executionContext: ExecutionContext;
  readonly permissionGrant: TestingPermissionGrant;
  readonly budget: BudgetSnapshot;
  readonly cancelled?: boolean;
}

export interface TestingInvocationRequest {
  readonly request: TestingExecutionRequest;
  readonly evidence: readonly Evidence[];
}

export interface TestingExecutionOutcome {
  readonly status: CapabilityStatus;
  readonly result?: TestingResult;
  readonly evidence: readonly Evidence[];
  readonly confidence: ConfidenceLevel;
  readonly timestamp: string;
  readonly usage: {
    readonly tokenUsed: number;
    readonly toolUsed: number;
    readonly timeUsedMs: number;
    readonly costUsed: number;
  };
  readonly failure?: TestingFailure;
}
