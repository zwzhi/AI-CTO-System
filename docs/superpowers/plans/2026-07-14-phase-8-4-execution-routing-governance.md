# Phase 8.4 Execution Routing Governance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 建立 Phase 8.4 的执行路由治理标准、决策模型、证据模型、ADR 和系统入口同步，而不实现任何运行时路由能力。

**Architecture:** `Execution Routing Governance` 是 Layer 5 的独立文档治理模块，负责把任务输入转换为建议性的 `Execution Plan`；它不执行任何动作。十份治理文档分别定义总体合同、复杂度、各路由维度、用户偏好和 Evidence；Master Plan 与 Module Registry 作为系统级事实入口，SKILL、Project Memory 与 Progress 承载操作规则和状态。

**Tech Stack:** Markdown、Git、PowerShell 结构 / 链接 / 差异校验。

## Global Constraints

- 不开发 Runtime、Router 代码、Agent、队列、调度器、模型调用、工具调用、MCP 接入或自动化。
- 不调用外部工具，不修改 Codex 执行行为、当前 Git 策略或用户偏好。
- 不自动选择或切换模型，不授予执行、提交、合并、发布或生产变更授权。
- 所有输出是建议性的 `Execution Plan`，必须服从安全规则、项目 Gate、ADR、权限和用户当前指令。
- EFF-001 仅为单案例 Problem Validation Evidence；未捕获数据使用 `NOT_CAPTURED`，不得把它升级为通用规则。
- 不进入 Phase 8.5。

---

## 文件结构

| 文件 | 职责 |
|---|---|
| `docs/governance/EXECUTION_ROUTING_GOVERNANCE_STANDARD.md` | 定义输入、输出、职责、边界和禁止项。 |
| `docs/governance/TASK_COMPLEXITY_MODEL.md` | L0–L4 的分类、默认 Workflow、Context 和升级规则。 |
| `docs/governance/WORKFLOW_ROUTING_RULES.md` | Instant、Engineering、CTO Workflow 的选择与禁止项。 |
| `docs/governance/SKILL_ROUTING_POLICY.md` | 按任务、风险、复杂度与 Capability 选择 Skill。 |
| `docs/governance/TOOL_ROUTING_POLICY.md` | 只在必要、授权、价值明确时建议工具调用。 |
| `docs/governance/MODEL_ROUTING_POLICY.md` | 快速、标准、高推理、代码模型类别的非自动建议。 |
| `docs/governance/REASONING_BUDGET_POLICY.md` | R0–R4 的最低充分推理预算。 |
| `docs/governance/CONTEXT_ROUTING_POLICY.md` | L0–L4 的最小上下文加载规则。 |
| `docs/governance/USER_EXECUTION_PREFERENCE_STANDARD.md` | 用户偏好的适用性、冲突和不可覆盖边界。 |
| `docs/governance/EXECUTION_ROUTING_EVIDENCE_STANDARD.md` | 路由证据字段、质量、复核与 Evolution 使用限制。 |
| `docs/adr/ADR-0014-EXECUTION-ROUTING-GOVERNANCE.md` | 独立路由治理模块的决策记录。 |
| 五个治理入口 | 路线、模块事实、操作约束、记忆和进度同步。 |

### Task 1: 建立总体合同、复杂度模型与 Workflow 规则

**Files:**
- Create: `docs/governance/EXECUTION_ROUTING_GOVERNANCE_STANDARD.md`
- Create: `docs/governance/TASK_COMPLEXITY_MODEL.md`
- Create: `docs/governance/WORKFLOW_ROUTING_RULES.md`

**Consumes:** Master Plan 的五层边界、EFF-001、现有 Gate 与 Capability Governance。

**Produces:** 建议性 `Execution Plan` 合同、L0–L4 与 Instant / Engineering / CTO Workflow 映射。

- [ ] **Step 1: 写入总体标准**

定义 `User Intent`、`Task Context`、`Project Context` 输入和 `Execution Plan` 输出；输出字段包含 Complexity、Workflow、Capability、Skill、Tool、Model Category、Reasoning Budget、Context Scope、User Preference Application、Evidence、Confidence、Escalation Conditions。明确 Router 不执行动作、不覆盖 Gate / ADR / 安全 / 权限。

- [ ] **Step 2: 写入 L0–L4 模型**

为每级写入判断标准、示例、默认 Workflow、默认 Context、升级条件。L0 必须退出 AI CTO 流程；L1 为轻量执行；L2 为工程；L3 为设计加工程；L4 为完整 CTO。

- [ ] **Step 3: 写入 Workflow 路由**

定义三种 Workflow 的输入、适用范围、最小产物和升级条件；明确低风险 L1 不得仅为流程完整启动 CTO Workflow。

- [ ] **Step 4: 校验第一组文档**

运行：

