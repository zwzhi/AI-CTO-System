import type {
  ExecutionProfile,
  FingerprintMethod,
  Reversibility,
  RiskLevel,
  TaskComplexity,
} from '../routing/execution-routing-contract.ts';

export type EnvelopeMode = 'analysis' | 'local-modification' | 'nonproduction' | 'production';
export type EnvelopePhase = 'IDENTIFY' | 'PLAN' | 'IMPLEMENT' | 'VALIDATE' | 'REVIEW' | 'DELIVER';

export interface TaskEnvelopeProject {
  readonly name: string;
  readonly repoPath: string;
  readonly branch: string;
  readonly baselineCommit: string;
}

export interface TaskEnvelopeExecution {
  readonly mode: EnvelopeMode;
  readonly profile: ExecutionProfile;
  readonly phase: EnvelopePhase;
  readonly riskLevel: RiskLevel;
  readonly complexity: TaskComplexity;
  readonly reversibility?: Reversibility;
}

export interface TaskEnvelopeAuthorization {
  readonly modifyFiles: boolean;
  readonly createCommit: boolean;
  readonly push: boolean;
  readonly deploy: boolean;
  readonly restart: boolean;
  readonly databaseWrite: boolean;
  readonly cacheOrMqWrite: boolean;
}

export interface TaskEnvelopeScope {
  readonly goals: readonly string[];
  readonly nonGoals: readonly string[];
  readonly allowedPaths: readonly string[];
  readonly forbiddenPaths: readonly string[];
}

export interface TaskEnvelopeGate {
  readonly required: readonly string[];
  readonly completed: readonly string[];
}

export interface TaskEnvelopeEvidence {
  readonly repoFingerprint?: {
    readonly method: FingerprintMethod;
    readonly value: string;
  };
  readonly validations: readonly string[];
  readonly reviews: readonly string[];
  readonly staleItems: readonly string[];
}

export interface TaskExecutionEnvelope {
  readonly schemaVersion: '1.0';
  readonly envelopeId: string;
  readonly taskRef: string;
  readonly title: string;
  readonly project: TaskEnvelopeProject;
  readonly execution: TaskEnvelopeExecution;
  readonly authorization: TaskEnvelopeAuthorization;
  readonly scope: TaskEnvelopeScope;
  readonly gates: TaskEnvelopeGate;
  readonly stopConditions: readonly string[];
  readonly rollbackConditions: readonly string[];
  readonly acceptanceCriteria: readonly string[];
  readonly evidence: TaskEnvelopeEvidence;
  readonly nextAction: string;
}

export type TaskEnvelopeErrorCode = 'INVALID_TASK_ENVELOPE';

export class TaskExecutionEnvelopeError extends Error {
  readonly code: TaskEnvelopeErrorCode;
  readonly details: Readonly<Record<string, unknown>>;

  constructor(message: string, details: Readonly<Record<string, unknown>> = {}) {
    super(message);
    this.name = 'TaskExecutionEnvelopeError';
    this.code = 'INVALID_TASK_ENVELOPE';
    this.details = Object.freeze({ ...details });
  }
}

function freezeArray<T>(values: readonly T[]): readonly T[] {
  return Object.freeze([...values]);
}

function nonBlank(value: unknown, field: string): asserts value is string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new TaskExecutionEnvelopeError(`task envelope field is blank: ${field}`, { field });
  }
}

function nonEmptyList(values: readonly string[], field: string): void {
  if (!Array.isArray(values) || values.length === 0 || values.some(value => typeof value !== 'string' || value.trim().length === 0)) {
    throw new TaskExecutionEnvelopeError(`task envelope list is empty or contains a blank item: ${field}`, { field });
  }
}

function optionalList(values: readonly string[], field: string): void {
  if (!Array.isArray(values) || values.some(value => typeof value !== 'string' || value.trim().length === 0)) {
    throw new TaskExecutionEnvelopeError(`task envelope list contains a blank item: ${field}`, { field });
  }
}

