import type { BudgetSnapshot, ExecutionContext } from '../models/runtime-types.ts';
import type {
  EvidenceFingerprint,
  EvidenceFreshnessInput,
  EvidenceFreshnessObservation,
} from '../routing/execution-routing-contract.ts';
import {
  HandoffError,
  type ControlledRuntimeHandoffRequest,
  type StructuredIntentClassificationResult,
} from './intent-runtime-handoff-contract.ts';

const REFERENCE_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:/-]{0,127}$/;
const CLASSIFICATION_STATUSES = new Set(['CLASSIFIED', 'AMBIGUOUS', 'OUT_OF_SCOPE', 'INSUFFICIENT_EVIDENCE']);
const INTENT_TYPES = new Set([
  'NEW_PROJECT',
  'FEATURE_REQUEST',
  'BUG_FIX',
  'INCIDENT',
  'REFACTOR',
  'ARCHITECTURE_CHANGE',
  'RESEARCH_REQUEST',
  'KNOWLEDGE_UPDATE',
  'PROJECT_STATUS_QUERY',
  'GENERAL_CONVERSATION',
]);
const CONFIDENCE_LEVELS = new Set(['L1', 'L2', 'L3', 'L4']);
const COMPLEXITIES = new Set(['L0', 'L1', 'L2', 'L3', 'L4']);
const TASK_KINDS = new Set(['DOCUMENTATION', 'ENGINEERING', 'ARCHITECTURE']);
const RISK_LEVELS = new Set(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);
const REVERSIBILITIES = new Set(['REVERSIBLE', 'CONDITIONALLY_REVERSIBLE', 'IRREVERSIBLE']);
const SUGGESTED_WORKFLOWS = new Set(['INSTANT', 'ENGINEERING', 'CTO']);
const FINGERPRINT_METHODS = new Set(['CONTENT_HASH', 'GIT_SCOPE']);

function invalid(field: string, reason: string): never {
  throw new HandoffError('INVALID_HANDOFF_REQUEST', 'handoff request is invalid', { field, reason });
}

function assertVocabulary(value: string, allowed: ReadonlySet<string>, field: string): void {
  if (!allowed.has(value)) {
    invalid(field, 'unsupported value');
  }
}

function assertReference(value: string, field: string): void {
  if (!REFERENCE_PATTERN.test(value)) {
    invalid(field, 'invalid reference');
  }
}

function assertUniqueReferences(values: readonly string[], field: string): readonly string[] {
  const unique = new Set<string>();
  for (const [index, value] of values.entries()) {
    assertReference(value, `${field}[${index}]`);
    if (unique.has(value)) {
      invalid(field, 'duplicate reference');
    }
    unique.add(value);
  }
  return Object.freeze([...values]);
}

function assertCanonicalIso(value: string, field: string): void {
  try {
    if (new Date(value).toISOString() !== value) {
      invalid(field, 'timestamp is not canonical ISO');
    }
  } catch {
    invalid(field, 'timestamp is not canonical ISO');
  }
}

function assertBudget(value: number, field: string): void {
  if (!Number.isFinite(value) || value < 0) {
    invalid(field, 'budget value must be finite and non-negative');
  }
}

function freezeFingerprint(
  fingerprint: EvidenceFingerprint | undefined,
  field: string,
): EvidenceFingerprint | undefined {
  if (fingerprint === undefined) {
    return undefined;
  }
  assertVocabulary(fingerprint.method, FINGERPRINT_METHODS, `${field}.method`);
  const value = fingerprint.value.trim();
  if (value.length === 0 || value.length > 512) {
    invalid(`${field}.value`, 'fingerprint value must contain 1 to 512 characters');
  }
  return Object.freeze({ method: fingerprint.method, value });
}

function freezeEvidenceInput(input: EvidenceFreshnessInput, index: number): EvidenceFreshnessInput {
  const field = `intentResult.evidenceInputs[${index}]`;
  assertReference(input.evidenceRef, `${field}.evidenceRef`);
  assertCanonicalIso(input.observedAt, `${field}.observedAt`);
  return Object.freeze({
    evidenceRef: input.evidenceRef,
    scopeRefs: assertUniqueReferences(input.scopeRefs, `${field}.scopeRefs`),
    ...(input.fingerprint === undefined
      ? {}
      : { fingerprint: freezeFingerprint(input.fingerprint, `${field}.fingerprint`) }),
    observedAt: input.observedAt,
  });
}

function freezeEvidenceObservation(
  observation: EvidenceFreshnessObservation,
  index: number,
): EvidenceFreshnessObservation {
  const field = `intentResult.evidenceObservations[${index}]`;
  assertReference(observation.evidenceRef, `${field}.evidenceRef`);
  return Object.freeze({
    evidenceRef: observation.evidenceRef,
    scopeRefs: assertUniqueReferences(observation.scopeRefs, `${field}.scopeRefs`),
    ...(observation.fingerprint === undefined
      ? {}
      : { fingerprint: freezeFingerprint(observation.fingerprint, `${field}.fingerprint`) }),
  });
}

