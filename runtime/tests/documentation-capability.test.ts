import test from 'node:test';
import assert from 'node:assert/strict';

import type {
  DocumentationExecutionOutcome,
  DocumentationExecutionRequest,
  DocumentationInvocationRequest,
} from '../capability/documentation-execution-contract.ts';
import { DOCUMENTATION_OPERATIONS } from '../capability/documentation-execution-contract.ts';
import type { DocumentationInvocationPort } from '../capability/documentation-invocation-port.ts';
import { DeterministicDocumentationAssistant } from '../capability/deterministic-documentation-assistant.ts';
import { DocumentationCapabilityAdapter } from '../capability/documentation-capability-adapter.ts';
import { PermissionBudgetGuard } from '../permission/permission-budget-guard.ts';
import { AuditService } from '../audit/audit-service.ts';
import { InMemoryAuditRepository } from '../audit/in-memory-audit-repository.ts';
import { DocumentationCapabilityRuntimeService } from '../services/documentation-capability-runtime-service.ts';

const NOW = '2026-07-14T00:00:00.000Z';

function createRequest(overrides: Partial<DocumentationExecutionRequest> = {}): DocumentationExecutionRequest {
  return {
    taskId: 'task-doc-1',
    workflowId: 'workflow-doc-1',
    operation: 'GENERATE_DRAFT',
    taskObjective: 'Create an implementation summary for reviewers.',
    authorizedSources: [{
      sourceRef: 'source-design-1',
      location: 'design.md#implementation',
      content: 'The implementation must be deterministic and audit-only.',
      versionRef: 'v1',
    }],
    executionContext: { intentRef: 'intent-doc-1', constraintRefs: [], allowedContextRefs: ['source-design-1'] },
    permissionGrant: { grantId: 'grant-doc-1', allowedOperations: ['GENERATE_DRAFT'], expiresAt: '2026-07-15T00:00:00.000Z' },
    budget: { tokenLimit: 10, tokenUsed: 0, toolLimit: 1, toolUsed: 0, timeLimitMs: 1_000, timeUsedMs: 0, costLimit: 1, costUsed: 0 },
    ...overrides,
  };
}

class CountingPort implements DocumentationInvocationPort {
  calls = 0;
  lastInvocation?: DocumentationInvocationRequest;
  private readonly delegate: DocumentationInvocationPort;

  constructor(delegate: DocumentationInvocationPort = new DeterministicDocumentationAssistant(() => NOW)) {
    this.delegate = delegate;
  }

  invoke(invocation: DocumentationInvocationRequest): DocumentationExecutionOutcome {
    this.calls += 1;
    this.lastInvocation = invocation;
    return this.delegate.invoke(invocation);
  }
}

function createAdapter(port: DocumentationInvocationPort = new DeterministicDocumentationAssistant(() => NOW)): DocumentationCapabilityAdapter {
  return new DocumentationCapabilityAdapter(port, new PermissionBudgetGuard(), () => NOW);
}

test('DOC-01 generates a complete draft package from one authorized source', () => {
  const outcome = createAdapter().invoke(createRequest());

  assert.equal(outcome.status, 'SUCCESS');
  assert.ok(outcome.result);
  assert.match(outcome.result.draft, /^DRAFT:/);
  assert.equal(outcome.result.sourceReferences.length, 1);
  assert.equal(outcome.result.confidence, 'L3');
  assert.equal(outcome.result.evidence.length, 1);
  assert.ok(outcome.result.limitations.length > 0);
});

test('DOC-02 builds evidence before drafting and cites only authorized sources', () => {
  const request = createRequest({
    authorizedSources: [
      ...createRequest().authorizedSources,
      { sourceRef: 'source-context-2', location: 'context.md#scope', content: 'The scope excludes workflow changes.', versionRef: 'v2' },
    ],
    executionContext: { ...createRequest().executionContext, allowedContextRefs: ['source-design-1', 'source-context-2'] },
  });
  const port = new CountingPort();
  const outcome = createAdapter(port).invoke(request);

  assert.equal(outcome.status, 'SUCCESS');
  assert.ok(outcome.result);
  assert.deepEqual(outcome.result.sourceReferences.map((reference) => reference.sourceRef), ['source-design-1', 'source-context-2']);
  assert.deepEqual(outcome.result.evidence.map((evidence) => evidence.reference), ['source-design-1', 'source-context-2']);
  assert.ok(outcome.result.sourceReferences.every((reference) => request.executionContext.allowedContextRefs.includes(reference.sourceRef)));
  assert.deepEqual(port.lastInvocation?.evidence.map((evidence) => evidence.reference), ['source-design-1', 'source-context-2']);
});

