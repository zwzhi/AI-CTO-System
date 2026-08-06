import type { DocumentationCapabilityActivationSnapshot } from './documentation-capability-activation-contract.ts';

export interface DocumentationCapabilityActivationPort {
  getById(capabilityId: string): DocumentationCapabilityActivationSnapshot | undefined;
}
