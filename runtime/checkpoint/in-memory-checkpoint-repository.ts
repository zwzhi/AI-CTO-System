import { validateAndFreezeCheckpoint, type TaskCheckpoint } from './checkpoint-contract.ts';
import type { CheckpointRepositoryPort } from './checkpoint-repository-port.ts';

export type CheckpointRepositoryErrorCode =
  | 'CHECKPOINT_ALREADY_EXISTS'
  | 'CHECKPOINT_PREDECESSOR_NOT_FOUND'
  | 'CHECKPOINT_PREDECESSOR_MISMATCH';

export class CheckpointRepositoryError extends Error {
  readonly code: CheckpointRepositoryErrorCode;

  constructor(code: CheckpointRepositoryErrorCode, message: string) {
    super(message);
    this.name = 'CheckpointRepositoryError';
    this.code = code;
  }
}

export class InMemoryCheckpointRepository implements CheckpointRepositoryPort {
  readonly #byId = new Map<string, TaskCheckpoint>();
  readonly #byTask = new Map<string, string[]>();

  append(input: TaskCheckpoint): TaskCheckpoint {
    const checkpoint = validateAndFreezeCheckpoint(structuredClone(input));
    if (this.#byId.has(checkpoint.checkpointId)) {
      throw new CheckpointRepositoryError(
        'CHECKPOINT_ALREADY_EXISTS',
        `checkpoint already exists: ${checkpoint.checkpointId}`,
      );
    }
    if (checkpoint.predecessorCheckpointId !== undefined) {
      const predecessor = this.#byId.get(checkpoint.predecessorCheckpointId);
      if (predecessor === undefined) {
        throw new CheckpointRepositoryError(
          'CHECKPOINT_PREDECESSOR_NOT_FOUND',
          `checkpoint predecessor does not exist: ${checkpoint.predecessorCheckpointId}`,
        );
      }
      if (predecessor.taskRef !== checkpoint.taskRef) {
        throw new CheckpointRepositoryError(
          'CHECKPOINT_PREDECESSOR_MISMATCH',
          'checkpoint predecessor belongs to a different task',
        );
      }
    }
    this.#byId.set(checkpoint.checkpointId, checkpoint);
    const taskIds = this.#byTask.get(checkpoint.taskRef) ?? [];
    taskIds.push(checkpoint.checkpointId);
    this.#byTask.set(checkpoint.taskRef, taskIds);
    return checkpoint;
  }

  listByTaskRef(taskRef: string): readonly TaskCheckpoint[] {
    const ids = this.#byTask.get(taskRef) ?? [];
    return Object.freeze(ids.map(id => this.#byId.get(id) as TaskCheckpoint));
  }

  getLatest(taskRef: string): TaskCheckpoint | undefined {
    const items = this.listByTaskRef(taskRef);
    return items.length === 0 ? undefined : items[items.length - 1];
  }
}
