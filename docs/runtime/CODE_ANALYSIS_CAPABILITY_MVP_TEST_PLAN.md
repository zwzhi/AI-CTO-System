# Code Analysis Capability MVP Test Plan

## Test Principle

All tests use fixed timestamps and caller-supplied in-memory code strings. They must neither load a project file nor produce a filesystem, network, provider, patch, commit, deployment, Registry, or Knowledge side effect.

## Required Scenarios

| ID | Scenario | Expected result |
| --- | --- | --- |
| CA-01 | Normal authorised analysis | `SUCCESS`; all seven required output fields are present. |
| CA-02 | Evidence-first multi-context analysis | The port receives source evidence before result creation; every reference is authorised. |
| CA-03 | Empty/unapproved/unlocatable context | `BLOCKED/SOURCE_SCOPE_INVALID`; port call count remains zero. |
| CA-04 | Missing, expired, malformed, or wrong permission | `BLOCKED/PERMISSION_DENIED`; port is not called. |
| CA-05 | Exceeded budget | `BLOCKED/BUDGET_EXCEEDED`; zero recorded usage and no port call. |
| CA-06 | Cancelled request | `BLOCKED/CANCELLED`; port is not called. |
| CA-07 | Invalid port output | `FAILURE/OUTPUT_INVALID`; incomplete findings/evidence cannot become success. |
| CA-08 | Confidence, evidence, and output bounds | Versionless input yields `L2`; overconfident, tampered, duplicate, or non-success port output is rejected/normalised; short ordinary code is not falsely treated as a source leak. |
| CA-09 | Audit completeness | Success and blocked outcomes append task, workflow, refs, budget, result/failure, and evidence. |
| CA-10 | No external side effect | Source scope snapshots are immutable; implementation imports no external I/O facility and output does not echo source content. |

## Acceptance

The new tests and the pre-existing complete suite pass through `npm.cmd test`. A scope scan confirms only the specialised capability files, service, test, package script, and approved documentation/progress records changed; no Core, Workflow, Task, Agent, Registry, Knowledge, or integration files are touched.
