# AI-CTO Auto-Intervention Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (- [ ]) syntax for tracking.

**Goal:** Make Codex automatically enter the existing AI-CTO lifecycle for relevant project requests and continue the current project's state without requiring the user to invoke $ai-cto-system explicitly.

**Architecture:** Strengthen the existing thin Skill Gateway with one automatic-intervention contract and one authority standard. The Skill identifies relevant requests, resolves the target project, routes L0-L4, loads only current relevant state, and reports one next action. Existing Project State, Project Memory, Lifecycle, Gate, Runtime, Task Envelope, Review and Checkpoint contracts remain authoritative. No new Runtime Controller, state source, background service, Agent, Capability or Module is introduced.

**Tech Stack:** Markdown, YAML, PowerShell static contract tests, existing Node.js 24 regression suite, and Codex Skill metadata; no new package dependency, Provider, MCP, model, network or external service.

## Global Constraints

- Design authority: docs/superpowers/specs/2026-08-14-ai-cto-auto-intervention-design.md, approved after commit 4e46a5b.
- Canonical authority root: D:\AI Project\AI-CTO-System.
- The Skill remains a thin entry gateway; it does not become Runtime, Workflow Controller, Agent Manager, Capability or Tool integration.
- Keep skills/ai-cto-system/agents/openai.yaml policy.allow_implicit_invocation: true.
- Explicit AI_CTO_MODE: OFF, 不要使用 AI CTO System, 普通模式处理, and 本次禁用 AI CTO Skill override inferred activation; AI_CTO_MODE: ON re-enables it.
- L0 ordinary conversation must not load the full governance corpus; L1 must remain targeted and resist process inflation.
- Existing PROJECT_STATE.md, PROJECT_MEMORY.md, Lifecycle, Gate, Evidence, Permission, Budget, Approval, Audit and Runtime contracts are the only authorities for their domains.
- Do not create AI_CTO_SESSION.md, a global conversation mirror, a second project state source, a background monitor, automatic commit/deploy, or unverified Fresh Session evidence.
- Do not merge the feature branch into main until implementation verification and a fresh-session pilot support that integration decision.

---

## File Map and Responsibility Lock

### Create

- docs/intent/AI_CTO_AUTO_INTERVENTION_STANDARD.md — authoritative trigger, target resolution, route, continuation, lifecycle-entry, safety and acceptance standard.
- docs/intent/AI_CTO_AUTO_INTERVENTION_FRESH_SESSION_PILOT.md — five-case pilot matrix with explicit NOT_CAPTURED, PASS and BLOCKED evidence states.

### Modify

- tests/ai-cto-skill-package.test.ps1 — package assertions for automatic intervention and implicit invocation.
- tests/ai-cto-skill-routing.test.ps1 — ordering and route/continuation assertions.
- skills/ai-cto-system/SKILL.md — automatic trigger, project resolution, continuation response and lifecycle-entry rules.
- skills/ai-cto-system/agents/openai.yaml — implicit-classification default prompt.
- SKILL.md — root authority clarification.
- README.md — truthful current-state description.
- docs/intent/INTENT_GATEWAY_STANDARD.md, docs/intent/INTENT_TRIGGER_RULES.md, docs/intent/PROACTIVE_INTERVENTION_POLICY.md — authority cross-links and boundaries.
- docs/architecture/MODULE_REGISTRY.md — project the entry change without adding a Module.
- DEVELOPMENT_PROGRESS.md and memory/project_memory/AI_CTO_SYSTEM_PROJECT_MEMORY.md — implementation and pilot evidence.

### Explicitly forbidden modifications

- Runtime Core state machine, Workflow, Task, Permission, Budget, Capability Registry, Knowledge Registry, ADRs, Lifecycle states, production configuration or external provider integrations.
- User-level Skill files other than the already verified Junction target.
- Any claim that Skill metadata alone proves Fresh Session discovery.

---

