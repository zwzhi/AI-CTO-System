import type { ExecutionProfile, RiskLevel, TaskComplexity } from '../routing/execution-routing-contract.ts';

export type ReviewProfileId =
  | 'FUNCTIONAL_BUSINESS'
  | 'COMPATIBILITY_REGRESSION'
  | 'SECURITY_ACCESS'
  | 'PERFORMANCE_RESOURCES'
  | 'DATA_CONTRACT'
  | 'STATE_CONCURRENCY'
  | 'TEST_DELIVERY';
export type ReviewPhase = 'PRE_IMPLEMENTATION' | 'POST_IMPLEMENTATION';
export type ReviewEffortTier = 'ECONOMY' | 'BALANCED' | 'DEEP';
export type ReviewIsolationLevel = 'SYSTEM_READONLY' | 'LOGICAL_READONLY' | 'SELF_REVIEW' | 'UNKNOWN';
export type ReviewSeverity = 'BLOCKER' | 'MAJOR' | 'MINOR' | 'NOTE';
export type ReviewStatus = 'PASS' | 'NON_BLOCKING_FINDINGS' | 'BLOCKING_FINDINGS' | 'INCOMPLETE';

export interface ReviewBudget {
  readonly maxProfiles: number;
  readonly maxRounds: number;
  readonly maxTotalReviewers: number;
}

export interface ReviewPlan {
  readonly schemaVersion: '1.0';
  readonly phase: ReviewPhase;
  readonly profiles: readonly ReviewProfileId[];
  readonly effortTier: ReviewEffortTier;
  readonly isolationLevel: ReviewIsolationLevel;
  readonly budget: ReviewBudget;
  readonly evidenceRequired: boolean;
  readonly escalationConditions: readonly string[];
  readonly rationale: readonly string[];
}

export interface ReviewFinding {
  readonly findingId: string;
  readonly severity: ReviewSeverity;
  readonly evidenceRef: string;
  readonly location: string;
  readonly description: string;
  readonly impact: string;
  readonly introducedByChange: boolean;
  readonly recommendedBoundary: string;
  readonly verificationMethod: string;
}

export interface ReviewResult {
  readonly schemaVersion: '1.0';
  readonly reviewId: string;
  readonly profileId: ReviewProfileId;
  readonly phase: ReviewPhase;
  readonly round: number;
  readonly baselineCommit: string;
  readonly packetSha256: string;
  readonly isolationLevel: ReviewIsolationLevel;
  readonly reviewerIdentity: string;
  readonly findings: readonly ReviewFinding[];
  readonly unverifiedItems: readonly string[];
  readonly status: ReviewStatus;
  readonly generatedAt: string;
}

export interface ReviewPacketInput {
  readonly boundary: string;
  readonly phase: ReviewPhase;
  readonly profiles: readonly ReviewProfileId[];
  readonly baselineCommit: string;
  readonly headCommit: string;
  readonly diffSha256: string;
  readonly changedFiles: readonly string[];
  readonly relatedFiles: readonly string[];
  readonly untrackedFiles?: readonly string[];
  readonly validations: readonly string[];
  readonly constraints: readonly string[];
}

export interface ReviewPacket {
  readonly schemaVersion: '1.0';
  readonly boundary: string;
  readonly phase: ReviewPhase;
  readonly profiles: readonly ReviewProfileId[];
  readonly baselineCommit: string;
  readonly headCommit: string;
  readonly diffSha256: string;
  readonly packetSha256: string;
  readonly changedFiles: readonly string[];
  readonly relatedFiles: readonly string[];
  readonly untrackedFiles: readonly string[];
  readonly excludedFiles: readonly { readonly path: string; readonly reason: string }[];
  readonly validations: readonly string[];
  readonly constraints: readonly string[];
}

export interface ReviewPacketObservation {
  readonly baselineCommit?: string;
  readonly headCommit?: string;
  readonly diffSha256?: string;
}

export type ReviewPacketFreshnessStatus = 'CURRENT' | 'STALE' | 'NOT_CAPTURED';

export interface ReviewPacketFreshnessResult {
  readonly status: ReviewPacketFreshnessStatus;
  readonly reason: string;
}

export class ReviewResultError extends Error {
  readonly code = 'INVALID_REVIEW_RESULT' as const;
  readonly details: Readonly<Record<string, unknown>>;

  constructor(message: string, details: Readonly<Record<string, unknown>> = {}) {
    super(message);
    this.name = 'ReviewResultError';
    this.details = Object.freeze({ ...details });
  }
}

