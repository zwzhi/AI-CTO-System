import type { TaskCheckpoint } from './checkpoint-contract.ts';
import type { CheckpointRepositoryPort } from './checkpoint-repository-port.ts';

export interface CheckpointRecovery {
  readonly taskRef: string;
  readonly latestCheckpoint?: TaskCheckpoint;
  readonly predecessorCheckpointIds: readonly string[];
  readonly revalidationObligations: readonly string[];
}

const REVALIDATION_OBLIGATIONS = Object.freeze([
  'recheck current project state',
  'recheck current Git and authorization state',
  'recheck current Evidence freshness',
  'recheck current blockers and risks',
  'reconfirm the current next action',
]);

export class CheckpointService {
  readonly #repository: CheckpointRepositoryPort;

  constructor(repository: CheckpointRepositoryPort) {
    this.#repository = repository;
  }

  append(checkpoint: TaskCheckpoint): TaskCheckpoint {
    return this.#repository.append(checkpoint);
  }

  listByTaskRef(taskRef: string): readonly TaskCheckpoint[] {
    return this.#repository.listByTaskRef(taskRef);
  }

  recover(taskRef: string): CheckpointRecovery {
    const checkpoints = this.#repository.listByTaskRef(taskRef);
    const latestCheckpoint = this.#repository.getLatest(taskRef);
    const byId = new Map(checkpoints.map(checkpoint => [checkpoint.checkpointId, checkpoint]));
    const predecessorCheckpointIds: string[] = [];
    let predecessorId = latestCheckpoint?.predecessorCheckpointId;
    while (predecessorId !== undefined && !predecessorCheckpointIds.includes(predecessorId)) {
      predecessorCheckpointIds.push(predecessorId);
      predecessorId = byId.get(predecessorId)?.predecessorCheckpointId;
    }

    return Object.freeze({
      taskRef,
      ...(latestCheckpoint === undefined ? {} : { latestCheckpoint }),
      predecessorCheckpointIds: Object.freeze(predecessorCheckpointIds),
      revalidationObligations: REVALIDATION_OBLIGATIONS,
    });
  }
}
