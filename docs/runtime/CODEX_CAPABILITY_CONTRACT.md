# Codex Capability Contract

## Capability identity

| Field | Contract |
|---|---|
| Capability ID | `CODEX_ENGINEERING_CAPABILITY` |
| Type | `Engineering Capability` |
| Provider version | Runtime records the exact provider/adapter version for every invocation. |
| Contract version | Semantic version for this input/output contract. |
| Applicable layer | Layer 5 Execution & Intelligence. |
| Invocation owner | Runtime through Capability Adapter only. |

## Input schema

| Field | Purpose | Rule |
|---|---|---|
| `taskRef` | References one Runtime Task / AgentTask. | Required; no unbound invocation. |
| `operation` | `ANALYZE_CODE`, `PROPOSE_CHANGE`, `APPLY_CHANGE`, or `CREATE_COMMIT`. | Must be explicitly permitted. |
| `executionContext` | User/project/intent/constraint/allowed-context references. | Only listed references may be read. |
| `permissionGrant` | Read/write/commit scope and expiry. | Least privilege; unlisted actions are denied. |
| `budgetSnapshot` | Token, time, tool, cost and retry limits. | Adapter must check before dispatch. |
| `approvalRef` | Human approval record when the operation requires confirmation. | Required for file modifications and commits. |
| `inputRefs` | Stable references to task, code scope, requirements and designs. | Do not embed secrets or unrestricted workspace context. |

## Output schema

| Field | Purpose |
|---|---|
| `status` | `COMPLETED`, `FAILED`, `REJECTED`, `BUDGET_EXCEEDED`, `CANCELLED`, or `OUTPUT_INVALID`. |
| `resultRef` | Reference to a bounded analysis, proposal, patch candidate or commit candidate. |
| `changedFiles` | Proposed or observed changed-file references; empty for analysis-only work. |
| `evidence` | Provider/adapter version, input/output references, confidence, timestamps and bounded summaries. |
| `usage` | Measured token, duration, tool and cost facts when available; unknown values are `NOT_CAPTURED`. |
| `failure` | Bounded reason, stage and recovery recommendation for non-success output. |

## Contract invariants

1. The Capability cannot receive raw authority beyond the supplied Permission Grant and Approval Reference.
2. `APPLY_CHANGE` and `CREATE_COMMIT` are invalid without `CONFIRM` approval and an approved scoped write permission.
3. A successful response does not advance Workflow state; Runtime validates it and decides the next state.
4. Evidence does not enter `ACTIVE` Knowledge automatically.
5. Contract or provider-version changes require capability re-evaluation before activation.

## Failure model

Failures use a stable category: `TIMEOUT`, `EXECUTION_FAILED`, `OUTPUT_INVALID`, `PERMISSION_DENIED`, `BUDGET_EXCEEDED`, `CANCELLED`, or `ADAPTER_UNAVAILABLE`. The adapter returns the category and Evidence to Runtime; it never self-escalates scope or retries without policy authorization.
