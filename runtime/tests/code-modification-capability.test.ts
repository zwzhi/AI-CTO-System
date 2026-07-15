import test from 'node:test';
import assert from 'node:assert/strict';

import { CODE_MODIFICATION_OPERATIONS } from '../capability/code-modification-execution-contract.ts';

test('CM-01 exposes only the proposal operation', () => {
  assert.deepEqual(CODE_MODIFICATION_OPERATIONS, ['PROPOSE_CHANGE']);
});
