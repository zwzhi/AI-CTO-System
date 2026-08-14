import test from 'node:test';
import assert from 'node:assert/strict';

import {
  validateAndFreezeTaskExecutionEnvelope,
  type TaskExecutionEnvelope,
} from '../task/task-execution-envelope-contract.ts';
import { TaskExecutionEnvelopeService } from '../task/task-execution-envelope-service.ts';
import type { RoutingRecommendation } from '../routing/execution-routing-contract.ts';

function validEnvelope(): TaskExecutionEnvelope {
  return {
    schemaVersion: '1.0',
    envelopeId: 'envelope-1',
    taskRef: 'task-1',
    title: 'Prepare a bounded implementation plan',
    project: {
      name: 'sample-project',
      repoPath: 'D:/work/sample-project',
      branch: 'feature/sample',
      baselineCommit: 'abc1234',
    },
    execution: {
      mode: 'analysis',
      profile: 'LIGHT',
      phase: 'IDENTIFY',
      riskLevel: 'LOW',
      complexity: 'L1',
    },
    authorization: {
      modifyFiles: false,
      createCommit: false,
      push: false,
      deploy: false,
      restart: false,
      databaseWrite: false,
      cacheOrMqWrite: false,
    },
    scope: {
      goals: ['clarify the bounded task'],
      nonGoals: ['execute the task'],
      allowedPaths: ['docs'],
      forbiddenPaths: ['secrets'],
    },
    gates: {
      required: [],
      completed: [],
    },
    stopConditions: ['stop when required evidence is unavailable'],
    rollbackConditions: ['restore the prior state if a bounded write fails'],
    acceptanceCriteria: ['return a traceable plan'],
    evidence: {
      repoFingerprint: { method: 'CONTENT_HASH', value: 'sha256:baseline' },
      validations: ['intent scope reviewed'],
      reviews: [],
      staleItems: [],
    },
    nextAction: 'request human confirmation',
  };
}

function mutate(
  input: TaskExecutionEnvelope,
  change: (copy: Record<string, any>) => void,
): TaskExecutionEnvelope {
  const copy = structuredClone(input) as Record<string, any>;
  change(copy);
  return copy as TaskExecutionEnvelope;
}

function routingFor(profile: 'LIGHT' | 'STANDARD' | 'STRICT'): RoutingRecommendation {
  return {
    routingId: 'routing-1',
    decision: 'ROUTE_RECOMMENDED',
    profile,
    reasoningBudget: profile === 'LIGHT' ? 'R1' : profile === 'STANDARD' ? 'R2' : 'R4',
    modelCategory: 'NONE',
    validationObligation: profile === 'LIGHT' ? 'TARGETED' : profile === 'STANDARD' ? 'CHANGE_IMPACT_AND_TARGETED' : 'FULL_GATE',
    escalationConditions: [],
    limitations: ['recommendation only'],
    evidenceFreshness: [],
    evidence: [],
  };
}

test('TE-01 accepts a complete immutable envelope', () => {
  const envelope = validateAndFreezeTaskExecutionEnvelope(validEnvelope());

  assert.equal(envelope.schemaVersion, '1.0');
  assert.equal(Object.isFrozen(envelope), true);
  assert.equal(Object.isFrozen(envelope.project), true);
  assert.equal(Object.isFrozen(envelope.scope.goals), true);
});

test('TE-02 rejects a blank goal, missing project baseline, or empty acceptance criteria', () => {
  const cases = [
    mutate(validEnvelope(), copy => { copy.scope.goals = ['']; }),
    mutate(validEnvelope(), copy => { copy.project.baselineCommit = ''; }),
    mutate(validEnvelope(), copy => { copy.acceptanceCriteria = []; }),
  ];

  for (const input of cases) {
    assert.throws(() => validateAndFreezeTaskExecutionEnvelope(input), {
      code: 'INVALID_TASK_ENVELOPE',
    });
  }
});

test('TE-03 rejects authorization that exceeds the declared mode', () => {
  const input = mutate(validEnvelope(), copy => {
    copy.authorization.modifyFiles = true;
  });

  assert.throws(() => validateAndFreezeTaskExecutionEnvelope(input), {
    code: 'INVALID_TASK_ENVELOPE',
  });
});

test('TE-04 rejects forbidden paths overlapping allowed paths', () => {
  const input = mutate(validEnvelope(), copy => {
    copy.scope.allowedPaths = ['src'];
    copy.scope.forbiddenPaths = ['src/private'];
  });

  assert.throws(() => validateAndFreezeTaskExecutionEnvelope(input), {
    code: 'INVALID_TASK_ENVELOPE',
  });
});

test('TE-05 preserves caller input and freezes nested arrays', () => {
  const input = validEnvelope();
  const envelope = validateAndFreezeTaskExecutionEnvelope(input);

  assert.notEqual(envelope, input);
  assert.equal(Object.isFrozen(envelope.scope.goals), true);
  assert.deepEqual(input, validEnvelope());
});

test('TE-06 rejects an L2 envelope without current baseline evidence', () => {
  const input = mutate(validEnvelope(), copy => {
    copy.execution.complexity = 'L2';
    copy.execution.profile = 'STANDARD';
    copy.evidence.repoFingerprint = undefined;
  });
  const result = new TaskExecutionEnvelopeService().validate(input, routingFor('STANDARD'));

  assert.equal(result.status, 'BLOCKED');
  assert.equal(result.reasonCode, 'EVIDENCE_REQUIRED');
});

test('TE-07 rejects a profile below the routing minimum', () => {
  const input = mutate(validEnvelope(), copy => {
    copy.execution.complexity = 'L3';
    copy.execution.profile = 'LIGHT';
  });
  const result = new TaskExecutionEnvelopeService().validate(input, routingFor('STANDARD'));

  assert.equal(result.status, 'BLOCKED');
  assert.equal(result.reasonCode, 'PROFILE_BELOW_MINIMUM');
});

test('TE-08 accepts a matching profile, baseline and authorization', () => {
  const input = mutate(validEnvelope(), copy => {
    copy.execution.complexity = 'L2';
    copy.execution.profile = 'STANDARD';
  });
  const result = new TaskExecutionEnvelopeService().validate(input, routingFor('STANDARD'));

  assert.equal(result.status, 'VALID');
  assert.ok(result.evidence.length > 0);
});

test('TE-09 never returns execution authorization', () => {
  const result = new TaskExecutionEnvelopeService().validate(validEnvelope(), routingFor('LIGHT'));

  assert.equal('executionAuthorization' in result, false);
});
