import type { AuditEvent, Evidence } from '../runtime/models/runtime-types.ts';
import { AuditService } from '../runtime/audit/audit-service.ts';
import { DeterministicMarkdownOptimizer } from './deterministic-markdown-optimizer.ts';
import { OptimizationEligibilityService } from './optimization-eligibility-service.ts';
import { OptimizationValidationService } from './optimization-validation-service.ts';
import type { MarkdownOptimizerPort, OptimizationExecutionRequest, OptimizationExecutionResult, OptimizationValidationPort, OptimizedDocument } from './optimization-execution-contract.ts';

export class OptimizationExecutionService {
  private readonly audit: AuditService;
  private readonly eligibility: OptimizationEligibilityService;
  private readonly optimizer: MarkdownOptimizerPort;
  private readonly validator: OptimizationValidationPort;

  constructor(
    audit: AuditService,
    eligibility: OptimizationEligibilityService = new OptimizationEligibilityService(),
    optimizer: MarkdownOptimizerPort = new DeterministicMarkdownOptimizer(),
    validator: OptimizationValidationPort = new OptimizationValidationService(),
  ) {
    this.audit = audit;
    this.eligibility = eligibility;
    this.optimizer = optimizer;
    this.validator = validator;
  }

  execute(request: OptimizationExecutionRequest): OptimizationExecutionResult {
    const eligibility = this.eligibility.check(request);
    if (!eligibility.allowed) return this.finish(request, 'BLOCKED', this.baselines(request), [], eligibility.evidence, eligibility.evidence, eligibility.reason);
    const candidates = request.documents.map((document) => this.optimizer.optimize(document, request.allowedActions));
    const validation = this.validator.validate(request, candidates);
    if (!validation.valid) return this.finish(request, 'ROLLED_BACK', this.baselines(request), [], validation.evidence, validation.evidence, validation.reason);
    return this.finish(request, 'COMPLETED', candidates, candidates.filter((document) => document.changed).map((document) => document.documentRef), validation.evidence, validation.evidence);
  }

  private baselines(request: OptimizationExecutionRequest): OptimizedDocument[] { return request.documents.map((document) => ({ documentRef: document.documentRef, content: document.baselineContent, changed: false })); }

  private finish(request: OptimizationExecutionRequest, status: OptimizationExecutionResult['status'], documents: readonly OptimizedDocument[], changedScope: readonly string[], evidence: readonly Evidence[], auditEvidence: readonly Evidence[], failureReason?: string): OptimizationExecutionResult {
    const auditStatus: AuditEvent['status'] = status === 'COMPLETED' ? 'SUCCESS' : status === 'BLOCKED' ? 'BLOCKED' : 'FAILURE';
    this.audit.append({ auditId: `optimization-${request.proposalRef}`, workflowId: request.workflowId, taskId: request.taskId, eventType: 'OPTIMIZATION_EXECUTION', status: auditStatus, evidence: auditEvidence, timestamp: request.timestamp, result: `${status}: ${request.proposalRef}`, inputRefs: [request.proposalRef, request.riskAssessmentRef, ...request.authorizedDocumentRefs], outputRef: changedScope.join(',') || 'no-change', failureReason });
    return { status, documents, changedScope, validationEvidence: evidence, auditEvidence, limitations: ['In-memory deterministic MVP only.', 'No execution authorization is written to Self Evolution proposals.'], failureReason };
  }
}
