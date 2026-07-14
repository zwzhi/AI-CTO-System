import test from 'node:test';
import assert from 'node:assert/strict';

import { TESTING_OPERATIONS } from '../capability/testing-execution-contract.ts';

test('TC-01 declares the sole read-only testing operation', () => {
  assert.deepEqual(TESTING_OPERATIONS, ['ANALYZE_TEST_CONTEXT']);
});
