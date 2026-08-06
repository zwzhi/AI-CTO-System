import test from 'node:test';
import assert from 'node:assert/strict';

import { EvidenceFreshnessService } from '../routing/evidence-freshness-service.ts';
import type { EvidenceFreshnessInput } from '../routing/execution-routing-contract.ts';

const NOW = '2026-08-06T00:00:00.000Z';
const INPUT: EvidenceFreshnessInput = Object.freeze({
  evidenceRef: 'test-1',
  scopeRefs: Object.freeze(['runtime/a.ts']),
  fingerprint: Object.freeze({ method: 'CONTENT_HASH', value: 'abc' }),
  observedAt: NOW,
});

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
