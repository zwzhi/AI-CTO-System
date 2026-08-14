import test from 'node:test';
import assert from 'node:assert/strict';

import {
  ReviewResultError,
  validateAndFreezeReviewResult,
  type ReviewResult,
  type ReviewFinding,
  type ReviewIsolationLevel,
  type ReviewPacketInput,
} from '../review/review-contract.ts';
import { ReviewProfilePolicy } from '../review/review-profile-policy.ts';
import { ReviewPacketService } from '../review/review-packet-service.ts';

const NOW = '2026-08-14T00:00:00.000Z';

function validFinding(overrides: Partial<ReviewFinding> = {}): ReviewFinding {
  return {
    findingId: 'finding-001',
    severity: 'MAJOR',
    evidenceRef: 'evidence-review-001',
    location: 'runtime/review/review-contract.ts:1',
    description: 'Review finding description.',
    impact: 'The change could weaken a declared boundary.',
    introducedByChange: true,
    recommendedBoundary: 'Keep the validation at the integration boundary.',
    verificationMethod: 'Add a regression test for the blocked path.',
    ...overrides,
  };
}

function validReviewResult(): ReviewResult {
  return {
    schemaVersion: '1.0',
    reviewId: 'review-001',
    profileId: 'SECURITY_ACCESS',
    phase: 'POST_IMPLEMENTATION',
    round: 1,
    baselineCommit: 'abc123',
    packetSha256: 'sha256:' + 'a'.repeat(64),
    isolationLevel: 'LOGICAL_READONLY',
    reviewerIdentity: 'reviewer-security-001',
    findings: [validFinding()],
    unverifiedItems: ['Production deployment behavior was not exercised.'],
    status: 'BLOCKING_FINDINGS',
    generatedAt: NOW,
  };
}

function withFinding(result: ReviewResult, overrides: Partial<ReviewFinding>): ReviewResult {
  return { ...result, findings: [{ ...result.findings[0], ...overrides }] };
}

function withIsolation(result: ReviewResult, isolationLevel: ReviewIsolationLevel): ReviewResult {
  return { ...result, isolationLevel };
}

function withForbiddenField(result: ReviewResult, field: string): ReviewResult {
  return { ...result, [field]: 'forbidden' } as ReviewResult;
}

function validPacketInput(): ReviewPacketInput {
  return {
    boundary: 'AI-CTO Runtime review boundary',
    phase: 'POST_IMPLEMENTATION',
    profiles: ['SECURITY_ACCESS', 'TEST_DELIVERY'],
    baselineCommit: 'abc123',
    headCommit: 'def456',
    diffSha256: 'sha256:' + 'b'.repeat(64),
    changedFiles: ['src/z.ts', 'src/a.ts'],
    relatedFiles: ['docs/review.md', 'src/a.ts'],
    untrackedFiles: [],
    validations: ['npm test'],
    constraints: ['No writes during review.'],
  };
}

function withUntracked(input: ReviewPacketInput, untrackedFiles: readonly string[]): ReviewPacketInput {
  return { ...input, untrackedFiles };
}

function assertInvalid(callback: () => unknown): void {
  assert.throws(callback, error => error instanceof ReviewResultError && error.code === 'INVALID_REVIEW_RESULT');
}

test('RV-01 freezes a structured review result', () => {
  const result = validateAndFreezeReviewResult(validReviewResult());

  assert.equal(Object.isFrozen(result), true);
  assert.equal(Object.isFrozen(result.findings), true);
  assert.equal(result.findings[0]?.severity, 'MAJOR');
});

test('RV-02 rejects a finding without evidence location and impact', () => {
  assertInvalid(() => validateAndFreezeReviewResult(withFinding(validReviewResult(), {
    evidenceRef: '',
    location: '',
    impact: '',
  })));
});

test('RV-03 preserves logical-readonly as distinct from system-readonly', () => {
  const result = validateAndFreezeReviewResult(withIsolation(validReviewResult(), 'LOGICAL_READONLY'));

  assert.equal(result.isolationLevel, 'LOGICAL_READONLY');
  assert.notEqual(result.isolationLevel, 'SYSTEM_READONLY');
});

test('RV-04 rejects a Reviewer result that claims execution or approval', () => {
  assertInvalid(() => validateAndFreezeReviewResult(withForbiddenField(validReviewResult(), 'executionAuthorization')));
  assertInvalid(() => validateAndFreezeReviewResult(withForbiddenField(validReviewResult(), 'approval')));
});

test('RV-05 selects one profile for a low-risk local change', () => {
  const plan = new ReviewProfilePolicy().decide({
    complexity: 'L1',
    riskLevel: 'LOW',
    changedAreas: ['documentation'],
    evidenceCurrent: true,
  });

  assert.deepEqual(plan.profiles, ['TEST_DELIVERY']);
  assert.equal(plan.effortTier, 'ECONOMY');
});

test('RV-06 selects focused profiles for a data and async change', () => {
  const plan = new ReviewProfilePolicy().decide({
    complexity: 'L2',
    riskLevel: 'MEDIUM',
    changedAreas: ['database', 'async'],
    evidenceCurrent: true,
  });

  assert.deepEqual(plan.profiles, ['DATA_CONTRACT', 'STATE_CONCURRENCY', 'TEST_DELIVERY']);
  assert.equal(plan.effortTier, 'BALANCED');
});

test('RV-07 selects deep security and compatibility review for high risk', () => {
  const plan = new ReviewProfilePolicy().decide({
    complexity: 'L4',
    riskLevel: 'CRITICAL',
    changedAreas: ['permission', 'production'],
    evidenceCurrent: false,
  });

  assert.equal(plan.effortTier, 'DEEP');
  assert.equal(plan.profiles.includes('SECURITY_ACCESS'), true);
  assert.equal(plan.profiles.includes('COMPATIBILITY_REGRESSION'), true);
  assert.equal(plan.escalationConditions.length > 0, true);
  assert.equal(plan.evidenceRequired, true);
});

test('RV-08 never exceeds the configured reviewer budget', () => {
  const plan = new ReviewProfilePolicy({ maxProfiles: 3 }).decide({
    complexity: 'L4',
    riskLevel: 'CRITICAL',
    changedAreas: ['permission', 'database', 'production'],
    evidenceCurrent: false,
  });

  assert.equal(plan.profiles.length <= 3, true);
  assert.equal(plan.budget.maxProfiles, 3);
});

test('RV-09 creates a deterministic packet hash from baseline, diff and related files', () => {
  const packet = new ReviewPacketService().create(validPacketInput());

  assert.match(packet.packetSha256, /^sha256:[0-9a-f]{64}$/);
  assert.equal(packet.changedFiles.includes('src/a.ts'), true);
});

test('RV-10 orders file lists deterministically and does not include sensitive untracked files', () => {
  const packet = new ReviewPacketService().create(withUntracked(validPacketInput(), ['.env', 'src/z.ts', 'src/a.ts']));

  assert.deepEqual(packet.untrackedFiles, ['src/a.ts', 'src/z.ts']);
  assert.deepEqual(packet.excludedFiles, [{ path: '.env', reason: 'sensitive-path' }]);
});

test('RV-11 marks a packet stale when the bound diff fingerprint changes', () => {
  const service = new ReviewPacketService();
  const packet = service.create(validPacketInput());

  assert.equal(service.isCurrent(packet, { diffSha256: 'sha256:changed' }).status, 'STALE');
});
