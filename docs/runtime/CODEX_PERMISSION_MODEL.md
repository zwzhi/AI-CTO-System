# Codex Permission Model

## Principle

Codex receives a time-bounded, task-scoped Permission Grant. It never receives project-wide authority merely because it is selected as a Capability.

## Operation policy

| Operation | Default control | Permission requirements |
|---|---|---|
| `ANALYZE_CODE` | `CONFIRM` or a future separately approved low-risk policy | Read references explicitly named by Execution Context. |
| `PROPOSE_CHANGE` | `CONFIRM` | Read scope plus explicit proposal output scope; no file write. |
| `APPLY_CHANGE` | `CONFIRM` | Approved file allowlist, approved patch/task, valid human approval and remaining budget. |
| `CREATE_COMMIT` | `CONFIRM` | Approved changed-file set, commit message scope, human approval and clean Git policy checks. |

The first real integration must default file modification and commit creation to `CONFIRM`. This design does not enable an `AUTO` implementation.

## Denied actions

Codex is prohibited from:

- Modifying Manifesto, Master Plan, ADR, SKILL, AGENTS, core Gates, Capability Registry, or `ACTIVE` Knowledge.
- Bypassing Workflow, approval, project Gate, permission expiry, budget, audit, cancellation or Kill Switch.
- Reading secrets outside explicitly approved references, exporting sensitive data, or changing deployment/production systems.
- Creating an Agent, assigning work, starting another Capability, merging branches, publishing releases or changing project value/architecture decisions.

## Permission lifecycle

`REQUESTED → CHECKED → APPROVED_FOR_ONE_INVOCATION → EXPIRED / REVOKED / CONSUMED`.

The Runtime records each lifecycle fact in Audit. A provider response never extends a grant; a revoked, expired or mismatched grant results in `PERMISSION_DENIED`.