## Task 1: Define the regression contract first

**Files:** Modify tests/ai-cto-skill-package.test.ps1 and tests/ai-cto-skill-routing.test.ps1.

**Produces:** tests that fail before the Skill and standard are updated and pass only when the automatic-entry contract is present without removing route-first or opt-out guarantees.

- [ ] Step 1: Add these exact package assertions after the existing implicit invocation checks.

First replace the existing assertion `Assert-Contains $metadataText '$ai-cto-system' 'Default prompt must name the Skill.'` with `Assert-Contains $metadataText 'Automatically classify this request' 'The default prompt must describe implicit classification.'`; the metadata prompt is intentionally no longer a manual wake-up instruction.

~~~powershell
Assert-Contains $skillText 'Automatic intervention contract' 'The Skill must expose an automatic-intervention contract.'
Assert-Contains $skillText 'Do not require the user to invoke $ai-cto-system' 'Automatic entry must not require a manual Skill command.'
Assert-Contains $skillText 'PROJECT_STATE.md' 'Continuation must use the target project state.'
Assert-Contains $skillText 'PROJECT_MEMORY.md' 'Continuation must use the target project memory.'
Assert-Contains $skillText 'Current result' 'Governed responses must report the current result.'
Assert-Contains $skillText 'Unique next action' 'Governed responses must report one next action.'
Assert-Contains $metadataText 'Automatically classify this request' 'The default prompt must describe implicit classification.'
Assert-True (Test-Path -LiteralPath (Join-Path $repoRoot 'docs\intent\AI_CTO_AUTO_INTERVENTION_STANDARD.md')) 'The automatic-intervention standard must exist.'
~~~

- [ ] Step 2: Add these exact routing assertions after the existing route-first assertions.

~~~powershell
Assert-Contains $skillText '## Automatic intervention contract' 'The automatic contract heading must exist.'
Assert-Contains $skillText 'Apply opt-out first' 'Opt-out must remain the first decision.'
Assert-Contains $skillText 'Resolve the target project' 'Target project resolution must be explicit.'
Assert-Contains $skillText 'For a new idea, enter Idea Intake' 'New ideas must enter Idea Intake.'
Assert-Contains $skillText 'For an existing project, read PROJECT_STATE.md' 'Existing projects must resume from project state.'
Assert-Contains $skillText 'For each relevant message' 'Continuation output must be explicit.'
Assert-Contains $skillText 'Current result' 'Continuation output must include the current result.'
Assert-Contains $skillText 'Evidence and limitations' 'Continuation output must include evidence and limitations.'
Assert-Contains $skillText 'Unique next action' 'Continuation output must include one next action.'
Assert-Contains $skillText 'Do not create a new session state source' 'No second session state source may be created.'

$contractIndex = $skillText.IndexOf('## Automatic intervention contract', [System.StringComparison]::Ordinal)
$routeIndex = $skillText.IndexOf('## Route before loading authority', [System.StringComparison]::Ordinal)
$authorityIndex = $skillText.IndexOf('## Load routed authority', [System.StringComparison]::Ordinal)
Assert-True ($contractIndex -ge 0 -and $contractIndex -lt $routeIndex) 'Automatic intervention must be declared before route selection.'
Assert-True ($routeIndex -ge 0 -and $routeIndex -lt $authorityIndex) 'Route-first ordering must remain intact.'
~~~

- [ ] Step 3: Run the new tests and prove RED.

~~~powershell
powershell -NoProfile -ExecutionPolicy Bypass -File tests\ai-cto-skill-package.test.ps1
powershell -NoProfile -ExecutionPolicy Bypass -File tests\ai-cto-skill-routing.test.ps1
~~~

Expected: the tests fail because the new contract strings and standard file do not yet exist. Do not weaken the assertions.

- [ ] Step 4: Commit the contract tests.