```powershell
$files = @('docs/governance/EXECUTION_ROUTING_GOVERNANCE_STANDARD.md','docs/governance/TASK_COMPLEXITY_MODEL.md','docs/governance/WORKFLOW_ROUTING_RULES.md')
foreach ($file in $files) { if (-not (Test-Path $file)) { throw "Missing file: $file" } }
$complexity = Get-Content -Raw -Encoding utf8 $files[1]
foreach ($level in @('Level 0','Level 1','Level 2','Level 3','Level 4')) { if (-not $complexity.Contains($level)) { throw "Missing complexity level: $level" } }
```

预期：命令无错误退出。

### Task 2: 建立 Skill、Tool、Model 与 Reasoning 路由政策

**Files:**
- Create: `docs/governance/SKILL_ROUTING_POLICY.md`
- Create: `docs/governance/TOOL_ROUTING_POLICY.md`
- Create: `docs/governance/MODEL_ROUTING_POLICY.md`
- Create: `docs/governance/REASONING_BUDGET_POLICY.md`

**Consumes:** Task Complexity、Workflow 路由和 Capability Governance 边界。

**Produces:** 四类非执行性、最小充分的资源建议规则。

- [ ] **Step 1: 写入 Skill 与 Tool 政策**

Skill 政策必须使用 Task Type、Risk、Complexity、Required Capability，说明文档修改、工程任务与新项目的候选 Capability，并禁止无任务需求加载 Skill。Tool 政策必须覆盖浏览器、Git、代码执行、文件扫描和 MCP，且要求明确任务价值、权限与必要性；禁止为流程完整调用。

- [ ] **Step 2: 写入 Model 与 Reasoning 政策**

Model 政策仅使用快速、标准、高推理、代码模型四种类别，以复杂度、风险、质量和成本选择；不指定供应商或自动切换。Reasoning 政策定义 R0–R4 并按 L0–L4 给出默认最低充分等级和升级条件。

- [ ] **Step 3: 校验第二组文档**

运行：

```powershell
$checks = @{
  'docs/governance/SKILL_ROUTING_POLICY.md' = '禁止'
  'docs/governance/TOOL_ROUTING_POLICY.md' = '明确任务价值'
  'docs/governance/MODEL_ROUTING_POLICY.md' = '不是所有任务使用最高能力模型'
  'docs/governance/REASONING_BUDGET_POLICY.md' = 'R4'
}
foreach ($entry in $checks.GetEnumerator()) { $body = Get-Content -Raw -Encoding utf8 $entry.Key; if (-not $body.Contains($entry.Value)) { throw "Missing policy requirement: $($entry.Key) / $($entry.Value)" } }
```

预期：命令无错误退出。

### Task 3: 建立 Context、用户偏好与 Evidence 政策

**Files:**
- Create: `docs/governance/CONTEXT_ROUTING_POLICY.md`
- Create: `docs/governance/USER_EXECUTION_PREFERENCE_STANDARD.md`
- Create: `docs/governance/EXECUTION_ROUTING_EVIDENCE_STANDARD.md`

**Consumes:** L0–L4、EFF-001、Project Memory、User Brain、Portfolio、Knowledge 和安全 / Gate / ADR 边界。

**Produces:** 最小上下文、可控偏好和可演进路由 Evidence 合同。

- [ ] **Step 1: 写入 Context 政策**

规定 L1 加载当前文件和必要规则、L2 加载当前项目 Memory、L3 加载 Project Memory 加相关 Knowledge、L4 加载 User Brain 加 Portfolio 加 Knowledge；所有 Level 都按任务相关性收窄，禁止无差别全量加载。

- [ ] **Step 2: 写入用户偏好政策**

覆盖 Git 策略、Review 习惯、默认模型、默认流程；要求偏好明确、可撤销、当前适用且不冲突。安全规则、项目 Gate、ADR、权限和当前用户指令不得被偏好覆盖。

- [ ] **Step 3: 写入 Evidence 标准与 EFF-001 约束**

记录 Task Type、Complexity、Workflow、Skill、Tool、Model、Reasoning、Context、Duration、Token、Quality 及结果、成本、风险、人工交互、Evidence、Confidence、适用范围。`NOT_CAPTURED` 不得伪造；EFF-001 是单案例、L3 / 中等置信度，不能成为默认自动化规则。

- [ ] **Step 4: 校验第三组文档**

运行：

```powershell
$context = Get-Content -Raw -Encoding utf8 'docs/governance/CONTEXT_ROUTING_POLICY.md'
foreach ($needle in @('Level 1','Level 2','Level 3','Level 4','禁止')) { if (-not $context.Contains($needle)) { throw "Missing context requirement: $needle" } }
$preference = Get-Content -Raw -Encoding utf8 'docs/governance/USER_EXECUTION_PREFERENCE_STANDARD.md'
foreach ($needle in @('安全规则','项目 Gate','ADR')) { if (-not $preference.Contains($needle)) { throw "Missing preference boundary: $needle" } }
$evidence = Get-Content -Raw -Encoding utf8 'docs/governance/EXECUTION_ROUTING_EVIDENCE_STANDARD.md'
foreach ($needle in @('Task Type','Duration','Token','Quality','EFF-001','NOT_CAPTURED')) { if (-not $evidence.Contains($needle)) { throw "Missing evidence field: $needle" } }
```

