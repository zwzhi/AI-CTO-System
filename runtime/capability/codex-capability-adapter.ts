import type { Evidence } from '../models/runtime-types.ts';
import type { PermissionBudgetGuard } from '../permission/permission-budget-guard.ts';
import type { CodexInvocationPort } from './codex-invocation-port.ts';
import type { CodexExecutionOutcome, CodexExecutionRequest, CodexFailureCategory } from './codex-execution-contract.ts';

export class CodexCapabilityAdapter {
  private readonly invocationPort: CodexInvocationPort;
  private readonly guard: PermissionBudgetGuard;
  private readonly now: () => string;

  constructor(
    invocationPort: CodexInvocationPort,
    guard: PermissionBudgetGuard,
    now: () => string = () => new Date().toISOString(),
  ) {
    this.invocationPort = invocationPort;
    this.guard = guard;
    this.now = now;
  }

  invoke(request: CodexExecutionRequest): CodexExecutionOutcome {
    const preflight = this.preflight(request);
    if (preflight !== undefined) return preflight;
    const outcome = this.invocationPort.invoke(request);
    if (outcome.changedFilesProposal.some((file) => file.state !== 'PROPOSED')) {
      return this.blocked(request, 'OUTPUT_INVALID', 'VALIDATION', 'changed file is not a proposal');
    }
    return outcome;
  }

  private preflight(request: CodexExecutionRequest): CodexExecutionOutcome | undefined {
    if (request.cancelled === true) return this.blocked(request, 'CANCELLED', 'PREFLIGHT', 'request cancelled');
    if (!request.permissionGrant.allowedOperations.includes(request.operation) || request.permissionGrant.expiresAt <= this.now()) return this.blocked(request, 'PERMISSION_DENIED', 'PREFLIGHT', 'operation permission is missing or expired');
    if (request.operation !== 'ANALYZE_CODE' && (request.approval.status !== 'CONFIRMED' || request.approval.taskId !== request.taskId || request.approval.operation !== request.operation || request.approval.expiresAt <= this.now())) return this.blocked(request, 'APPROVAL_REQUIRED', 'PREFLIGHT', 'matching confirmation is required');
    const decision = this.guard.evaluate({ budget: request.budget, controlMode: 'AUTO' });
    if (decision.kind === 'DENY') return this.blocked(request, decision.reasonCode === 'BUDGET_EXCEEDED' ? 'BUDGET_EXCEEDED' : 'CANCELLED', 'PREFLIGHT', decision.reasonCode);
    return undefined;
  }

  private blocked(request: CodexExecutionRequest, category: CodexFailureCategory, stage: 'PREFLIGHT' | 'VALIDATION', reason: string): CodexExecutionOutcome {
    const timestamp = this.now();
    const evidence: Evidence = { evidenceId: `codex-adapter-evidence-${request.taskId}`, source: 'codex-capability-adapter', summary: reason, confidence: 'L3', timestamp, reference: request.taskId };
    return { status: 'BLOCKED', result: { resultRef: `codex-adapter-result-${request.taskId}`, summary: reason, assumptions: [] }, evidence: [evidence], changedFilesProposal: [], confidence: 'L3', timestamp, usage: { tokenUsed: 0, toolUsed: 0, timeUsedMs: 0, costUsed: 0 }, failure: { category, stage, reason } };
  }
}
