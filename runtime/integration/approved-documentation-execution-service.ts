import type { AuditService } from '../audit/audit-service.ts';
import {
  DOCUMENTATION_CAPABILITY_ID,
  DOCUMENTATION_CAPABILITY_VERSION,
} from '../capability/documentation-capability-activation-contract.ts';
import type { DocumentationCapabilityActivationPort } from '../capability/documentation-capability-activation-port.ts';
import type { DocumentationExecutionRequest } from '../capability/documentation-execution-contract.ts';
import { RuntimeError } from '../models/runtime-error.ts';
import type { AuditEvent, BudgetSnapshot, Evidence, Task, WorkflowInstance } from '../models/runtime-types.ts';
import type { TaskService } from '../task/task-service.ts';
import type { WorkflowService } from '../workflow/workflow-service.ts';
import type {
  ApprovedDocumentationExecutionFailure,
  ApprovedDocumentationExecutionRequest,
  ApprovedDocumentationExecutionResult,
  DocumentationExecutionPort,
} from './approved-documentation-execution-contract.ts';
import { createDocumentationSourceScopeFingerprint } from './documentation-source-scope-fingerprint.ts';

const REQUIRED_ACTIVATION_SCOPE = [
  'INTERNAL_NON_PRODUCTION',
  'EXPLICIT_CONFIRMATION_REQUIRED',
  'AUTHORIZED_IN_MEMORY_SOURCES_ONLY',
  'DRAFT_OUTPUT_ONLY',
  'NO_FILESYSTEM_NETWORK_PROVIDER_TOOL_OR_KNOWLEDGE_WRITE',
] as const;

export interface ApprovedDocumentationExecutionDependencies {
  readonly workflowService: WorkflowService;
  readonly taskService: TaskService;
  readonly activationPort: DocumentationCapabilityActivationPort;
  readonly documentationExecutionPort: DocumentationExecutionPort;
  readonly auditService: AuditService;
  readonly now?: () => string;
}

function cloneAndFreeze<T>(value: T): T {
  const clone = structuredClone(value);

  function freezeNested(candidate: unknown): void {
    if (candidate === null || typeof candidate !== 'object' || Object.isFrozen(candidate)) {
      return;
    }
    for (const nested of Object.values(candidate)) {
      freezeNested(nested);
    }
    Object.freeze(candidate);
  }

  freezeNested(clone);
  return clone;
}

function isCanonicalIsoTimestamp(value: string): boolean {
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) && new Date(parsed).toISOString() === value;
}

function hasValidBudget(budget: BudgetSnapshot): boolean {
  const pairs = [
    [budget.tokenLimit, budget.tokenUsed],
    [budget.toolLimit, budget.toolUsed],
    [budget.timeLimitMs, budget.timeUsedMs],
    [budget.costLimit, budget.costUsed],
  ] as const;
  return pairs.every(([limit, used]) =>
    Number.isFinite(limit) &&
    Number.isFinite(used) &&
    limit >= 0 &&
    used >= 0 &&
    used <= limit,
  );
}

function parseHandoff(request: string): { readonly routingId: string; readonly objective: string } | undefined {
  const prefix = 'handoff:v1:';
  if (!request.startsWith(prefix)) return undefined;
  try {
    const value = JSON.parse(request.slice(prefix.length)) as Record<string, unknown>;
    if (
      typeof value.routingId !== 'string' ||
      value.routingId.trim().length === 0 ||
      typeof value.objective !== 'string' ||
      value.objective.trim().length === 0
    ) {
      return undefined;
    }
    return { routingId: value.routingId, objective: value.objective };
  } catch {
    return undefined;
  }
}

export class ApprovedDocumentationExecutionService {
  readonly #dependencies: Omit<ApprovedDocumentationExecutionDependencies, 'now'>;
  readonly #now: () => string;
  #nextAuditId = 1;

  constructor(dependencies: ApprovedDocumentationExecutionDependencies) {
    this.#dependencies = dependencies;
    this.#now = dependencies.now ?? (() => new Date().toISOString());
  }