~~~powershell
git add tests\ai-cto-skill-package.test.ps1 tests\ai-cto-skill-routing.test.ps1
git commit -m "test: define AI CTO automatic intervention contract"
~~~

## Task 2: Create the authoritative automatic-intervention standard

**Files:** Create docs/intent/AI_CTO_AUTO_INTERVENTION_STANDARD.md. Modify docs/intent/INTENT_GATEWAY_STANDARD.md, docs/intent/INTENT_TRIGGER_RULES.md and docs/intent/PROACTIVE_INTERVENTION_POLICY.md.

**Produces:** one concise operational standard referenced by the Skill instead of duplicating full governance.

- [ ] Step 1: Create the standard with these headings.

~~~markdown
# AI CTO Automatic Intervention Standard

## 1. Scope and authority
## 2. Trigger order and opt-out
## 3. Target project resolution
## 4. L0-L4 route selection
## 5. Continuation response contract
## 6. Lifecycle entry rules
## 7. Existing contract boundaries
## 8. Stop and ask conditions
## 9. Fresh Session acceptance matrix
~~~

The body must state that intervention occurs per relevant user message in Codex, not in the background; PROJECT_STATE.md and PROJECT_MEMORY.md are the only continuation authorities; new ideas enter Idea Intake; existing code enters onboarding; every governed response reports current result, current state, Evidence and limitations, and one next action; and opt-out is evaluated before routing.

- [ ] Step 2: Cross-link existing Intent authorities.

Add to INTENT_GATEWAY_STANDARD.md that the new standard governs entry and continuation only, while Intent Gateway remains the classifier and does not execute.

Add to INTENT_TRIGGER_RULES.md:

~~~markdown
Codex Skill Gateway 默认允许对项目相关请求进行隐式 AI CTO 介入；触发只进入分类、路由和适用生命周期，不创建执行授权。
~~~

Add to PROACTIVE_INTERVENTION_POLICY.md that intervention may occur automatically after a relevant user message, remains concise and rejectable, and never becomes a background monitor or automatic side effect.

- [ ] Step 3: Validate links and wording.

~~~powershell
rg -n "AI_CTO_AUTO_INTERVENTION_STANDARD|PROJECT_STATE.md|PROJECT_MEMORY.md|Fresh Session|background" docs/intent
git diff --check
~~~

Expected: all four Intent documents point to the same standard and no whitespace error is reported.

- [ ] Step 4: Commit the authority standard.

~~~powershell
git add docs/intent/AI_CTO_AUTO_INTERVENTION_STANDARD.md docs/intent/INTENT_GATEWAY_STANDARD.md docs/intent/INTENT_TRIGGER_RULES.md docs/intent/PROACTIVE_INTERVENTION_POLICY.md
git commit -m "docs: define AI CTO automatic intervention standard"
~~~

## Task 3: Strengthen the Codex Skill Gateway without adding Runtime

**Files:** Modify skills/ai-cto-system/SKILL.md and skills/ai-cto-system/agents/openai.yaml.

**Produces:** a thin Skill that Codex may invoke implicitly and that tells the host how to continue a relevant AI-CTO project request.

- [ ] Step 1: Insert this section after the Skill title and before Apply opt-out first.

~~~markdown
## Automatic intervention contract

Codex may invoke this Skill implicitly when the user presents a product idea, project request, feature, bug, architecture, testing, delivery, maintenance, takeover, incident, or project continuation need. Do not require the user to invoke $ai-cto-system.

For each relevant message:

- Apply opt-out first.
- Resolve the target project.
- Classify the request and choose the lightest sufficient L0-L4 route.
- Load only the required authority and continue the current lifecycle.
- Report the Current result, Current state, Evidence and limitations, and one Unique next action.

For a new idea, enter Idea Intake without creating a formal project before confirmation. For an existing project, read PROJECT_STATE.md and PROJECT_MEMORY.md before selecting the next task. Do not create a new session state source or infer historical stages that are not evidenced.
~~~

