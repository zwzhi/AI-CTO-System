import type { Evidence } from '../models/runtime-types.ts';
import type {
  ExecutionProfile,
  RoutingRecommendation,
} from '../routing/execution-routing-contract.ts';
import {
  validateAndFreezeTaskExecutionEnvelope,
  type TaskExecutionEnvelope,
} from './task-execution-envelope-contract.ts';

export type TaskEnvelopeValidationStatus = 'VALID' | 'BLOCKED';
export type TaskEnvelopeReasonCode =
  | 'EVIDENCE_REQUIRED'
  | 'PROFILE_BELOW_MINIMUM'
  | 'GATE_REQUIRED'
  | 'AUTHORIZATION_MISMATCH'
  | 'ENVELOPE_INVALID';

export interface TaskEnvelopeValidationResult {
  readonly status: TaskEnvelopeValidationStatus;
  readonly reasonCode?: TaskEnvelopeReasonCode;
  readonly evidence: readonly Evidence[];
}

export interface TaskExecutionEnvelopeServiceOptions {
  readonly now?: () => string;
}

const profileRank: Readonly<Record<ExecutionProfile, number>> = {
  LIGHT: 1,
  STANDARD: 2,
  STRICT: 3,
};

function envelopeEvidence(
  envelope: TaskExecutionEnvelope,
  summary: string,
  timestamp: string,
): Evidence {
  return {
    evidenceId: `task-envelope-evidence-${envelope.envelopeId}`,
    source: 'task-execution-envelope',
    summary,
    confidence: 'L3',
    timestamp,
    reference: envelope.envelopeId,
  };
}

function blocked(
  envelope: TaskExecutionEnvelope,
  reasonCode: TaskEnvelopeReasonCode,
  now: () => string,
): TaskEnvelopeValidationResult {
  return {
    status: 'BLOCKED',
    reasonCode,
    evidence: [envelopeEvidence(envelope, `Task envelope blocked: ${reasonCode}.`, now())],
  };
}

export class TaskExecutionEnvelopeService {
  readonly #now: () => string;

  constructor(options: TaskExecutionEnvelopeServiceOptions = {}) {
    this.#now = options.now ?? (() => new Date().toISOString());
  }

  validate(
    input: TaskExecutionEnvelope,
    routing: RoutingRecommendation | undefined,
  ): TaskEnvelopeValidationResult {
    let envelope: TaskExecutionEnvelope;
    try {
      envelope = validateAndFreezeTaskExecutionEnvelope(input);
    } catch {
      return {
        status: 'BLOCKED',
        reasonCode: 'ENVELOPE_INVALID',
        evidence: [{
          evidenceId: `task-envelope-evidence-invalid-${input?.envelopeId ?? 'unknown'}`,
          source: 'task-execution-envelope',
          summary: 'Task envelope failed structural validation.',
          confidence: 'L3',
          timestamp: this.#now(),
        }],
      };
    }

    if (envelope.execution.complexity !== 'L0' && envelope.execution.complexity !== 'L1' && routing === undefined) {
      return blocked(envelope, 'EVIDENCE_REQUIRED', this.#now);
    }

    if (routing?.decision === 'INSUFFICIENT_EVIDENCE') {
      return blocked(envelope, 'EVIDENCE_REQUIRED', this.#now);
    }

    if (routing?.profile !== undefined
      && profileRank[envelope.execution.profile] < profileRank[routing.profile]) {
      return blocked(envelope, 'PROFILE_BELOW_MINIMUM', this.#now);
    }

    const requiresCurrentEvidence = envelope.execution.complexity !== 'L0'
      && envelope.execution.complexity !== 'L1';
    if (requiresCurrentEvidence
      && (envelope.evidence.repoFingerprint === undefined || envelope.evidence.staleItems.length > 0)) {
      return blocked(envelope, 'EVIDENCE_REQUIRED', this.#now);
    }

    const missingGates = envelope.gates.required.filter(gate => !envelope.gates.completed.includes(gate));
    if (missingGates.length > 0 || (routing?.decision === 'ESCALATE_FOR_REVIEW' && envelope.gates.required.length === 0)) {
      return blocked(envelope, 'GATE_REQUIRED', this.#now);
    }

    return {
      status: 'VALID',
      evidence: [envelopeEvidence(envelope, 'Task envelope matches routing, evidence and gate constraints.', this.#now())],
    };
  }
}