test('DOC-03 blocks an empty authorized source scope before invocation', () => {
  const port = new CountingPort();
  const outcome = createAdapter(port).invoke(createRequest({ authorizedSources: [] }));

  assert.equal(outcome.status, 'BLOCKED');
  assert.equal(outcome.failure?.category, 'SOURCE_SCOPE_INVALID');
  assert.equal(port.calls, 0);
});

test('DOC-04 blocks a source outside the allowed context references before invocation', () => {
  const port = new CountingPort();
  const outcome = createAdapter(port).invoke(createRequest({
    executionContext: { ...createRequest().executionContext, allowedContextRefs: [] },
  }));

  assert.equal(outcome.status, 'BLOCKED');
  assert.equal(outcome.failure?.category, 'SOURCE_SCOPE_INVALID');
  assert.equal(port.calls, 0);
});

test('DOC-05 blocks an unlocatable source before invocation', () => {
  const port = new CountingPort();
  const outcome = createAdapter(port).invoke(createRequest({
    authorizedSources: [{ ...createRequest().authorizedSources[0]!, location: '' }],
  }));

  assert.equal(outcome.status, 'BLOCKED');
  assert.equal(outcome.failure?.category, 'SOURCE_SCOPE_INVALID');
  assert.equal(port.calls, 0);
});

test('DOC-06 blocks missing, expired, or insufficient draft permission before invocation', () => {
  const missingPermissionPort = new CountingPort();
  const expiredPermissionPort = new CountingPort();
  const missingPermission = createAdapter(missingPermissionPort).invoke(createRequest({
    permissionGrant: { ...createRequest().permissionGrant, allowedOperations: [] },
  }));
  const expiredPermission = createAdapter(expiredPermissionPort).invoke(createRequest({
    permissionGrant: { ...createRequest().permissionGrant, expiresAt: NOW },
  }));

  assert.equal(missingPermission.failure?.category, 'PERMISSION_DENIED');
  assert.equal(expiredPermission.failure?.category, 'PERMISSION_DENIED');
  assert.equal(missingPermissionPort.calls, 0);
  assert.equal(expiredPermissionPort.calls, 0);
});

test('DOC-07 blocks an exceeded budget before invocation with zero usage', () => {
  const port = new CountingPort();
  const outcome = createAdapter(port).invoke(createRequest({
    budget: { ...createRequest().budget, tokenLimit: 1, tokenUsed: 2 },
  }));

  assert.equal(outcome.status, 'BLOCKED');
  assert.equal(outcome.failure?.category, 'BUDGET_EXCEEDED');
  assert.deepEqual(outcome.usage, { tokenUsed: 0, toolUsed: 0, timeUsedMs: 0, costUsed: 0 });
  assert.equal(port.calls, 0);
});

test('DOC-08 blocks a cancelled request before invocation', () => {
  const port = new CountingPort();
  const outcome = createAdapter(port).invoke(createRequest({ cancelled: true }));

  assert.equal(outcome.status, 'BLOCKED');
  assert.equal(outcome.failure?.category, 'CANCELLED');
  assert.equal(port.calls, 0);
});

test('DOC-09 rejects a successful invocation missing a required result field', () => {
  const invalidPort: DocumentationInvocationPort = {
    invoke: (invocation) => ({
      status: 'SUCCESS', timestamp: NOW, usage: { tokenUsed: 0, toolUsed: 0, timeUsedMs: 0, costUsed: 0 }, evidence: [], confidence: 'L3',
      result: { resultRef: `invalid-${invocation.request.taskId}`, draft: 'DRAFT: invalid', sourceReferences: [], confidence: 'L3', evidence: [], limitations: [] },
    }),
  };
  const outcome = createAdapter(invalidPort).invoke(createRequest());

  assert.equal(outcome.status, 'FAILURE');
  assert.equal(outcome.failure?.category, 'OUTPUT_INVALID');
  assert.equal(outcome.result, undefined);
});

