import test from 'node:test';
import assert from 'node:assert/strict';

import {
  HandoffError,
  type ControlledRuntimeHandoffRequest,
} from '../integration/intent-runtime-handoff-contract.ts';
import { validateAndFreezeHandoffRequest } from '../integration/intent-runtime-handoff-validation.ts';

const NOW = '2026-08-06T00:00:00.000Z';

function validHandoffRequest(): ControlledRuntimeHandoffRequest {
  return {
    intentResult: {
      schemaVersion: '1.0',
      classificationId: 'intent-001',
      status: 'CLASSIFIED',
      intentType: 'FEATURE_REQUEST',
      confidence: 'L3',
      complexity: 'L1',
      taskKind: 'DOCUMENTATION',
      riskLevel: 'LOW',
      reversibility: 'REVERSIBLE',
      hasApplicableGate: false,
      requiresCurrentEvidence: false,
      suggestedWorkflow: 'ENGINEERING',
      requiredCapabilityRefs: ['documentation'],
      taskObjective: 'Create a traceable documentation update plan.',
      evidenceInputs: [{
        evidenceRef: 'evidence-input-001',
        scopeRefs: ['docs/guide.md'],
        fingerprint: { method: 'CONTENT_HASH', value: 'sha256:abc' },
        observedAt: NOW,
      }],
      evidenceObservations: [{
        evidenceRef: 'evidence-input-001',
        scopeRefs: ['docs/guide.md'],
        fingerprint: { method: 'CONTENT_HASH', value: 'sha256:abc' },
      }],
    },
    executionContext: {
      userRef: 'user-001',
      projectRef: 'project-001',
      intentRef: 'intent-001',
      constraintRefs: ['constraint-001'],
      allowedContextRefs: ['docs/guide.md'],
    },
    budget: {
      tokenLimit: 100,
      tokenUsed: 0,
      toolLimit: 0,
      toolUsed: 0,
      timeLimitMs: 1_000,
      timeUsedMs: 0,
      costLimit: 0,
      costUsed: 0,
    },
  };
}

function assertDeepFrozen(value: unknown): void {
  if (value === null || typeof value !== 'object') {
    return;
  }
  assert.equal(Object.isFrozen(value), true);
  for (const nested of Object.values(value)) {
    assertDeepFrozen(nested);
  }
}

test('IH-01 reconstructs and deeply freezes a valid handoff request without mutating caller input', () => {
  const input = validHandoffRequest();
  const baseline = structuredClone(input);

  const result = validateAndFreezeHandoffRequest(input);

  assert.deepEqual(input, baseline);
  assert.notEqual(result, input);
  assert.notEqual(result.intentResult, input.intentResult);
  assert.notEqual(result.executionContext, input.executionContext);
  assert.notEqual(result.budget, input.budget);
  assert.deepEqual(result, baseline);
  assertDeepFrozen(result);
  assert.equal(Object.isFrozen(input), false);
});

test('IH-02 rejects malformed handoff fields at the integration boundary', () => {
  const cases: readonly {
    readonly name: string;
    readonly mutate: (request: Record<string, any>) => void;
  }[] = [
    { name: 'schema version', mutate: request => { request.intentResult.schemaVersion = '2.0'; } },
    { name: 'classification identifier', mutate: request => { request.intentResult.classificationId = '../escape'; request.executionContext.intentRef = '../escape'; } },
    { name: 'blank objective', mutate: request => { request.intentResult.taskObjective = '   '; } },
    { name: 'overlong objective', mutate: request => { request.intentResult.taskObjective = 'x'.repeat(1_001); } },
    { name: 'duplicate capability references', mutate: request => { request.intentResult.requiredCapabilityRefs = ['documentation', 'documentation']; } },
    { name: 'duplicate evidence input references', mutate: request => { request.intentResult.evidenceInputs.push(structuredClone(request.intentResult.evidenceInputs[0])); } },
    { name: 'invalid timestamp', mutate: request => { request.intentResult.evidenceInputs[0].observedAt = '2026-02-30T00:00:00.000Z'; } },
    { name: 'blank fingerprint', mutate: request => { request.intentResult.evidenceInputs[0].fingerprint.value = ' '; } },
    { name: 'negative budget', mutate: request => { request.budget.tokenLimit = -1; } },
    { name: 'non-finite budget', mutate: request => { request.budget.timeLimitMs = Number.POSITIVE_INFINITY; } },
    { name: 'mismatched intent reference', mutate: request => { request.executionContext.intentRef = 'intent-other'; } },
  ];

  for (const entry of cases) {
    const request = validHandoffRequest() as unknown as Record<string, any>;
    entry.mutate(request);

    assert.throws(
      () => validateAndFreezeHandoffRequest(request as unknown as ControlledRuntimeHandoffRequest),
      error => error instanceof HandoffError && error.code === 'INVALID_HANDOFF_REQUEST',
      entry.name,
    );
  }
});
