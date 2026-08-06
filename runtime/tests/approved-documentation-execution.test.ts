import test from 'node:test';
import assert from 'node:assert/strict';

import type { AuthorizedDocumentationSource } from '../capability/documentation-execution-contract.ts';
import type { DocumentationCapabilityActivationSnapshot } from '../capability/documentation-capability-activation-contract.ts';
import { InMemoryDocumentationCapabilityActivationRepository } from '../capability/in-memory-documentation-capability-activation-repository.ts';
import { createDocumentationSourceScopeFingerprint } from '../integration/documentation-source-scope-fingerprint.ts';

const NOW = '2026-08-06T00:00:00.000Z';

function activeSnapshot(): DocumentationCapabilityActivationSnapshot {
  return {
    capabilityId: 'CAP-DOC-0001',
    version: '1.0.0-internal',
    registryStatus: 'ACTIVE',
    sourceCommit: '9876764',
    allowedOperations: ['GENERATE_DRAFT'],
    allowedEnvironment: 'INTERNAL_LOCAL',
    activationScope: [
      'INTERNAL_NON_PRODUCTION',
      'EXPLICIT_CONFIRMATION_REQUIRED',
      'AUTHORIZED_IN_MEMORY_SOURCES_ONLY',
      'DRAFT_OUTPUT_ONLY',
      'NO_FILESYSTEM_NETWORK_PROVIDER_TOOL_OR_KNOWLEDGE_WRITE',
    ],
    lastReviewAt: NOW,
    nextReviewAt: '2026-09-05T00:00:00.000Z',
  };
}

function sourceA(): AuthorizedDocumentationSource {
  return {
    sourceRef: 'source-a',
    location: 'docs/source-a.md',
    content: '# Source A\nEvidence A.',
    versionRef: 'v1',
  };
}

function sourceB(): AuthorizedDocumentationSource {
  return {
    sourceRef: 'source-b',
    location: 'docs/source-b.md',
    content: '# Source B\nEvidence B.',
    versionRef: 'v3',
  };
}

test('AD-01 activation repository returns only immutable trusted projections', () => {
  const repository = new InMemoryDocumentationCapabilityActivationRepository(activeSnapshot());
  const first = repository.getById('CAP-DOC-0001')!;

  assert.equal(first.registryStatus, 'ACTIVE');
  assert.equal(Object.isFrozen(first), true);
  assert.equal(Object.isFrozen(first.activationScope), true);
  assert.equal(repository.getById('CAP-DOC-9999'), undefined);
  assert.notEqual(repository.getById('CAP-DOC-0001'), first);
});

test('AD-02 source fingerprint is deterministic and source-order independent', () => {
  const left = createDocumentationSourceScopeFingerprint([sourceB(), sourceA()]);
  const right = createDocumentationSourceScopeFingerprint([sourceA(), sourceB()]);

  assert.equal(left, right);
  assert.match(left, /^[a-f0-9]{64}$/);
});

test('AD-03 source fingerprint changes for content, location, or version drift', () => {
  const baseline = createDocumentationSourceScopeFingerprint([sourceA()]);
  const changedSources: AuthorizedDocumentationSource[] = [
    { ...sourceA(), content: 'changed' },
    { ...sourceA(), location: 'docs/other.md' },
    { ...sourceA(), versionRef: 'v2' },
  ];

  for (const source of changedSources) {
    assert.notEqual(createDocumentationSourceScopeFingerprint([source]), baseline);
  }
});

test('AD-04 source fingerprint rejects empty, duplicate, and blank source fields', () => {
  assert.throws(() => createDocumentationSourceScopeFingerprint([]), TypeError);
  assert.throws(() => createDocumentationSourceScopeFingerprint([sourceA(), sourceA()]), TypeError);
  assert.throws(
    () => createDocumentationSourceScopeFingerprint([{ ...sourceA(), content: ' ' }]),
    TypeError,
  );
});
