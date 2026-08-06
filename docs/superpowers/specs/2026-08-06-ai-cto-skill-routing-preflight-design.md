# AI CTO Skill Routing Preflight Design

**Design ID:** `SYS-L5-SKILL-ROUTE-001`  
**Status:** Approved for implementation  
**Date:** 2026-08-06  
**Owner:** AI CTO System project owner

## 1. Problem and goal

AI CTO System already defines task complexity, workflow routing, reasoning budgets, execution profiles and context routing. The global Skill gateway currently says to choose the lightest sufficient workflow, but it does not make the route decision an explicit prerequisite for authority loading. In a fresh conversation, Codex can therefore trigger the Skill correctly yet still load or apply a heavier process than the task requires.

The goal is to connect the existing routing governance to the Skill entry point with a compact, mandatory preflight. This is an extension of the existing Execution Routing and Intent Gateway behavior, not a new Module, Phase, Runtime service or authority source.

## 2. Chosen approach

Use a minimal inline routing contract in `skills/ai-cto-system/SKILL.md`:

1. Apply explicit opt-out.
2. Classify complexity before loading governance context.
3. Select the minimum sufficient workflow, execution profile, reasoning level, context scope and validation strength.
4. Load only the authority required by that route.
5. Execute without adding a new approval step.

The detailed governance documents remain authoritative. The Skill contains only the entry-time decision table needed to prevent routing ambiguity.

## 3. Routing contract

| Complexity | Typical request | Default route | Default context |
|---|---|---|---|
| `L0` | Ordinary conversation or explanation with no project-state dependency | No AI CTO workflow; `R0` | Current request only |
| `L1` | Confirmed, local, low-risk and reversible change | Instant / LIGHT / `R1` / TARGETED | Current file, governing paragraph and necessary Git state |
| `L2` | Normal engineering task with approved requirement and design | Engineering / STANDARD / `R2` / CHANGE_IMPACT_AND_TARGETED | Project Memory and related requirement, design, task and tests |
| `L3` | Module-level or cross-object change requiring design or impact analysis | Design + Engineering / STANDARD / `R3` / CHANGE_IMPACT_AND_TARGETED | Project Memory, Architecture, related ADR, Knowledge and impact scope |
| `L4` | New project, major architecture, cross-project or high-risk decision | CTO / STRICT / `R4` / FULL_GATE | User, Portfolio, Knowledge, project context and applicable Gates |

Risk, security, data, permission, irreversibility, unresolved ADR conflict and Gate triggers may raise the route. Preference, convenience or process completeness may not lower a mandatory control.

## 4. Process-inflation guard

For `L0`, do not start AI CTO lifecycle, memory or Runtime routing.

For `L1`, use the existing Instant Workflow. Do not create a new Phase, ADR, design specification, review document or Gate artifact unless the task independently meets the documented trigger for that artifact. Do not scan the full repository, load the complete Memory or Knowledge corpus, or invoke unrelated Skills and tools.

Using AI CTO System does not itself make a request `L3` or `L4`. The route is determined by impact and risk, not by the presence of the Skill.

## 5. Route visibility

When AI CTO governance applies, report one concise route line before substantive work:

`Route: L1 / Instant / LIGHT / R1 | Context: targeted | Validation: targeted`

This is a format example; the emitted line must contain the actual selected values. It is informational and does not create an approval pause. Omit it for `L0` ordinary conversation. Ask the user only when evidence is insufficient or a meaningful decision is required.

## 6. Scope and files

Modify only:

- `skills/ai-cto-system/SKILL.md` for the mandatory entry contract;
- existing Skill contract tests for static and behavioral routing assertions;
- project progress and memory records required by repository governance.

Validate `skills/ai-cto-system/agents/openai.yaml` against the updated Skill. Change it only if its existing metadata becomes inaccurate.

## 7. Test design

The behavior matrix must cover:

| Prompt class | Expected result |
|---|---|
| Ordinary explanation | `L0`; no AI CTO workflow or route line |
| Local documentation correction | `L1`; Instant / LIGHT / targeted; no new Phase, ADR, design, review or Gate |
| Approved normal feature implementation | `L2`; Engineering / STANDARD |
| Architecture or module change | At least `L3`; design and impact controls preserved |
| New product idea | `L4`; CTO entry beginning at Idea |
| Explicit opt-out | No AI CTO lifecycle or routing |

Static tests must fail against the current Skill because the mandatory route table, route-line contract and `L1` process-inflation guard are absent. After the minimal edit, schema validation, package tests, installer tests and the repository's existing regression suite must pass.

## 8. Boundaries and decision status

- No new Module, Phase, Runtime code, Capability, Provider or external integration.
- No actual model switching, tool invocation or execution authorization is added.
- Reasoning and model entries remain routing guidance unless the host platform exposes an authorized execution path.
- No ADR is required because this only connects an existing governance rule to its existing gateway and does not change Layer, Module, Gate or authority boundaries.

## 9. Acceptance criteria

1. Route classification occurs before governance context loading.
2. `L0` and `L1` do not inflate into a complete CTO workflow.
3. `L2`–`L4` retain the appropriate engineering, design and Gate controls.
4. AI CTO project work exposes one concise route line without adding a confirmation round.
5. Existing opt-out, authority, safety and Runtime boundaries remain intact.
6. Skill validation and all affected tests pass.
