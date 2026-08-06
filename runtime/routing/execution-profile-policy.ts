import type {
  EvidenceFreshnessResult,
  ExecutionProfile,
  ExecutionProfileDecision,
  ReasoningBudget,
  RoutingRequest,
  SuggestedModelCategory,
  ValidationObligation,
} from './execution-routing-contract.ts';

const REASONING_BY_COMPLEXITY: Readonly<Record<RoutingRequest['complexity'], ReasoningBudget>> = Object.freeze({
  L0: 'R0',
  L1: 'R1',
  L2: 'R2',
  L3: 'R3',
  L4: 'R4',
});

function modelCategory(request: RoutingRequest): SuggestedModelCategory {
  if (request.complexity === 'L0') return 'NONE';
  if (request.complexity === 'L1') return 'FAST';
  if (request.complexity === 'L2') return 'STANDARD';
  if (request.complexity === 'L3' && request.taskKind === 'ENGINEERING') return 'CODE';
  return 'HIGH_REASONING';
}

function minimumProfile(request: RoutingRequest): ExecutionProfile {
  if (request.complexity === 'L4'
    || request.riskLevel === 'CRITICAL'
    || request.reversibility === 'IRREVERSIBLE'
    || request.hasApplicableGate) {
    return 'STRICT';
  }
  if (request.complexity === 'L1'
    && request.riskLevel === 'LOW'
    && request.reversibility === 'REVERSIBLE') {
    return 'LIGHT';
  }
  return 'STANDARD';
}

function baseValidation(profile: ExecutionProfile): ValidationObligation {
  if (profile === 'LIGHT') return 'TARGETED';
  if (profile === 'STANDARD') return 'CHANGE_IMPACT_AND_TARGETED';
  return 'FULL_GATE';
}

function increaseValidation(obligation: ValidationObligation): ValidationObligation {
  if (obligation === 'TARGETED') return 'CHANGE_IMPACT_AND_TARGETED';
  if (obligation === 'CHANGE_IMPACT_AND_TARGETED') return 'FULL_GATE';
  return obligation;
}

export class ExecutionProfilePolicy {
  decide(
    request: RoutingRequest,
    evidenceFreshness: readonly EvidenceFreshnessResult[],
  ): ExecutionProfileDecision {
    const reasoningBudget = REASONING_BY_COMPLEXITY[request.complexity];
    if (request.complexity === 'L0') {
      return Object.freeze({
        decision: 'OUT_OF_SCOPE',
        reasoningBudget,
        modelCategory: 'NONE',
        validationObligation: 'NONE',
        escalationConditions: Object.freeze([]),
        limitations: Object.freeze(['L0 does not enter an AI CTO execution workflow.']),
      });
    }

    const hasNonCurrentEvidence = evidenceFreshness.some((item) => item.currentness !== 'CURRENT');
    const evidenceRequiresReview = request.requiresCurrentEvidence && hasNonCurrentEvidence;
    const profile = evidenceRequiresReview ? 'STRICT' : minimumProfile(request);
    let validationObligation = baseValidation(profile);
    if (!request.requiresCurrentEvidence && hasNonCurrentEvidence) {
      validationObligation = increaseValidation(validationObligation);
    }

    const strictControlRequired = profile === 'STRICT';
    const escalationConditions = Object.freeze([
      ...(strictControlRequired ? ['Existing Gate, approval, security, or rollback controls remain mandatory.'] : []),
      ...(hasNonCurrentEvidence ? ['Non-current evidence requires renewed validation before it can support execution.'] : []),
    ]);

    return Object.freeze({
      decision: evidenceRequiresReview || strictControlRequired ? 'ESCALATE_FOR_REVIEW' : 'ROUTE_RECOMMENDED',
      profile,
      reasoningBudget,
      modelCategory: modelCategory(request),
      validationObligation,
      escalationConditions,
      limitations: Object.freeze([
        'Model category is advisory; no model is selected or invoked.',
        'Execution profile does not replace permissions, approval, ADR, or project gates.',
      ]),
    });
  }
}
