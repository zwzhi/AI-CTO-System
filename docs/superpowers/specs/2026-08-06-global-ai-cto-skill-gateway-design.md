# Global AI CTO Skill Gateway Design

**Design ID:** `SYS-L5-SKILL-GATEWAY-001`  
**Status:** Approved for implementation planning  
**Date:** 2026-08-06  
**Owner:** AI CTO System project owner

## 1. Problem and Goal

AI CTO System already has a project-local `SKILL.md`, governance documents, Runtime contracts and one restricted internal Documentation Capability. However, Codex does not currently discover `ai-cto-system` in a new conversation outside this repository. The current user-level Skill catalog contains no AI CTO Skill.

The goal is to make AI CTO System discoverable from new Codex conversations and other project workspaces while keeping this repository as the single source of truth. The gateway must support an explicit opt-out and must not imply that every request requires the full AI CTO workflow.

## 2. Strategic Admission and Classification

| Field | Decision |
|---|---|
| Candidate ID / Name | `SYS-L5-SKILL-GATEWAY-001` / Global AI CTO Skill Gateway |
| Mission Contribution | Reduces the friction between a project idea or existing-project request and the governed AI CTO workflow, making the existing system reusable across real projects. |
| Core Problem | The system exists locally, but new Codex conversations cannot discover or route into it without repeated manual instructions. |
| Owning Layer / Existing Module | Layer 5; extend existing Intent Gateway and AI CTO Runtime Architecture entry surface. |
| Reuse Analysis | Reuse the repository Manifesto, Master Plan, protocols, gates, memory rules and Runtime. Do not copy the governance corpus or create a second Runtime. |
| Long-term Asset | One versioned, testable Codex Skill entry contract and an idempotent local installation method. |
| Complexity Impact | Adds one thin Skill package, UI metadata and one installation script. Avoids a Plugin, Provider, MCP server, model integration and duplicated documentation. |
| Evidence / Confidence | L3 for current discovery failure: the active Codex Skill catalog does not include AI CTO System, while the repository contains the project-local source. |
| Human Decision | Project owner selected approach A: globally discoverable Skill with repository as authority, 2026-08-06. |
| Admission Result | `ADMIT_FOR_CLASSIFICATION` |
| Classification Result | `EXTEND_EXISTING_MODULE` |
| Architecture Review / ADR | Not required. No Layer, Module authority, Gate or Runtime contract changes. |
| Next Action | Create and validate the Skill package, install the Junction, then run a fresh-conversation pilot. |

## 3. Chosen Architecture

Canonical source:

```text
D:\AI Project\AI-CTO-System\skills\ai-cto-system\
├── SKILL.md
└── agents\
    └── openai.yaml
```

Discovery path:

```text
C:\Users\白名单\.codex\skills\ai-cto-system
    -> NTFS Junction ->
D:\AI Project\AI-CTO-System\skills\ai-cto-system
```

The Junction prevents version drift: repository changes become visible to future Codex sessions without copying the Skill. The installer must stop if the destination already exists and does not resolve to the canonical source.

## 4. Trigger and Opt-out Contract

The Skill description must trigger on:

- a new product or AI project idea;
- an existing repository review, takeover, health check or optimization request;
- a material feature, architecture, delivery, maintenance or portfolio decision;
- an explicit request to use AI CTO System.

The following user instructions have higher priority than inferred triggering:

- `AI_CTO_MODE: OFF`;
- “不要使用 AI CTO System”；
- “普通模式处理”；
- “本次禁用 AI CTO Skill”。

An opt-out in the current request applies to that request. If the user explicitly says the whole conversation is excluded, keep AI CTO mode off until the user says `AI_CTO_MODE: ON` or otherwise explicitly re-enables it. Opt-out does not bypass Codex safety, permissions or mandatory confirmations.

Ordinary conversation, simple explanation and low-risk direct work must not start the complete CTO workflow merely because the Skill exists. When AI CTO applies, use the existing Execution Routing rules to select the lightest sufficient workflow.

