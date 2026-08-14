import type { AuditEvent, Evidence } from '../models/runtime-types.ts';
import type { RoutingRecommendation, RoutingRequest } from '../routing/execution-routing-contract.ts';
import { TaskExecutionEnvelopeService } from '../task/task-execution-envelope-service.ts';
import type { TaskCheckpoint } from '../checkpoint/checkpoint-contract.ts';
import { CheckpointService } from '../checkpoint/checkpoint-service.ts';
import {
  HandoffError,
  type ControlledRuntimeHandoffRequest,
  type ControlledRuntimeHandoffResult,
  type HandoffRouterPort,
  type HandoffRuntimePort,
  type StructuredIntentClassificationResult,
} from './intent-runtime-handoff-contract.ts';
import { validateAndFreezeHandoffRequest } from './intent-runtime-handoff-validation.ts';

export interface ControlledRuntimeHandoffDependencies {
  readonly router: HandoffRouterPort;
  readonly runtime: HandoffRuntimePort;
  readonly checkpointService?: CheckpointService;
  readonly now?: () => string;
}

function cloneAndFreeze<T>(value: T): T {
  const clone = structuredClone(value);

  function freezeNested(candidate: unknown): void {
    if (candidate === null || typeof candidate !== 'object' || Object.isFrozen(candidate)) {
      return;
    }
    for (const nested of Object.values(candidate)) {
      freezeNested(nested);
    }
    Object.freeze(candidate);
  }

  freezeNested(clone);
  return clone;
}

function auditEvidence(events: readonly AuditEvent[]): readonly Evidence[] {
  return events.flatMap(event => event.evidence);
}

export class ControlledRuntimeHandoffService {
  readonly #router: HandoffRouterPort;
  readonly #runtime: HandoffRuntimePort;
  readonly #now: () => string;
  readonly #envelopeService: TaskExecutionEnvelopeService;
  readonly #checkpointService?: CheckpointService;

  constructor(dependencies: ControlledRuntimeHandoffDependencies) {
    this.#router = dependencies.router;
    this.#runtime = dependencies.runtime;
    this.#now = dependencies.now ?? (() => new Date().toISOString());
    this.#envelopeService = new TaskExecutionEnvelopeService({ now: this.#now });
    this.#checkpointService = dependencies.checkpointService;
  }

  handoff(request: ControlledRuntimeHandoffRequest): ControlledRuntimeHandoffResult {
    const snapshot = validateAndFreezeHandoffRequest(request);
    if (snapshot.checkpoint !== undefined && this.#checkpointService === undefined) {
      throw new HandoffError(
        'HANDOFF_INVARIANT_VIOLATION',
        'an explicit checkpoint requires a configured CheckpointService',
      );
    }
    const intent = snapshot.intentResult;

    if (intent.status !== 'CLASSIFIED' || !this.#isRoutingConfidence(intent.confidence)) {
      return this.#result({
        handoffDecision: 'INTENT_REJECTED',
        intentResult: intent,
        evidence: [this.#handoffEvidence(intent, 'Intent did not meet the controlled routing threshold.')],
        limitations: [
          'Intent was not routed because it was not CLASSIFIED at confidence L3 or L4.',
          'No execution authorization was created.',
          'No capability, tool, model, or agent was invoked.',
        ],
      });
    }

    const routingRequest: RoutingRequest = {
      routingId: `routing-${intent.classificationId}`,
      taskKind: intent.taskKind,
      complexity: intent.complexity,
      riskLevel: intent.riskLevel,
      reversibility: intent.reversibility,
      hasApplicableGate: intent.hasApplicableGate,
      requiresCurrentEvidence: intent.requiresCurrentEvidence,
      evidenceInputs: intent.evidenceInputs,
      evidenceObservations: intent.evidenceObservations,
    };
    const routing = this.#router.route(routingRequest);

