import { lstatSync, realpathSync, writeFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';
import { DeterministicMarkdownOptimizer } from '../deterministic-markdown-optimizer.ts';
import type { OptimizationAction } from '../optimization-execution-contract.ts';
import type { RoutedRealTarget } from './proposal-routing-service.ts';
import type { RealTargetConfirmation } from './real-target-confirmation-service.ts';
import { preflightTarget, type BeforeSnapshot } from './real-target-preflight-service.ts';
import type { PersistentRealTargetAuditPort } from './jsonl-persistent-real-target-audit.ts';

export type { PersistentRealTargetAuditPort } from './jsonl-persistent-real-target-audit.ts';

export interface RealTargetFilePort {
  snapshot(projectRoot: string, target: string, expectedHash?: string): BeforeSnapshot;
  write(projectRoot: string, target: string, content: string): void;
}

export interface RealTargetValidationPort {
  validate(before: string, after: string): { valid: boolean; reason?: string };
}

export interface RealTargetExecutionResult {
  readonly status: 'COMPLETED' | 'ROLLED_BACK' | 'BLOCKED';
  readonly changedScope: readonly string[];
  readonly beforeHash: string;
  readonly afterHash?: string;
  readonly validationEvidence: readonly string[];
  readonly failureReason?: string;
}

class NodeRealTargetFilePort implements RealTargetFilePort {
  snapshot(projectRoot: string, target: string, expectedHash?: string): BeforeSnapshot {
    return preflightTarget(projectRoot, target, expectedHash);
  }

  write(projectRoot: string, target: string, content: string): void {
    const root = realpathSync(projectRoot);
    const file = resolve(root, target);
    if (relative(root, file).startsWith('..') || !file.endsWith('.md')) throw new Error('Target is outside the allowed markdown scope.');
    const stat = lstatSync(file);
    if (stat.isSymbolicLink() || !stat.isFile()) throw new Error('Target must be a regular file.');
    writeFileSync(file, content, 'utf8');
  }
}

class MarkdownPreservationValidator implements RealTargetValidationPort {
  validate(before: string, after: string): { valid: boolean; reason?: string } {
    const headings = (value: string) => value.split('\n').filter((line) => /^#{1,6} /.test(line));
    const uniqueNonEmpty = (value: string) => [...new Set(value.split('\n').filter((line) => line.trim().length > 0))];
    const beforeHeadings = headings(before);
    const afterHeadings = headings(after);
    if (JSON.stringify(beforeHeadings) !== JSON.stringify(afterHeadings)) return { valid: false, reason: 'Heading structure changed.' };
    let position = 0;
    for (const line of uniqueNonEmpty(before)) {
      position = after.indexOf(line, position);
      if (position < 0) return { valid: false, reason: 'Non-empty text was not preserved.' };
      position += line.length;
    }
    return { valid: true };
  }
}

export class RealTargetExecutionService {
  private readonly audit: PersistentRealTargetAuditPort;
  private readonly files: RealTargetFilePort;
  private readonly validator: RealTargetValidationPort;
  private readonly optimizer = new DeterministicMarkdownOptimizer();

  constructor(audit: PersistentRealTargetAuditPort, files: RealTargetFilePort = new NodeRealTargetFilePort(), validator: RealTargetValidationPort = new MarkdownPreservationValidator()) {
    this.audit = audit;
    this.files = files;
    this.validator = validator;
  }

  execute(projectRoot: string, request: RoutedRealTarget, confirmation: RealTargetConfirmation, before: BeforeSnapshot): RealTargetExecutionResult {
    if (confirmation.used || confirmation.proposalRef !== request.proposalRef || confirmation.target !== request.target || confirmation.action !== request.action || confirmation.beforeHash !== before.hash) {
      return this.blocked(before.hash, 'Confirmation does not match the proposed bounded write.');
    }
    let current: BeforeSnapshot;
    try {
      current = this.files.snapshot(projectRoot, request.target, before.hash);
    } catch (error) {
      return this.blocked(before.hash, errorMessage(error));
    }
    const optimized = this.optimizer.optimize({ documentRef: request.target, content: current.content, baselineContent: before.content, authority: 'NON_AUTHORITATIVE' }, [request.action as OptimizationAction]);
    try {
      if (optimized.changed) this.files.write(projectRoot, request.target, optimized.content);
      const after = this.files.snapshot(projectRoot, request.target);
      const validation = this.validator.validate(before.content, after.content);
      if (!validation.valid) return this.rollback(projectRoot, request, before, validation.reason ?? 'Validation failed.');
      try {
        this.audit.append({ proposalRef: request.proposalRef, target: request.target, action: request.action, beforeHash: before.hash, afterHash: after.hash, validation: 'PASSED', result: 'COMPLETED', timestamp: new Date().toISOString() });
      } catch (error) {
        return this.rollback(projectRoot, request, before, `Persistent audit failed: ${errorMessage(error)}`);
      }
      return { status: 'COMPLETED', changedScope: optimized.changed ? [request.target] : [], beforeHash: before.hash, afterHash: after.hash, validationEvidence: ['scope-passed', 'structure-passed', 'semantic-preservation-passed', 'rollback-available'] };
    } catch (error) {
      return this.rollback(projectRoot, request, before, errorMessage(error));
    }
  }

  private blocked(beforeHash: string, reason: string): RealTargetExecutionResult {
    return { status: 'BLOCKED', changedScope: [], beforeHash, validationEvidence: ['preflight-blocked'], failureReason: reason };
  }

  private rollback(projectRoot: string, request: RoutedRealTarget, before: BeforeSnapshot, reason: string): RealTargetExecutionResult {
    try { this.files.write(projectRoot, request.target, before.content); } catch (rollbackError) { reason = `${reason}; rollback failed: ${errorMessage(rollbackError)}`; }
    try { this.audit.append({ proposalRef: request.proposalRef, target: request.target, action: request.action, beforeHash: before.hash, validation: 'FAILED', result: 'ROLLED_BACK', timestamp: new Date().toISOString(), failureReason: reason }); } catch { /* Persistent audit failures cannot justify retaining a write. */ }
    return { status: 'ROLLED_BACK', changedScope: [], beforeHash: before.hash, validationEvidence: ['rollback-attempted'], failureReason: reason };
  }
}

function errorMessage(error: unknown): string { return error instanceof Error ? error.message : String(error); }
