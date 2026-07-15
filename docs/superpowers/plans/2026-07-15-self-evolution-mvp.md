# Self Evolution MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a read-only, deterministic Phase 10 loop that turns explicit snapshots into traceable optimization proposals without changing the AI CTO system.

**Architecture:** A standalone `self-evolution/` package consumes caller-supplied Runtime, Audit, Evidence, and Capability snapshots. An observer creates facts, a deterministic analyzer evaluates those facts, and a generator creates non-executable proposals. The package imports Runtime types for compatibility but never reads or changes Runtime internals.

**Tech Stack:** TypeScript, Node.js 24, `node:test`, no third-party dependencies.

## Global Constraints

- Accept only explicit in-memory snapshots; do not query Repository, filesystem, network, Provider, or database.
- Do not modify existing Runtime Core, Workflow, Task, Agent, Permission, Manifesto, ADR, lifecycle, Registry, or Knowledge.
- Do not persist data, execute proposals, activate a Capability, change a process, or delete an asset.
- Every proposal must carry evidence and `executionAuthorization: 'NONE'`.
- Use TDD and commit each independently testable task.

---

## Planned File Structure

- `self-evolution/self-evolution-contract.ts` — snapshot, observation, analysis, proposal, and result types.
- `self-evolution/self-observation-service.ts` — input validation and immutable fact extraction.
- `self-evolution/value-complexity-analysis-service.ts` — two fixed, explainable rules.
- `self-evolution/optimization-proposal-generator.ts` — evidence-backed, non-executable proposal construction.
- `self-evolution/self-evolution-mvp-service.ts` — one read-only orchestration entry point.
- `self-evolution/self-evolution-mvp.test.ts` — TDD tests for contracts, rules, and boundaries.
- `package.json` — registers the new test file in the existing `npm.cmd test` command.

### Task 1: Define Snapshot Contracts and Observe Facts

**Files:**

- Create: `self-evolution/self-evolution-contract.ts`
- Create: `self-evolution/self-observation-service.ts`
- Create: `self-evolution/self-evolution-mvp.test.ts`

**Consumes:** `AuditEvent`, `Evidence`, and `ConfidenceLevel` from `runtime/models/runtime-types.ts`.

**Produces:** `SelfEvolutionSnapshotInput`, `SelfObservation`, `FailureObservation`, `CapabilitySignal`, and `SelfEvolutionInputError`.

- [ ] **Step 1: Write failing tests for explicit read-only input**

```ts
test('SE-01 observes only the four supplied snapshots and preserves their content', () => {
  const input = createSnapshotInput();
  const expected = structuredClone(input);
  const result = new SelfObservationService().observe(input);

  assert.equal(result.sourceRefs.length, 4);
  assert.equal(result.observedAuditEventCount, 2);
  assert.equal(result.evidenceById['evidence-1']?.source, 'audit');
  assert.deepEqual(input, expected);
});

test('SE-02 rejects an invalid source or an audit evidence reference missing from EvidenceSnapshot', () => {
  assert.throws(() => new SelfObservationService().observe(withBlankRuntimeSource()), /snapshot source/i);
  assert.throws(() => new SelfObservationService().observe(withoutAuditEvidence()), /evidence/i);
});
```

- [ ] **Step 2: Run the focused test and confirm it fails**

Run: `node --experimental-strip-types --test self-evolution/self-evolution-mvp.test.ts`

Expected: FAIL because `self-observation-service.ts` and the contracts do not yet exist.

- [ ] **Step 3: Implement exact contracts and validation**

