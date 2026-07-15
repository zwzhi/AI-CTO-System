import assert from 'node:assert/strict';
import test from 'node:test';
import { routeRealTarget } from './proposal-routing-service.ts';
import { bindConfirmation } from './real-target-confirmation-service.ts';

test('RT-01 routes one explicit non-authoritative markdown target to confirmation only', () => {
  const result = routeRealTarget({ proposalRef: 'op-1', riskAssessmentRef: 'risk-1', autonomyDecision: 'AUTO_EXECUTE', target: 'docs/scratch.md', action: 'NORMALIZE_FORMATTING' });
  assert.equal(result.state, 'WAITING_CONFIRMATION');
  assert.equal(result.target, 'docs/scratch.md');
});

test('RT-03 binds confirmation to one proposal, target and before hash', () => {
  const routed = routeRealTarget({ proposalRef: 'op-1', riskAssessmentRef: 'risk-1', autonomyDecision: 'AUTO_EXECUTE', target: 'docs/scratch.md', action: 'NORMALIZE_FORMATTING' });
  const confirmation = bindConfirmation(routed, 'before-hash');
  assert.equal(confirmation.proposalRef, 'op-1');
  assert.equal(confirmation.target, 'docs/scratch.md');
  assert.equal(confirmation.beforeHash, 'before-hash');
  assert.equal(confirmation.used, false);
});

test('RT-02 rejects authority paths, non-markdown targets, and missing references', () => {
  assert.throws(() => routeRealTarget({ proposalRef: 'op-1', riskAssessmentRef: 'risk-1', autonomyDecision: 'AUTO_EXECUTE', target: 'docs/adr/ADR-0020.md', action: 'NORMALIZE_FORMATTING' }), /forbidden/i);
  assert.throws(() => routeRealTarget({ proposalRef: 'op-1', riskAssessmentRef: 'risk-1', autonomyDecision: 'AUTO_EXECUTE', target: 'runtime/a.ts', action: 'NORMALIZE_FORMATTING' }), /markdown/i);
  assert.throws(() => routeRealTarget({ proposalRef: ' ', riskAssessmentRef: 'risk-1', autonomyDecision: 'AUTO_EXECUTE', target: 'docs/scratch.md', action: 'NORMALIZE_FORMATTING' }), /reference/i);
});
