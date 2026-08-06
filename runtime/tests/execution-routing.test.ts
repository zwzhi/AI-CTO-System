import test from 'node:test';
import assert from 'node:assert/strict';

import { EvidenceFreshnessService } from '../routing/evidence-freshness-service.ts';
import { ExecutionProfilePolicy } from '../routing/execution-profile-policy.ts';
import type {
  EvidenceFreshnessInput,
  EvidenceFreshnessResult,
  RoutingRequest,
} from '../routing/execution-routing-contract.ts';

const NOW = '2026-08-06T00:00:00.000Z';
const INPUT: EvidenceFreshnessInput = Object.freeze({
  evidenceRef: 'test-1',
  scopeRefs: Object.freeze(['runtime/a.ts']),
  fingerprint: Object.freeze({ method: 'CONTENT_HASH', value: 'abc' }),
  observedAt: NOW,
});
const STALE_EVIDENCE: EvidenceFreshnessResult = Object.freeze({
  evidenceRef: 'test-1',
  currentness: 'STALE',
  reason: 'Relevant authorised scope or fingerprint changed.',
  scopeRefs: Object.freeze(['runtime/a.ts']),
  observedAt: NOW,
});

function request(overrides: Partial<RoutingRequest> = {}): RoutingRequest {
  return Object.freeze({
    routingId: 'route-1',
    taskKind: 'ENGINEERING',
    complexity: 'L2',
    riskLevel: 'LOW',
    reversibility: 'REVERSIBLE',
    hasApplicableGate: false,
    requiresCurrentEvidence: false,
    evidenceInputs: Object.freeze([INPUT]),
    evidenceObservations: Object.freeze([Object.freeze({
      evidenceRef: 'test-1',
      scopeRefs: Object.freeze(['runtime/a.ts']),
      fingerprint: Object.freeze({ method: 'CONTENT_HASH', value: 'abc' }),
    })]),
    ...overrides,
  });
}

test('ER-01 marks matching authorised scope and fingerprint CURRENT', () => {
  const result = new EvidenceFreshnessService().evaluate([INPUT], [{
    evidenceRef: 'test-1',
    scopeRefs: ['runtime/a.ts'],
    fingerprint: { method: 'CONTENT_HASH', value: 'abc' },
  }]);

  assert.equal(result[0]?.currentness, 'CURRENT');
});

test('ER-02 marks only a changed relevant scope STALE', () => {
  const result = new EvidenceFreshnessService().evaluate([INPUT], [{
    evidenceRef: 'test-1',
    scopeRefs: ['runtime/a.ts'],
    fingerprint: { method: 'CONTENT_HASH', value: 'changed' },
  }]);

  assert.equal(result[0]?.currentness, 'STALE');
});

test('ER-03 never infers CURRENT when input or observation has no fingerprint', () => {
  const result = new EvidenceFreshnessService().evaluate([{ ...INPUT, fingerprint: undefined }], []);

  assert.equal(result[0]?.currentness, 'NOT_CAPTURED');
});

test('ER-04 maps L1 low-risk reversible documentation to LIGHT and R1', () => {
  const decision = new ExecutionProfilePolicy().decide(request({
    taskKind: 'DOCUMENTATION',
    complexity: 'L1',
    riskLevel: 'LOW',
    reversibility: 'REVERSIBLE',
  }), []);

  assert.equal(decision.decision, 'ROUTE_RECOMMENDED');
  assert.equal(decision.profile, 'LIGHT');
  assert.equal(decision.reasoningBudget, 'R1');
  assert.equal(decision.modelCategory, 'FAST');
  assert.equal(decision.validationObligation, 'TARGETED');
});

test('ER-05 escalates a simple irreversible task to STRICT without raising R1', () => {
  const decision = new ExecutionProfilePolicy().decide(request({
    complexity: 'L1',
    riskLevel: 'HIGH',
    reversibility: 'IRREVERSIBLE',
  }), []);

  assert.equal(decision.profile, 'STRICT');
  assert.equal(decision.reasoningBudget, 'R1');
  assert.equal(decision.validationObligation, 'FULL_GATE');
});

test('ER-06 keeps stale evidence non-executable and requests review when current evidence is required', () => {
  const decision = new ExecutionProfilePolicy().decide(
    request({ requiresCurrentEvidence: true }),
    [STALE_EVIDENCE],
  );

  assert.equal(decision.decision, 'ESCALATE_FOR_REVIEW');
  assert.equal(decision.profile, 'STRICT');
  assert.equal(decision.validationObligation, 'FULL_GATE');
});
