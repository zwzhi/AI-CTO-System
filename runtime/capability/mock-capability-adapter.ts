import type { CapabilityResult } from '../models/runtime-types.ts';
import type { CapabilityAdapterPort, CapabilityRequest } from './capability-adapter-port.ts';

export class MockCapabilityAdapter implements CapabilityAdapterPort {
  private readonly now: () => string;

  constructor(now: () => string = () => new Date().toISOString()) {
    this.now = now;
  }

  invoke(request: CapabilityRequest): CapabilityResult {
    const timestamp = this.now();
    const isFailure = request.input.mode === 'failure';
    const summary = isFailure ? 'mock capability failure' : 'mock capability success';

    return {
      status: isFailure ? 'FAILURE' : 'SUCCESS',
      output: isFailure ? '' : `mock result for ${request.input.request}`,
      evidence: [{
        evidenceId: `evidence-${request.taskId}`,
        source: 'mock-capability',
        summary,
        confidence: 'L3',
        timestamp,
      }],
      confidence: 'L3',
      timestamp,
      ...(isFailure ? { error: 'mock capability failed' } : {}),
    };
  }
}
