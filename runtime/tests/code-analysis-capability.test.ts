import test from 'node:test';
import assert from 'node:assert/strict';

import type {
  CodeAnalysisExecutionOutcome,
  CodeAnalysisExecutionRequest,
  CodeAnalysisInvocationRequest,
} from '../capability/code-analysis-execution-contract.ts';
import { CODE_ANALYSIS_OPERATIONS } from '../capability/code-analysis-execution-contract.ts';
import type { CodeAnalysisInvocationPort } from '../capability/code-analysis-invocation-port.ts';
import { CodeAnalysisCapabilityAdapter } from '../capability/code-analysis-capability-adapter.ts';
import { DeterministicCodeAnalysisAssistant } from '../capability/deterministic-code-analysis-assistant.ts';
import { PermissionBudgetGuard } from '../permission/permission-budget-guard.ts';
import { AuditService } from '../audit/audit-service.ts';
import { InMemoryAuditRepository } from '../audit/in-memory-audit-repository.ts';
import { CodeAnalysisCapabilityRuntimeService } from '../services/code-analysis-capability-runtime-service.ts';

const NOW = '2026-07-14T00:00:00.000Z';

function createRequest(overrides: Partial<CodeAnalysisExecutionRequest> = {}): CodeAnalysisExecutionRequest {
  return {
    taskId: 'task-code-analysis-1',
    workflowId: 'workflow-code-analysis-1',
    operation: 'ANALYZE_READ_ONLY_CODE',
    taskObjective: 'Analyse the supplied module boundaries and risks.',
    authorizedCodeContexts: [{
      sourceRef: 'source-runtime-1',
      location: 'runtime/sample.ts',
      content: 'export function sample() { return "ok"; }',
      versionRef: 'v1',
    }],
    repositoryContext: { repositoryRef: 'repo-ai-cto', revisionRef: 'main@v1' },
    executionContext: { intentRef: 'intent-code-analysis-1', constraintRefs: [], allowedContextRefs: ['source-runtime-1'] },
    permissionGrant: { grantId: 'grant-code-analysis-1', allowedOperations: ['ANALYZE_READ_ONLY_CODE'], expiresAt: '2026-07-15T00:00:00.000Z' },
    budget: { tokenLimit: 10, tokenUsed: 0, toolLimit: 0, toolUsed: 0, timeLimitMs: 1_000, timeUsedMs: 0, costLimit: 1, costUsed: 0 },
    ...overrides,
  };
}

class CountingPort implements CodeAnalysisInvocationPort {
  calls = 0;
  lastInvocation?: CodeAnalysisInvocationRequest;
  private readonly delegate: CodeAnalysisInvocationPort;

  constructor(delegate: CodeAnalysisInvocationPort = new DeterministicCodeAnalysisAssistant(() => NOW)) {
    this.delegate = delegate;
  }

  invoke(invocation: CodeAnalysisInvocationRequest): CodeAnalysisExecutionOutcome {
    this.calls += 1;
    this.lastInvocation = invocation;
    return this.delegate.invoke(invocation);
  }
}

function createAdapter(port: CodeAnalysisInvocationPort = new DeterministicCodeAnalysisAssistant(() => NOW)): CodeAnalysisCapabilityAdapter {
  return new CodeAnalysisCapabilityAdapter(port, new PermissionBudgetGuard(), () => NOW);
}

test('CA-01 returns a complete read-only analysis for an authorised code context', () => {
  const outcome = createAdapter().invoke(createRequest());

  assert.equal(outcome.status, 'SUCCESS');
  assert.ok(outcome.result?.analysisReport);
  assert.ok(outcome.result?.architectureFindings.length);
  assert.ok(outcome.result?.riskFindings.length);
  assert.ok(outcome.result?.technicalDebt.length);
  assert.ok(outcome.result?.evidence.length);
  assert.ok(outcome.result?.confidence);
  assert.ok(outcome.result?.limitations.length);
});

