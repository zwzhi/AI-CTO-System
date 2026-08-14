import type { TaskCheckpoint } from './checkpoint-contract.ts';

export interface CheckpointRepositoryPort {
  append(checkpoint: TaskCheckpoint): TaskCheckpoint;
  listByTaskRef(taskRef: string): readonly TaskCheckpoint[];
  getLatest(taskRef: string): TaskCheckpoint | undefined;
}