  execute(request: ApprovedDocumentationExecutionRequest): ApprovedDocumentationExecutionResult {
    const now = this.#now();
    let workflow: WorkflowInstance | undefined;
    let task: Task | undefined;

    try {
      workflow = this.#dependencies.workflowService.get(request.documentationRequest.workflowId);
    } catch (error) {
      if (error instanceof RuntimeError && error.code === 'WORKFLOW_NOT_FOUND') {
        return this.#blocked(request, undefined, undefined, 'WORKFLOW_NOT_FOUND', 'Workflow was not found.');
      }
      throw error;
    }
    if (workflow.state !== 'WAITING_APPROVAL') {
      return this.#blocked(request, workflow, undefined, 'WORKFLOW_NOT_WAITING_APPROVAL', 'Workflow is not waiting for approval.');
    }

    try {
      task = this.#dependencies.taskService.get(request.documentationRequest.taskId);
    } catch (error) {
      if (error instanceof RuntimeError && error.code === 'TASK_NOT_FOUND') {
        return this.#blocked(request, workflow, undefined, 'TASK_NOT_FOUND', 'Task was not found.');
      }
      throw error;
    }
    if (task.state !== 'CREATED' || task.workflowId !== workflow.workflowId) {
      return this.#blocked(request, workflow, task, 'TASK_MISMATCH', 'Task does not belong to the waiting Workflow.');
    }

    const handoff = parseHandoff(task.input.request);
    if (handoff === undefined) {
      return this.#blocked(request, workflow, task, 'HANDOFF_REFERENCE_MISMATCH', 'Task does not contain a valid controlled handoff reference.');
    }
    if (
      request.classificationId !== workflow.intentRef ||
      request.routingId !== handoff.routingId ||
      request.documentationRequest.taskObjective !== handoff.objective
    ) {
      return this.#blocked(request, workflow, task, 'HANDOFF_REFERENCE_MISMATCH', 'Execution references do not match the controlled handoff.');
    }

    const approval = request.approval;
    if (
      approval === undefined ||
      approval.status !== 'CONFIRMED' ||
      !isCanonicalIsoTimestamp(approval.confirmedAt) ||
      !isCanonicalIsoTimestamp(approval.expiresAt) ||
      Date.parse(approval.confirmedAt) > Date.parse(now) ||
      Date.parse(now) >= Date.parse(approval.expiresAt) ||
      approval.classificationId !== request.classificationId ||
      approval.routingId !== request.routingId ||
      approval.workflowId !== workflow.workflowId ||
      approval.taskId !== task.taskId ||
      approval.capabilityId !== DOCUMENTATION_CAPABILITY_ID ||
      approval.operation !== request.documentationRequest.operation
    ) {
      return this.#blocked(request, workflow, task, 'APPROVAL_REJECTED', 'Approval is missing, expired, noncanonical, or not bound to the execution.');
    }

    const activation = this.#dependencies.activationPort.getById(DOCUMENTATION_CAPABILITY_ID);
    if (
      activation === undefined ||
      activation.registryStatus !== 'ACTIVE' ||
      activation.version !== DOCUMENTATION_CAPABILITY_VERSION ||
      activation.sourceCommit !== '9876764' ||
      approval.capabilityVersion !== activation.version
    ) {
      return this.#blocked(request, workflow, task, 'CAPABILITY_NOT_ACTIVE', 'The exact evaluated Documentation Capability version is not active.');
    }
    if (
      request.executionEnvironment !== activation.allowedEnvironment ||
      !activation.allowedOperations.includes(request.documentationRequest.operation) ||
      !REQUIRED_ACTIVATION_SCOPE.every((scope) => activation.activationScope.includes(scope))
    ) {
      return this.#blocked(request, workflow, task, 'ACTIVATION_SCOPE_MISMATCH', 'Operation, environment, or activation scope is not allowed.');
    }

    let sourceFingerprint: string;
    try {
      sourceFingerprint = createDocumentationSourceScopeFingerprint(request.documentationRequest.authorizedSources);
    } catch {
      return this.#blocked(request, workflow, task, 'SOURCE_SCOPE_INVALID', 'Authorized source scope is invalid.');
    }
    if (sourceFingerprint !== approval.sourceScopeFingerprint) {
      return this.#blocked(request, workflow, task, 'SOURCE_SCOPE_CHANGED', 'Authorized source scope changed after confirmation.', sourceFingerprint);
    }

    const documentationRequest = request.documentationRequest;
    if (
      documentationRequest.workflowId !== workflow.workflowId ||
      documentationRequest.taskId !== task.taskId ||
      documentationRequest.executionContext.intentRef !== workflow.intentRef ||
      documentationRequest.taskObjective !== handoff.objective
    ) {
      return this.#blocked(request, workflow, task, 'HANDOFF_REFERENCE_MISMATCH', 'Documentation request does not match Workflow, Task, or Execution Context.');
    }
    if (
      !documentationRequest.permissionGrant.allowedOperations.includes('GENERATE_DRAFT') ||
      !isCanonicalIsoTimestamp(documentationRequest.permissionGrant.expiresAt) ||
      Date.parse(now) >= Date.parse(documentationRequest.permissionGrant.expiresAt)
    ) {
      return this.#blocked(request, workflow, task, 'PERMISSION_DENIED', 'Draft permission is missing, expired, or noncanonical.', sourceFingerprint);
    }
    if (!hasValidBudget(documentationRequest.budget)) {
      return this.#blocked(request, workflow, task, 'BUDGET_EXCEEDED', 'Budget is invalid or exceeded.', sourceFingerprint);
    }
    if (
      documentationRequest.authorizedSources.some((source) =>
        !documentationRequest.executionContext.allowedContextRefs.includes(source.sourceRef),
      )
    ) {
      return this.#blocked(request, workflow, task, 'SOURCE_SCOPE_INVALID', 'Source is outside the authorized Execution Context.', sourceFingerprint);
    }

    if (request.cancelled === true) {
      const cancelledWorkflow = this.#dependencies.workflowService.transition(workflow.workflowId, 'CANCELLED');
      const failure: ApprovedDocumentationExecutionFailure = {
        code: 'CANCELLED',
        stage: 'PREFLIGHT',
        reason: 'Execution was cancelled before Capability invocation.',
      };
      const event = this.#appendAudit(
        request,
        'DOCUMENTATION_EXECUTION_CANCELLED',
        'CANCELLED',
        failure,
        sourceFingerprint,
      );
      return cloneAndFreeze({
        decision: 'CANCELLED',
        workflow: cancelledWorkflow,
        task,
        auditEvents: [event],
        evidence: event.evidence,
        failure,
      });
    }

