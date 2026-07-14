# Codex Capability Re-evaluation Readiness

## Current readiness decision

**Result: `NOT_READY_FOR_REEVALUATION`**

The candidate remains `REJECT_OR_DEFER`. Public Evidence and local Mock evidence provide a controlled baseline, but the mandatory real-Provider evaluation baseline cannot be frozen.

## Evidence checklist

| Requirement | Status | Notes |
|---|---|---|
| Capability purpose and Layer boundary | SATISFIED | Contract and ADR-0024 define Codex as an Engineering Capability, not Core/Workflow authority. |
| Local contract, Permission/Budget/Audit behavior | SATISFIED | 33 local Mock tests; scope limited to local fixture. |
| Provider identity | PARTIALLY_SATISFIED | OpenAI public product/policy identity verified; exact selected surface unresolved. |
| Source / artifact provenance | MISSING | No approved artifact, package, CLI build, SDK or endpoint. |
| Exact version | MISSING | No immutable version/model/build baseline. |
| License / usage agreement applicability | MISSING | Public terms located, but no selected surface/account agreement or license review. |
| Permission and data-flow implementation | MISSING | Local contract exists; real Provider enforcement and data handling unverified. |
| Security review | MISSING | No selected execution environment, credential, logging, retention or egress review. |
| Cost and limits baseline | MISSING | Pricing model located; no selected plan/model/rate or budget forecast. |
| Real Runtime compatibility | MISSING | Mock compatibility is not Provider compatibility. |
| Replacement / fallback | PARTIALLY_SATISFIED | Local Mock and human workflow exist; no admitted alternate provider. |

## Minimum evidence required before re-evaluation

1. Choose one concrete Codex surface and record official Source, Publisher, artifact and immutable Version.
2. Complete License and usage-terms review for that surface and intended commercial use.
3. Freeze least-privilege permission/data-flow design, including file, project, Git, network, credential, logging and retention boundaries.
4. Obtain security review for the selected environment and provider data path.
5. Freeze plan/model/rate/limit data and estimate token, time and cost budgets.
6. Define a non-production, revocable, no-production-data evaluation environment and test plan.
7. Re-run Capability Admission. Only if the result is `ADMIT_FOR_EVALUATION` may a Registry Record be created with Status `EVALUATING`.

## Explicitly prohibited next actions

Until these conditions are met: no Provider installation, API/CLI/MCP call, credential grant, Runtime Provider swap, Capability Registry activation, selection, file modification, Commit creation or production access.
