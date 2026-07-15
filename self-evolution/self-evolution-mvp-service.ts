import type { SelfEvolutionMvpResult, SelfEvolutionSnapshotInput } from './self-evolution-contract.ts';
import { OptimizationProposalGenerator } from './optimization-proposal-generator.ts';
import { SelfObservationService } from './self-observation-service.ts';
import { ValueComplexityAnalysisService } from './value-complexity-analysis-service.ts';

export class SelfEvolutionMvpService {
  private readonly observer = new SelfObservationService();
  private readonly analyzer = new ValueComplexityAnalysisService();
  private readonly generator = new OptimizationProposalGenerator();

  evaluate(input: SelfEvolutionSnapshotInput): SelfEvolutionMvpResult {
    const observation = this.observer.observe(input);
    const analyses = this.analyzer.analyze(observation);
    return { observation, analyses, proposals: this.generator.generate(observation, analyses) };
  }
}
