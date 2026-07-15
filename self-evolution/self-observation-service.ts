import type {
  AuditEvent,
  CapabilitySignal,
  CapabilitySnapshotRecord,
  Evidence,
  FailureObservation,
  SelfEvolutionSnapshotInput,
  SelfObservation,
  SnapshotSource,
} from './self-evolution-contract.ts';

export class SelfEvolutionInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SelfEvolutionInputError';
  }
}

export class SelfObservationService {
  observe(input: SelfEvolutionSnapshotInput): SelfObservation {
    const sourceRefs = validateSources(input);
    validateRuntimeMetrics(input);
    const evidenceById = collectEvidence(input.evidenceSnapshot.evidence);
    validateAuditEvidenceReferences(input.auditSnapshot.events, evidenceById);
    validateCapabilityRecords(input.capabilitySnapshot.records, evidenceById);

    const failuresByEventType = collectFailures(input.auditSnapshot.events);
    const capabilitySignals = collectCapabilitySignals(input.capabilitySnapshot.records);

    return Object.freeze({
      sourceRefs: Object.freeze(sourceRefs),
      observedAuditEventCount: input.auditSnapshot.events.length,
      failuresByEventType: Object.freeze(failuresByEventType),
      capabilitySignals: Object.freeze(capabilitySignals),
      evidenceById,
      limitations: Object.freeze(['Observation is bounded to caller-supplied snapshot records.']),
    });
  }
}

function validateSources(input: SelfEvolutionSnapshotInput): string[] {
  const sources: readonly SnapshotSource[] = [
    input.runtimeSnapshot.source,
    input.auditSnapshot.source,
    input.evidenceSnapshot.source,
    input.capabilitySnapshot.source,
  ];
  const sourceRefs = sources.map((source) => {
    if (!isNonBlankString(source.sourceRef) || !isIsoTimestamp(source.capturedAt)) {
      throw new SelfEvolutionInputError('Invalid snapshot source: sourceRef must be non-blank and capturedAt must be an ISO timestamp.');
    }
    return source.sourceRef;
  });

  if (new Set(sourceRefs).size !== sourceRefs.length) {
    throw new SelfEvolutionInputError('Snapshot source references must be distinct.');
  }
  return sourceRefs;
}

function validateRuntimeMetrics(input: SelfEvolutionSnapshotInput): void {
  const metrics = [
    input.runtimeSnapshot.taskCount,
    input.runtimeSnapshot.totalDurationMs,
    input.runtimeSnapshot.tokenUsed,
    input.runtimeSnapshot.costUsed,
  ];
  if (metrics.some((metric) => !isNonNegativeFiniteNumber(metric))) {
    throw new SelfEvolutionInputError('Runtime snapshot metrics must be non-negative finite numbers.');
  }
}

function collectEvidence(evidence: readonly Evidence[]): Readonly<Record<string, Evidence>> {
  const evidenceById: Record<string, Evidence> = Object.create(null);
  for (const item of evidence) {
    if (!isNonBlankString(item.evidenceId)) {
      throw new SelfEvolutionInputError('Evidence IDs must be non-blank.');
    }
    if (Object.hasOwn(evidenceById, item.evidenceId)) {
      throw new SelfEvolutionInputError(`Duplicate Evidence ID: ${item.evidenceId}.`);
    }
    evidenceById[item.evidenceId] = Object.freeze({ ...item });
  }
  return Object.freeze(evidenceById);
}

function validateAuditEvidenceReferences(events: readonly AuditEvent[], evidenceById: Readonly<Record<string, Evidence>>): void {
  for (const event of events) {
    for (const evidence of event.evidence) {
      assertEvidenceReference(evidence.evidenceId, evidenceById);
    }
  }
}

function validateCapabilityRecords(records: readonly CapabilitySnapshotRecord[], evidenceById: Readonly<Record<string, Evidence>>): void {
  const capabilityIds = new Set<string>();
  for (const record of records) {
    if (!isNonBlankString(record.capabilityId)) {
      throw new SelfEvolutionInputError('Capability IDs must be non-blank.');
    }
    if (capabilityIds.has(record.capabilityId)) {
      throw new SelfEvolutionInputError('Capability IDs must be distinct.');
    }
    capabilityIds.add(record.capabilityId);
    for (const evidenceRef of record.evidenceRefs) {
      assertEvidenceReference(evidenceRef, evidenceById);
    }
  }
}

function assertEvidenceReference(evidenceId: string, evidenceById: Readonly<Record<string, Evidence>>): void {
  if (!Object.hasOwn(evidenceById, evidenceId)) {
    throw new SelfEvolutionInputError(`Evidence reference is absent from EvidenceSnapshot: ${evidenceId}.`);
  }
}

function collectFailures(events: readonly AuditEvent[]): FailureObservation[] {
  const failures = new Map<string, { count: number; evidenceRefs: Set<string> }>();
  for (const event of events) {
    if (event.status !== 'FAILED' && event.status !== 'FAILURE') continue;

    const failure = failures.get(event.eventType) ?? { count: 0, evidenceRefs: new Set<string>() };
    failure.count += 1;
    for (const evidence of event.evidence) failure.evidenceRefs.add(evidence.evidenceId);
    failures.set(event.eventType, failure);
  }
  return [...failures].map(([eventType, failure]) => Object.freeze({
    eventType,
    count: failure.count,
    evidenceRefs: Object.freeze([...failure.evidenceRefs]),
  }));
}

function collectCapabilitySignals(records: readonly CapabilitySnapshotRecord[]): CapabilitySignal[] {
  return records.map((record) => Object.freeze({
    capabilityId: record.capabilityId,
    usageCount: record.usageCount,
    maintenanceCostSignal: record.maintenanceCostSignal,
    evidenceRefs: Object.freeze([...new Set(record.evidenceRefs)]),
  }));
}

function isNonBlankString(value: string): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}

function isNonNegativeFiniteNumber(value: number): boolean {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

function isIsoTimestamp(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d{1,9})?(Z|[+-]\d{2}:\d{2})$/.exec(value);
  if (!match) return false;

  const [, year, month, day, hour, minute, second, timezone] = match;
  const numericMonth = Number(month);
  const numericDay = Number(day);
  const numericHour = Number(hour);
  const numericMinute = Number(minute);
  const numericSecond = Number(second);
  const maximumDay = new Date(Date.UTC(Number(year), numericMonth, 0)).getUTCDate();
  if (numericMonth < 1 || numericMonth > 12 || numericDay < 1 || numericDay > maximumDay) return false;
  if (numericHour > 23 || numericMinute > 59 || numericSecond > 59) return false;
  if (timezone === 'Z') return true;

  const [, timezoneHour, timezoneMinute] = /[+-](\d{2}):(\d{2})/.exec(timezone) ?? [];
  return Number(timezoneHour) <= 23 && Number(timezoneMinute) <= 59;
}
