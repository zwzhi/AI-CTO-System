import test from 'node:test';
import assert from 'node:assert/strict';

import { AuditService } from '../audit/audit-service.ts';
import { InMemoryAuditRepository } from '../audit/in-memory-audit-repository.ts';
import { CodeModificationCapabilityAdapter } from '../capability/code-modification-capability-adapter.ts';
import { DeterministicCodeModificationAssistant } from '../capability/deterministic-code-modification-assistant.ts';
import {
  CODE_MODIFICATION_OPERATIONS,
  type ModificationExecutionOutcome,
  type ModificationExecutionRequest,
  type CodeModificationInvocationRequest,
} from '../capability/code-modification-execution-contract.ts';
import type { CodeModificationInvocationPort } from '../capability/code-modification-invocation-port.ts';
import { PermissionBudgetGuard } from '../permission/permission-budget-guard.ts';
import { CodeModificationCapabilityRuntimeService } from '../services/code-modification-capability-runtime-service.ts';

const NOW = '2026-07-15T00:00:00.000Z';

function createInvocation(overrides: Partial<CodeModificationInvocationRequest> = {}): CodeModificationInvocationRequest {
  const request = {
    taskId: 'task-code-modification-1',
    workflowId: 'workflow-code-modification-1',
    operation: 'PROPOSE_CHANGE' as const,
    changeGoal: 'Replace diagnostic logging with the approved logger API.',
    authorizedChangeContexts: [{
      sourceRef: 'source-change-1',
      location: 'runtime/sample.ts',
      content: 'console.log("diagnostic");\nconst unrelated = "do-not-copy";',
      versionRef: 'v1',
    }],
    codeAnalysisEvidence: [{
      evidenceRef: 'code-analysis-evidence-1',
      source: 'code-analysis',
      summary: 'Authorised code analysis supports the change proposal.',
      confidence: 'L3' as const,
      timestamp: NOW,
    }],
    testEvidence: [{
      evidenceRef: 'test-evidence-1',
      source: 'testing-analysis',
      summary: 'Authorised test analysis supports downstream validation planning.',
      confidence: 'L3' as const,
      timestamp: NOW,
    }],
    executionContext: {
      intentRef: 'intent-code-modification-1',
      constraintRefs: [],
      allowedContextRefs: ['source-change-1'],
    },
    permissionGrant: {
      grantId: 'grant-code-modification-1',
      allowedOperations: ['PROPOSE_CHANGE'] as const,
      expiresAt: '2026-07-16T00:00:00.000Z',
    },
    budget: {
      tokenLimit: 10,
      tokenUsed: 0,
      toolLimit: 0,
      toolUsed: 0,
      timeLimitMs: 1_000,
      timeUsedMs: 0,
      costLimit: 1,
      costUsed: 0,
    },
  };
  const evidence = [...request.codeAnalysisEvidence, ...request.testEvidence];
  return { request, evidence, ...overrides };
}

function createRequest(overrides: Partial<ModificationExecutionRequest> = {}): ModificationExecutionRequest {
  return { ...createInvocation().request, ...overrides };
}

class CountingPort implements CodeModificationInvocationPort {
  calls = 0;
  lastInvocation?: CodeModificationInvocationRequest;
  private readonly delegate: CodeModificationInvocationPort;

  constructor(delegate: CodeModificationInvocationPort = new DeterministicCodeModificationAssistant(() => NOW)) {
    this.delegate = delegate;
  }

  invoke(invocation: CodeModificationInvocationRequest): ModificationExecutionOutcome {
    this.calls += 1;
    this.lastInvocation = invocation;
    return this.delegate.invoke(invocation);
  }
}

function createAdapter(port: CodeModificationInvocationPort = new DeterministicCodeModificationAssistant(() => NOW)): CodeModificationCapabilityAdapter {
  return new CodeModificationCapabilityAdapter(port, new PermissionBudgetGuard(), () => NOW);
}

test('CM-01 exposes only the proposal operation', () => {
  assert.deepEqual(CODE_MODIFICATION_OPERATIONS, ['PROPOSE_CHANGE']);
});

