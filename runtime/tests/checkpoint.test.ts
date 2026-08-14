import test from 'node:test';
import assert from 'node:assert/strict';

import {
  validateAndFreezeCheckpoint,
  type CheckpointEvidenceRef,
  type TaskCheckpoint,
} from '../checkpoint/checkpoint-contract.ts';
import { InMemoryCheckpointRepository } from '../checkpoint/in-memory-checkpoint-repository.ts';
import { CheckpointService } from '../checkpoint/checkpoint-service.ts';
import { ProjectMemoryProjectionService } from '../checkpoint/project-memory-projection.ts';

const NOW = '2026-08-14T00:00:00.000Z';

function validEvidence(overrides: Partial<CheckpointEvidenceRef> = {}): CheckpointEvidenceRef {
  return {
    evidenceId: 'evidence-001',
    source: 'runtime-tests',
    confidence: 'L3',
    reference: 'checkpoint-test-001',
    ...overrides,
  };
}

function validCheckpoint(overrides: Partial<TaskCheckpoint> = {}): TaskCheckpoint {
  return {
    schemaVersion: '1.0',
    checkpointId: 'cp-001',
    taskRef: 'task-1',
    projectRef: 'project-1',
    phase: 'VALIDATE',
    kind: 'VALIDATION',
    status: 'COMPLETED',
    createdAt: NOW,
    confirmedFacts: ['The focused validation passed.'],
    decisions: ['Keep the existing Runtime boundary.'],
    evidence: [validEvidence()],
    blockers: [],
    risks: ['Full production integration is not captured.'],
    nextAction: 'Review the validation evidence before the next phase.',
    ownerRef: 'ai-cto-system',
    ...overrides,
  };
}

const blankTask = (checkpoint: TaskCheckpoint): TaskCheckpoint => ({ ...checkpoint, taskRef: ' ' });
const blankPhase = (checkpoint: TaskCheckpoint): TaskCheckpoint => ({ ...checkpoint, phase: ' ' });
const emptyEvidence = (checkpoint: TaskCheckpoint): TaskCheckpoint => ({ ...checkpoint, evidence: [] });
const blankNextAction = (checkpoint: TaskCheckpoint): TaskCheckpoint => ({ ...checkpoint, nextAction: ' ' });

function withFact(checkpoint: TaskCheckpoint, fact: string): TaskCheckpoint {
  return { ...checkpoint, confirmedFacts: [fact] };
}

function withPredecessor(checkpoint: TaskCheckpoint, predecessorCheckpointId: string): TaskCheckpoint {
  return { ...checkpoint, predecessorCheckpointId };
}

function withFactEvidence(checkpoint: TaskCheckpoint, evidence: Partial<CheckpointEvidenceRef>): TaskCheckpoint {
  return { ...checkpoint, evidence: [{ ...checkpoint.evidence[0], ...evidence }] };
}

function checkpointService(): CheckpointService {
  return new CheckpointService(new InMemoryCheckpointRepository());
}

test('CP-01 accepts and freezes a confirmed task checkpoint', () => {
  const checkpoint = validateAndFreezeCheckpoint(validCheckpoint());

  assert.equal(checkpoint.kind, 'VALIDATION');
  assert.equal(Object.isFrozen(checkpoint), true);
  assert.equal(Object.isFrozen(checkpoint.confirmedFacts), true);
  assert.equal(Object.isFrozen(checkpoint.evidence), true);
});

test('CP-02 rejects a checkpoint without task, phase, status, evidence or next action', () => {
  for (const mutate of [blankTask, blankPhase, emptyEvidence, blankNextAction]) {
    assert.throws(
      () => validateAndFreezeCheckpoint(mutate(validCheckpoint())),
      error => error instanceof Error && (error as Error & { code?: string }).code === 'INVALID_CHECKPOINT',
    );
  }
});

test('CP-03 rejects a checkpoint that stores secret-like content', () => {
  assert.throws(
    () => validateAndFreezeCheckpoint(withFact(validCheckpoint(), 'api_key=secret')),
    error => error instanceof Error && (error as Error & { code?: string }).code === 'SENSITIVE_CHECKPOINT_CONTENT',
  );
});

test('CP-04 preserves append-only predecessor linkage', () => {
  const checkpoint = validateAndFreezeCheckpoint(withPredecessor(validCheckpoint(), 'cp-000'));

  assert.equal(checkpoint.predecessorCheckpointId, 'cp-000');
});

test('CP-05 appends checkpoints without replacing predecessors', () => {
  const service = checkpointService();
  service.append(validCheckpoint({ checkpointId: 'cp-001' }));
  service.append(validCheckpoint({ checkpointId: 'cp-002', predecessorCheckpointId: 'cp-001' }));

  assert.deepEqual(service.listByTaskRef('task-1').map(item => item.checkpointId), ['cp-001', 'cp-002']);
});

test('CP-06 rejects a duplicate checkpoint ID', () => {
  const service = checkpointService();
  service.append(validCheckpoint({ checkpointId: 'cp-001' }));

  assert.throws(
    () => service.append(validCheckpoint({ checkpointId: 'cp-001' })),
    error => error instanceof Error && (error as Error & { code?: string }).code === 'CHECKPOINT_ALREADY_EXISTS',
  );
});

test('CP-07 recovery returns latest checkpoint plus revalidation obligations', () => {
  const service = checkpointService();
  service.append(validCheckpoint({ checkpointId: 'cp-001', status: 'COMPLETED' }));
  const recovery = service.recover('task-1');

  assert.equal(recovery.latestCheckpoint?.checkpointId, 'cp-001');
  assert.equal(recovery.revalidationObligations.includes('recheck current Git and authorization state'), true);
});

test('CP-08 recovery never returns an execution authorization', () => {
  const recovery = checkpointService().recover('missing-task');

  assert.equal('executionAuthorization' in recovery, false);
});

test('CP-09 projects confirmed facts, evidence and next action without raw logs', () => {
  const projection = new ProjectMemoryProjectionService().project(validCheckpoint());

  assert.equal(projection.taskRef, 'task-1');
  assert.equal(projection.evidence.length, 1);
  assert.equal(projection.rawConversationIncluded, false);
  assert.equal(projection.suggestedSection, '当前状态');
});

test('CP-10 refuses a projection with unverified facts', () => {
  assert.throws(
    () => new ProjectMemoryProjectionService().project(
      withFactEvidence(validCheckpoint(), { confidence: 'UNVERIFIED' }),
    ),
    error => error instanceof Error
      && (error as Error & { code?: string }).code === 'PROJECTION_REQUIRES_CONFIRMED_EVIDENCE',
  );
});

test('CP-11 rejects a bare secret-like checkpoint value', () => {
  assert.throws(
    () => validateAndFreezeCheckpoint(withFact(validCheckpoint(), 'secret')),
    error => error instanceof Error && (error as Error & { code?: string }).code === 'SENSITIVE_CHECKPOINT_CONTENT',
  );
});
