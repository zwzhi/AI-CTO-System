export type CheckpointKind =
  | 'ANALYSIS'
  | 'DECISION'
  | 'MODIFICATION'
  | 'VALIDATION'
  | 'REVIEW'
  | 'HANDOFF'
  | 'RECOVERY';
export type CheckpointStatus = 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED' | 'FAILED' | 'ROLLED_BACK';
export type CheckpointEvidenceConfidence =
  | 'L1'
  | 'L2'
  | 'L3'
  | 'L4'
  | 'UNVERIFIED'
  | 'UNKNOWN'
  | 'NOT_CAPTURED';

export interface CheckpointEvidenceRef {
  readonly evidenceId: string;
  readonly source: string;
  readonly confidence: CheckpointEvidenceConfidence;
  readonly reference?: string;
}

export interface TaskCheckpoint {
  readonly schemaVersion: '1.0';
  readonly checkpointId: string;
  readonly taskRef: string;
  readonly projectRef: string;
  readonly phase: string;
  readonly kind: CheckpointKind;
  readonly status: CheckpointStatus;
  readonly createdAt: string;
  readonly predecessorCheckpointId?: string;
  readonly confirmedFacts: readonly string[];
  readonly decisions: readonly string[];
  readonly evidence: readonly CheckpointEvidenceRef[];
  readonly blockers: readonly string[];
  readonly risks: readonly string[];
  readonly nextAction: string;
  readonly ownerRef: string;
}

export type CheckpointErrorCode = 'INVALID_CHECKPOINT' | 'SENSITIVE_CHECKPOINT_CONTENT';

export class CheckpointError extends Error {
  readonly code: CheckpointErrorCode;
  readonly details: Readonly<Record<string, unknown>>;

  constructor(code: CheckpointErrorCode, message: string, details: Readonly<Record<string, unknown>> = {}) {
    super(message);
    this.name = 'CheckpointError';
    this.code = code;
    this.details = Object.freeze({ ...details });
  }
}

const KINDS = new Set<CheckpointKind>([
  'ANALYSIS',
  'DECISION',
  'MODIFICATION',
  'VALIDATION',
  'REVIEW',
  'HANDOFF',
  'RECOVERY',
]);
const STATUSES = new Set<CheckpointStatus>([
  'IN_PROGRESS',
  'COMPLETED',
  'BLOCKED',
  'FAILED',
  'ROLLED_BACK',
]);
const CONFIDENCES = new Set<CheckpointEvidenceConfidence>([
  'L1',
  'L2',
  'L3',
  'L4',
  'UNVERIFIED',
  'UNKNOWN',
  'NOT_CAPTURED',
]);
const SECRET_PATTERN = /(?:api[_-]?key|password|token|secret)\s*[:=]|-----BEGIN (?:[A-Z0-9 ]+ )?PRIVATE KEY-----|authorization\s*:\s*bearer\s+/i;

function invalid(field: string, reason: string): never {
  throw new CheckpointError('INVALID_CHECKPOINT', `checkpoint field is invalid: ${field}`, { field, reason });
}

function nonBlank(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    invalid(field, 'must be a non-blank string');
  }
  return value.trim();
}

function list(values: unknown, field: string, required: boolean): readonly string[] {
  if (!Array.isArray(values) || values.some(value => typeof value !== 'string' || value.trim().length === 0)) {
    invalid(field, 'must be an array of non-blank strings');
  }
  if (required && values.length === 0) {
    invalid(field, 'must contain at least one item');
  }
  return Object.freeze(values.map(value => value.trim()));
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

function sensitive(value: string): void {
  if (SECRET_PATTERN.test(value)) {
    throw new CheckpointError('SENSITIVE_CHECKPOINT_CONTENT', 'checkpoint contains secret-like content');
  }
}

function evidenceRef(value: CheckpointEvidenceRef, index: number): CheckpointEvidenceRef {
  const evidenceId = nonBlank(value?.evidenceId, `evidence[${index}].evidenceId`);
  const source = nonBlank(value?.source, `evidence[${index}].source`);
  if (typeof value?.confidence !== 'string' || !CONFIDENCES.has(value.confidence)) {
    invalid(`evidence[${index}].confidence`, 'unsupported confidence');
  }
  const reference = value.reference === undefined ? undefined : nonBlank(value.reference, `evidence[${index}].reference`);
  sensitive(evidenceId);
  sensitive(source);
  if (reference !== undefined) {
    sensitive(reference);
  }
  return Object.freeze({
    evidenceId,
    source,
    confidence: value.confidence,
    ...(reference === undefined ? {} : { reference }),
  });
}

export function validateAndFreezeCheckpoint(input: TaskCheckpoint): TaskCheckpoint {
  if (input === null || typeof input !== 'object') {
    throw new CheckpointError('INVALID_CHECKPOINT', 'checkpoint must be an object');
  }
  if (input.schemaVersion !== '1.0') {
    invalid('schemaVersion', 'unsupported schema version');
  }
  const checkpointId = nonBlank(input.checkpointId, 'checkpointId');
  const taskRef = nonBlank(input.taskRef, 'taskRef');
  const projectRef = nonBlank(input.projectRef, 'projectRef');
  const phase = nonBlank(input.phase, 'phase');
  if (typeof input.kind !== 'string' || !KINDS.has(input.kind)) {
    invalid('kind', 'unsupported checkpoint kind');
  }
  if (typeof input.status !== 'string' || !STATUSES.has(input.status)) {
    invalid('status', 'unsupported checkpoint status');
  }
  const createdAt = canonicalIso(input.createdAt, 'createdAt');
  const predecessorCheckpointId = input.predecessorCheckpointId === undefined
    ? undefined
    : nonBlank(input.predecessorCheckpointId, 'predecessorCheckpointId');
  if (predecessorCheckpointId === checkpointId) {
    invalid('predecessorCheckpointId', 'cannot reference itself');
  }
  const confirmedFacts = list(input.confirmedFacts, 'confirmedFacts', true);
  const decisions = list(input.decisions, 'decisions', false);
  const blockers = list(input.blockers, 'blockers', false);
  const risks = list(input.risks, 'risks', false);
  if (!Array.isArray(input.evidence) || input.evidence.length === 0) {
    invalid('evidence', 'must contain at least one evidence reference');
  }
  const evidence = Object.freeze(input.evidence.map(evidenceRef));
  if (new Set(evidence.map(item => item.evidenceId)).size !== evidence.length) {
    invalid('evidence', 'evidence IDs must be unique');
  }
  const nextAction = nonBlank(input.nextAction, 'nextAction');
  const ownerRef = nonBlank(input.ownerRef, 'ownerRef');

  for (const value of [
    checkpointId,
    taskRef,
    projectRef,
    phase,
    ...confirmedFacts,
    ...decisions,
    ...blockers,
    ...risks,
    nextAction,
    ownerRef,
  ]) {
    sensitive(value);
  }

  return Object.freeze({
    schemaVersion: '1.0',
    checkpointId,
    taskRef,
    projectRef,
    phase,
    kind: input.kind,
    status: input.status,
    createdAt,
    ...(predecessorCheckpointId === undefined ? {} : { predecessorCheckpointId }),
    confirmedFacts,
    decisions,
    evidence,
    blockers,
    risks,
    nextAction,
    ownerRef,
  });
}