```ts
// self-evolution-contract.ts
import type { AuditEvent, ConfidenceLevel, Evidence } from '../runtime/models/runtime-types.ts';

export type OptimizationActionType = 'ADD' | 'MODIFY' | 'MERGE' | 'DEPRECATE' | 'REMOVE' | 'SIMPLIFY';
export type OptimizationRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';
export interface SnapshotSource { readonly sourceRef: string; readonly capturedAt: string; }
export interface RuntimeSnapshot { readonly source: SnapshotSource; readonly taskCount: number; readonly totalDurationMs: number; readonly tokenUsed: number; readonly costUsed: number; }
export interface AuditSnapshot { readonly source: SnapshotSource; readonly events: readonly AuditEvent[]; }
export interface EvidenceSnapshot { readonly source: SnapshotSource; readonly evidence: readonly Evidence[]; }
export interface CapabilitySnapshotRecord { readonly capabilityId: string; readonly usageCount: number; readonly successfulInvocations: number; readonly failedInvocations: number; readonly maintenanceCostSignal: 'LOW' | 'MEDIUM' | 'HIGH'; readonly evidenceRefs: readonly string[]; }
export interface CapabilitySnapshot { readonly source: SnapshotSource; readonly records: readonly CapabilitySnapshotRecord[]; }
export interface SelfEvolutionSnapshotInput { readonly runtimeSnapshot: RuntimeSnapshot; readonly auditSnapshot: AuditSnapshot; readonly evidenceSnapshot: EvidenceSnapshot; readonly capabilitySnapshot: CapabilitySnapshot; }
export interface FailureObservation { readonly eventType: string; readonly count: number; readonly evidenceRefs: readonly string[]; }
export interface CapabilitySignal { readonly capabilityId: string; readonly usageCount: number; readonly maintenanceCostSignal: 'LOW' | 'MEDIUM' | 'HIGH'; readonly evidenceRefs: readonly string[]; }
export interface SelfObservation { readonly sourceRefs: readonly string[]; readonly observedAuditEventCount: number; readonly failuresByEventType: readonly FailureObservation[]; readonly capabilitySignals: readonly CapabilitySignal[]; readonly evidenceById: Readonly<Record<string, Evidence>>; readonly limitations: readonly string[]; }
export type { AuditEvent, ConfidenceLevel, Evidence };
```

```ts
// self-observation-service.ts
export class SelfEvolutionInputError extends Error {}
export class SelfObservationService {
  observe(input: SelfEvolutionSnapshotInput): SelfObservation {
    // Validate four distinct non-blank sourceRef values and ISO timestamps.
    // Reject negative/non-finite Runtime metrics, duplicate Evidence IDs, blank capability IDs,
    // and references absent from EvidenceSnapshot.
    // Group only AuditEvent statuses FAILED or FAILURE by eventType, deduplicating evidence IDs.
    // Return copied/frozen facts; do not invoke a repository or mutate input.
  }
}
```

Use only supplied snapshots. Validate each `CapabilitySnapshotRecord.evidenceRefs` and each `AuditEvent.evidence[].evidenceId` exists in `EvidenceSnapshot`. Return a limitation explicitly stating that the observation is bounded to caller-supplied records.

- [ ] **Step 4: Run focused and full tests**

Run: `node --experimental-strip-types --test self-evolution/self-evolution-mvp.test.ts && npm.cmd test`

Expected: `SE-01` and `SE-02` pass; all existing tests remain passing.

- [ ] **Step 5: Commit Task 1**

```bash
git add self-evolution/self-evolution-contract.ts self-evolution/self-observation-service.ts self-evolution/self-evolution-mvp.test.ts
git commit -m "feat: add self evolution observation"
```

### Task 2: Analyze Value and Complexity, Then Generate Proposals

**Files:**

- Modify: `self-evolution/self-evolution-contract.ts`
- Create: `self-evolution/value-complexity-analysis-service.ts`
- Create: `self-evolution/optimization-proposal-generator.ts`
- Modify: `self-evolution/self-evolution-mvp.test.ts`

**Consumes:** `SelfObservation` from Task 1.

**Produces:** `OptimizationAnalysis`, `OptimizationProposal`, `ValueComplexityAnalysisService.analyze`, and `OptimizationProposalGenerator.generate`.