const PROFILE_IDS = new Set<ReviewProfileId>([
  'FUNCTIONAL_BUSINESS',
  'COMPATIBILITY_REGRESSION',
  'SECURITY_ACCESS',
  'PERFORMANCE_RESOURCES',
  'DATA_CONTRACT',
  'STATE_CONCURRENCY',
  'TEST_DELIVERY',
]);
const PHASES = new Set<ReviewPhase>(['PRE_IMPLEMENTATION', 'POST_IMPLEMENTATION']);
const ISOLATION_LEVELS = new Set<ReviewIsolationLevel>([
  'SYSTEM_READONLY',
  'LOGICAL_READONLY',
  'SELF_REVIEW',
  'UNKNOWN',
]);
const SEVERITIES = new Set<ReviewSeverity>(['BLOCKER', 'MAJOR', 'MINOR', 'NOTE']);
const STATUSES = new Set<ReviewStatus>(['PASS', 'NON_BLOCKING_FINDINGS', 'BLOCKING_FINDINGS', 'INCOMPLETE']);
const FORBIDDEN_FIELDS = new Set([
  'approval',
  'executionAuthorization',
  'executionRecord',
  'canWrite',
  'canCommit',
  'canDeploy',
  'canRestart',
  'writeAuthorization',
]);
const PACKET_SHA_PATTERN = /^sha256:[0-9a-f]{64}$/;

function invalid(field: string, reason: string): never {
  throw new ReviewResultError(`review result is invalid: ${field}`, { field, reason });
}

function nonBlank(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    invalid(field, 'must be a non-blank string');
  }
  return value.trim();
}

function canonicalIso(value: unknown, field: string): string {
  const candidate = nonBlank(value, field);
  try {
    if (new Date(candidate).toISOString() !== candidate) {
      invalid(field, 'must be canonical ISO');
    }
  } catch {
    invalid(field, 'must be canonical ISO');
  }
  return candidate;
}

function vocabulary<T extends string>(value: unknown, allowed: ReadonlySet<T>, field: string): T {
  if (typeof value !== 'string' || !allowed.has(value as T)) {
    invalid(field, 'unsupported value');
  }
  return value as T;
}

function list(values: unknown, field: string): readonly string[] {
  if (!Array.isArray(values) || values.some(value => typeof value !== 'string' || value.trim().length === 0)) {
    invalid(field, 'must be an array of non-blank strings');
  }
  return Object.freeze(values.map(value => value.trim()));
}

function finding(input: ReviewFinding, index: number): ReviewFinding {
  const field = `findings[${index}]`;
  const severity = vocabulary(input?.severity, SEVERITIES, `${field}.severity`);
  if (typeof input?.introducedByChange !== 'boolean') {
    invalid(`${field}.introducedByChange`, 'must be boolean');
  }
  return Object.freeze({
    findingId: nonBlank(input?.findingId, `${field}.findingId`),
    severity,
    evidenceRef: nonBlank(input?.evidenceRef, `${field}.evidenceRef`),
    location: nonBlank(input?.location, `${field}.location`),
    description: nonBlank(input?.description, `${field}.description`),
    impact: nonBlank(input?.impact, `${field}.impact`),
    introducedByChange: input.introducedByChange,
    recommendedBoundary: nonBlank(input?.recommendedBoundary, `${field}.recommendedBoundary`),
    verificationMethod: nonBlank(input?.verificationMethod, `${field}.verificationMethod`),
  });
}

export function validateAndFreezeReviewResult(input: ReviewResult): ReviewResult {
  if (input === null || typeof input !== 'object') {
    throw new ReviewResultError('review result must be an object');
  }
  const keys = Object.keys(input as object);
  const forbidden = keys.find(key => FORBIDDEN_FIELDS.has(key));
  if (forbidden !== undefined) {
    invalid(forbidden, 'review result cannot carry execution or approval authority');
  }
  if (input.schemaVersion !== '1.0') {
    invalid('schemaVersion', 'unsupported schema version');
  }
  const profileId = vocabulary(input.profileId, PROFILE_IDS, 'profileId');
  const phase = vocabulary(input.phase, PHASES, 'phase');
  const isolationLevel = vocabulary(input.isolationLevel, ISOLATION_LEVELS, 'isolationLevel');
  const status = vocabulary(input.status, STATUSES, 'status');
  if (!Number.isInteger(input.round) || input.round < 1) {
    invalid('round', 'must be a positive integer');
  }
  const packetSha256 = nonBlank(input.packetSha256, 'packetSha256');
  if (!PACKET_SHA_PATTERN.test(packetSha256)) {
    invalid('packetSha256', 'must be a sha256 fingerprint');
  }
  if (!Array.isArray(input.findings)) {
    invalid('findings', 'must be an array');
  }

  return Object.freeze({
    schemaVersion: '1.0',
    reviewId: nonBlank(input.reviewId, 'reviewId'),
    profileId,
    phase,
    round: input.round,
    baselineCommit: nonBlank(input.baselineCommit, 'baselineCommit'),
    packetSha256,
    isolationLevel,
    reviewerIdentity: nonBlank(input.reviewerIdentity, 'reviewerIdentity'),
    findings: Object.freeze(input.findings.map(finding)),
    unverifiedItems: list(input.unverifiedItems, 'unverifiedItems'),
    status,
    generatedAt: canonicalIso(input.generatedAt, 'generatedAt'),
  });
}

export type { ExecutionProfile, RiskLevel, TaskComplexity };
