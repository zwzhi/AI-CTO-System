import {
  validateAndFreezeCheckpoint,
  type CheckpointEvidenceRef,
  type TaskCheckpoint,
} from './checkpoint-contract.ts';

export interface ProjectMemoryProjection {
  readonly schemaVersion: '1.0';
  readonly taskRef: string;
  readonly projectRef: string;
  readonly checkpointId: string;
  readonly confirmedFacts: readonly string[];
  readonly decisions: readonly string[];
  readonly evidence: readonly CheckpointEvidenceRef[];
  readonly blockers: readonly string[];
  readonly risks: readonly string[];
  readonly nextAction: string;
  readonly suggestedSection: '当前状态';
  readonly rawConversationIncluded: false;
}

export class ProjectMemoryProjectionError extends Error {
  readonly code = 'PROJECTION_REQUIRES_CONFIRMED_EVIDENCE' as const;

  constructor(message: string) {
    super(message);
    this.name = 'ProjectMemoryProjectionError';
  }
}

export class ProjectMemoryProjectionService {
  project(input: TaskCheckpoint): ProjectMemoryProjection {
    const checkpoint = validateAndFreezeCheckpoint(input);
    if (checkpoint.evidence.some(evidence => !['L1', 'L2', 'L3', 'L4'].includes(evidence.confidence))) {
      throw new ProjectMemoryProjectionError(
        'project memory projection requires confirmed evidence confidence',
      );
    }

    return Object.freeze({
      schemaVersion: '1.0',
      taskRef: checkpoint.taskRef,
      projectRef: checkpoint.projectRef,
      checkpointId: checkpoint.checkpointId,
      confirmedFacts: Object.freeze([...checkpoint.confirmedFacts]),
      decisions: Object.freeze([...checkpoint.decisions]),
      evidence: Object.freeze(checkpoint.evidence.map(evidence => Object.freeze({ ...evidence }))),
      blockers: Object.freeze([...checkpoint.blockers]),
      risks: Object.freeze([...checkpoint.risks]),
      nextAction: checkpoint.nextAction,
      suggestedSection: '当前状态',
      rawConversationIncluded: false,
    });
  }
}
