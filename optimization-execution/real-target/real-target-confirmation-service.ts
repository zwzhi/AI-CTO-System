import type { RoutedRealTarget } from './proposal-routing-service.ts';
export type RealTargetConfirmation = { proposalRef: string; target: string; action: RoutedRealTarget['action']; beforeHash: string; used: false };
export function bindConfirmation(request: RoutedRealTarget, beforeHash: string): RealTargetConfirmation {
  if (!beforeHash.trim()) throw new Error('Before snapshot hash is required.');
  return { proposalRef: request.proposalRef, target: request.target, action: request.action, beforeHash, used: false };
}
