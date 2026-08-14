import type { ExecutionProfile, RiskLevel, TaskComplexity } from '../routing/execution-routing-contract.ts';
import type {
  ReviewEffortTier,
  ReviewPhase,
  ReviewPlan,
  ReviewProfileId,
} from './review-contract.ts';

export interface ReviewProfilePolicyInput {
  readonly complexity: TaskComplexity;
  readonly riskLevel: RiskLevel;
  readonly changedAreas: readonly string[];
  readonly evidenceCurrent: boolean;
  readonly phase?: ReviewPhase;
  readonly executionProfile?: ExecutionProfile;
}

export interface ReviewProfilePolicyOptions {
  readonly maxProfiles?: number;
  readonly maxRounds?: number;
  readonly maxTotalReviewers?: number;
}

const AREA_PROFILE_RULES: readonly {
  readonly profile: ReviewProfileId;
  readonly keywords: readonly string[];
}[] = [
  { profile: 'SECURITY_ACCESS', keywords: ['security', 'permission', 'auth', 'access', 'secret', 'privacy'] },
  { profile: 'DATA_CONTRACT', keywords: ['database', 'data', 'schema', 'migration', 'storage', 'api-contract'] },
  { profile: 'STATE_CONCURRENCY', keywords: ['async', 'concurrency', 'state', 'queue', 'transaction', 'lock', 'event'] },
  { profile: 'PERFORMANCE_RESOURCES', keywords: ['performance', 'resource', 'latency', 'capacity', 'cache', 'memory'] },
  { profile: 'COMPATIBILITY_REGRESSION', keywords: ['compatibility', 'regression', 'api', 'dependency', 'production', 'release'] },
  { profile: 'FUNCTIONAL_BUSINESS', keywords: ['business', 'functional', 'product', 'requirement', 'domain'] },
  { profile: 'TEST_DELIVERY', keywords: ['test', 'testing', 'documentation', 'docs', 'local'] },
];

function positiveInteger(value: number | undefined, fallback: number, field: string): number {
  const candidate = value ?? fallback;
  if (!Number.isInteger(candidate) || candidate < 1) {
    throw new RangeError(`${field} must be a positive integer`);
  }
  return candidate;
}

function effortTier(complexity: TaskComplexity, riskLevel: RiskLevel): ReviewEffortTier {
  if (complexity === 'L4' || riskLevel === 'HIGH' || riskLevel === 'CRITICAL') {
    return 'DEEP';
  }
  if (complexity === 'L2' || complexity === 'L3' || riskLevel === 'MEDIUM') {
    return 'BALANCED';
  }
  return 'ECONOMY';
}

function addUnique(profiles: ReviewProfileId[], profile: ReviewProfileId): void {
  if (!profiles.includes(profile)) {
    profiles.push(profile);
  }
}

export class ReviewProfilePolicy {
  readonly #maxProfiles: number;
  readonly #maxRounds: number;
  readonly #maxTotalReviewers: number;

  constructor(options: ReviewProfilePolicyOptions = {}) {
    this.#maxProfiles = positiveInteger(options.maxProfiles, 4, 'maxProfiles');
    this.#maxRounds = positiveInteger(options.maxRounds, 2, 'maxRounds');
    this.#maxTotalReviewers = positiveInteger(options.maxTotalReviewers, 6, 'maxTotalReviewers');
  }

  decide(input: ReviewProfilePolicyInput): ReviewPlan {
    if (!Array.isArray(input.changedAreas) || typeof input.evidenceCurrent !== 'boolean') {
      throw new TypeError('review profile policy input is invalid');
    }

    const areas = input.changedAreas.map(area => area.trim().toLowerCase()).filter(Boolean);
    const profiles: ReviewProfileId[] = [];
    for (const rule of AREA_PROFILE_RULES) {
      if (areas.some(area => rule.keywords.some(keyword => area === keyword || area.includes(keyword)))) {
        addUnique(profiles, rule.profile);
      }
    }

    if (profiles.length === 0) {
      addUnique(profiles, input.riskLevel === 'HIGH' || input.riskLevel === 'CRITICAL'
        ? 'SECURITY_ACCESS'
        : 'FUNCTIONAL_BUSINESS');
    }
    addUnique(profiles, 'TEST_DELIVERY');

    const tier = effortTier(input.complexity, input.riskLevel);
    if (tier === 'DEEP') {
      addUnique(profiles, 'COMPATIBILITY_REGRESSION');
      addUnique(profiles, 'SECURITY_ACCESS');
    }

    const uncappedCount = profiles.length;
    const selectedProfiles = profiles.slice(0, this.#maxProfiles);
    const escalationConditions: string[] = [];
    const rationale: string[] = [
      `Selected profiles from changed areas: ${areas.length === 0 ? 'none declared' : areas.join(', ')}.`,
      `Risk ${input.riskLevel} and complexity ${input.complexity} require ${tier} review effort.`,
    ];
    if (!input.evidenceCurrent) {
      escalationConditions.push('Current baseline and change Evidence is required before review can be considered complete.');
    }
    if (uncappedCount > selectedProfiles.length) {
      escalationConditions.push(`Profile budget capped selection at ${this.#maxProfiles}; omitted profiles remain unreviewed.`);
    }
    if (tier === 'DEEP') {
      escalationConditions.push('High-risk review requires explicit human disposition of blocking findings.');
    }

    return Object.freeze({
      schemaVersion: '1.0',
      phase: input.phase ?? 'POST_IMPLEMENTATION',
      profiles: Object.freeze(selectedProfiles),
      effortTier: tier,
      isolationLevel: 'UNKNOWN',
      budget: Object.freeze({
        maxProfiles: this.#maxProfiles,
        maxRounds: this.#maxRounds,
        maxTotalReviewers: this.#maxTotalReviewers,
      }),
      evidenceRequired: !input.evidenceCurrent,
      escalationConditions: Object.freeze(escalationConditions),
      rationale: Object.freeze(rationale),
    });
  }
}
