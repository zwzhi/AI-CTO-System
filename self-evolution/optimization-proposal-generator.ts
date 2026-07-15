import type {
  Evidence,
  OptimizationAnalysis,
  OptimizationProposal,
  SelfObservation,
} from './self-evolution-contract.ts';

export class OptimizationProposalGenerator {
  generate(
    observation: SelfObservation,
    analyses: readonly OptimizationAnalysis[],
  ): readonly OptimizationProposal[] {
    return Object.freeze(analyses.flatMap((analysis) => {
      if ((analysis.confidence !== 'L2' && analysis.confidence !== 'L3') || !hasAllEvidence(analysis, observation)) {
        return [];
      }
      return [createProposal(analysis, observation)];
    }));
  }
}

function hasAllEvidence(analysis: OptimizationAnalysis, observation: SelfObservation): boolean {
  return analysis.evidenceRefs.length > 0
    && analysis.evidenceRefs.every((evidenceId) => Object.hasOwn(observation.evidenceById, evidenceId));
}

function createProposal(analysis: OptimizationAnalysis, observation: SelfObservation): OptimizationProposal {
  const evidence = Object.freeze(analysis.evidenceRefs.map((evidenceId) => observation.evidenceById[evidenceId]!));
  const humanReviewLimitation = 'Human review is required before any change.';
  const isModification = analysis.actionType === 'MODIFY';
  const targetId = isModification
    ? analysis.analysisId.slice('analysis-failure-'.length)
    : analysis.analysisId.slice('analysis-unused-'.length);

  return Object.freeze({
    proposalId: isModification ? `proposal-modify-${targetId}` : `proposal-deprecate-${targetId}`,
    actionType: analysis.actionType,
    problem: analysis.problem,
    currentState: analysis.currentState,
    recommendation: isModification
      ? `Human review should determine a targeted modification for ${targetId}.`
      : `Human review should determine whether to deprecate ${targetId}.`,
    expectedValue: isModification
      ? 'Reduce repeated failures for the observed event type.'
      : 'Reduce maintenance burden for an unused capability.',
    risk: 'Medium risk; no change is authorized by this proposal.',
    impact: isModification
      ? `Potentially affects handling of ${targetId}.`
      : `Potentially affects availability of ${targetId}.`,
    rollback: 'No rollback is needed because this proposal makes no change.',
    validationMethod: 'Human review of the cited evidence before any authorized change.',
    evidenceRefs: Object.freeze([...analysis.evidenceRefs]),
    evidence,
    confidence: analysis.confidence,
    limitations: Object.freeze([...analysis.limitations, humanReviewLimitation]),
    executionAuthorization: 'NONE',
  });
}
