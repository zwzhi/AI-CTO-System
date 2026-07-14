# Code Analysis Capability MVP Implementation Design

## Goal

Implement a provider-free, read-only capability that analyses only immutable code context explicitly supplied in one request. The MVP proves this controlled path:

```text
Authorized Code Context
  -> CodeAnalysisExecutionRequest
  -> CodeAnalysisCapabilityAdapter
  -> DeterministicCodeAnalysisAssistant
  -> CodeAnalysisResult + Evidence
  -> Audit Event
```

It is not a repository scanner, code editor, patch generator, commit service, deployment service, Agent, or Provider integration.

## Architecture and Boundaries

| Component | Responsibility | Must not do |
| --- | --- | --- |
| `CodeAnalysisExecutionRequest` | Binds objective, authorised in-memory code contexts, repository metadata, execution context, permission, budget, and cancellation to one invocation. | Read a path, enumerate a directory, or mutate any state. |
| `CodeAnalysisInvocationPort` | Defines the replaceable deterministic analysis invocation. | Enforce permission, budget, audit, or workflow rules. |
| `DeterministicCodeAnalysisAssistant` | Produces predictable findings from verified in-memory contexts and prebuilt evidence. | Access filesystem/network/tools, create patches, or change state. |
| `CodeAnalysisCapabilityAdapter` | Performs preflight, freezes request inputs, builds source evidence first, invokes the port, then validates the returned contract. | Change Workflow, Task, Agent, Registry, Knowledge, or source files. |
| `CodeAnalysisCapabilityRuntimeService` | Invokes the adapter and appends one audit event for either outcome. | Advance Workflow/Task, write Knowledge, or authorise changes. |

The implementation is specialised and does not modify `runtime/models/runtime-types.ts`, Runtime Foundation, Workflow, Task, Agent, or Registry.

## Contract

`ANALYZE_READ_ONLY_CODE` is the only operation. A request contains one or more `AuthorizedCodeContext` values:

- `sourceRef`, `location`, `content`, and optional `versionRef`;
- every `sourceRef` must occur in `executionContext.allowedContextRefs`;
- content is already in memory; no pathname, glob, URL, callback, or filesystem port is accepted;
- repository context is descriptive metadata only (`repositoryRef`, optional revision), not an access grant.

A successful `CodeAnalysisResult` has non-empty:

1. `analysisReport`
2. `architectureFindings`
3. `riskFindings`
4. `technicalDebt`
5. `evidence`
6. `confidence`
7. `limitations`

`L3` requires every context to contain a non-empty `versionRef`; otherwise the highest possible result is `L2`. The adapter rejects a port result with missing fields, unapproved references, altered evidence, or confidence above this bound. `revisionRef` is optional descriptive metadata and is not a repository access mechanism.

## Evidence-first and Safety

1. Validate cancellation, operation, a strict parseable and unexpired read-only permission timestamp, source scope, and budget.
2. Freeze copies of all request collections.
3. Build one non-content-revealing evidence item per authorised code context.
4. Invoke the deterministic port with only the frozen request and prebuilt evidence.
5. Validate the complete result and append it to audit.

Failure is returned as `BLOCKED` for preflight rejection and `FAILURE` for invocation or result-validation failure. A non-success outcome from the invocation port is normalised to a controlled invocation failure. No successful result is returned for a failed validation. Canonical evidence is frozen before port invocation and must be returned as the same ordered set. Evidence summaries, result reference, and finding identifiers/text must not echo a nontrivial full authorised source body; short common code fragments are not treated as secret values.

The service has no filesystem, network, LLM, Codex, MCP, Provider, Patch, Commit, Deployment, Knowledge, or Registry dependency.

## File Structure

```text
runtime/
  capability/
    code-analysis-execution-contract.ts
    code-analysis-invocation-port.ts
    deterministic-code-analysis-assistant.ts
    code-analysis-capability-adapter.ts
  services/
    code-analysis-capability-runtime-service.ts
  tests/
    code-analysis-capability.test.ts
```

`package.json` changes only to include the new test file in the existing `node --test` command.

## Implementation Gate

Coding is authorised by the user. The design keeps all approved boundaries intact: no Runtime Core change, no external access, no Provider or Registry activation, and no state-changing operation in the code-analysis contract.