test('CA-02 builds authorised evidence before deterministic analysis', () => {
  const request = createRequest({
    authorizedCodeContexts: [
      ...createRequest().authorizedCodeContexts,
      { sourceRef: 'source-runtime-2', location: 'runtime/other.ts', content: 'export const other = true;', versionRef: 'v2' },
    ],
    executionContext: { ...createRequest().executionContext, allowedContextRefs: ['source-runtime-1', 'source-runtime-2'] },
  });
  const port = new CountingPort();
  const outcome = createAdapter(port).invoke(request);

  assert.equal(outcome.status, 'SUCCESS');
  assert.deepEqual(port.lastInvocation?.evidence.map((evidence) => evidence.reference), ['source-runtime-1', 'source-runtime-2']);
  assert.ok(outcome.result?.evidence.every((evidence) => request.executionContext.allowedContextRefs.includes(evidence.reference ?? '')));
});

test('CA-03a blocks empty source scope before invocation', () => {
  const port = new CountingPort();
  const outcome = createAdapter(port).invoke(createRequest({ authorizedCodeContexts: [] }));

  assert.equal(outcome.status, 'BLOCKED');
  assert.equal(outcome.failure?.category, 'SOURCE_SCOPE_INVALID');
  assert.equal(port.calls, 0);
});

test('CA-03b blocks a source context that is absent from allowedContextRefs before invocation', () => {
  const port = new CountingPort();
  const outcome = createAdapter(port).invoke(createRequest({
    executionContext: { ...createRequest().executionContext, allowedContextRefs: [] },
  }));

  assert.equal(outcome.status, 'BLOCKED');
  assert.equal(outcome.failure?.category, 'SOURCE_SCOPE_INVALID');
  assert.equal(port.calls, 0);
});

test('CA-03c blocks source contexts with an empty sourceRef or location before invocation', () => {
  for (const invalidContext of [
    { ...createRequest().authorizedCodeContexts[0]!, sourceRef: '' },
    { ...createRequest().authorizedCodeContexts[0]!, location: '' },
  ]) {
    const port = new CountingPort();
    const outcome = createAdapter(port).invoke(createRequest({ authorizedCodeContexts: [invalidContext] }));

    assert.equal(outcome.status, 'BLOCKED');
    assert.equal(outcome.failure?.category, 'SOURCE_SCOPE_INVALID');
    assert.equal(port.calls, 0);
  }
});

test('CA-04 blocks missing or expired read-only permission before invocation', () => {
  const port = new CountingPort();
  const outcome = createAdapter(port).invoke(createRequest({
    permissionGrant: { ...createRequest().permissionGrant, allowedOperations: [] },
  }));

  assert.equal(outcome.status, 'BLOCKED');
  assert.equal(outcome.failure?.category, 'PERMISSION_DENIED');
  assert.equal(port.calls, 0);
});

test('CA-04b blocks expired and malformed permission timestamps before invocation', () => {
  for (const expiresAt of ['2026-07-13T23:59:59.000Z', 'not-a-timestamp', '2026-07-32T00:00:00.000Z']) {
    const port = new CountingPort();
    const outcome = createAdapter(port).invoke(createRequest({
      permissionGrant: { ...createRequest().permissionGrant, expiresAt },
    }));

    assert.equal(outcome.status, 'BLOCKED');
    assert.equal(outcome.failure?.category, 'PERMISSION_DENIED');
    assert.equal(port.calls, 0);
  }
});

test('CA-05 blocks an exceeded budget before invocation', () => {
  const port = new CountingPort();
  const outcome = createAdapter(port).invoke(createRequest({
    budget: { ...createRequest().budget, tokenLimit: 1, tokenUsed: 2 },
  }));

  assert.equal(outcome.status, 'BLOCKED');
  assert.equal(outcome.failure?.category, 'BUDGET_EXCEEDED');
  assert.equal(port.calls, 0);
});

test('CA-06 blocks a cancelled analysis request before invocation', () => {
  const port = new CountingPort();
  const outcome = createAdapter(port).invoke(createRequest({ cancelled: true }));

  assert.equal(outcome.status, 'BLOCKED');
  assert.equal(outcome.failure?.category, 'CANCELLED');
  assert.equal(port.calls, 0);
});

