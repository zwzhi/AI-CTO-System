import type { InMemoryMarkdownDocument, MarkdownOptimizerPort, OptimizationAction, OptimizedDocument } from './optimization-execution-contract.ts';

export class DeterministicMarkdownOptimizer implements MarkdownOptimizerPort {
  optimize(document: InMemoryMarkdownDocument, actions: readonly OptimizationAction[]): OptimizedDocument {
    let content = document.content;
    if (actions.includes('DEDUPLICATE_EXACT_BLOCKS')) content = content.split(/\n{2,}/).filter((block, index, blocks) => !block.trim() || index === 0 || block !== blocks[index - 1]).join('\n\n');
    if (actions.includes('NORMALIZE_FORMATTING')) content = content.replace(/\n{3,}/g, '\n\n');
    if (actions.includes('NORMALIZE_HEADINGS')) content = content.replace(/^(?:\s*\n)+(?=#)/, '');
    return { documentRef: document.documentRef, content, changed: content !== document.content };
  }
}
