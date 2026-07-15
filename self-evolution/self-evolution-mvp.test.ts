import assert from 'node:assert/strict';
import test from 'node:test';

import type { SelfEvolutionSnapshotInput } from './self-evolution-contract.ts';
import { SelfObservationService } from './self-observation-service.ts';

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
