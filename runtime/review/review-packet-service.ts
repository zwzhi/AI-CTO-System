import { createHash } from 'node:crypto';

import type {
  ReviewPacket,
  ReviewPacketFreshnessResult,
  ReviewPacketInput,
  ReviewPacketObservation,
  ReviewProfileId,
} from './review-contract.ts';

const PROFILE_IDS = new Set<ReviewProfileId>([
  'FUNCTIONAL_BUSINESS',
  'COMPATIBILITY_REGRESSION',
  'SECURITY_ACCESS',
  'PERFORMANCE_RESOURCES',
  'DATA_CONTRACT',
  'STATE_CONCURRENCY',
  'TEST_DELIVERY',
]);

function nonBlank(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new TypeError(`${field} must be a non-blank string`);
  }
  return value.trim();
}

function sortedUnique(values: readonly string[], field: string): readonly string[] {
  if (!Array.isArray(values) || values.some(value => typeof value !== 'string' || value.trim().length === 0)) {
    throw new TypeError(`${field} must contain non-blank strings`);
  }
  return Object.freeze([...new Set(values.map(value => value.trim().replaceAll('\\', '/')))].sort());
}

function profiles(values: readonly ReviewProfileId[]): readonly ReviewProfileId[] {
  if (!Array.isArray(values) || values.some(value => !PROFILE_IDS.has(value))) {
    throw new TypeError('profiles contains an unsupported profile');
  }
  return Object.freeze([...new Set(values)].sort());
}

function sensitivePath(path: string): boolean {
  const lower = path.toLowerCase();
  return lower === '.env'
    || lower.startsWith('.env.')
    || lower.includes('/.env.')
    || /(^|\/)(secret|secrets|credential|credentials)(\/|\.|$)/.test(lower)
    || lower.endsWith('.pem')
    || lower.endsWith('.key');
}

function packetHash(payload: unknown): string {
  return `sha256:${createHash('sha256').update(JSON.stringify(payload)).digest('hex')}`;
}

export class ReviewPacketService {
  create(input: ReviewPacketInput): ReviewPacket {
    const boundary = nonBlank(input.boundary, 'boundary');
    const phase = nonBlank(input.phase, 'phase') as ReviewPacket['phase'];
    const baselineCommit = nonBlank(input.baselineCommit, 'baselineCommit');
    const headCommit = nonBlank(input.headCommit, 'headCommit');
    const diffSha256 = nonBlank(input.diffSha256, 'diffSha256');
    const changedFiles = sortedUnique(input.changedFiles, 'changedFiles');
    const relatedFiles = sortedUnique(input.relatedFiles, 'relatedFiles');
    const validations = sortedUnique(input.validations, 'validations');
    const constraints = sortedUnique(input.constraints, 'constraints');
    const selectedProfiles = profiles(input.profiles);

    const excludedFiles: { readonly path: string; readonly reason: string }[] = [];
    const untrackedFiles = sortedUnique(input.untrackedFiles ?? [], 'untrackedFiles').filter(path => {
      if (!sensitivePath(path)) {
        return true;
      }
      excludedFiles.push(Object.freeze({ path, reason: 'sensitive-path' }));
      return false;
    });

    const payload = {
      schemaVersion: '1.0',
      boundary,
      phase,
      profiles: selectedProfiles,
      baselineCommit,
      headCommit,
      diffSha256,
      changedFiles,
      relatedFiles,
      untrackedFiles: Object.freeze(untrackedFiles),
      excludedFiles: Object.freeze(excludedFiles),
      validations,
      constraints,
    };

    return Object.freeze({
      ...payload,
      packetSha256: packetHash(payload),
      untrackedFiles: Object.freeze([...untrackedFiles]),
      excludedFiles: Object.freeze([...excludedFiles]),
    });
  }

  isCurrent(packet: ReviewPacket, observation: ReviewPacketObservation): ReviewPacketFreshnessResult {
    const fields: readonly (keyof ReviewPacketObservation)[] = ['baselineCommit', 'headCommit', 'diffSha256'];
    const captured = fields.filter(field => observation[field] !== undefined && observation[field]?.trim().length !== 0);
    if (captured.length === 0) {
      return { status: 'NOT_CAPTURED', reason: 'Current baseline or diff fingerprint was not captured.' };
    }
    if (captured.some(field => observation[field] !== packet[field])) {
      return { status: 'STALE', reason: 'The observed baseline or diff fingerprint differs from the packet.' };
    }
    if (captured.length !== fields.length) {
      return { status: 'NOT_CAPTURED', reason: 'The packet was not compared with a complete baseline and diff observation.' };
    }
    return { status: 'CURRENT', reason: 'The observed baseline and diff match the packet.' };
  }
}
