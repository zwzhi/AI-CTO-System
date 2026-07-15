import { appendFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

export interface PersistentRealTargetAuditRecord {
  readonly proposalRef: string;
  readonly target: string;
  readonly action: string;
  readonly beforeHash: string;
  readonly afterHash?: string;
  readonly validation: 'PASSED' | 'FAILED';
  readonly result: 'COMPLETED' | 'ROLLED_BACK' | 'BLOCKED';
  readonly timestamp: string;
  readonly failureReason?: string;
}

export interface PersistentRealTargetAuditPort {
  append(record: PersistentRealTargetAuditRecord): void;
}

export class JsonlPersistentRealTargetAudit implements PersistentRealTargetAuditPort {
  private readonly root: string;

  constructor(projectRoot: string) { this.root = projectRoot; }

  append(record: PersistentRealTargetAuditRecord): void {
    const directory = join(this.root, '.ai-cto', 'audit');
    mkdirSync(directory, { recursive: true });
    appendFileSync(join(directory, 'real-target.jsonl'), `${JSON.stringify(record)}\n`, 'utf8');
  }
}