test('CA-07 rejects an invalid analysis result from the invocation port', () => {
  const invalidPort: CodeAnalysisInvocationPort = {
    invoke: () => ({ status: 'SUCCESS', evidence: [], confidence: 'L3', timestamp: NOW, usage: { tokenUsed: 0, toolUsed: 0, timeUsedMs: 0, costUsed: 0 } }),
  };
  const outcome = createAdapter(invalidPort).invoke(createRequest());

  assert.equal(outcome.status, 'FAILURE');
  assert.equal(outcome.failure?.category, 'OUTPUT_INVALID');
});

test('CA-08 limits confidence to the evidence available from supplied contexts', () => {
  const outcome = createAdapter().invoke(createRequest({
    authorizedCodeContexts: [{ ...createRequest().authorizedCodeContexts[0]!, versionRef: undefined }],
  }));

  assert.equal(outcome.status, 'SUCCESS');
  assert.equal(outcome.result?.confidence, 'L2');
});

test('CA-08b rejects confidence above the supplied evidence bound', () => {
  const overconfidentPort: CodeAnalysisInvocationPort = {
    invoke: (invocation) => ({
      status: 'SUCCESS', timestamp: NOW, usage: { tokenUsed: 0, toolUsed: 0, timeUsedMs: 0, costUsed: 0 }, confidence: 'L4', evidence: invocation.evidence,
      result: {
        resultRef: 'overconfident-result', analysisReport: 'Read-only report.', confidence: 'L4', evidence: invocation.evidence,
        architectureFindings: [{ findingId: 'architecture-1', summary: 'Architecture observation.', evidenceRefs: ['source-runtime-1'] }],
        riskFindings: [{ findingId: 'risk-1', severity: 'LOW', summary: 'Risk observation.', evidenceRefs: ['source-runtime-1'] }],
        technicalDebt: [{ findingId: 'debt-1', summary: 'Debt observation.', evidenceRefs: ['source-runtime-1'] }],
        limitations: ['No external verification.'],
      },
    }),
  };
  const outcome = createAdapter(overconfidentPort).invoke(createRequest());

  assert.equal(outcome.status, 'FAILURE');
  assert.equal(outcome.failure?.category, 'OUTPUT_INVALID');
});

test('CA-08c preserves canonical evidence when a port attempts mutation', () => {
  const mutatingPort: CodeAnalysisInvocationPort = {
    invoke: (invocation) => {
      assert.throws(() => {
        (invocation.evidence as Array<{ reference?: string }>)[0]!.reference = 'unapproved-source';
      }, TypeError);
      return new DeterministicCodeAnalysisAssistant(() => NOW).invoke(invocation);
    },
  };
  const outcome = createAdapter(mutatingPort).invoke(createRequest());

  assert.equal(outcome.status, 'SUCCESS');
  assert.equal(outcome.evidence[0]?.reference, 'source-runtime-1');
});

test('CA-08d rejects a port that returns duplicate evidence instead of the canonical evidence set', () => {
  const duplicateEvidencePort: CodeAnalysisInvocationPort = {
    invoke: (invocation) => {
      const outcome = new DeterministicCodeAnalysisAssistant(() => NOW).invoke(invocation);
      const duplicated = [invocation.evidence[0]!, invocation.evidence[0]!];
      return { ...outcome, evidence: duplicated, result: { ...outcome.result!, evidence: duplicated } };
    },
  };
  const request = createRequest({
    authorizedCodeContexts: [
      ...createRequest().authorizedCodeContexts,
      { sourceRef: 'source-runtime-2', location: 'runtime/other.ts', content: 'export const other = true;', versionRef: 'v2' },
    ],
    executionContext: { ...createRequest().executionContext, allowedContextRefs: ['source-runtime-1', 'source-runtime-2'] },
  });
  const outcome = createAdapter(duplicateEvidencePort).invoke(request);

  assert.equal(outcome.status, 'FAILURE');
  assert.equal(outcome.failure?.category, 'OUTPUT_INVALID');
});

test('CA-08e permits short ordinary code context without treating a common character as a source leak', () => {
  const outcome = createAdapter().invoke(createRequest({
    authorizedCodeContexts: [{ ...createRequest().authorizedCodeContexts[0]!, content: 'a' }],
  }));

  assert.equal(outcome.status, 'SUCCESS');
});