预期：命令无错误退出。

### Task 4: 记录 ADR 并同步五个治理入口

**Files:**
- Create: `docs/adr/ADR-0014-EXECUTION-ROUTING-GOVERNANCE.md`
- Modify: `docs/strategy/AI_CTO_SYSTEM_MASTER_PLAN.md`
- Modify: `SKILL.md`
- Modify: `docs/architecture/MODULE_REGISTRY.md`
- Modify: `memory/project_memory/AI_CTO_SYSTEM_PROJECT_MEMORY.md`
- Modify: `docs/DEVELOPMENT_PROGRESS.md`

**Consumes:** 十份路由规则与 EFF-001。

**Produces:** ADR、Layer 5 Module Registry 事实、Phase 8.4 已完成的文档治理状态与非运行时边界。

- [ ] **Step 1: 创建 ADR-0014**

记录背景：EFF-001 显示需要基于复杂度管理流程与资源建议；决策：建立独立 Layer 5 Execution Routing Governance，输出建议性 Execution Plan；后果：与 Capability Governance、Intent Gateway、Runtime 分离，未来实施仍需独立准入和 Gate。

- [ ] **Step 2: 更新 Master Plan 与 Module Registry**

Master Plan 将 Phase 8.4 从 `PROPOSED` 改为“已完成文档治理、未实现运行时”，并增加 ADR-0014。Registry 新增 `Execution Routing Governance`、Layer 5、`Completed`，相关文档为总体规范、复杂度、Evidence 和 ADR；不得改动 Intent Gateway、Agent Runtime、Tool Calling、Codex Integration、Automation 的 `Planned` 状态。

- [ ] **Step 3: 更新 SKILL、Project Memory 与 Development Progress**

SKILL 加入路由前先分类、只建议不执行、最小充分资源和不覆盖 Gate 的规则。Project Memory 记录模块边界、EFF-001 限制和本阶段历史。Progress 写入 10 份规则、ADR、Registry 和入口同步完成，风险为单案例 Evidence 不足，下一步不进入 Phase 8.5 或 Runtime。

- [ ] **Step 4: 验证全量结构与边界**

运行：

```powershell
$docs = @(
  'docs/governance/EXECUTION_ROUTING_GOVERNANCE_STANDARD.md',
  'docs/governance/TASK_COMPLEXITY_MODEL.md',
  'docs/governance/WORKFLOW_ROUTING_RULES.md',
  'docs/governance/SKILL_ROUTING_POLICY.md',
  'docs/governance/TOOL_ROUTING_POLICY.md',
  'docs/governance/MODEL_ROUTING_POLICY.md',
  'docs/governance/REASONING_BUDGET_POLICY.md',
  'docs/governance/CONTEXT_ROUTING_POLICY.md',
  'docs/governance/USER_EXECUTION_PREFERENCE_STANDARD.md',
  'docs/governance/EXECUTION_ROUTING_EVIDENCE_STANDARD.md',
  'docs/adr/ADR-0014-EXECUTION-ROUTING-GOVERNANCE.md'
)
foreach ($doc in $docs) { if (-not (Test-Path $doc)) { throw "Missing required document: $doc" } }
$registry = Get-Content -Raw -Encoding utf8 'docs/architecture/MODULE_REGISTRY.md'
if (-not $registry.Contains('Execution Routing Governance')) { throw 'Missing Layer 5 registry entry' }
git diff --check
```

预期：命令无错误退出。

### Task 5: 执行全仓链接校验并提交

**Files:**
- Test: 全仓 Markdown 文件

**Consumes:** 全部已创建和同步的治理文档。

**Produces:** 可交付的 Phase 8.4 文档治理提交。

- [ ] **Step 1: 执行 Markdown 相对链接校验**

运行：

```powershell
$errors = [System.Collections.Generic.List[string]]::new()
Get-ChildItem -Recurse -File -Filter *.md | ForEach-Object {
  $file = $_
  $content = Get-Content -Raw -Encoding utf8 $file.FullName
  [regex]::Matches($content, '\[[^\]]+\]\(([^)#]+)(?:#[^)]+)?\)') | ForEach-Object {
    $target = $_.Groups[1].Value.Trim('<>')
    if ($target -and $target -notmatch '^(https?:|mailto:|#)' -and -not (Test-Path (Join-Path $file.DirectoryName $target))) { $errors.Add("$($file.FullName): $target") }
  }
}
if ($errors.Count) { $errors; exit 1 }
```

预期：命令无错误退出。

- [ ] **Step 2: 提交治理文档**

运行：

```powershell
git add docs/governance docs/adr/ADR-0014-EXECUTION-ROUTING-GOVERNANCE.md docs/strategy/AI_CTO_SYSTEM_MASTER_PLAN.md SKILL.md docs/architecture/MODULE_REGISTRY.md memory/project_memory/AI_CTO_SYSTEM_PROJECT_MEMORY.md docs/DEVELOPMENT_PROGRESS.md
git commit -m "docs: add execution routing governance"
```

预期：产生仅包含 Phase 8.4 文档治理的提交。
