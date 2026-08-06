import type {
  AuditEvent,
  Evidence,
  Task,
  WorkflowInstance,
} from '../models/runtime-types.ts';
import type {
  DocumentationExecutionOutcome,
  DocumentationExecutionRequest,
} from '../capability/documentation-execution-contract.ts';
import type { DocumentationRuntimeExecutionResult } from '../services/documentation-capability-runtime-service.ts';

export interface DocumentationExecutionApproval {
  readonly approvalId: string;
  readonly status: 'CONFIRMED';
  readonly classificationId: string;
  readonly routingId: string;
  readonly workflowId: string;
  readonly taskId: string;
  readonly capabilityId: 'CAP-DOC-0001';
  readonly capabilityVersion: '1.0.0-internal';
  readonly operation: 'GENERATE_DRAFT';
  readonly sourceScopeFingerprint: string;
  readonly confirmedAt: string;
  readonly expiresAt: string;
}

export interface ApprovedDocumentationExecutionRequest {
  readonly classificationId: string;
  readonly routingId: string;
  readonly executionEnvironment: 'INTERNAL_LOCAL';
  readonly approval?: DocumentationExecutionApproval;
  readonly documentationRequest: DocumentationExecutionRequest;
  readonly cancelled?: boolean;
}

export type ApprovedDocumentationExecutionDecision =
  | 'COMPLETED'
  | 'FAILED'
  | 'BLOCKED'
  | 'CANCELLED';

export type ApprovedDocumentationExecutionFailureCode =
  | 'WORKFLOW_NOT_FOUND'
  | 'WORKFLOW_NOT_WAITING_APPROVAL'
  | 'TASK_NOT_FOUND'
  | 'TASK_MISMATCH'
  | 'HANDOFF_REFERENCE_MISMATCH'
  | 'APPROVAL_REJECTED'
  | 'CAPABILITY_NOT_ACTIVE'
  | 'ACTIVATION_SCOPE_MISMATCH'
  | 'SOURCE_SCOPE_CHANGED'
  | 'PERMISSION_DENIED'
  | 'BUDGET_EXCEEDED'
  | 'SOURCE_SCOPE_INVALID'
  | 'CANCELLED'
  | 'CAPABILITY_FAILED';

export interface ApprovedDocumentationExecutionFailure {
  readonly code: ApprovedDocumentationExecutionFailureCode;
  readonly stage: 'PREFLIGHT' | 'EXECUTION' | 'VALIDATION';
  readonly reason: string;
}

export interface ApprovedDocumentationExecutionResult {
  readonly decision: ApprovedDocumentationExecutionDecision;
  readonly workflow?: WorkflowInstance;
  readonly task?: Task;
  readonly documentationOutcome?: DocumentationExecutionOutcome;
  readonly auditEvents: readonly AuditEvent[];
  readonly evidence: readonly Evidence[];
  readonly failure?: ApprovedDocumentationExecutionFailure;
}

export interface DocumentationExecutionPort {
  execute(request: DocumentationExecutionRequest): DocumentationRuntimeExecutionResult;
}
