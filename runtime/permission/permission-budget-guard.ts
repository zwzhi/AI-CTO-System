import type {
  BudgetSnapshot,
  ControlMode,
  GuardDecisionKind,
} from '../models/runtime-types.ts';

export interface GuardRequest {
  readonly budget: BudgetSnapshot;
  readonly controlMode: ControlMode;
  readonly cancelled?: boolean;
}

export type GuardDecision =
  | { readonly kind: Extract<GuardDecisionKind, 'ALLOW'> }
  | { readonly kind: Extract<GuardDecisionKind, 'CONFIRM_REQUIRED'>; readonly reasonCode: 'CONFIRMATION_REQUIRED' }
  | {
      readonly kind: Extract<GuardDecisionKind, 'DENY'>;
      readonly reasonCode: 'BUDGET_EXCEEDED' | 'OPERATION_CANCELLED' | 'GUARD_DENIED';
    };

function exceedsBudget(budget: BudgetSnapshot): boolean {
  return (
    budget.tokenUsed > budget.tokenLimit ||
    budget.toolUsed > budget.toolLimit ||
    budget.timeUsedMs > budget.timeLimitMs ||
    budget.costUsed > budget.costLimit
  );
}

export class PermissionBudgetGuard {
  evaluate(request: GuardRequest): GuardDecision {
    if (request.cancelled === true) {
      return { kind: 'DENY', reasonCode: 'OPERATION_CANCELLED' };
    }

    if (exceedsBudget(request.budget)) {
      return { kind: 'DENY', reasonCode: 'BUDGET_EXCEEDED' };
    }

    if (request.controlMode === 'BLOCK') {
      return { kind: 'DENY', reasonCode: 'GUARD_DENIED' };
    }

    if (request.controlMode === 'CONFIRM') {
      return { kind: 'CONFIRM_REQUIRED', reasonCode: 'CONFIRMATION_REQUIRED' };
    }

    return { kind: 'ALLOW' };
  }
}
