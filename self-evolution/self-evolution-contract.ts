import type { AuditEvent, ConfidenceLevel, Evidence } from '../runtime/models/runtime-types.ts';

export type OptimizationActionType = 'ADD' | 'MODIFY' | 'MERGE' | 'DEPRECATE' | 'REMOVE' | 'SIMPLIFY';
export type OptimizationRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface SnapshotSource {
  readonly sourceRef: string;
  readonly capturedAt: string;
}

export interface RuntimeSnapshot {
  readonly source: SnapshotSource;
  readonly taskCount: number;
  readonly totalDurationMs: number;
  readonly tokenUsed: number;
  readonly costUsed: number;
}

export interface AuditSnapshot {
  readonly source: SnapshotSource;
  readonly events: readonly AuditEvent[];
}

export interface EvidenceSnapshot {
  readonly source: SnapshotSource;
  readonly evidence: readonly Evidence[];
}

export interface CapabilitySnapshotRecord {
  readonly capabilityId: string;
  readonly usageCount: number;
  readonly successfulInvocations: number;
  readonly failedInvocations: number;
  readonly maintenanceCostSignal: 'LOW' | 'MEDIUM' | 'HIGH';
  readonly evidenceRefs: readonly string[];
}

export interface CapabilitySnapshot {
  readonly source: SnapshotSource;
  readonly records: readonly CapabilitySnapshotRecord[];
}

export interface SelfEvolutionSnapshotInput {
  readonly runtimeSnapshot: RuntimeSnapshot;
  readonly auditSnapshot: AuditSnapshot;
  readonly evidenceSnapshot: EvidenceSnapshot;
  readonly capabilitySnapshot: CapabilitySnapshot;
}

export interface FailureObservation {
  readonly eventType: string;
  readonly count: number;
  readonly evidenceRefs: readonly string[];
}

export interface CapabilitySignal {
  readonly capabilityId: string;
  readonly usageCount: number;
  readonly maintenanceCostSignal: 'LOW' | 'MEDIUM' | 'HIGH';
  readonly evidenceRefs: readonly string[];
}

export interface SelfObservation {
  readonly sourceRefs: readonly string[];
  readonly observedAuditEventCount: number;
  readonly failuresByEventType: readonly FailureObservation[];
  readonly capabilitySignals: readonly CapabilitySignal[];
  readonly evidenceById: Readonly<Record<string, Evidence>>;
  readonly limitations: readonly string[];
}

export type { AuditEvent, ConfidenceLevel, Evidence };