test('DOC-10 rejects citations or evidence that exceed the authorized source scope', () => {
  const invalidPort: DocumentationInvocationPort = {
    invoke: () => ({
      status: 'SUCCESS', timestamp: NOW, usage: { tokenUsed: 0, toolUsed: 0, timeUsedMs: 0, costUsed: 0 }, confidence: 'L3', evidence: [],
      result: {
        resultRef: 'invalid-reference', draft: 'DRAFT: invalid reference', confidence: 'L3', limitations: ['Test limitation.'],
        sourceReferences: [{ sourceRef: 'outside-scope', location: 'outside.md#secret' }],
        evidence: [{ evidenceId: 'outside-evidence', source: 'authorized-source', summary: 'outside', confidence: 'L3', timestamp: NOW, reference: 'outside-scope' }],
      },
    }),
  };
  const outcome = createAdapter(invalidPort).invoke(createRequest());

  assert.equal(outcome.status, 'FAILURE');
  assert.equal(outcome.failure?.category, 'OUTPUT_INVALID');
});

test('DOC-11 appends complete audit evidence for successful and blocked calls', () => {
  const repository = new InMemoryAuditRepository();
  const service = new DocumentationCapabilityRuntimeService(createAdapter(), new AuditService(repository), () => NOW);
  const succeeded = service.execute(createRequest());
  const blocked = service.execute(createRequest({ cancelled: true }));

  assert.equal(succeeded.auditEvent.eventType, 'DOCUMENTATION_CAPABILITY_COMPLETED');
  assert.deepEqual(succeeded.auditEvent.inputRefs, ['intent-doc-1', 'grant-doc-1', 'source-design-1']);
  assert.equal(succeeded.auditEvent.outputRef, succeeded.outcome.result?.resultRef);
  assert.equal(blocked.auditEvent.eventType, 'DOCUMENTATION_CAPABILITY_REJECTED');
  assert.equal(blocked.auditEvent.failureReason, 'CANCELLED');
  assert.equal(repository.listByWorkflowId('workflow-doc-1').length, 2);
});

test('DOC-12 runtime service only invokes the adapter and appends audit evidence', () => {
  const service = new DocumentationCapabilityRuntimeService(createAdapter(), new AuditService(new InMemoryAuditRepository()), () => NOW);
  const result = service.execute(createRequest());

  assert.equal(result.outcome.status, 'SUCCESS');
  assert.equal(result.auditEvent.status, 'SUCCESS');
  assert.equal(result.auditEvent.workflowId, 'workflow-doc-1');
});

test('DOC-13 exposes only the generate-draft operation and deterministic in-memory behavior', () => {
  const outcome = createAdapter().invoke(createRequest({
    authorizedSources: [{ ...createRequest().authorizedSources[0]!, versionRef: undefined }],
  }));

  assert.deepEqual(DOCUMENTATION_OPERATIONS, ['GENERATE_DRAFT']);
  assert.equal(outcome.status, 'SUCCESS');
  assert.equal(outcome.result?.confidence, 'L2');
  assert.match(outcome.result?.limitations.join(' ') ?? '', /version/i);
});

test('DOC-14 converts an invocation exception into an audited execution failure', () => {
  const throwingPort: DocumentationInvocationPort = {
    invoke: () => { throw new Error('local port failure'); },
  };
  const adapter = createAdapter(throwingPort);
  const outcome = adapter.invoke(createRequest());
  const service = new DocumentationCapabilityRuntimeService(adapter, new AuditService(new InMemoryAuditRepository()), () => NOW);
  const executed = service.execute(createRequest());

  assert.equal(outcome.status, 'FAILURE');
  assert.equal(outcome.failure?.category, 'EXECUTION_FAILED');
  assert.equal(outcome.failure?.stage, 'INVOCATION');
  assert.equal(executed.auditEvent.failureReason, 'EXECUTION_FAILED');
});

test('DOC-15 passes an immutable source-scope snapshot to the invocation port', () => {
  let received: DocumentationInvocationRequest | undefined;
  const mutatingPort: DocumentationInvocationPort = {
    invoke: (invocation) => {
      received = invocation;
      try {
        (invocation.request.authorizedSources as Array<{ sourceRef: string }>).push({ sourceRef: 'outside-scope' });
      } catch {
        // The immutable boundary is the behavior under test.
      }
      return new DeterministicDocumentationAssistant(() => NOW).invoke(invocation);
    },
  };
  const request = createRequest();
  const outcome = createAdapter(mutatingPort).invoke(request);

  assert.equal(outcome.status, 'SUCCESS');
  assert.notEqual(received?.request, request);
  assert.ok(Object.isFrozen(received?.request));
  assert.ok(Object.isFrozen(received?.request.authorizedSources));
  assert.ok(Object.isFrozen(received?.request.executionContext.allowedContextRefs));
  assert.deepEqual(request.executionContext.allowedContextRefs, ['source-design-1']);
  assert.equal(request.authorizedSources.length, 1);
});

