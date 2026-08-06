import { createHash } from 'node:crypto';

import type { AuthorizedDocumentationSource } from '../capability/documentation-execution-contract.ts';

function sha256(value: string): string {
  return createHash('sha256').update(value, 'utf8').digest('hex');
}

export function createDocumentationSourceScopeFingerprint(
  sources: readonly AuthorizedDocumentationSource[],
): string {
  if (sources.length === 0) {
    throw new TypeError('At least one authorized source is required.');
  }

  const sourceRefs = new Set<string>();
  const canonicalSources = sources.map((source) => {
    if (source.sourceRef.trim().length === 0) {
      throw new TypeError('Authorized sourceRef cannot be blank.');
    }
    if (sourceRefs.has(source.sourceRef)) {
      throw new TypeError(`Duplicate authorized sourceRef: ${source.sourceRef}`);
    }
    if (source.location.trim().length === 0) {
      throw new TypeError('Authorized source location cannot be blank.');
    }
    if (source.content.trim().length === 0) {
      throw new TypeError('Authorized source content cannot be blank.');
    }

    sourceRefs.add(source.sourceRef);
    return {
      sourceRef: source.sourceRef,
      location: source.location,
      versionRef: source.versionRef ?? null,
      contentHash: sha256(source.content),
    };
  });

  canonicalSources.sort((left, right) => left.sourceRef.localeCompare(right.sourceRef));
  return sha256(JSON.stringify(canonicalSources));
}
