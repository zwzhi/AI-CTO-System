import test from 'node:test';
import assert from 'node:assert/strict';

import { RuntimeError } from '../models/runtime-error.ts';

test('RuntimeError preserves code, message, and safe details', () => {
  const error = new RuntimeError(
    'INVALID_TRANSITION',
    'cannot transition',
    { from: 'CREATED', to: 'COMPLETED' },
  );

  assert.equal(error.code, 'INVALID_TRANSITION');
  assert.equal(error.message, 'cannot transition');
  assert.deepEqual(error.details, { from: 'CREATED', to: 'COMPLETED' });
});
