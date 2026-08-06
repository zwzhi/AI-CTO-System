import {
  DOCUMENTATION_CAPABILITY_ID,
  DOCUMENTATION_CAPABILITY_VERSION,
  type DocumentationCapabilityActivationSnapshot,
} from './documentation-capability-activation-contract.ts';
import type { DocumentationCapabilityActivationPort } from './documentation-capability-activation-port.ts';

const SOURCE_COMMIT = '9876764' as const;

function isCanonicalIsoTimestamp(value: string): boolean {
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) && new Date(timestamp).toISOString() === value;
}

function validateSnapshot(snapshot: DocumentationCapabilityActivationSnapshot): void {
  if (snapshot.capabilityId !== DOCUMENTATION_CAPABILITY_ID) {
    throw new TypeError('Unexpected Documentation Capability ID.');
  }
  if (snapshot.version !== DOCUMENTATION_CAPABILITY_VERSION) {
    throw new TypeError('Unexpected Documentation Capability version.');
  }
  if (snapshot.sourceCommit !== SOURCE_COMMIT) {
    throw new TypeError('Unexpected Documentation Capability source commit.');
  }
  if (
    snapshot.allowedOperations.length !== 1 ||
    snapshot.allowedOperations[0] !== 'GENERATE_DRAFT'
  ) {
    throw new TypeError('Documentation Capability may only generate drafts.');
  }
  if (snapshot.allowedEnvironment !== 'INTERNAL_LOCAL') {
    throw new TypeError('Documentation Capability environment must be INTERNAL_LOCAL.');
  }
  if (
    snapshot.activationScope.length === 0 ||
    snapshot.activationScope.some((entry) => entry.trim().length === 0) ||
    new Set(snapshot.activationScope).size !== snapshot.activationScope.length
  ) {
    throw new TypeError('Documentation Capability activation scope must be nonempty and unique.');
  }
  if (!isCanonicalIsoTimestamp(snapshot.lastReviewAt) || !isCanonicalIsoTimestamp(snapshot.nextReviewAt)) {
    throw new TypeError('Documentation Capability review dates must be canonical ISO timestamps.');
  }
  if (Date.parse(snapshot.nextReviewAt) <= Date.parse(snapshot.lastReviewAt)) {
    throw new TypeError('Documentation Capability next review must follow its last review.');
  }
}

function cloneAndFreeze(
  snapshot: DocumentationCapabilityActivationSnapshot,
): DocumentationCapabilityActivationSnapshot {
  return Object.freeze({
    ...snapshot,
    allowedOperations: Object.freeze([...snapshot.allowedOperations]) as readonly ['GENERATE_DRAFT'],
    activationScope: Object.freeze([...snapshot.activationScope]),
  });
}

export class InMemoryDocumentationCapabilityActivationRepository
  implements DocumentationCapabilityActivationPort
{
  readonly #snapshot: DocumentationCapabilityActivationSnapshot;

  constructor(snapshot: DocumentationCapabilityActivationSnapshot) {
    validateSnapshot(snapshot);
    this.#snapshot = cloneAndFreeze(snapshot);
  }

  getById(capabilityId: string): DocumentationCapabilityActivationSnapshot | undefined {
    if (capabilityId !== this.#snapshot.capabilityId) {
      return undefined;
    }
    return cloneAndFreeze(this.#snapshot);
  }
}
