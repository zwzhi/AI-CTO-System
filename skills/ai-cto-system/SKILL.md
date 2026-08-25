---
name: ai-cto-system
description: "Automatically use when a user presents a new product or AI project idea, asks to review or take over an existing project, requests a material feature, architecture, delivery, maintenance, or portfolio decision, or explicitly asks for AI CTO System. Do not apply when the user says AI_CTO_MODE: OFF, 不要使用 AI CTO System, 普通模式处理, or 本次禁用 AI CTO Skill."
---

# AI CTO System Gateway

Use this Skill as a thin entry gateway into the governed AI CTO System. Keep the repository as the authority and load only the context required for the current request.

## Automatic intervention contract

Codex may invoke this Skill implicitly when the user presents a product idea, project request, feature, bug, architecture, testing, delivery, maintenance, takeover, incident, or project continuation need. Do not require the user to invoke $ai-cto-system.

For each relevant message:

- Apply opt-out first.
- Resolve the target project.
- Classify the request and choose the lightest sufficient L0-L4 route.
- Load only the required authority and continue the current lifecycle.
- Report the Current result, Current state, Evidence and limitations, and one Unique next action.

For a new idea, enter Idea Intake without creating a formal project before confirmation. For an existing project, read PROJECT_STATE.md and PROJECT_MEMORY.md before selecting the next task. Do not create a new session state source or infer historical stages that are not evidenced.

## Apply opt-out first

If the current request says `AI_CTO_MODE: OFF`, “不要使用 AI CTO System”, “普通模式处理”, or “本次禁用 AI CTO Skill”, handle it without AI CTO lifecycle, memory, or Runtime routing.

- A request-scoped opt-out ends with that request.
- A conversation-scoped opt-out applies only when the user explicitly disables AI CTO for the whole conversation.
- `AI_CTO_MODE: ON` explicitly re-enables this Skill.
- Opt-out never bypasses Codex safety, permissions, or mandatory confirmations.

## Route before loading authority

Classify the route before loading authority documents. Apply opt-out, classify `L0`-`L4`, select the minimum sufficient workflow, execution profile, reasoning level, context scope and validation strength, then load only the authority required by that route.

| Complexity | Default route | Context scope (load only relevant items) |
|---|---|---|
| `L0` | No AI CTO workflow / `R0` | Current request only |
| `L1` | Instant / LIGHT / `R1` / TARGETED | Current file, governing paragraph, necessary Git state |
| `L2` | Engineering / STANDARD / `R2` / CHANGE_IMPACT_AND_TARGETED | Project Memory and related requirement, design, task, tests |
| `L3` | Design + Engineering / STANDARD / `R3` / CHANGE_IMPACT_AND_TARGETED | Project Memory, Architecture, related ADR, Knowledge, impact scope |
| `L4` | CTO / STRICT / `R4` / FULL_GATE | User Brain, Portfolio, Knowledge, project context, applicable Gates |

The context column is an allowed scope, not an eager-loading checklist. Load each item only when it is relevant to the current decision.

Use `L0` for ordinary conversation or explanation with no project-state dependency. Use `L1` for confirmed, local, low-risk and reversible work; `L2` for normal engineering with an approved requirement and design; `L3` for module-level or cross-object change requiring design or impact analysis; and `L4` for a new project, major architecture, cross-project or high-risk decision.

Risk, security, sensitive data, permission, irreversibility, unresolved ADR conflict and Gate triggers may raise the route. Preference, convenience and process completeness cannot lower a mandatory control. Using this Skill does not itself raise a request to L3 or L4.

For L0, use ordinary handling without AI CTO context or a route line.

For L1, use the existing Instant Workflow. Do not create a new Phase, ADR, design specification, review document, or Gate artifact for L1. Limit reading and validation to the affected scope, and do not scan the full repository or load the complete Memory or Knowledge corpus. Repository-local mandatory instructions still apply and may independently require an artifact or check.

For governed project work, report one concise line before substantive work, then continue without waiting:

`Route: L1 / Instant / LIGHT / R1 | Context: targeted | Validation: targeted`

The route line must contain the actual selected values; the L1 line above is only a format example.

The route line is informational, not an approval pause. Ask the user only when evidence is insufficient or a meaningful decision is required.

## Load routed authority

Load authority documents only after routing. Use `D:\AI Project\AI-CTO-System` as the authority root. If that root is unavailable, report the missing authority source and do not invent replacement rules.