function normalisePath(path: string): string {
  return path.trim().replaceAll('\\', '/').replace(/^\.\//, '').replace(/\/+$/, '').toLowerCase();
}

function pathOverlaps(left: string, right: string): boolean {
  return left === right || left.startsWith(`${right}/`) || right.startsWith(`${left}/`);
}

function validatePaths(scope: TaskEnvelopeScope): void {
  optionalList(scope.allowedPaths, 'scope.allowedPaths');
  optionalList(scope.forbiddenPaths, 'scope.forbiddenPaths');
  const allowed = scope.allowedPaths.map(normalisePath);
  const forbidden = scope.forbiddenPaths.map(normalisePath);

  if (allowed.some((path, index) => path.length === 0 || allowed.indexOf(path) !== index)) {
    throw new TaskExecutionEnvelopeError('task envelope contains duplicate or blank allowed paths', { field: 'scope.allowedPaths' });
  }
  if (forbidden.some((path, index) => path.length === 0 || forbidden.indexOf(path) !== index)) {
    throw new TaskExecutionEnvelopeError('task envelope contains duplicate or blank forbidden paths', { field: 'scope.forbiddenPaths' });
  }
  if (allowed.some(left => forbidden.some(right => pathOverlaps(left, right)))) {
    throw new TaskExecutionEnvelopeError('allowed and forbidden paths overlap', { field: 'scope' });
  }
}

function validateAuthorization(
  mode: EnvelopeMode,
  authorization: TaskEnvelopeAuthorization,
): void {
  const fields: readonly (keyof TaskEnvelopeAuthorization)[] = [
    'modifyFiles',
    'createCommit',
    'push',
    'deploy',
    'restart',
    'databaseWrite',
    'cacheOrMqWrite',
  ];
  if (fields.some(field => typeof authorization[field] !== 'boolean')) {
    throw new TaskExecutionEnvelopeError('task envelope authorization must contain booleans', { field: 'authorization' });
  }
  if (mode === 'analysis' && fields.some(field => authorization[field])) {
    throw new TaskExecutionEnvelopeError('analysis envelope cannot authorize side effects', { field: 'authorization' });
  }
  if (authorization.push && !authorization.createCommit) {
    throw new TaskExecutionEnvelopeError('push authorization requires createCommit authorization', { field: 'authorization.push' });
  }
  if ((authorization.deploy || authorization.restart || authorization.databaseWrite || authorization.cacheOrMqWrite)
    && mode !== 'production' && mode !== 'nonproduction') {
    throw new TaskExecutionEnvelopeError('environmental write authorization requires an execution environment mode', { field: 'authorization' });
  }
}

function validateEvidence(evidence: TaskEnvelopeEvidence): void {
  optionalList(evidence.validations, 'evidence.validations');
  optionalList(evidence.reviews, 'evidence.reviews');
  optionalList(evidence.staleItems, 'evidence.staleItems');
  if (evidence.repoFingerprint !== undefined) {
    nonBlank(evidence.repoFingerprint.value, 'evidence.repoFingerprint.value');
    if (!['CONTENT_HASH', 'GIT_SCOPE'].includes(evidence.repoFingerprint.method)) {
      throw new TaskExecutionEnvelopeError('unsupported evidence fingerprint method', { field: 'evidence.repoFingerprint.method' });
    }
  }
}

function freezeEnvelope(input: TaskExecutionEnvelope): TaskExecutionEnvelope {
  return Object.freeze({
    ...input,
    project: Object.freeze({ ...input.project }),
    execution: Object.freeze({ ...input.execution }),
    authorization: Object.freeze({ ...input.authorization }),
    scope: Object.freeze({
      ...input.scope,
      goals: freezeArray(input.scope.goals),
      nonGoals: freezeArray(input.scope.nonGoals),
      allowedPaths: freezeArray(input.scope.allowedPaths),
      forbiddenPaths: freezeArray(input.scope.forbiddenPaths),
    }),
    gates: Object.freeze({
      ...input.gates,
      required: freezeArray(input.gates.required),
      completed: freezeArray(input.gates.completed),
    }),
    stopConditions: freezeArray(input.stopConditions),
    rollbackConditions: freezeArray(input.rollbackConditions),
    acceptanceCriteria: freezeArray(input.acceptanceCriteria),
    evidence: Object.freeze({
      ...input.evidence,
      ...(input.evidence.repoFingerprint === undefined ? {} : {
        repoFingerprint: Object.freeze({ ...input.evidence.repoFingerprint }),
      }),
      validations: freezeArray(input.evidence.validations),
      reviews: freezeArray(input.evidence.reviews),
      staleItems: freezeArray(input.evidence.staleItems),
    }),
  });
}

export function validateAndFreezeTaskExecutionEnvelope(
  input: TaskExecutionEnvelope,
): TaskExecutionEnvelope {
  if (input === null || typeof input !== 'object') {
    throw new TaskExecutionEnvelopeError('task envelope must be an object');
  }
  if (input.schemaVersion !== '1.0') {
    throw new TaskExecutionEnvelopeError('unsupported task envelope schema version', { field: 'schemaVersion' });
  }

  nonBlank(input.envelopeId, 'envelopeId');
  nonBlank(input.taskRef, 'taskRef');
  nonBlank(input.title, 'title');
  nonBlank(input.project.name, 'project.name');
  nonBlank(input.project.repoPath, 'project.repoPath');
  nonBlank(input.project.branch, 'project.branch');
  nonBlank(input.project.baselineCommit, 'project.baselineCommit');
  nonBlank(input.execution.mode, 'execution.mode');
  nonBlank(input.execution.profile, 'execution.profile');
  nonBlank(input.execution.phase, 'execution.phase');
  nonBlank(input.execution.riskLevel, 'execution.riskLevel');
  nonBlank(input.execution.complexity, 'execution.complexity');
  validateAuthorization(input.execution.mode, input.authorization);
  nonEmptyList(input.scope.goals, 'scope.goals');
  nonEmptyList(input.scope.nonGoals, 'scope.nonGoals');
  validatePaths(input.scope);
  optionalList(input.gates.required, 'gates.required');
  optionalList(input.gates.completed, 'gates.completed');
  nonEmptyList(input.stopConditions, 'stopConditions');
  nonEmptyList(input.rollbackConditions, 'rollbackConditions');
  nonEmptyList(input.acceptanceCriteria, 'acceptanceCriteria');
  nonBlank(input.nextAction, 'nextAction');
  validateEvidence(input.evidence);

  return freezeEnvelope(input);
}
