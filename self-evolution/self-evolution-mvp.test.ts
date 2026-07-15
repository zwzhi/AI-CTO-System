import assert from 'node:assert/strict';
import test from 'node:test';

import type { OptimizationAnalysis, SelfEvolutionSnapshotInput, SelfObservation } from './self-evolution-contract.ts';
import { OptimizationProposalGenerator } from './optimization-proposal-generator.ts';
import { SelfEvolutionMvpService } from './self-evolution-mvp-service.ts';
import { SelfObservationService } from './self-observation-service.ts';
import { ValueComplexityAnalysisService } from './value-complexity-analysis-service.ts';

function createSnapshotInput(): SelfEvolutionSnapshotInput {
  return {
    runtimeSnapshot: {
      source: { sourceRef: 'runtime-snapshot', capturedAt: '2026-07-15T00:00:00.000Z' },
      taskCount: 2,
      totalDurationMs: 125,
      tokenUsed: 24,
      costUsed: 0.01,
    },
    auditSnapshot: {
      source: { sourceRef: 'audit-snapshot', capturedAt: '2026-07-15T00:00:01.000Z' },
      events: [
        {
          auditId: 'audit-1', workflowId: 'workflow-1', taskId: 'task-1', eventType: 'CAPABILITY_RUN',
          status: 'FAILURE', timestamp: '2026-07-15T00:00:02.000Z',
          evidence: [{ evidenceId: 'evidence-1', source: 'audit', summary: 'failed run', confidence: 'L2', timestamp: '2026-07-15T00:00:02.000Z' }],
        },
        {
          auditId: 'audit-2', workflowId: 'workflow-1', taskId: 'task-2', eventType: 'TASK_RUN',
          status: 'FAILED', timestamp: '2026-07-15T00:00:03.000Z',
          evidence: [{ evidenceId: 'evidence-2', source: 'audit', summary: 'failed task', confidence: 'L2', timestamp: '2026-07-15T00:00:03.000Z' }],
        },
      ],
    },
    evidenceSnapshot: {
      source: { sourceRef: 'evidence-snapshot', capturedAt: '2026-07-15T00:00:04.000Z' },
      evidence: [
        { evidenceId: 'evidence-1', source: 'audit', summary: 'failed run', confidence: 'L2', timestamp: '2026-07-15T00:00:02.000Z' },
        { evidenceId: 'evidence-2', source: 'audit', summary: 'failed task', confidence: 'L2', timestamp: '2026-07-15T00:00:03.000Z' },
      ],
    },
    capabilitySnapshot: {
      source: { sourceRef: 'capability-snapshot', capturedAt: '2026-07-15T00:00:05.000Z' },
      records: [{ capabilityId: 'capability-1', usageCount: 2, successfulInvocations: 0, failedInvocations: 2, maintenanceCostSignal: 'HIGH', evidenceRefs: ['evidence-1'] }],
    },
  };
}

function withBlankRuntimeSource(): SelfEvolutionSnapshotInput {
  const input = createSnapshotInput();
  return { ...input, runtimeSnapshot: { ...input.runtimeSnapshot, source: { ...input.runtimeSnapshot.source, sourceRef: ' ' } } };
}

function withoutAuditEvidence(): SelfEvolutionSnapshotInput {
  const input = createSnapshotInput();
  return { ...input, evidenceSnapshot: { ...input.evidenceSnapshot, evidence: input.evidenceSnapshot.evidence.slice(1) } };
}

function withPrototypeNamedEvidence(): SelfEvolutionSnapshotInput {
  const input = createSnapshotInput();
  const [firstAuditEvent, secondAuditEvent] = input.auditSnapshot.events;
  const [firstEvidence, secondEvidence] = input.evidenceSnapshot.evidence;
  const [capability] = input.capabilitySnapshot.records;
  return {
    ...input,
    auditSnapshot: {
      ...input.auditSnapshot,
      events: [{ ...firstAuditEvent, evidence: [{ ...firstAuditEvent.evidence[0], evidenceId: '__proto__' }] }, secondAuditEvent],
    },
    evidenceSnapshot: {
      ...input.evidenceSnapshot,
      evidence: [{ ...firstEvidence, evidenceId: '__proto__' }, secondEvidence],
    },
    capabilitySnapshot: {
      ...input.capabilitySnapshot,
      records: [{ ...capability, evidenceRefs: ['__proto__'] }],
    },
  };
}

