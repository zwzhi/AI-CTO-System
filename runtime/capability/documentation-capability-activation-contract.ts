export const DOCUMENTATION_CAPABILITY_ID = 'CAP-DOC-0001' as const;
export const DOCUMENTATION_CAPABILITY_VERSION = '1.0.0-internal' as const;

export type DocumentationCapabilityRegistryStatus =
  | 'DISCOVERED'
  | 'EVALUATING'
  | 'ACTIVE'
  | 'DEPRECATED'
  | 'DISABLED'
  | 'REMOVED';

export interface DocumentationCapabilityActivationSnapshot {
  readonly capabilityId: typeof DOCUMENTATION_CAPABILITY_ID;
  readonly version: typeof DOCUMENTATION_CAPABILITY_VERSION;
  readonly registryStatus: DocumentationCapabilityRegistryStatus;
  readonly sourceCommit: '9876764';
  readonly allowedOperations: readonly ['GENERATE_DRAFT'];
  readonly allowedEnvironment: 'INTERNAL_LOCAL';
  readonly activationScope: readonly string[];
  readonly lastReviewAt: string;
  readonly nextReviewAt: string;
}
