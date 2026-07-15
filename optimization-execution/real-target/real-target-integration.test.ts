import assert from 'node:assert/strict';
import test from 'node:test';
import { routeRealTarget } from './proposal-routing-service.ts';
import { bindConfirmation } from './real-target-confirmation-service.ts';
import { createHash } from 'node:crypto';
import { mkdtempSync, writeFileSync, rmSync, readFileSync, existsSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { preflightTarget } from './real-target-preflight-service.ts';
import { RealTargetExecutionService, type PersistentRealTargetAuditPort, type RealTargetFilePort, type RealTargetValidationPort } from './real-target-execution-service.ts';
import { JsonlPersistentRealTargetAudit } from './jsonl-persistent-real-target-audit.ts';

test('RT-01 routes one explicit non-authoritative markdown target to confirmation only', () => {
  const result = routeRealTarget({ proposalRef: 'op-1', riskAssessmentRef: 'risk-1', autonomyDecision: 'AUTO_EXECUTE', target: 'docs/scratch.md', authorizedTargets: ['docs/scratch.md'], action: 'NORMALIZE_FORMATTING' });
  assert.equal(result.state, 'WAITING_CONFIRMATION');
  assert.equal(result.target, 'docs/scratch.md');
});

test('RT-04 creates a before snapshot and detects confirmation-time drift', () => {
  const root = mkdtempSync(join(tmpdir(), 'ai-cto-'));
  const file = join(root, 'scratch.md');
  writeFileSync(file, '# Title\n\nText', 'utf8');
  try {
    const snapshot = preflightTarget(root, 'scratch.md');
    assert.equal(snapshot.content, '# Title\n\nText');
    assert.equal(snapshot.hash, createHash('sha256').update('# Title\n\nText').digest('hex'));
    writeFileSync(file, '# Title\n\nChanged', 'utf8');
    assert.throws(() => preflightTarget(root, 'scratch.md', snapshot.hash), /drift/i);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('RT-03 binds confirmation to one proposal, target and before hash', () => {
  const routed = routeRealTarget({ proposalRef: 'op-1', riskAssessmentRef: 'risk-1', autonomyDecision: 'AUTO_EXECUTE', target: 'docs/scratch.md', authorizedTargets: ['docs/scratch.md'], action: 'NORMALIZE_FORMATTING' });
  const confirmation = bindConfirmation(routed, 'before-hash');
  assert.equal(confirmation.proposalRef, 'op-1');
  assert.equal(confirmation.target, 'docs/scratch.md');
  assert.equal(confirmation.beforeHash, 'before-hash');
  assert.equal(confirmation.used, false);
});

test('RT-02 rejects authority paths, non-markdown targets, and missing references', () => {
  assert.throws(() => routeRealTarget({ proposalRef: 'op-1', riskAssessmentRef: 'risk-1', autonomyDecision: 'AUTO_EXECUTE', target: 'docs/adr/ADR-0020.md', authorizedTargets: ['docs/adr/ADR-0020.md'], action: 'NORMALIZE_FORMATTING' }), /forbidden/i);
  assert.throws(() => routeRealTarget({ proposalRef: 'op-1', riskAssessmentRef: 'risk-1', autonomyDecision: 'AUTO_EXECUTE', target: 'runtime/a.ts', authorizedTargets: ['runtime/a.ts'], action: 'NORMALIZE_FORMATTING' }), /markdown/i);
  assert.throws(() => routeRealTarget({ proposalRef: ' ', riskAssessmentRef: 'risk-1', autonomyDecision: 'AUTO_EXECUTE', target: 'docs/scratch.md', authorizedTargets: ['docs/scratch.md'], action: 'NORMALIZE_FORMATTING' }), /reference/i);
  assert.throws(() => routeRealTarget({ proposalRef: 'op-1', riskAssessmentRef: 'risk-1', autonomyDecision: 'AUTO_EXECUTE', target: 'docs/not-whitelisted.md', authorizedTargets: ['docs/scratch.md'], action: 'NORMALIZE_FORMATTING' }), /whitelist/i);
});

test('RT-05 writes one confirmed whitelist target and persists metadata-only audit evidence', () => {
  const root = mkdtempSync(join(tmpdir(), 'ai-cto-'));
  const target = 'notes/scratch.md';
  const file = join(root, target);
  const auditPath = join(root, '.ai-cto', 'audit', 'real-target.jsonl');
  mkdirSync(join(root, 'notes'));
  writeFileSync(file, '# Title\n\nRepeat\n\nRepeat\n\n\n\nText', 'utf8');
  try {
    const routed = routeRealTarget({ proposalRef: 'op-5', riskAssessmentRef: 'risk-5', autonomyDecision: 'AUTO_EXECUTE', target, authorizedTargets: [target], action: 'DEDUPLICATE_EXACT_BLOCKS' });
    const before = preflightTarget(root, target);
    const result = new RealTargetExecutionService(new JsonlPersistentRealTargetAudit(root)).execute(root, routed, bindConfirmation(routed, before.hash), before);
    assert.equal(result.status, 'COMPLETED');
    assert.equal(readFileSync(file, 'utf8'), '# Title\n\nRepeat\n\nText');
    assert.equal(existsSync(auditPath), true);
    const audit = readFileSync(auditPath, 'utf8');
    assert.match(audit, /op-5/);
    assert.doesNotMatch(audit, /Repeat/);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('RT-06 blocks a missing or mismatched confirmation before any write', () => {
  const routed = routeRealTarget({ proposalRef: 'op-6', riskAssessmentRef: 'risk-6', autonomyDecision: 'AUTO_EXECUTE', target: 'notes/scratch.md', authorizedTargets: ['notes/scratch.md'], action: 'NORMALIZE_FORMATTING' });
  const before = memorySnapshot(routed.target, '# Title\n\nText');
  const files = new MemoryFiles(before.content);
  const result = new RealTargetExecutionService(new MemoryAudit(), files).execute('.', routed, { ...bindConfirmation(routed, before.hash), target: 'notes/other.md' }, before);
  assert.equal(result.status, 'BLOCKED');
  assert.equal(files.writes, 0);
});

test('RT-07 restores the before snapshot after a bounded write fails', () => {
  const routed = routeRealTarget({ proposalRef: 'op-7', riskAssessmentRef: 'risk-7', autonomyDecision: 'AUTO_EXECUTE', target: 'notes/scratch.md', authorizedTargets: ['notes/scratch.md'], action: 'NORMALIZE_FORMATTING' });
  const before = memorySnapshot(routed.target, '# Title\n\n\n\nText');
  const files = new MemoryFiles(before.content, 'FAIL_AFTER_PARTIAL_WRITE');
  const result = new RealTargetExecutionService(new MemoryAudit(), files).execute('.', routed, bindConfirmation(routed, before.hash), before);
  assert.equal(result.status, 'ROLLED_BACK');
  assert.equal(files.content, before.content);
  assert.equal(files.writes, 2);
});

test('RT-08 restores the before snapshot when post-write validation fails', () => {
  const routed = routeRealTarget({ proposalRef: 'op-8', riskAssessmentRef: 'risk-8', autonomyDecision: 'AUTO_EXECUTE', target: 'notes/scratch.md', authorizedTargets: ['notes/scratch.md'], action: 'NORMALIZE_FORMATTING' });
  const before = memorySnapshot(routed.target, '# Title\n\n\n\nText');
  const files = new MemoryFiles(before.content);
  const validator: RealTargetValidationPort = { validate: () => ({ valid: false, reason: 'Semantic preservation failed.' }) };
  const result = new RealTargetExecutionService(new MemoryAudit(), files, validator).execute('.', routed, bindConfirmation(routed, before.hash), before);
  assert.equal(result.status, 'ROLLED_BACK');
  assert.equal(files.content, before.content);
});

test('RT-09 blocks completion and restores the before snapshot when persistent audit fails', () => {
  const routed = routeRealTarget({ proposalRef: 'op-9', riskAssessmentRef: 'risk-9', autonomyDecision: 'AUTO_EXECUTE', target: 'notes/scratch.md', authorizedTargets: ['notes/scratch.md'], action: 'NORMALIZE_FORMATTING' });
  const before = memorySnapshot(routed.target, '# Title\n\n\n\nText');
  const files = new MemoryFiles(before.content);
  const audit: PersistentRealTargetAuditPort = { append: () => { throw new Error('Audit unavailable.'); } };
  const result = new RealTargetExecutionService(audit, files).execute('.', routed, bindConfirmation(routed, before.hash), before);
  assert.equal(result.status, 'ROLLED_BACK');
  assert.equal(files.content, before.content);
  assert.match(result.failureReason ?? '', /audit/i);
});

function memorySnapshot(target: string, content: string) {
  const hash = createHash('sha256').update(content).digest('hex');
  return { target, content, hash, reference: `sha256:${hash}` };
}

class MemoryFiles implements RealTargetFilePort {
  content: string;
  writes = 0;
  private readonly mode?: 'FAIL_AFTER_PARTIAL_WRITE';

  constructor(content: string, mode?: 'FAIL_AFTER_PARTIAL_WRITE') { this.content = content; this.mode = mode; }

  snapshot(_projectRoot: string, target: string, expectedHash?: string) {
    const snapshot = memorySnapshot(target, this.content);
    if (expectedHash !== undefined && expectedHash !== snapshot.hash) throw new Error('Target content drift detected.');
    return snapshot;
  }

  write(_projectRoot: string, _target: string, content: string): void {
    this.writes += 1;
    if (this.mode === 'FAIL_AFTER_PARTIAL_WRITE' && this.writes === 1) {
      this.content = content.slice(0, 4);
      throw new Error('Write failed.');
    }
    this.content = content;
  }
}

class MemoryAudit implements PersistentRealTargetAuditPort {
  readonly records: unknown[] = [];
  append(record: unknown): void { this.records.push(record); }
}