- [ ] **Step 1: Write failing tests for both deterministic rules**

```ts
test('SE-03 creates an L3, evidence-backed MODIFY proposal for two failures of one event type', () => {
  const result = runMvp(withRepeatedFailures());
  const proposal = result.proposals[0]!;

  assert.equal(proposal.actionType, 'MODIFY');
  assert.equal(proposal.executionAuthorization, 'NONE');
  assert.equal(proposal.confidence, 'L3');
  assert.deepEqual(proposal.evidenceRefs, ['evidence-1', 'evidence-2']);
});

test('SE-04 creates only a DEPRECATE candidate for an unused capability with maintenance cost', () => {
  const proposal = runMvp(withUnusedCapability()).proposals[0]!;

  assert.equal(proposal.actionType, 'DEPRECATE');
  assert.match(proposal.recommendation, /human/i);
  assert.notEqual(proposal.actionType, 'REMOVE');
});

test('SE-05 leaves a single failure as L1 observation rather than a proposal', () => {
  const result = runMvp(withOneFailure());

  assert.equal(result.proposals.length, 0);
  assert.equal(result.analyses[0]!.confidence, 'L1');
});
```

- [ ] **Step 2: Run the focused test and confirm it fails**

Run: `node --experimental-strip-types --test self-evolution/self-evolution-mvp.test.ts`

Expected: FAIL because analysis and proposal modules do not yet exist.

- [ ] **Step 3: Implement fixed, explainable rule contracts**

```ts
export interface OptimizationAnalysis {
  readonly analysisId: string;
  readonly actionType: 'MODIFY' | 'DEPRECATE';
  readonly problem: string;
  readonly currentState: string;
  readonly valueScore: number;
  readonly complexityScore: number;
  readonly riskLevel: OptimizationRiskLevel;
  readonly confidence: ConfidenceLevel;
  readonly evidenceRefs: readonly string[];
  readonly limitations: readonly string[];
}
export interface OptimizationProposal {
  readonly proposalId: string;
  readonly actionType: OptimizationActionType;
  readonly problem: string;
  readonly currentState: string;
  readonly recommendation: string;
  readonly expectedValue: string;
  readonly risk: string;
  readonly impact: string;
  readonly rollback: string;
  readonly validationMethod: string;
  readonly evidenceRefs: readonly string[];
  readonly evidence: readonly Evidence[];
  readonly confidence: ConfidenceLevel;
  readonly limitations: readonly string[];
  readonly executionAuthorization: 'NONE';
}
```

Implement these exact rules:

- A failure group with at least two events and two distinct Evidence IDs yields `MODIFY`, score `valueScore: 75`, `complexityScore: 60`, `riskLevel: 'MEDIUM'`, and `confidence: 'L3'`.
- A single failure or a failure group with fewer than two Evidence IDs yields an `L1` analysis but no proposal.
- A capability with `usageCount === 0`, `maintenanceCostSignal` `MEDIUM`/`HIGH`, and at least one Evidence ID yields `DEPRECATE`, score `valueScore: 55`, `complexityScore: 70`, `riskLevel: 'MEDIUM'`, and `confidence: 'L2'`.
- Generator returns proposals only for L2/L3 analyses whose evidence exists in `observation.evidenceById`; all proposals set `executionAuthorization: 'NONE'` and include a limitation that human review is required.
- Use stable identifiers: `analysis-failure-<eventType>`, `proposal-modify-<eventType>`, `analysis-unused-<capabilityId>`, and `proposal-deprecate-<capabilityId>`.
- Do not generate `ADD`, `MERGE`, or `REMOVE` proposals in this MVP.

- [ ] **Step 4: Run focused and full tests**

Run: `node --experimental-strip-types --test self-evolution/self-evolution-mvp.test.ts && npm.cmd test`

Expected: `SE-01` through `SE-05` pass; existing tests remain passing.