test('CM-02 returns a CONFIRM_REQUIRED proposal and one display-only diff', () => {
  const outcome = new DeterministicCodeModificationAssistant(() => NOW).invoke(createInvocation());

  assert.equal(outcome.status, 'SUCCESS');
  assert.equal(outcome.result!.changeProposal.approvalStatus, 'CONFIRM_REQUIRED');
  assert.match(outcome.result!.proposedDiff.displayText, /^--- runtime\/sample\.ts/m);
  assert.match(outcome.result!.proposedDiff.displayText, /^\+\+\+ runtime\/sample\.ts/m);
  assert.match(outcome.result!.proposedDiff.displayText, /^-console\.log\(/m);
  assert.match(outcome.result!.proposedDiff.displayText, /^\+logger\.info\(/m);
  assert.doesNotMatch(outcome.result!.proposedDiff.displayText, /do-not-copy/);
  assert.match(outcome.result!.limitations.join(' '), /human confirmation/i);
  assert.match(outcome.result!.limitations.join(' '), /downstream testing/i);
  assert.deepEqual(outcome.usage, { tokenUsed: 0, toolUsed: 0, timeUsedMs: 0, costUsed: 0 });
});

test('CM-03 fails when no supported marker exists', () => {
  const invocation = createInvocation({
    request: {
      ...createInvocation().request,
      authorizedChangeContexts: [{
        ...createInvocation().request.authorizedChangeContexts[0]!,
        content: 'const logger = createLogger();',
      }],
    },
  });
  const outcome = new DeterministicCodeModificationAssistant(() => NOW).invoke(invocation);

  assert.equal(outcome.status, 'FAILURE');
  assert.equal(outcome.failure?.category, 'EXECUTION_FAILED');
});

test('CM-04 preserves the authorised source-line indentation in the display-only diff', () => {
  const originalLine = '  console.log("indented");';
  const invocation = createInvocation({
    request: {
      ...createInvocation().request,
      authorizedChangeContexts: [{
        ...createInvocation().request.authorizedChangeContexts[0]!,
        content: `function sample() {\n${originalLine}\n}`,
      }],
    },
  });

  const outcome = new DeterministicCodeModificationAssistant(() => NOW).invoke(invocation);
  const lines = outcome.result!.proposedDiff.displayText.split('\n');

  assert.equal(outcome.status, 'SUCCESS');
  assert.equal(lines[2], `-${originalLine}`);
  assert.equal(lines[3], '+  logger.info("indented");');
});

test('CM-05 blocks missing code-analysis or test evidence before port invocation', () => {
  for (const request of [
    createRequest({ codeAnalysisEvidence: [] }),
    createRequest({ testEvidence: [] }),
  ]) {
    const port = new CountingPort();
    const outcome = createAdapter(port).invoke(request);

    assert.equal(outcome.status, 'BLOCKED');
    assert.equal(outcome.failure?.category, 'EVIDENCE_INSUFFICIENT');
    assert.equal(port.calls, 0);
  }
});

test('CM-06 blocks cancellation, permission, budget, invalid scope, and malformed evidence before invocation', () => {
  const request = createRequest();
  const context = request.authorizedChangeContexts[0]!;
  const blockedRequests = [
    createRequest({ cancelled: true }),
    createRequest({ operation: 'NOT_A_MODIFICATION_OPERATION' as ModificationExecutionRequest['operation'] }),
    createRequest({ permissionGrant: { ...request.permissionGrant, allowedOperations: [] } }),
    createRequest({ permissionGrant: { ...request.permissionGrant, expiresAt: '2026-02-30T00:00:00.000Z' } }),
    createRequest({ changeGoal: '  ' }),
    createRequest({ budget: { ...request.budget, tokenLimit: 0, tokenUsed: 1 } }),
    createRequest({ authorizedChangeContexts: [] }),
    createRequest({ authorizedChangeContexts: [context, { ...context, location: 'runtime/duplicate.ts' }] }),
    createRequest({ authorizedChangeContexts: [{ ...context, sourceRef: '' }] }),
    createRequest({ executionContext: { ...request.executionContext, allowedContextRefs: [] } }),
    createRequest({ codeAnalysisEvidence: [{ ...request.codeAnalysisEvidence[0]!, evidenceRef: '' }] }),
    createRequest({ testEvidence: [{ ...request.testEvidence[0]!, source: 'unexpected-source' }] }),
  ];

  for (const blockedRequest of blockedRequests) {
    const port = new CountingPort();
    const outcome = createAdapter(port).invoke(blockedRequest);

    assert.equal(outcome.status, 'BLOCKED');
    assert.equal(port.calls, 0);
  }
});

test('CM-07 rejects invalid proposal output, display diff, evidence, confidence, leakage, and usage', () => {
  const request = createRequest();
  const sourceContent = request.authorizedChangeContexts[0]!.content;
  const valid = (invocation: CodeModificationInvocationRequest) => new DeterministicCodeModificationAssistant(() => NOW).invoke(invocation);
  const invalidPorts: readonly CodeModificationInvocationPort[] = [
    {
      invoke: (invocation) => {
        const outcome = valid(invocation);
        return { ...outcome, result: undefined };
      },
    },
    {
      invoke: (invocation) => {
        const outcome = valid(invocation);
        return {
          ...outcome,
          result: outcome.result === undefined ? undefined : {
            ...outcome.result,
            changeProposal: { ...outcome.result.changeProposal, approvalStatus: 'AUTO' as unknown as 'CONFIRM_REQUIRED' },
          },
        };
      },
    },
    {
      invoke: (invocation) => {
        const outcome = valid(invocation);
        return {
          ...outcome,
          result: outcome.result === undefined ? undefined : {
            ...outcome.result,
            proposedDiff: { ...outcome.result.proposedDiff, displayText: 'not-a-unified-display-diff' },
          },
        };
      },
    },
    {
      invoke: (invocation) => {
        const outcome = valid(invocation);
        return { ...outcome, evidence: [] };
      },
    },
    {
      invoke: (invocation) => {
        const outcome = valid(invocation);
        return {
          ...outcome,
          confidence: 'L4',
          result: outcome.result === undefined ? undefined : { ...outcome.result, confidence: 'L4' },
        };
      },
    },
    {
      invoke: (invocation) => {
        const outcome = valid(invocation);
        return {
          ...outcome,
          result: outcome.result === undefined ? undefined : {
            ...outcome.result,
            changeProposal: { ...outcome.result.changeProposal, impact: sourceContent },
          },
        };
      },
    },
    {
      invoke: (invocation) => ({
        ...valid(invocation),
        usage: { tokenUsed: 1, toolUsed: 0, timeUsedMs: 0, costUsed: 0 },
      }),
    },
  ];

  for (const port of invalidPorts) {
    const outcome = createAdapter(port).invoke(request);

    assert.equal(outcome.status, 'FAILURE');
    assert.equal(outcome.failure?.category, 'OUTPUT_INVALID');
  }
});

test('CM-08 supplies frozen canonical evidence, normalises non-success, and accepts a short context', () => {
  let received: CodeModificationInvocationRequest | undefined;
  const observingPort: CodeModificationInvocationPort = {
    invoke: (invocation) => {
      received = invocation;
      return new DeterministicCodeModificationAssistant(() => NOW).invoke(invocation);
    },
  };
  const succeeded = createAdapter(observingPort).invoke(createRequest({
    authorizedChangeContexts: [{ ...createRequest().authorizedChangeContexts[0]!, content: 'console.log(1)' }],
  }));
  const failingPort: CodeModificationInvocationPort = {
    invoke: (invocation) => ({
      status: 'FAILURE',
      evidence: invocation.evidence,
      confidence: 'L3',
      timestamp: NOW,
      usage: { tokenUsed: 0, toolUsed: 0, timeUsedMs: 0, costUsed: 0 },
    }),
  };
  const failed = createAdapter(failingPort).invoke(createRequest());

  assert.equal(succeeded.status, 'SUCCESS');
  assert.ok(Object.isFrozen(received?.request));
  assert.ok(Object.isFrozen(received?.request.authorizedChangeContexts));
  assert.ok(Object.isFrozen(received?.request.authorizedChangeContexts[0]));
  assert.ok(Object.isFrozen(received?.request.codeAnalysisEvidence));
  assert.ok(Object.isFrozen(received?.request.testEvidence));
  assert.ok(Object.isFrozen(received?.evidence));
  assert.deepEqual(received?.evidence.map((item) => item.evidenceRef), [
    'source-change-1',
    'code-analysis-evidence-1',
    'test-evidence-1',
  ]);
  assert.equal(failed.status, 'FAILURE');
  assert.equal(failed.failure?.category, 'EXECUTION_FAILED');
});

test('CM-09 appends proposal audit evidence without applying a change or changing state', () => {
  const repository = new InMemoryAuditRepository();
  const service = new CodeModificationCapabilityRuntimeService(createAdapter(), new AuditService(repository), () => NOW);
  const succeeded = service.execute(createRequest());
  const blocked = service.execute(createRequest({ cancelled: true }));

  assert.equal(succeeded.auditEvent.eventType, 'CODE_MODIFICATION_CAPABILITY_PROPOSED');
  assert.equal(succeeded.auditEvent.outputRef, succeeded.outcome.result?.resultRef);
  assert.match(succeeded.auditEvent.result ?? '', new RegExp(succeeded.outcome.result!.changeProposal.changeId));
  assert.match(succeeded.auditEvent.result ?? '', new RegExp(succeeded.outcome.result!.proposedDiff.diffId));
  assert.match(succeeded.auditEvent.result ?? '', /CONFIRM_REQUIRED/);
  assert.deepEqual(succeeded.auditEvent.budgetSnapshot, createRequest().budget);
  assert.equal(blocked.auditEvent.eventType, 'CODE_MODIFICATION_CAPABILITY_REJECTED');
  assert.equal(blocked.auditEvent.failureReason, 'CANCELLED');
  assert.equal(blocked.auditEvent.failureStage, 'PREFLIGHT');
  assert.equal(repository.listByWorkflowId('workflow-code-modification-1').length, 2);
});
