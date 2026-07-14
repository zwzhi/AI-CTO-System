# Codex Capability Implementation Gate

## Purpose

This Gate decides only whether a local Mock Codex Capability implementation may begin. It does not approve Capability Registry Activation, real Codex access, API/CLI/MCP use, network access, code modification, Commit creation or production execution.

## Required checks

| Check | Acceptance standard |
|---|---|
| Adapter design | Provider-neutral Adapter boundaries, request conversion, normalization and Workflow prohibitions are documented. |
| Permission confirmation | Least-privilege, expiry, scope matching, denial and prohibited-scope rules are documented. |
| Budget confirmation | Token/time/tool/cost/retry checks and bounded failures are documented. |
| Approval confirmation | `CONFIRM_REQUIRED` barrier, binding, expiry and denial behavior are documented. |
| Audit confirmation | Input/output references, versions, snapshots, Evidence, duration and failure fields are specified. |
| Test plan confirmation | Success, failure, permission, budget, approval, cancellation, invalid output and Audit completeness cases are specified. |
| Risk confirmation | Mock-only scope, no external side effects, Registry `ABSENT` and no Activation are explicitly preserved. |

## Gate result

**Current result: `APPROVED_FOR_IMPLEMENTATION` — Mock-only.**

The implementation scope is strictly the local Mock Adapter and its contract/Guard/Audit tests. Any proposal to connect a real Codex provider changes the Gate scope and must first pass Capability Admission, Evaluation, Registry, Activation, security/privacy/license/cost review, integration design, controlled integration tests and explicit user authorization.

## Rejection rule

Return `CHANGES_REQUIRED` if any required check is missing, if the design permits external access or state mutation, or if the Mock could be interpreted as a real Capability Registry record.
