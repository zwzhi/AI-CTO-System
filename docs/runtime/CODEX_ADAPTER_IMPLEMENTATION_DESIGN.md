# Codex Adapter Implementation Design

## Adapter role

`CodexCapabilityAdapter` is a provider-neutral Runtime Port implementation. It accepts an already-bound execution request, validates its contract-level prerequisites, invokes only the configured Mock capability, and returns a normalized outcome.

## Inputs and outputs

| Direction | Contract object | Required role |
|---|---|---|
| Input | `CodexExecutionRequest` | Binds Task, Execution Context, Permission, Budget, Approval and operation. |
| Input | `CapabilityInvocationPolicy` | Limits supported operations to the local Mock scope. |
| Output | `CodexExecutionOutcome` | Returns Result, Evidence, Status, usage facts and Changed Files Proposal. |
| Output | `AuditCandidate` | Supplies immutable references and control snapshots to Audit. |

## Controlled adapter sequence

1. Verify contract version and that the request is bound to one Runtime Task.
2. Verify Execution Context only exposes declared references.
3. Verify Permission scope, expiry and allowed operation.
4. Verify Budget has not exceeded token, time, tool, cost or retry limits.
5. Verify the required approval is present and matches the task, operation and scope.
6. Convert the approved provider-neutral request into a Mock capability request.
7. Invoke the Mock capability through an internal invocation interface only.
8. Validate Status, Result, Evidence and Changed Files Proposal against the output contract.
9. Return a normalized outcome or a bounded failure; emit data for Audit.

## Prohibitions

- The Adapter cannot call Workflow transition APIs, repositories or domain services that change Workflow status.
- The Adapter cannot create/extend Permission, consume an approval on behalf of Runtime, change Budget, or decide Gate results.
- The Adapter cannot write files, create commits, dispatch another Capability, access network/CLI/MCP, or invoke a real Codex provider.
- The Adapter cannot treat a proposal as an applied change.

## Interface abstraction

The future `CodexInvocationPort` accepts a bounded mock request and returns a bounded mock response. A real transport may only replace this Port after independent Capability Admission, Evaluation, Registry, Activation, security review, implementation design, test evidence and user authorization. Runtime Core and Workflow do not import provider-specific APIs.

## Error normalization

The Adapter maps malformed requests/responses and invocation facts to stable categories: `PERMISSION_DENIED`, `BUDGET_EXCEEDED`, `APPROVAL_REQUIRED`, `OUTPUT_INVALID`, `EXECUTION_FAILED`, `CANCELLED`, or `ADAPTER_UNAVAILABLE`. It preserves the failure stage and safe evidence references without exposing secrets.