- [ ] **Step 5: Commit Task 2**

```bash
git add self-evolution/self-evolution-contract.ts self-evolution/value-complexity-analysis-service.ts self-evolution/optimization-proposal-generator.ts self-evolution/self-evolution-mvp.test.ts
git commit -m "feat: add self evolution proposals"
```

### Task 3: Add the Read-Only Facade and Boundary Verification

**Files:**

- Create: `self-evolution/self-evolution-mvp-service.ts`
- Modify: `self-evolution/self-evolution-contract.ts`
- Modify: `self-evolution/self-evolution-mvp.test.ts`
- Modify: `package.json`

**Consumes:** the observer, analyzer, and generator from Tasks 1–2.

**Produces:** `SelfEvolutionMvpService.evaluate(input): SelfEvolutionMvpResult`.

- [ ] **Step 1: Write failing integration and boundary tests**

```ts
test('SE-06 executes observation to analysis to proposal without external side effects', () => {
  const input = withRepeatedFailures();
  const expected = structuredClone(input);
  const result = new SelfEvolutionMvpService().evaluate(input);

  assert.equal(result.observation.observedAuditEventCount, 2);
  assert.equal(result.analyses.length, 1);
  assert.equal(result.proposals.length, 1);
  assert.equal(result.proposals[0]!.executionAuthorization, 'NONE');
  assert.deepEqual(input, expected);
});

test('SE-07 exposes no execution, persistence, repository, or activation operation', () => {
  const service = new SelfEvolutionMvpService() as unknown as Record<string, unknown>;

  assert.equal(typeof service.executeProposal, 'undefined');
  assert.equal(typeof service.persist, 'undefined');
  assert.equal(typeof service.activateCapability, 'undefined');
});
```

- [ ] **Step 2: Run the focused test and confirm it fails**

Run: `node --experimental-strip-types --test self-evolution/self-evolution-mvp.test.ts`

Expected: FAIL because `SelfEvolutionMvpService` does not yet exist.

- [ ] **Step 3: Implement the facade and test registration**

```ts
export interface SelfEvolutionMvpResult {
  readonly observation: SelfObservation;
  readonly analyses: readonly OptimizationAnalysis[];
  readonly proposals: readonly OptimizationProposal[];
}

export class SelfEvolutionMvpService {
  private readonly observer = new SelfObservationService();
  private readonly analyzer = new ValueComplexityAnalysisService();
  private readonly generator = new OptimizationProposalGenerator();

  evaluate(input: SelfEvolutionSnapshotInput): SelfEvolutionMvpResult {
    const observation = this.observer.observe(input);
    const analyses = this.analyzer.analyze(observation);
    return { observation, analyses, proposals: this.generator.generate(analyses, observation) };
  }
}
```

Add `self-evolution/self-evolution-mvp.test.ts` to the explicit `node --experimental-strip-types --test` list in `package.json`. Do not add dependencies, scripts, repository imports, or Runtime modifications.

- [ ] **Step 4: Run full verification**

Run: `npm.cmd test`

Expected: all pre-existing test files plus `SE-01` through `SE-07` pass.

Run: `git diff --check; rg -n "from .*repository|readFile|writeFile|fetch\\(|http|executeProposal|activateCapability" self-evolution package.json`

Expected: no implementation reference to Repository/file/network/activation APIs; permitted mentions are limited to test assertions or explanatory strings.

- [ ] **Step 5: Commit Task 3**

```bash
git add self-evolution/self-evolution-mvp-service.ts self-evolution/self-evolution-contract.ts self-evolution/self-evolution-mvp.test.ts package.json
git commit -m "feat: add self evolution mvp"
```

## Final Verification

- [ ] Run `git status --short`; expect no output.
- [ ] Run `npm.cmd test`; report the exact passing count.
- [ ] Run `git log --oneline -3`; report the implementation commits.
- [ ] Do not merge, activate a Capability, or start a new phase without user authorization.
