import type {
  EvidenceCurrentness,
  EvidenceFingerprint,
  EvidenceFreshnessInput,
  EvidenceFreshnessObservation,
  EvidenceFreshnessResult,
} from './execution-routing-contract.ts';

function sameScope(left: readonly string[], right: readonly string[]): boolean {
  const sortedLeft = [...left].sort();
  const sortedRight = [...right].sort();
  return sortedLeft.length === sortedRight.length
    && sortedLeft.every((item, index) => item === sortedRight[index]);
}

function sameFingerprint(left: EvidenceFingerprint, right: EvidenceFingerprint): boolean {
  return left.method === right.method && left.value === right.value;
}

function freezeResult(
  input: EvidenceFreshnessInput,
  currentness: EvidenceCurrentness,
  reason: string,
): EvidenceFreshnessResult {
  return Object.freeze({
    evidenceRef: input.evidenceRef,
    currentness,
    reason,
    scopeRefs: Object.freeze([...input.scopeRefs]),
    observedAt: input.observedAt,
  });
}

export class EvidenceFreshnessService {
  evaluate(
    inputs: readonly EvidenceFreshnessInput[],
    observations: readonly EvidenceFreshnessObservation[],
  ): readonly EvidenceFreshnessResult[] {
    return Object.freeze(inputs.map((input) => {
      const observation = observations.find((item) => item.evidenceRef === input.evidenceRef);
      if (input.fingerprint === undefined || observation?.fingerprint === undefined) {
        return freezeResult(
          input,
          'NOT_CAPTURED',
          'Fingerprint is not captured for an authorised comparison.',
        );
      }
      if (!sameScope(input.scopeRefs, observation.scopeRefs)
        || !sameFingerprint(input.fingerprint, observation.fingerprint)) {
        return freezeResult(
          input,
          'STALE',
          'Relevant authorised scope or fingerprint changed.',
        );
      }
      return freezeResult(
        input,
        'CURRENT',
        'Relevant authorised scope and fingerprint match.',
      );
    }));
  }
}
