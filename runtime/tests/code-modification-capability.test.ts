import test from 'node:test';
import assert from 'node:assert/strict';

import { DeterministicCodeModificationAssistant } from '../capability/deterministic-code-modification-assistant.ts';
import {
  CODE_MODIFICATION_OPERATIONS,
  type CodeModificationInvocationRequest,
} from '../capability/code-modification-execution-contract.ts';

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
