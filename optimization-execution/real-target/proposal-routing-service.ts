const forbidden = ['manifesto', 'adr/', 'master_plan', 'module_registry', 'project_memory', 'development_progress', 'readme', 'runtime/', 'permission', 'security'];
export type RealTargetRequest = { proposalRef: string; riskAssessmentRef: string; autonomyDecision: string; target: string; action: 'NORMALIZE_FORMATTING' | 'DEDUPLICATE_EXACT_BLOCKS' | 'NORMALIZE_HEADINGS' };
export type RoutedRealTarget = RealTargetRequest & { state: 'WAITING_CONFIRMATION' };
export function routeRealTarget(request: RealTargetRequest): RoutedRealTarget {
  if (!request.proposalRef.trim() || !request.riskAssessmentRef.trim()) throw new Error('Proposal and risk references are required.');
  if (request.autonomyDecision !== 'AUTO_EXECUTE') throw new Error('Confirmation is required for this autonomy decision.');
  const target = request.target.replaceAll('\\', '/').toLowerCase();
  if (!target.endsWith('.md')) throw new Error('Only Markdown targets are allowed.');
  if (target.startsWith('/') || target.includes('../') || forbidden.some((item) => target.includes(item))) throw new Error('Forbidden real target.');
  return { ...request, state: 'WAITING_CONFIRMATION' };
}