- [ ] Step 2: Add docs/intent/AI_CTO_AUTO_INTERVENTION_STANDARD.md to the Skill authority table for automatic-entry and project-continuation policy requests. Preserve the existing first-authority mappings for new projects, onboarding and system changes.

- [ ] Step 3: Replace skills/ai-cto-system/agents/openai.yaml with exactly:

~~~yaml
interface:
  display_name: "AI CTO System"
  short_description: "Automatically route project work through governed AI CTO workflows"
  default_prompt: "Automatically classify this request and enter the lightest applicable AI CTO workflow when it is relevant."
policy:
  allow_implicit_invocation: true
~~~

- [ ] Step 4: Run package, routing and official Skill validation.

~~~powershell
powershell -NoProfile -ExecutionPolicy Bypass -File tests\ai-cto-skill-package.test.ps1
powershell -NoProfile -ExecutionPolicy Bypass -File tests\ai-cto-skill-routing.test.ps1
python "$env:USERPROFILE\.codex\skills\.system\skill-creator\scripts\quick_validate.py" skills\ai-cto-system
~~~

Expected: both PowerShell tests and the official validator pass, implicit invocation remains true, and the thin-gateway size guard passes.

- [ ] Step 5: Commit the Skill changes.

~~~powershell
git add skills\ai-cto-system\SKILL.md skills\ai-cto-system\agents\openai.yaml
git commit -m "feat: make AI CTO Skill automatically continue project work"
~~~

## Task 4: Synchronize authority projections and prepare the Fresh Session pilot

**Files:** Create docs/intent/AI_CTO_AUTO_INTERVENTION_FRESH_SESSION_PILOT.md. Modify SKILL.md, README.md, docs/architecture/MODULE_REGISTRY.md, DEVELOPMENT_PROGRESS.md and memory/project_memory/AI_CTO_SYSTEM_PROJECT_MEMORY.md.

**Produces:** synchronized system entry documents and a pilot record that distinguishes static contract evidence from real new-session behavior.

- [ ] Step 1: Align root authority and README.

Add under the forced entry rules in root SKILL.md:

~~~markdown
Codex 的 skills/ai-cto-system 是本系统的自动入口；用户不需要显式唤醒。该入口只负责识别、路由和接续，实际项目状态、生命周期、Gate 与执行授权仍以仓库权威为准。
~~~

In README.md, replace the current-state sentence that claims no external Skill is installed with a factual statement that the repository Skill Gateway exists, implicit invocation is enabled, and fresh-session discovery still requires pilot evidence.

- [ ] Step 2: Update registry, progress and memory.

Update the existing Intent Gateway / Runtime entry in docs/architecture/MODULE_REGISTRY.md to mention automatic Skill entry and continuation without adding a Module.

Append a dated AI-CTO Automatic Intervention section to DEVELOPMENT_PROGRESS.md and memory/project_memory/AI_CTO_SYSTEM_PROJECT_MEMORY.md with integration decision EXTEND_EXISTING_MODULE, execution authorization NONE, static package/routing/validator evidence, Fresh Session status NOT_CAPTURED until a new conversation is observed, and next action to run the five-case pilot.

- [ ] Step 3: Create the pilot matrix with these exact cases.

~~~markdown
| Case | New-session input | Expected automatic behavior | Evidence status |
|---|---|---|---|
| New idea | 我有一个产品想法，帮我判断能不能做 | Enters Idea Intake without $ai-cto-system | NOT_CAPTURED |
| Existing project request | 给这个项目增加一个低风险功能 | Identifies target project and prints actual L0-L3 route | NOT_CAPTURED |
| Continuation | 继续 | Reads current project state and resumes the recorded Next Action | NOT_CAPTURED |
| Ordinary conversation | 解释一下什么是 API | Does not load full AI-CTO governance | NOT_CAPTURED |
| Explicit opt-out | AI_CTO_MODE: OFF，普通模式处理 | Does not enter AI-CTO for that request | NOT_CAPTURED |
~~~