    if (routing.decision === 'OUT_OF_SCOPE' || routing.decision === 'INSUFFICIENT_EVIDENCE') {
      return this.#result({
        handoffDecision: 'ROUTING_BLOCKED',
        intentResult: intent,
        routingRecommendation: routing,
        evidence: [
          ...routing.evidence,
          this.#handoffEvidence(intent, `Routing stopped with ${routing.decision}.`, routing.routingId),
        ],
        limitations: [
          ...routing.limitations,
          'Routing did not create a Runtime workflow.',
          'No execution authorization was created.',
          'No capability, tool, model, or agent was invoked.',
        ],
      });
    }

    let envelopeEvidence: readonly Evidence[] = [];
    if (intent.complexity !== 'L0' && intent.complexity !== 'L1') {
      if (snapshot.executionEnvelope === undefined) {
        return this.#result({
          handoffDecision: 'ENVELOPE_BLOCKED',
          intentResult: intent,
          routingRecommendation: routing,
          evidence: [
            ...routing.evidence,
            this.#handoffEvidence(
              intent,
              'L2-L4 handoff requires a validated Task Execution Envelope before runtime creation.',
            ),
          ],
          limitations: [
            ...routing.limitations,
            'Task Execution Envelope is required for L2-L4 work.',
            'Workflow and Task were not created.',
            'No execution authorization was created.',
            'No capability, tool, model, or agent was invoked.',
          ],
        });
      }

      const envelopeValidation = this.#envelopeService.validate(snapshot.executionEnvelope, routing, {
        taskRef: intent.classificationId,
        complexity: intent.complexity,
        riskLevel: intent.riskLevel,
      });
      if (envelopeValidation.status === 'BLOCKED') {
        return this.#result({
          handoffDecision: 'ENVELOPE_BLOCKED',
          intentResult: intent,
          routingRecommendation: routing,
          evidence: [
            ...routing.evidence,
            ...envelopeValidation.evidence,
            this.#handoffEvidence(
              intent,
              `Task Execution Envelope blocked handoff with ${envelopeValidation.reasonCode ?? 'UNKNOWN'}.`,
            ),
          ],
          limitations: [
            ...routing.limitations,
            'Task Execution Envelope validation stopped the handoff before runtime creation.',
            'Workflow and Task were not created.',
            'No execution authorization was created.',
            'No capability, tool, model, or agent was invoked.',
          ],
        });
      }
      envelopeEvidence = envelopeValidation.evidence;
    }

    const runtimeResult = this.#runtime.run(
      {
        intentRef: intent.classificationId,
        executionContext: snapshot.executionContext,
        controlMode: 'CONFIRM',
        budget: snapshot.budget,
      },
      {
        request: `handoff:v1:${JSON.stringify({
          routingId: routing.routingId,
          objective: intent.taskObjective,
        })}`,
      },
      { cancelled: snapshot.cancelled },
    );

    if (runtimeResult.capabilityInvocation !== undefined || runtimeResult.executionRecord !== undefined) {
      throw new HandoffError(
        'HANDOFF_INVARIANT_VIOLATION',
        'controlled handoff must not invoke a capability or create an execution record',
        { workflowState: runtimeResult.workflow.state },
      );
    }

    if (runtimeResult.workflow.state === 'CANCELLED') {
      const checkpoint = this.#appendCheckpoint(snapshot.checkpoint);
      return this.#result({
        handoffDecision: 'RUNTIME_BLOCKED',
        intentResult: intent,
        routingRecommendation: routing,
        checkpoint,
        workflow: runtimeResult.workflow,
        task: runtimeResult.task,
        auditEvents: runtimeResult.auditEvents,
        evidence: [
          ...routing.evidence,
          ...envelopeEvidence,
          ...auditEvidence(runtimeResult.auditEvents),
          this.#handoffEvidence(intent, 'Runtime guard blocked the controlled handoff.', routing.routingId),
        ],
        limitations: [
          ...routing.limitations,
          'Runtime stopped before approval because its guard denied the request.',
          'No execution authorization was created.',
          'No capability, tool, model, or agent was invoked.',
        ],
      });
    }

    if (runtimeResult.workflow.state !== 'WAITING_APPROVAL') {
      throw new HandoffError(
        'HANDOFF_INVARIANT_VIOLATION',
        'controlled handoff must stop at WAITING_APPROVAL',
        { workflowState: runtimeResult.workflow.state },
      );
    }

    const checkpoint = this.#appendCheckpoint(snapshot.checkpoint);
    return this.#result({
      handoffDecision: 'WAITING_APPROVAL',
      intentResult: intent,
      routingRecommendation: routing,
      checkpoint,
      workflow: runtimeResult.workflow,
      task: runtimeResult.task,
      auditEvents: runtimeResult.auditEvents,
      evidence: [
        ...routing.evidence,
        ...envelopeEvidence,
        ...auditEvidence(runtimeResult.auditEvents),
        this.#handoffEvidence(intent, 'Runtime created a controlled approval checkpoint.', routing.routingId),
      ],
      limitations: [
        ...routing.limitations,
        'Workflow is waiting for explicit approval before any execution.',
        'No execution authorization was created.',
        'No capability, tool, model, or agent was invoked.',
      ],
    });
  }

  #isRoutingConfidence(confidence: StructuredIntentClassificationResult['confidence']): boolean {
    return confidence === 'L3' || confidence === 'L4';
  }

  #handoffEvidence(
    intent: StructuredIntentClassificationResult,
    summary: string,
    reference: string = intent.classificationId,
  ): Evidence {
    return {
      evidenceId: `handoff-evidence-${reference}`,
      source: 'controlled-runtime-handoff',
      summary,
      confidence: 'L2',
      timestamp: this.#now(),
      reference,
    };
  }

  #appendCheckpoint(checkpoint: TaskCheckpoint | undefined): TaskCheckpoint | undefined {
    if (checkpoint === undefined) {
      return undefined;
    }
    if (this.#checkpointService === undefined) {
      throw new HandoffError(
        'HANDOFF_INVARIANT_VIOLATION',
        'an explicit checkpoint requires a configured CheckpointService',
      );
    }
    try {
      return this.#checkpointService.append(checkpoint);
    } catch (error) {
      throw new HandoffError(
        'HANDOFF_INVARIANT_VIOLATION',
        'explicit checkpoint could not be appended',
        { cause: error instanceof Error ? error.message : 'unknown checkpoint failure' },
      );
    }
  }

  #result(
    input: Omit<ControlledRuntimeHandoffResult, 'auditEvents'> & {
      readonly auditEvents?: readonly AuditEvent[];
    },
  ): ControlledRuntimeHandoffResult {
    return cloneAndFreeze({
      ...input,
      auditEvents: input.auditEvents ?? [],
    });
  }
}

