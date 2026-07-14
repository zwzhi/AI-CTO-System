# Agent Permission Boundary

## Principles

Permissions are Task-scoped, time-bounded, least-privilege grants. They authorize an Agent action only within the Runtime contract; they do not constitute project, architecture, release, or Knowledge approval.

## Planner Agent

| Action | Permission |
|---|---|
| Read explicit Task input and allowed Execution Context references | Allowed |
| Generate proposed Execution Plan and Plan Evidence | Allowed |
| Return structured result/failure to Workflow Engine | Allowed |
| Read unrelated project, user, or portfolio context | Denied unless explicitly referenced and authorized |
| Change Workflow state or approval | Denied |
| Invoke Capability or external tool | Denied |
| Modify code, repository files, configuration, or data | Denied |
| Modify Manifesto, Master Plan, ADR, Project Memory, or project Gate | Denied |
| Create/assign Tasks or call another Agent | Denied |
| Write Knowledge directly or mark Knowledge `ACTIVE` | Denied |

## Enforcement rules

- The Permission / Budget Guard evaluates the contract before Agent work starts and again before any future side-effecting action.
- Missing, expired, or ambiguous permission is a denial, not an implied grant.
- An Agent may report a permission blocker, but only a human and the applicable governance process may change the authorization scope.
- Planner plan generation does not gain a write permission simply because the plan recommends a write.