## 5. Progressive Context Loading

The global Skill is a thin gateway. It must not duplicate or eagerly load the entire project-local `SKILL.md` or governance corpus.

| Request | Load first | Load only when needed |
|---|---|---|
| New project or product idea | `docs/protocol/IDEA_INTAKE_PROTOCOL.md`, `docs/evaluation/IDEA_CANDIDATE_STANDARD.md` | Research, Evaluation and Design standards as the project advances |
| Existing project review | `docs/onboarding/PROJECT_ONBOARDING_PROTOCOL.md` | Recovery, health and migration standards |
| AI CTO System modification | Manifesto, Master Plan, Module Admission Criteria | Module Registry, applicable ADR and specialist standards |
| Project status or continuation | Target project state and Project Memory | Related plan, progress, risk and Gate evidence |
| Simple non-AI-CTO request | No AI CTO governance context | None |

The canonical repository path is `D:\AI Project\AI-CTO-System`. If it cannot be read, report the missing authority source and do not invent replacement rules.

## 6. Runtime and Execution Boundary

The Skill tells Codex when and how to enter AI CTO System. It does not become the Runtime, a Workflow Controller, an Agent Manager or a Capability.

First-version behavior:

1. classify the request using the trigger and opt-out contract;
2. load the smallest relevant authority set;
3. identify the correct existing lifecycle entry and execution profile;
4. produce the governed analysis, documents or next approval request;
5. use existing Runtime or Capability paths only when a callable, authorized path exists;
6. state honestly when a path remains design-only or internal-only.

The Skill must not claim automatic Runtime invocation where no stable CLI or callable entry adapter exists. It must not activate another Capability, install a Provider, call a model, access a network, modify production, or bypass a Gate.

## 7. Installation and Rollback

Add an idempotent PowerShell installer under the existing `scripts/` directory. It must:

1. resolve the canonical Skill directory and user Skill root;
2. verify both paths remain inside the explicitly named locations;
3. create the user Skill root when absent;
4. create an NTFS Junction only when the destination is absent;
5. accept an existing correct Junction as success;
6. reject a conflicting file, directory or link without deleting it;
7. print the installed source and discovery path.

Rollback removes only the verified Junction after explicit user authorization. It must never delete the canonical repository directory or an unverified target.

## 8. Validation Strategy

Baseline RED evidence: the current user-level Skill catalog does not contain `ai-cto-system`, so a new conversation cannot discover it automatically.

Implementation validation must include:

- Skill schema validation with the official local `quick_validate.py`;
- metadata consistency between `SKILL.md` and `agents/openai.yaml`;
- installer idempotency and conflict refusal;
- Junction target verification;
- static checks for the opt-out phrases and `AI_CTO_MODE: OFF` / `ON` semantics;
- a fresh-conversation trigger pilot for a new project;
- a fresh-conversation existing-project onboarding pilot;
- a fresh-conversation opt-out pilot proving ordinary Codex handling;
- a non-trigger pilot for ordinary conversation or simple explanation.

The fresh-conversation pilot is required because the current conversation cannot prove startup discovery after installation.

## 9. Success Criteria

The design succeeds when:

1. `ai-cto-system` appears in a new Codex conversation's available Skill catalog;
2. new-project and existing-project requests select the correct AI CTO entry;
3. explicit opt-out prevents AI CTO lifecycle, memory and Runtime routing for the scoped request or conversation;
4. context loading remains task-specific rather than loading the full governance corpus;
5. the repository remains the only authority source;
6. no Plugin, new Module, new Phase, Provider, MCP, external model, Runtime contract or production behavior is added.

## 10. Known Limitations

- The installation is local to this Windows user and this repository path.
- The repository currently has no Git remote and is not backed up to GitHub.
- A Skill can guide Codex into existing contracts but does not itself make every internal TypeScript service callable.
- Cross-device use requires a separate repository distribution and installation decision.
- The first real validation must happen in a newly opened Codex conversation after installation.