function withRepeatedFailures(): SelfEvolutionSnapshotInput {
  const input = createSnapshotInput();
  const [firstEvent, secondEvent] = input.auditSnapshot.events;
  return {
    ...input,
    auditSnapshot: {
      ...input.auditSnapshot,
      events: [firstEvent, { ...secondEvent, eventType: firstEvent.eventType }],
    },
  };
}

function withUnusedCapability(): SelfEvolutionSnapshotInput {
  const input = createSnapshotInput();
  const [capability] = input.capabilitySnapshot.records;
  return {
    ...input,
    capabilitySnapshot: {
      ...input.capabilitySnapshot,
      records: [{ ...capability, usageCount: 0 }],
    },
  };
}

function withDuplicateCapabilityId(): SelfEvolutionSnapshotInput {
  const input = createSnapshotInput();
  const [capability] = input.capabilitySnapshot.records;
  return {
    ...input,
    capabilitySnapshot: {
      ...input.capabilitySnapshot,
      records: [capability!, { ...capability!, evidenceRefs: ['evidence-2'] }],
    },
  };
}

function withOneFailure(): SelfEvolutionSnapshotInput {
  const input = createSnapshotInput();
  return {
    ...input,
    auditSnapshot: {
      ...input.auditSnapshot,
      events: [input.auditSnapshot.events[0]!],
    },
  };
}

function withRepeatedFailureObservationUsingOneEvidenceId(): SelfObservation {
  const input = createSnapshotInput();
  const [firstEvent, secondEvent] = input.auditSnapshot.events;
  const repeatedFailuresUsingOneEvidence = {
    ...input,
    auditSnapshot: {
      ...input.auditSnapshot,
      events: [
        firstEvent,
        { ...secondEvent, eventType: firstEvent.eventType, evidence: firstEvent.evidence },
      ],
    },
  };
  const observation = new SelfObservationService().observe(repeatedFailuresUsingOneEvidence);
  const [failure] = observation.failuresByEventType;
  const evidenceId = firstEvent.evidence[0]!.evidenceId;

  return {
    ...observation,
    failuresByEventType: [{ ...failure!, evidenceRefs: [evidenceId, evidenceId] }],
  };
}

function runMvp(input: SelfEvolutionSnapshotInput) {
  const observation = new SelfObservationService().observe(input);
  const analyses = new ValueComplexityAnalysisService().analyze(observation);
  const proposals = new OptimizationProposalGenerator().generate(observation, analyses);
  return { analyses, proposals };
}

test('SE-01 observes only the four supplied snapshots and preserves their content', () => {
  const input = createSnapshotInput();
  const expected = structuredClone(input);
  const result = new SelfObservationService().observe(input);

  assert.equal(result.sourceRefs.length, 4);
  assert.equal(result.observedAuditEventCount, 2);
  assert.equal(result.evidenceById['evidence-1']?.source, 'audit');
  assert.deepEqual(input, expected);
});

test('SE-02 rejects an invalid source or an audit evidence reference missing from EvidenceSnapshot', () => {
  assert.throws(() => new SelfObservationService().observe(withBlankRuntimeSource()), /snapshot source/i);
  assert.throws(() => new SelfObservationService().observe(withoutAuditEvidence()), /evidence/i);
});

test('SE-03 preserves __proto__ evidence IDs and validates their audit references', () => {
  const result = new SelfObservationService().observe(withPrototypeNamedEvidence());

  assert.equal(Object.getPrototypeOf(result.evidenceById), null);
  assert.equal(result.evidenceById['__proto__']?.source, 'audit');
});