test('DOC-16 rejects a fabricated source version reference', () => {
  const invalidPort: DocumentationInvocationPort = {
    invoke: (invocation) => ({
      status: 'SUCCESS', timestamp: NOW, usage: { tokenUsed: 0, toolUsed: 0, timeUsedMs: 0, costUsed: 0 }, confidence: 'L3',
      evidence: invocation.evidence,
      result: {
        resultRef: 'invalid-version', draft: 'DRAFT: invalid version', confidence: 'L3', limitations: ['Test limitation.'],
        sourceReferences: [{ sourceRef: 'source-design-1', location: 'design.md#implementation', versionRef: 'fabricated' }],
        evidence: invocation.evidence,
      },
    }),
  };
  const outcome = createAdapter(invalidPort).invoke(createRequest());

  assert.equal(outcome.status, 'FAILURE');
  assert.equal(outcome.failure?.category, 'OUTPUT_INVALID');
});

test('DOC-17 rejects confidence that exceeds the verified source evidence', () => {
  const invalidPort: DocumentationInvocationPort = {
    invoke: (invocation) => ({
      status: 'SUCCESS', timestamp: NOW, usage: { tokenUsed: 0, toolUsed: 0, timeUsedMs: 0, costUsed: 0 }, confidence: 'L4',
      evidence: invocation.evidence,
      result: {
        resultRef: 'invalid-confidence', draft: 'DRAFT: invalid confidence', confidence: 'L4', limitations: ['Test limitation.'],
        sourceReferences: [{ sourceRef: 'source-design-1', location: 'design.md#implementation', versionRef: 'v1' }],
        evidence: invocation.evidence,
      },
    }),
  };

  const outcome = createAdapter(invalidPort).invoke(createRequest());

  assert.equal(outcome.status, 'FAILURE');
  assert.equal(outcome.failure?.category, 'OUTPUT_INVALID');
});

test('DOC-18 does not echo authorized source content into the draft or evidence', () => {
  const sensitiveContent = 'secret-token-value-must-not-be-repeated';
  const outcome = createAdapter().invoke(createRequest({
    authorizedSources: [{ ...createRequest().authorizedSources[0]!, content: sensitiveContent }],
  }));

  assert.equal(outcome.status, 'SUCCESS');
  assert.doesNotMatch(outcome.result?.draft ?? '', new RegExp(sensitiveContent));
  assert.ok(outcome.result?.evidence.every((evidence) => !evidence.summary.includes(sensitiveContent)));
});

test('DOC-19 adapter rejects a custom port that echoes authorized source content', () => {
  const sensitiveContent = 'secret-token-value-must-not-be-repeated';
  const echoingPort: DocumentationInvocationPort = {
    invoke: (invocation) => {
      const outcome = new DeterministicDocumentationAssistant(() => NOW).invoke(invocation);
      return {
        ...outcome,
        result: {
          ...outcome.result!,
          draft: `${outcome.result!.draft}\n${sensitiveContent}`,
        },
      };
    },
  };

  const outcome = createAdapter(echoingPort).invoke(createRequest({
    authorizedSources: [{ ...createRequest().authorizedSources[0]!, content: sensitiveContent }],
  }));

  assert.equal(outcome.status, 'FAILURE');
  assert.equal(outcome.failure?.category, 'OUTPUT_INVALID');
});

test('DOC-20 adapter rejects a custom port that echoes source content in limitations', () => {
  const sensitiveContent = 'secret-token-value-must-not-be-repeated';
  const echoingPort: DocumentationInvocationPort = {
    invoke: (invocation) => {
      const outcome = new DeterministicDocumentationAssistant(() => NOW).invoke(invocation);
      return {
        ...outcome,
        result: {
          ...outcome.result!,
          limitations: [sensitiveContent],
        },
      };
    },
  };

  const outcome = createAdapter(echoingPort).invoke(createRequest({
    authorizedSources: [{ ...createRequest().authorizedSources[0]!, content: sensitiveContent }],
  }));

  assert.equal(outcome.status, 'FAILURE');
  assert.equal(outcome.failure?.category, 'OUTPUT_INVALID');
});