function assertUniqueEvidenceRefs(
  values: readonly { readonly evidenceRef: string }[],
  field: string,
): void {
  const refs = new Set<string>();
  for (const value of values) {
    if (refs.has(value.evidenceRef)) {
      invalid(field, 'duplicate evidence reference');
    }
    refs.add(value.evidenceRef);
  }
}

function freezeIntent(intent: StructuredIntentClassificationResult): StructuredIntentClassificationResult {
  if (intent.schemaVersion !== '1.0') {
    invalid('intentResult.schemaVersion', 'unsupported schema version');
  }
  assertReference(intent.classificationId, 'intentResult.classificationId');
  assertVocabulary(intent.status, CLASSIFICATION_STATUSES, 'intentResult.status');
  assertVocabulary(intent.intentType, INTENT_TYPES, 'intentResult.intentType');
  assertVocabulary(intent.confidence, CONFIDENCE_LEVELS, 'intentResult.confidence');
  assertVocabulary(intent.complexity, COMPLEXITIES, 'intentResult.complexity');
  assertVocabulary(intent.taskKind, TASK_KINDS, 'intentResult.taskKind');
  assertVocabulary(intent.riskLevel, RISK_LEVELS, 'intentResult.riskLevel');
  assertVocabulary(intent.reversibility, REVERSIBILITIES, 'intentResult.reversibility');
  assertVocabulary(intent.suggestedWorkflow, SUGGESTED_WORKFLOWS, 'intentResult.suggestedWorkflow');
  if (typeof intent.hasApplicableGate !== 'boolean') {
    invalid('intentResult.hasApplicableGate', 'must be boolean');
  }
  if (typeof intent.requiresCurrentEvidence !== 'boolean') {
    invalid('intentResult.requiresCurrentEvidence', 'must be boolean');
  }
  const taskObjective = intent.taskObjective.trim();
  if (taskObjective.length === 0 || taskObjective.length > 1_000) {
    invalid('intentResult.taskObjective', 'objective must contain 1 to 1000 characters');
  }
  const evidenceInputs = intent.evidenceInputs.map(freezeEvidenceInput);
  const evidenceObservations = intent.evidenceObservations.map(freezeEvidenceObservation);
  assertUniqueEvidenceRefs(evidenceInputs, 'intentResult.evidenceInputs');
  assertUniqueEvidenceRefs(evidenceObservations, 'intentResult.evidenceObservations');

  return Object.freeze({
    schemaVersion: '1.0',
    classificationId: intent.classificationId,
    status: intent.status,
    intentType: intent.intentType,
    confidence: intent.confidence,
    complexity: intent.complexity,
    taskKind: intent.taskKind,
    riskLevel: intent.riskLevel,
    reversibility: intent.reversibility,
    hasApplicableGate: intent.hasApplicableGate,
    requiresCurrentEvidence: intent.requiresCurrentEvidence,
    suggestedWorkflow: intent.suggestedWorkflow,
    requiredCapabilityRefs: assertUniqueReferences(
      intent.requiredCapabilityRefs,
      'intentResult.requiredCapabilityRefs',
    ),
    taskObjective,
    evidenceInputs: Object.freeze(evidenceInputs),
    evidenceObservations: Object.freeze(evidenceObservations),
  });
}

function freezeExecutionContext(context: ExecutionContext): ExecutionContext {
  if (context.userRef !== undefined) {
    assertReference(context.userRef, 'executionContext.userRef');
  }
  if (context.projectRef !== undefined) {
    assertReference(context.projectRef, 'executionContext.projectRef');
  }
  assertReference(context.intentRef, 'executionContext.intentRef');
  return Object.freeze({
    ...(context.userRef === undefined ? {} : { userRef: context.userRef }),
    ...(context.projectRef === undefined ? {} : { projectRef: context.projectRef }),
    intentRef: context.intentRef,
    constraintRefs: assertUniqueReferences(context.constraintRefs, 'executionContext.constraintRefs'),
    allowedContextRefs: assertUniqueReferences(
      context.allowedContextRefs,
      'executionContext.allowedContextRefs',
    ),
  });
}

function freezeBudget(budget: BudgetSnapshot): BudgetSnapshot {
  const fields = Object.entries(budget) as [keyof BudgetSnapshot, number][];
  for (const [field, value] of fields) {
    assertBudget(value, `budget.${field}`);
  }
  return Object.freeze({ ...budget });
}

export function validateAndFreezeHandoffRequest(
  request: ControlledRuntimeHandoffRequest,
): ControlledRuntimeHandoffRequest {
  const intentResult = freezeIntent(request.intentResult);
  const executionContext = freezeExecutionContext(request.executionContext);
  const budget = freezeBudget(request.budget);
  if (executionContext.intentRef !== intentResult.classificationId) {
    invalid('executionContext.intentRef', 'must match intentResult.classificationId');
  }
  if (request.cancelled !== undefined && typeof request.cancelled !== 'boolean') {
    invalid('cancelled', 'must be boolean');
  }

  return Object.freeze({
    intentResult,
    executionContext,
    budget,
    ...(request.cancelled === undefined ? {} : { cancelled: request.cancelled }),
  });
}

