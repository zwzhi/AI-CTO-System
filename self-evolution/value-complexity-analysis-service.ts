import type {
  CapabilitySignal,
  FailureObservation,
  OptimizationAnalysis,
  SelfObservation,
} from './self-evolution-contract.ts';

export class ValueComplexityAnalysisService {
  analyze(observation: SelfObservation): readonly OptimizationAnalysis[] {
    return Object.freeze([
      ...observation.failuresByEventType.map(analyzeFailure),
      ...observation.capabilitySignals.flatMap(analyzeUnusedCapability),
    ]);
  }
}

function analyzeFailure(failure: FailureObservation): OptimizationAnalysis {
  const evidenceRefs = Object.freeze([...new Set(failure.evidenceRefs)]);
  const isEvidenceBackedRepeatedFailure = failure.count >= 2 && evidenceRefs.length >= 2;

  return Object.freeze({
    analysisId: `analysis-failure-${failure.eventType}`,
    actionType: 'MODIFY',
    problem: `Repeated failures for event type ${failure.eventType}.`,
    currentState: `${failure.count} failure event(s) observed for ${failure.eventType}.`,
    valueScore: isEvidenceBackedRepeatedFailure ? 75 : 0,
    complexityScore: isEvidenceBackedRepeatedFailure ? 60 : 0,
    riskLevel: isEvidenceBackedRepeatedFailure ? 'MEDIUM' : 'LOW',
    confidence: isEvidenceBackedRepeatedFailure ? 'L3' : 'L1',
    evidenceRefs,
    limitations: Object.freeze(isEvidenceBackedRepeatedFailure
      ? ['Analysis is limited to the supplied failure observation.']
      : ['Insufficient repeated, distinct evidence for a proposal.']),
  });
}

function analyzeUnusedCapability(signal: CapabilitySignal): readonly OptimizationAnalysis[] {
  const isUnusedWithMaintenanceCost = signal.usageCount === 0
    && (signal.maintenanceCostSignal === 'MEDIUM' || signal.maintenanceCostSignal === 'HIGH')
    && signal.evidenceRefs.length >= 1;

  if (!isUnusedWithMaintenanceCost) return [];

  return [Object.freeze({
    analysisId: `analysis-unused-${signal.capabilityId}`,
    actionType: 'DEPRECATE',
    problem: `Unused capability ${signal.capabilityId} has a maintenance cost signal.`,
    currentState: `Capability ${signal.capabilityId} has zero usage and ${signal.maintenanceCostSignal} maintenance cost.`,
    valueScore: 55,
    complexityScore: 70,
    riskLevel: 'MEDIUM',
    confidence: 'L2',
    evidenceRefs: Object.freeze([...signal.evidenceRefs]),
    limitations: Object.freeze(['Analysis is limited to the supplied capability signal.']),
  })];
}