test('creates an L3, evidence-backed MODIFY proposal for two failures of one event type', () => {
  const result = runMvp(withRepeatedFailures());
  const analysis = result.analyses[0]!;
  const proposal = result.proposals[0]!;

  assert.equal(analysis.valueScore, 75);
  assert.equal(analysis.complexityScore, 60);
  assert.equal(analysis.riskLevel, 'MEDIUM');
  assert.equal(analysis.confidence, 'L3');
  assert.equal(proposal.actionType, 'MODIFY');
  assert.equal(proposal.executionAuthorization, 'NONE');
  assert.equal(proposal.confidence, 'L3');
  assert.deepEqual(proposal.evidenceRefs, ['evidence-1', 'evidence-2']);
});

test('creates only a DEPRECATE candidate for an unused capability with maintenance cost', () => {
  const result = runMvp(withUnusedCapability());
  const analysis = result.analyses.find((candidate) => candidate.actionType === 'DEPRECATE')!;
  const proposal = result.proposals[0]!;

  assert.equal(analysis.valueScore, 55);
  assert.equal(analysis.complexityScore, 70);
  assert.equal(analysis.riskLevel, 'MEDIUM');
  assert.equal(analysis.confidence, 'L2');
  assert.equal(proposal.actionType, 'DEPRECATE');
  assert.match(proposal.recommendation, /human/i);
  assert.notEqual(proposal.actionType, 'REMOVE');
});

test('leaves a single failure as L1 observation rather than a proposal', () => {
  const result = runMvp(withOneFailure());

  assert.equal(result.proposals.length, 0);
  assert.equal(result.analyses[0]!.confidence, 'L1');
});

test('keeps repeated failures with one duplicate Evidence ID at L1 without a proposal', () => {
  const observation = withRepeatedFailureObservationUsingOneEvidenceId();
  const analyses = new ValueComplexityAnalysisService().analyze(observation);
  const proposals = new OptimizationProposalGenerator().generate(observation, analyses);

  assert.equal(analyses[0]!.confidence, 'L1');
  assert.equal(proposals.length, 0);
});

test('SE-06 executes observation to analysis to proposal without external side effects', () => {
  const input = withRepeatedFailures();
  const expected = structuredClone(input);
  const result = new SelfEvolutionMvpService().evaluate(input);

  assert.equal(result.observation.observedAuditEventCount, 2);
  assert.equal(result.analyses.length, 1);
  assert.equal(result.proposals.length, 1);
  assert.equal(result.proposals[0]!.executionAuthorization, 'NONE');
  assert.deepEqual(input, expected);
});

test('SE-07 exposes no execution, persistence, repository, or activation operation', () => {
  const service = new SelfEvolutionMvpService() as unknown as Record<string, unknown>;

  assert.equal(typeof service.executeProposal, 'undefined');
  assert.equal(typeof service.persist, 'undefined');
  assert.equal(typeof service.activateCapability, 'undefined');
});

test('rejects a duplicate non-blank capability ID in the supplied snapshot', () => {
  assert.throws(() => new SelfObservationService().observe(withDuplicateCapabilityId()), /capability IDs must be distinct/i);
});

test('does not generate a proposal for a forged REMOVE L2 analysis with supplied evidence', () => {
  const observation = new SelfObservationService().observe(createSnapshotInput());
  const forgedRemoveAnalysis = {
    analysisId: 'analysis-remove-capability-1',
    actionType: 'REMOVE',
    problem: 'A forged removal proposal.',
    currentState: 'No action is permitted.',
    valueScore: 55,
    complexityScore: 70,
    riskLevel: 'MEDIUM',
    confidence: 'L2',
    evidenceRefs: ['evidence-1'],
    limitations: [],
  } as unknown as OptimizationAnalysis;

  const proposals = new OptimizationProposalGenerator().generate(observation, [forgedRemoveAnalysis]);

  assert.deepEqual(proposals, []);
});