test('CA-08f normalises a non-successful port result into a controlled execution failure', () => {
  const failingPort: CodeAnalysisInvocationPort = {
    invoke: () => ({
      status: 'BLOCKED', evidence: [], confidence: 'L4', timestamp: NOW,
      usage: { tokenUsed: 99, toolUsed: 99, timeUsedMs: 99, costUsed: 99 },
    }),
  };
  const outcome = createAdapter(failingPort).invoke(createRequest());

  assert.equal(outcome.status, 'FAILURE');
  assert.equal(outcome.failure?.category, 'EXECUTION_FAILED');
  assert.deepEqual(outcome.usage, { tokenUsed: 0, toolUsed: 0, timeUsedMs: 0, costUsed: 0 });
});

test('CA-08g accepts a repository context without a revision reference', () => {
  const outcome = createAdapter().invoke(createRequest({
    repositoryContext: { repositoryRef: 'repo-ai-cto', revisionRef: undefined },
  }));

  assert.equal(outcome.status, 'SUCCESS');
});

test('CA-08h rejects a port result that leaks a nontrivial source body through an identifier', () => {
  const sourceContent = 'private-source-body-must-not-appear';
  const leakingPort: CodeAnalysisInvocationPort = {
    invoke: (invocation) => {
      const outcome = new DeterministicCodeAnalysisAssistant(() => NOW).invoke(invocation);
      return { ...outcome, result: { ...outcome.result!, resultRef: sourceContent } };
    },
  };
  const outcome = createAdapter(leakingPort).invoke(createRequest({
    authorizedCodeContexts: [{ ...createRequest().authorizedCodeContexts[0]!, content: sourceContent }],
  }));

  assert.equal(outcome.status, 'FAILURE');
  assert.equal(outcome.failure?.category, 'OUTPUT_INVALID');
});

test('CA-09 writes complete audit evidence for success and preflight rejection', () => {
  const repository = new InMemoryAuditRepository();
  const service = new CodeAnalysisCapabilityRuntimeService(createAdapter(), new AuditService(repository), () => NOW);
  const succeeded = service.execute(createRequest());
  const blocked = service.execute(createRequest({ cancelled: true }));

  assert.equal(succeeded.auditEvent.workflowId, 'workflow-code-analysis-1');
  assert.equal(succeeded.auditEvent.outputRef, succeeded.outcome.result?.resultRef);
  assert.equal(blocked.auditEvent.failureReason, 'CANCELLED');
  assert.equal(repository.listByWorkflowId('workflow-code-analysis-1').length, 2);
});

test('CA-10 passes immutable in-memory scope and does not expose external side effects', () => {
  let received: CodeAnalysisInvocationRequest | undefined;
  const observingPort: CodeAnalysisInvocationPort = {
    invoke: (invocation) => {
      received = invocation;
      return new DeterministicCodeAnalysisAssistant(() => NOW).invoke(invocation);
    },
  };
  const source = createRequest().authorizedCodeContexts[0]!;
  const outcome = createAdapter(observingPort).invoke(createRequest({
    authorizedCodeContexts: [{ ...source, content: 'private-value-must-not-appear' }],
  }));

  assert.equal(outcome.status, 'SUCCESS');
  assert.ok(Object.isFrozen(received?.request));
  assert.ok(Object.isFrozen(received?.request.authorizedCodeContexts));
  assert.ok(Object.isFrozen(received?.request.authorizedCodeContexts[0]));
  assert.ok(Object.isFrozen(received?.request.executionContext));
  assert.ok(Object.isFrozen(received?.request.executionContext.allowedContextRefs));
  assert.throws(() => {
    (received!.request.authorizedCodeContexts as Array<{ content: string }>)[0]!.content = 'attempted-mutation';
  }, TypeError);
  assert.throws(() => {
    (received!.request.executionContext.allowedContextRefs as string[]).push('unapproved-source');
  }, TypeError);
  assert.throws(() => {
    (received!.request.executionContext as { intentRef: string }).intentRef = 'mutated-intent';
  }, TypeError);
  assert.doesNotMatch(outcome.result?.analysisReport ?? '', /private-value-must-not-appear/);
  assert.deepEqual(CODE_ANALYSIS_OPERATIONS, ['ANALYZE_READ_ONLY_CODE']);
});
