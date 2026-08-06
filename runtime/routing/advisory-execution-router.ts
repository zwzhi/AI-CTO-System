import type { Evidence } from '../models/runtime-types.ts';
import { EvidenceFreshnessService } from './evidence-freshness-service.ts';
import { ExecutionProfilePolicy } from './execution-profile-policy.ts';
import type {
  EvidenceFingerprint,
  EvidenceFreshnessInput,
  EvidenceFreshnessObservation,
  ExecutionProfileDecision,
  RoutingRecommendation,
  RoutingRequest,
} from './execution-routing-contract.ts';

function freezeFingerprint(fingerprint: EvidenceFingerprint | undefined): EvidenceFingerprint | undefined {
  return fingerprint === undefined ? undefined : Object.freeze({ ...fingerprint });
}

function freezeEvidenceInput(input: EvidenceFreshnessInput): EvidenceFreshnessInput {
  return Object.freeze({
    ...input,
    scopeRefs: Object.freeze([...input.scopeRefs]),
    fingerprint: freezeFingerprint(input.fingerprint),
  });
}

function freezeObservation(observation: EvidenceFreshnessObservation): EvidenceFreshnessObservation {
  return Object.freeze({
    ...observation,
    scopeRefs: Object.freeze([...observation.scopeRefs]),
    fingerprint: freezeFingerprint(observation.fingerprint),
  });
}

function freezeRequest(request: RoutingRequest): RoutingRequest {
  return Object.freeze({
    ...request,
    evidenceInputs: Object.freeze(request.evidenceInputs.map(freezeEvidenceInput)),
    evidenceObservations: Object.freeze(request.evidenceObservations.map(freezeObservation)),
  });
}

function routingEvidence(
  routingId: string,
  decision: ExecutionProfileDecision,
  timestamp: string,
): Evidence {
  const profile = decision.profile ?? 'NONE';
  return Object.freeze({
    evidenceId: `routing-evidence-${routingId}`,
    source: 'execution-routing',
    summary: `Decision ${decision.decision}; profile ${profile}; reasoning ${decision.reasoningBudget}; model category ${decision.modelCategory}.`,
    confidence: 'L2',
    timestamp,
    reference: routingId,
  });
}

export class AdvisoryExecutionRouter {
  readonly #freshness = new EvidenceFreshnessService();
  readonly #policy = new ExecutionProfilePolicy();
  readonly #now: () => string;

  constructor(now: () => string = () => new Date().toISOString()) {
    this.#now = now;
  }

  route(request: RoutingRequest): RoutingRecommendation {
    const snapshot = freezeRequest(request);
    const evidenceFreshness = this.#freshness.evaluate(
      snapshot.evidenceInputs,
      snapshot.evidenceObservations,
    );
    const decision = this.#policy.decide(snapshot, evidenceFreshness);
    return Object.freeze({
      routingId: snapshot.routingId,
      ...decision,
      escalationConditions: Object.freeze([...decision.escalationConditions]),
      evidenceFreshness,
      evidence: Object.freeze([routingEvidence(snapshot.routingId, decision, this.#now())]),
      limitations: Object.freeze([
        ...decision.limitations,
        'Recommendation only; no execution authorisation is created.',
      ]),
    });
  }
}
