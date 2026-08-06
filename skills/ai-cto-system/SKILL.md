---
name: ai-cto-system
description: "Use when a user presents a new product or AI project idea, asks to review or take over an existing project, requests a material feature, architecture, delivery, maintenance, or portfolio decision, or explicitly asks for AI CTO System. Do not apply when the user says AI_CTO_MODE: OFF, 不要使用 AI CTO System, 普通模式处理, or 本次禁用 AI CTO Skill."
---

# AI CTO System Gateway

Use this Skill as a thin entry gateway into the governed AI CTO System. Keep the repository as the authority and load only the context required for the current request.

## Apply opt-out first

If the current request says `AI_CTO_MODE: OFF`, “不要使用 AI CTO System”, “普通模式处理”, or “本次禁用 AI CTO Skill”, handle it without AI CTO lifecycle, memory, or Runtime routing.

- A request-scoped opt-out ends with that request.
- A conversation-scoped opt-out applies only when the user explicitly disables AI CTO for the whole conversation.
- `AI_CTO_MODE: ON` explicitly re-enables this Skill.
- Opt-out never bypasses Codex safety, permissions, or mandatory confirmations.

## Select the lightest route

Load authority documents from `D:\AI Project\AI-CTO-System`. If that root is unavailable, report the missing authority source and do not invent replacement rules.

| Request | First authority to load |
|---|---|
| New project or product idea | `docs/protocol/IDEA_INTAKE_PROTOCOL.md` and `docs/evaluation/IDEA_CANDIDATE_STANDARD.md` |
| Existing project review, takeover, health check, or optimization | `docs/onboarding/PROJECT_ONBOARDING_PROTOCOL.md` |
| AI CTO System change | `docs/strategy/AI_CTO_SYSTEM_MANIFESTO.md`, `docs/strategy/AI_CTO_SYSTEM_MASTER_PLAN.md`, and `docs/strategy/MODULE_ADMISSION_CRITERIA.md` |
| Project status or continuation | The target project's `PROJECT_STATE.md` and `PROJECT_MEMORY.md` |
| Ordinary conversation, simple explanation, or low-risk direct work | No AI CTO governance context |

Load research, evaluation, design, development, testing, release, maintenance, capability, knowledge, or Runtime standards only when the request reaches that concern. Never eagerly load the full governance corpus.

## Preserve governed execution

1. Classify whether the request is ordinary work, a new project, an existing project, a system change, or a continuation.
2. Enter the applicable existing lifecycle stage and choose the lightest sufficient workflow through existing Execution Routing rules.
3. Analyze and design before coding when AI CTO governance applies.
4. Preserve existing ADR, Gate, Human Control, memory, audit, evidence, permission, and budget rules.
5. State the current result, confidence, evidence gaps, and next authorized action.

## Keep the boundary honest

This Skill is not Runtime, a Workflow Controller, an Agent Manager, a Capability, a Provider, or a tool integration. It guides Codex into existing AI CTO contracts. Do not claim an internal Runtime or Capability is callable unless a stable authorized invocation path actually exists. Do not activate capabilities, install providers, call external models, access networks, modify production, or bypass Gates merely because this Skill was selected.
