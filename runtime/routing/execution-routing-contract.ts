import type { Evidence } from '../models/runtime-types.ts';

export type TaskComplexity = 'L0' | 'L1' | 'L2' | 'L3' | 'L4';
export type TaskKind = 'DOCUMENTATION' | 'ENGINEERING' | 'ARCHITECTURE';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type Reversibility = 'REVERSIBLE' | 'CONDITIONALLY_REVERSIBLE' | 'IRREVERSIBLE';
export type ExecutionProfile = 'LIGHT' | 'STANDARD' | 'STRICT';
export type ReasoningBudget = 'R0' | 'R1' | 'R2' | 'R3' | 'R4';
export type SuggestedModelCategory = 'NONE' | 'FAST' | 'STANDARD' | 'HIGH_REASONING' | 'CODE';
export type ValidationObligation = 'NONE' | 'TARGETED' | 'CHANGE_IMPACT_AND_TARGETED' | 'FULL_GATE';
export type RoutingDecision = 'OUT_OF_SCOPE' | 'ROUTE_RECOMMENDED' | 'ESCALATE_FOR_REVIEW' | 'INSUFFICIENT_EVIDENCE';
export type EvidenceCurrentness = 'CURRENT' | 'STALE' | 'NOT_CAPTURED';
export type FingerprintMethod = 'CONTENT_HASH' | 'GIT_SCOPE';

export interface EvidenceFingerprint {
  readonly method: FingerprintMethod;
  readonly value: string;
}

export interface EvidenceFreshnessInput {
  readonly evidenceRef: string;
  readonly scopeRefs: readonly string[];
  readonly fingerprint?: EvidenceFingerprint;
  readonly observedAt: string;
}

export interface EvidenceFreshnessObservation {
  readonly evidenceRef: string;
  readonly scopeRefs: readonly string[];
  readonly fingerprint?: EvidenceFingerprint;
}

export interface RoutingRequest {
  readonly routingId: string;
  readonly taskKind: TaskKind;
  readonly complexity: TaskComplexity;
  readonly riskLevel: RiskLevel;
  readonly reversibility: Reversibility;
  readonly hasApplicableGate: boolean;
  readonly requiresCurrentEvidence: boolean;
  readonly evidenceInputs: readonly EvidenceFreshnessInput[];
  readonly evidenceObservations: readonly EvidenceFreshnessObservation[];
}

export interface EvidenceFreshnessResult {
  readonly evidenceRef: string;
  readonly currentness: EvidenceCurrentness;
  readonly reason: string;
  readonly scopeRefs: readonly string[];
  readonly observedAt: string;
}

export interface ExecutionProfileDecision {
  readonly decision: RoutingDecision;
  readonly profile?: ExecutionProfile;
  readonly reasoningBudget: ReasoningBudget;
  readonly modelCategory: SuggestedModelCategory;
  readonly validationObligation: ValidationObligation;
  readonly escalationConditions: readonly string[];
  readonly limitations: readonly string[];
}

export interface RoutingRecommendation extends ExecutionProfileDecision {
  readonly routingId: string;
  readonly evidenceFreshness: readonly EvidenceFreshnessResult[];
  readonly evidence: readonly Evidence[];
}