    return this.#blocked(
      request,
      workflow,
      task,
      'CAPABILITY_FAILED',
      'Approved execution branch is not implemented yet.',
      sourceFingerprint,
      'EXECUTION',
    );
  }

  #blocked(
    request: ApprovedDocumentationExecutionRequest,
    workflow: WorkflowInstance | undefined,
    task: Task | undefined,
    code: ApprovedDocumentationExecutionFailure['code'],
    reason: string,
    fingerprint = request.approval?.sourceScopeFingerprint ?? 'missing-source-fingerprint',
    stage: ApprovedDocumentationExecutionFailure['stage'] = 'PREFLIGHT',
  ): ApprovedDocumentationExecutionResult {
    const failure: ApprovedDocumentationExecutionFailure = { code, stage, reason };
    const event = this.#appendAudit(request, 'DOCUMENTATION_EXECUTION_BLOCKED', 'BLOCKED', failure, fingerprint);
    return cloneAndFreeze({
      decision: 'BLOCKED',
      ...(workflow === undefined ? {} : { workflow }),
      ...(task === undefined ? {} : { task }),
      auditEvents: [event],
      evidence: event.evidence,
      failure,
    });
  }

  #appendAudit(
    request: ApprovedDocumentationExecutionRequest,
    eventType: string,
    status: AuditEvent['status'],
    failure: ApprovedDocumentationExecutionFailure,
    fingerprint: string,
  ): AuditEvent {
    const evidence: Evidence = {
      evidenceId: `approved-documentation-evidence-${this.#nextAuditId}`,
      source: 'approved-documentation-execution',
      summary: failure.reason,
      confidence: failure.code === 'SOURCE_SCOPE_CHANGED' ? 'L3' : 'L2',
      timestamp: this.#now(),
      reference: request.approval?.approvalId ?? request.documentationRequest.taskId,
    };
    return this.#dependencies.auditService.append({
      auditId: `approved-documentation-audit-${this.#nextAuditId++}`,
      workflowId: request.documentationRequest.workflowId,
      taskId: request.documentationRequest.taskId,
      eventType,
      status,
      evidence: [evidence],
      timestamp: this.#now(),
      inputRefs: [
        request.classificationId,
        request.routingId,
        request.documentationRequest.workflowId,
        request.documentationRequest.taskId,
        request.approval?.approvalId ?? 'missing-approval',
        DOCUMENTATION_CAPABILITY_ID,
        fingerprint,
      ],
      budgetSnapshot: request.documentationRequest.budget,
      failureReason: failure.code,
      failureStage: failure.stage,
    });
  }
}
