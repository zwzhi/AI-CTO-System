import type { ConfidenceLevel, Evidence } from '../runtime/models/runtime-types.ts';

export type DocumentAuthority = 'NON_AUTHORITATIVE' | 'AUTHORITATIVE';
export type OptimizationAction = 'DEDUPLICATE_EXACT_BLOCKS' | 'NORMALIZE_FORMATTING' | 'NORMALIZE_HEADINGS';
export type OptimizationAutonomyDecision = 'AUTO_EXECUTE' | 'AUTO_WITH_VALIDATION' | 'NOTIFY' | 'CONFIRM_REQUIRED' | 'MANDATORY_APPROVAL';
export type OptimizationExecutionStatus = 'COMPLETED' | 'BLOCKED' | 'ROLLED_BACK';

export interface InMemoryMarkdownDocument {
  readonly documentRef: string;
  readonly content: string;
  readonly baselineContent: string;
  readonly authority: DocumentAuthority;
}

export interface OptimizationExecutionRequest {
  readonly workflowId: string;
  readonly taskId: string;
  readonly proposalRef: string;
  readonly riskAssessmentRef: string;
  readonly autonomyDecision: OptimizationAutonomyDecision;
  readonly autoExecuteTestAuthorization: boolean;
  readonly documents: readonly InMemoryMarkdownDocument[];
  readonly authorizedDocumentRefs: readonly string[];
  readonly allowedActions: readonly OptimizationAction[];
  readonly validationPlanRef: string;
  readonly rollbackPlanRef: string;
  readonly timestamp: string;
}

export interface EligibilityResult {
  readonly allowed: boolean;
  readonly evidence: readonly Evidence[];
  readonly reason?: string;
}

export interface OptimizedDocument {
  readonly documentRef: string;
  readonly content: string;
  readonly changed: boolean;
}

export interface ValidationResult {
  readonly valid: boolean;
  readonly evidence: readonly Evidence[];
  readonly reason?: string;
}

export interface MarkdownOptimizerPort {
  optimize(document: InMemoryMarkdownDocument, actions: readonly OptimizationAction[]): OptimizedDocument;
}

export interface OptimizationValidationPort {
  validate(request: OptimizationExecutionRequest, candidates: readonly OptimizedDocument[]): ValidationResult;
}

export interface OptimizationExecutionResult {
  readonly status: OptimizationExecutionStatus;
  readonly documents: readonly OptimizedDocument[];
  readonly changedScope: readonly string[];
  readonly validationEvidence: readonly Evidence[];
  readonly auditEvidence: readonly Evidence[];
  readonly limitations: readonly string[];
  readonly failureReason?: string;
}

export type { ConfidenceLevel, Evidence };
