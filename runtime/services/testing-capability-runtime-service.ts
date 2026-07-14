import type { AuditService } from '../audit/audit-service.ts';
import type { TestingCapabilityAdapter } from '../capability/testing-capability-adapter.ts';
import type { TestingExecutionRequest } from '../capability/testing-execution-contract.ts';
import type { AuditEvent } from '../models/runtime-types.ts';

export interface TestingCapabilityRuntimeExecutionResult {
  readonly outcome: ReturnType<TestingCapabilityAdapter['invoke']>;
  readonly auditEvent: AuditEvent;
}

export class TestingCapabilityRuntimeService {
  private readonly adapter: TestingCapabilityAdapter;
  private readonly auditService: AuditService;
  private readonly now: () => string;
  private nextAuditId = 1;

  constructor(
    adapter: TestingCapabilityAdapter,
    auditService: AuditService,
    now: () => string = () => new Date().toISOString(),
  ) {
    this.adapter = adapter;
    this.auditService = auditService;
    this.now = now;
  }

  execute(request: TestingExecutionRequest): TestingCapabilityRuntimeExecutionResult {
    const outcome = this.adapter.invoke(request);
    const failure = outcome.failure;
    const auditEvent = this.auditService.append({
      auditId: `testing-capability-audit-${this.nextAuditId++}`,
      workflowId: request.workflowId,
      taskId: request.taskId,
      eventType: outcome.status === 'SUCCESS' ? 'TESTING_CAPABILITY_COMPLETED' : 'TESTING_CAPABILITY_REJECTED',
      status: outcome.status,
      evidence: outcome.evidence,
      timestamp: this.now(),
      result: outcome.result?.testAnalysisReport,
      inputRefs: [
        request.executionContext.intentRef,
        request.permissionGrant.grantId,
        ...request.authorizedTestContexts.map((context) => context.sourceRef),
      ],
      outputRef: outcome.result?.resultRef,
      budgetSnapshot: request.budget,
      ...(failure === undefined ? {} : {
        failureReason: failure.category,
        failureStage: failure.stage === 'INVOCATION' ? 'EXECUTION' as const : failure.stage,
      }),
    });
    return { outcome, auditEvent };
  }
}