Add instructions that the matrix must use a newly opened Codex conversation, record exact observed route/context/response, and never mark PASS from static files alone.

- [ ] Step 4: Run static regression and the full suite.

~~~powershell
powershell -NoProfile -ExecutionPolicy Bypass -File tests\ai-cto-skill-package.test.ps1
powershell -NoProfile -ExecutionPolicy Bypass -File tests\ai-cto-skill-routing.test.ps1
npm.cmd test
git diff --check
~~~

Expected: Skill package/routing tests pass, the existing Node regression remains green, and no Runtime side-effect boundary changes.

- [ ] Step 5: Commit synchronized authority and pilot matrix.

~~~powershell
git add SKILL.md README.md docs\architecture\MODULE_REGISTRY.md docs\intent\AI_CTO_AUTO_INTERVENTION_FRESH_SESSION_PILOT.md DEVELOPMENT_PROGRESS.md memory\project_memory\AI_CTO_SYSTEM_PROJECT_MEMORY.md
git commit -m "docs: sync AI CTO automatic intervention entry"
~~~

## Task 5: Execute the Fresh Session pilot and hand off integration

**Files:** Modify docs/intent/AI_CTO_AUTO_INTERVENTION_FRESH_SESSION_PILOT.md, DEVELOPMENT_PROGRESS.md and memory/project_memory/AI_CTO_SYSTEM_PROJECT_MEMORY.md.

**Produces:** real host-level evidence for automatic invocation, or a precise blocked result explaining what the host did not expose.

- [ ] Step 1: Verify the canonical source and discovery target.

~~~powershell
$source = 'D:\AI Project\AI-CTO-System\skills\ai-cto-system'
$destination = 'C:\Users\白名单\.codex\skills\ai-cto-system'
Get-Item -LiteralPath $source
Get-Item -LiteralPath $destination -Force
~~~

Expected: the destination is the verified Junction to the canonical source. Do not overwrite or recreate it.

- [ ] Step 2: Execute the five cases in a newly opened Codex conversation.

For each case record exact input, whether the Skill was automatically selected, route line, loaded context scope, result, limitations and next action. If the host does not expose selection metadata, record NOT_OBSERVABLE rather than inferring success from response style.

- [ ] Step 3: Update pilot status with evidence.

Only change NOT_CAPTURED to PASS when expected behavior is observed in the new conversation. If any case fails, record BLOCKED with exact failure and do not claim the gateway is validated.

- [ ] Step 4: Re-run regression after updating the pilot record.

~~~powershell
powershell -NoProfile -ExecutionPolicy Bypass -File tests\ai-cto-skill-package.test.ps1
powershell -NoProfile -ExecutionPolicy Bypass -File tests\ai-cto-skill-routing.test.ps1
npm.cmd test
git diff --check
~~~

- [ ] Step 5: Commit the evidence record and stop before merge.

~~~powershell
git add docs\intent\AI_CTO_AUTO_INTERVENTION_FRESH_SESSION_PILOT.md DEVELOPMENT_PROGRESS.md memory\project_memory\AI_CTO_SYSTEM_PROJECT_MEMORY.md
git commit -m "test: record AI CTO automatic intervention pilot"
~~~

Do not merge into main automatically. Present branch integration choices separately after evidence review.

## Self-Review Checklist

- [ ] Every Spec requirement has a corresponding task and acceptance assertion.
- [ ] The plan adds no Runtime Controller, second state source, background monitor, Agent, Capability or Module.
- [ ] The Skill remains implicitly invocable and opt-out-first.
- [ ] L0/L1 process inflation rules remain intact.
- [ ] Fresh Session status cannot be marked PASS without a new conversation observation.
- [ ] All commands are runnable from repository root on Windows PowerShell.
- [ ] No step relies on TODO, TBD, an unspecified file, or an unnamed error path.
