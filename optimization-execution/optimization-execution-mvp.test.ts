import assert from 'node:assert/strict';
import test from 'node:test';

import { AuditService } from '../runtime/audit/audit-service.ts';
import { InMemoryAuditRepository } from '../runtime/audit/in-memory-audit-repository.ts';
import type { MarkdownOptimizerPort, OptimizationExecutionRequest } from './optimization-execution-contract.ts';
import { DeterministicMarkdownOptimizer } from './deterministic-markdown-optimizer.ts';
import { OptimizationEligibilityService } from './optimization-eligibility-service.ts';
import { OptimizationExecutionService } from './optimization-execution-service.ts';
import { OptimizationValidationService } from './optimization-validation-service.ts';

function document(overrides: Partial<OptimizationExecutionRequest['documents'][number]> = {}) {
  const content = '# Title\n\nRepeat\n\nRepeat\n\n\n\n  - item';
  return { documentRef: 'doc-allowed', content, baselineContent: content, authority: 'NON_AUTHORITATIVE' as const, ...overrides };
}

function createRequest(overrides: Partial<OptimizationExecutionRequest> = {}): OptimizationExecutionRequest {
  return {
    workflowId: 'workflow-optimization', taskId: 'task-optimization', proposalRef: 'proposal-optimization', riskAssessmentRef: 'risk-optimization',
    autonomyDecision: 'AUTO_EXECUTE', autoExecuteTestAuthorization: true,
    documents: [document()], authorizedDocumentRefs: ['doc-allowed'],
    allowedActions: ['DEDUPLICATE_EXACT_BLOCKS', 'NORMALIZE_FORMATTING', 'NORMALIZE_HEADINGS'],
    validationPlanRef: 'validation-plan', rollbackPlanRef: 'rollback-plan', timestamp: '2026-07-15T00:00:00.000Z',
    ...overrides,
  };
}

function createService(auditService: AuditService, optimizer = new DeterministicMarkdownOptimizer()) {
  return new OptimizationExecutionService(auditService, new OptimizationEligibilityService(), optimizer, new OptimizationValidationService());
}

test('OE-01 blocks a request without explicit AUTO_EXECUTE test authorization', () => {
  const result = new OptimizationEligibilityService().check({ ...createRequest(), autoExecuteTestAuthorization: false });
  assert.equal(result.allowed, false);
  assert.match(result.reason!, /authorization/i);
});

test('OE-02 blocks an unlisted document before optimization', () => {
  const result = new OptimizationEligibilityService().check(createRequest({ authorizedDocumentRefs: [] }));
  assert.equal(result.allowed, false);
  assert.match(result.reason!, /whitelist/i);
});

test('OE-03 blocks an authoritative document before optimization', () => {
  const result = new OptimizationEligibilityService().check(createRequest({ documents: [document({ authority: 'AUTHORITATIVE' })] }));
  assert.equal(result.allowed, false);
  assert.match(result.reason!, /non-authoritative/i);
});

test('OE-04 blocks an unsupported action or missing validation or rollback plan', () => {
  const guard = new OptimizationEligibilityService();
  assert.equal(guard.check(createRequest({ allowedActions: ['REWRITE'] as never })).allowed, false);
  assert.equal(guard.check(createRequest({ validationPlanRef: ' ' })).allowed, false);
  assert.equal(guard.check(createRequest({ rollbackPlanRef: ' ' })).allowed, false);
});

test('OE-05 deterministically simplifies an authorised document without changing headings or non-empty text', () => {
  const request = createRequest();
  const optimized = new DeterministicMarkdownOptimizer().optimize(request.documents[0]!, request.allowedActions);
  assert.equal(optimized.content, '# Title\n\nRepeat\n\n  - item');
  assert.equal(optimized.changed, true);
  assert.match(optimized.content, /^# Title/m);
  assert.match(optimized.content, /^  - item/m);
});

test('OE-06 returns complete validation evidence for authorised semantic-preserving output', () => {
  const request = createRequest();
  const candidate = new DeterministicMarkdownOptimizer().optimize(request.documents[0]!, request.allowedActions);
  const validation = new OptimizationValidationService().validate(request, [candidate]);
  assert.equal(validation.valid, true);
  assert.equal(validation.evidence.length, 5);
  assert.ok(validation.evidence.every((item) => item.source === 'optimization-execution'));
});

test('OE-07 completes an explicit AUTO_EXECUTE request and writes complete audit evidence', () => {
  const repository = new InMemoryAuditRepository();
  const result = createService(new AuditService(repository)).execute(createRequest());
  assert.equal(result.status, 'COMPLETED');
  assert.deepEqual(result.changedScope, ['doc-allowed']);
  assert.equal(result.validationEvidence.length, 5);
  const [audit] = repository.listByWorkflowId('workflow-optimization');
  assert.equal(audit?.status, 'SUCCESS');
  assert.match(audit?.result ?? '', /proposal-optimization/i);
  assert.ok((audit?.inputRefs ?? []).includes('doc-allowed'));
});

test('OE-08 rolls back to the baseline when validation rejects optimizer output', () => {
  const destructiveOptimizer: MarkdownOptimizerPort = { optimize: (doc) => ({ documentRef: doc.documentRef, content: '# Changed', changed: true }) };
  const repository = new InMemoryAuditRepository();
  const request = createRequest();
  const result = createService(new AuditService(repository), destructiveOptimizer).execute(request);
  assert.equal(result.status, 'ROLLED_BACK');
  assert.equal(result.documents[0]?.content, request.documents[0]?.baselineContent);
  assert.equal(repository.listByWorkflowId(request.workflowId)[0]?.status, 'FAILURE');
});

test('OE-09 does not mutate request input or expose external side effects', () => {
  const request = createRequest();
  const expected = structuredClone(request);
  const service = createService(new AuditService(new InMemoryAuditRepository())) as unknown as Record<string, unknown>;
  (service as { execute(input: OptimizationExecutionRequest): unknown }).execute(request);
  assert.deepEqual(request, expected);
  assert.equal(typeof service.readFile, 'undefined');
  assert.equal(typeof service.writeFile, 'undefined');
  assert.equal(typeof service.fetch, 'undefined');
  assert.equal(typeof service.modifyRuntime, 'undefined');
});
