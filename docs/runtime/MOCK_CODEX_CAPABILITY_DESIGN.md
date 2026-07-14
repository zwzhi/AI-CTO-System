# Mock Codex Capability Design

## Purpose

Mock Codex Capability verifies Capability Adapter control flow without representing or calling real Codex. It is deterministic, local, side-effect free and limited to contract fixtures.

## Supported operations

| Operation | Mock behavior | Result | Changed Files Proposal |
|---|---|---|---|
| `ANALYZE_CODE` | Returns a bounded analysis fixture for declared input references. | Analysis summary and findings fixture. | Empty. |
| `PROPOSE_CHANGE` | Returns a bounded change proposal fixture for declared task scope. | Proposal summary and assumptions fixture. | Proposed file references only; never a patch or write. |

`APPLY_CHANGE` and `CREATE_COMMIT` are not implemented by the Mock. They return a controlled rejection even if an approval exists.

## Deterministic input and output

The Mock only accepts a known operation, a Task reference, declared Execution Context references, a matching Permission / Budget Snapshot and a fixture selector. The same valid fixture input produces the same Result structure, Evidence shape, Status and proposal references.

| Output field | Design rule |
|---|---|
| Result | Describes fixture analysis or proposal; never reports an applied change. |
| Evidence | Includes mock capability version, contract version, input/output references, confidence label and timestamp. |
| Status | `COMPLETED`, `FAILED`, `REJECTED`, `BUDGET_EXCEEDED`, `CANCELLED`, or `OUTPUT_INVALID`. |
| Changed Files Proposal | Explicitly marked `PROPOSED`; it cannot be used as filesystem evidence. |

## Failure fixtures

The Mock provides explicit fixtures for invalid output, provider-style execution failure, cancellation and unsupported operation. This lets Runtime verify rejection and Audit behavior without retries, external side effects or hidden fallbacks.

## Non-goals

The Mock does not inspect source files, parse code, generate patches, execute commands, call models, access Git, create commits, create registry entries or write Knowledge.