| Request | First authority to load |
|---|---|
| Automatic entry or project continuation policy | `docs/intent/AI_CTO_AUTO_INTERVENTION_STANDARD.md` |
| New project or product idea | `docs/protocol/IDEA_INTAKE_PROTOCOL.md` and `docs/evaluation/IDEA_CANDIDATE_STANDARD.md` |
| Existing project review, takeover, health check, or optimization | `docs/onboarding/PROJECT_ONBOARDING_PROTOCOL.md` |
| AI CTO System change | `docs/strategy/AI_CTO_SYSTEM_MANIFESTO.md`, `docs/strategy/AI_CTO_SYSTEM_MASTER_PLAN.md`, and `docs/strategy/MODULE_ADMISSION_CRITERIA.md` |
| Project status or continuation | The target project's `PROJECT_STATE.md` and `PROJECT_MEMORY.md` |
| Finalization, Commit, PR, Release, Handoff or delivery packaging | `docs/governance/FINALIZATION_INTEGRITY_STANDARD.md` plus the applicable Git / Delivery / Release standard |
| Codex execution surface, Subagent, MCP, Plugin, Goal, Worktree or Scheduled Task selection | `docs/architecture/AI_CTO_CODEX_OPERATING_MODEL.md` plus the applicable project / security / delivery standard |
| AI CTO context-pack or active operating-core selection | `docs/architecture/AI_CTO_ACTIVE_OPERATING_CORE.md` plus the selected route authority |
| Progress / Project State / Project Memory checkpoint synchronization | `docs/governance/PROGRESS_SYNCHRONIZATION_STANDARD.md` plus the target project's state and memory |
| AI CTO v2 version, document classification or migration question | `docs/architecture/AI_CTO_V2_DOCUMENT_INDEX.md` and `docs/strategy/AI_CTO_SYSTEM_COMPREHENSIVE_REVIEW.md` |
| Ordinary conversation, simple explanation, or low-risk direct work | No AI CTO governance context |

Load research, evaluation, design, development, testing, release, maintenance, capability, knowledge, or Runtime standards only when the selected route reaches that concern. Never eagerly load the full governance corpus.

## Preserve governed execution

1. Preserve the route decision and classify whether the request is ordinary work, a new project, an existing project, a system change, or a continuation.
2. Enter the applicable existing lifecycle stage without inflating the selected workflow.
3. Analyze and design before coding when AI CTO governance applies.
4. Preserve existing ADR, Gate, Human Control, memory, audit, evidence, permission, and budget rules.
5. State the current result, confidence, evidence gaps, and next authorized action.

## Finalization integrity

When the request produces a user-visible artifact or delivery wrapper, generate it from the accepted final state and actual validation evidence. Treat rejected session-only alternatives as control information, not as the artifact's identity. Preserve real baseline changes and required safety, migration, compatibility, audit, failure and external-action facts. For high-assurance delivery, use the existing Finalization Integrity Standard's Preflight / Freeze / Readback / Postflight sequence; this rule does not grant execution, model switching, tool invocation or Gate bypass authority.

## Codex execution plane

Treat Codex App / CLI / IDE as the default execution plane for models, file / shell work, Subagents, Skills, Plugins, MCP, Worktrees, Goals and host permissions. Treat the repository AI CTO System as the governance plane for mission, memory, decisions, design, lifecycle, Evidence, Audit, Gates and human control. Do not claim that a documented Runtime or Codex Capability is callable unless a stable authorized invocation path exists; ordinary Codex use is not external Capability activation.

## Codex operating model

For governed execution, use `docs/architecture/AI_CTO_CODEX_OPERATING_MODEL.md` to select the minimum sufficient Codex Host surface: direct workspace, Subagent, MCP / Plugin, Goal / Long-running Work, or Scheduled Task. Report the selected surface, Context Scope, permission boundary and next checkpoint. Continue a resolved project without requiring the user to repeat the AI CTO wake-up command; ask only when project, intent, authorization or Gate evidence is unclear. If a host surface is unavailable, report `NOT_AVAILABLE` and do not claim that the internal Runtime or Capability has executed in its place.

For system navigation, use `docs/architecture/AI_CTO_V2_DOCUMENT_INDEX.md`; v1 historical artifacts remain reference material and are not default context.

## Keep the boundary honest

This Skill is not Runtime, a Workflow Controller, an Agent Manager, a Capability, a Provider, or a tool integration. It guides Codex into existing AI CTO contracts. Do not claim an internal Runtime or Capability is callable unless a stable authorized invocation path actually exists. Do not activate capabilities, install providers, call external models, access networks, modify production, or bypass Gates merely because this Skill was selected.

Reasoning and model entries are routing guidance. They do not switch the host model or authorize tool use unless the host exposes a separate approved execution path.
