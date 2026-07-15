import { createHash } from 'node:crypto';
import { lstatSync, readFileSync, realpathSync } from 'node:fs';
import { resolve, relative } from 'node:path';
export type BeforeSnapshot = { target: string; content: string; hash: string; reference: string };
export function preflightTarget(projectRoot: string, target: string, expectedHash?: string): BeforeSnapshot {
  const root = realpathSync(projectRoot);
  const file = resolve(root, target);
  if (relative(root, file).startsWith('..') || !file.endsWith('.md')) throw new Error('Target is outside the allowed markdown scope.');
  const stat = lstatSync(file);
  if (stat.isSymbolicLink() || !stat.isFile()) throw new Error('Target must be a regular file.');
  const content = readFileSync(file, 'utf8');
  const hash = createHash('sha256').update(content).digest('hex');
  if (expectedHash !== undefined && expectedHash !== hash) throw new Error('Target content drift detected.');
  return { target, content, hash, reference: `sha256:${hash}` };
}
