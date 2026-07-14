# Phase 8.5 Intent Gateway Governance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 建立 Phase 8.5 Intent Gateway 的分类、触发、置信度、冲突、Evidence 与系统入口治理，而不实现 Runtime 或 Classifier。

**Architecture:** `Intent Gateway` 是 Layer 5 的独立文档治理 Module，输出建议性的 `Intent Classification Result`。它向 Execution Routing Governance 提供 Intent、复杂度候选、风险、置信度和确认要求；Execution Routing 保持“如何执行”的职责，不执行任何动作。

**Tech Stack:** Markdown、Git、PowerShell 结构 / 链接 / 差异校验。

## Global Constraints

- 不开发 Runtime、Intent Classifier、Agent、模型调用、工具调用、MCP、自动化或自动任务执行。
- 不修改 Codex 执行行为，不训练、评测或部署 Intent 模型。
- Intent Classification Result 是建议，不构成执行、提交、合并、发布或生产变更授权。
- 低置信度、冲突、超出范围和 Evidence 不足必须使用询问、`AMBIGUOUS`、`OUT_OF_SCOPE` 或 `INSUFFICIENT_EVIDENCE`，不得强行分类。
- 不进入 Phase 8.6。

---

## 文件结构

| 文件 | 职责 |
|---|---|
| `docs/intent/INTENT_GATEWAY_STANDARD.md` | 输入、输出、职责与 Execution Routing 边界。 |
| `docs/intent/INTENT_CLASSIFICATION_STANDARD.md` | 十类 Intent 的识别、示例与默认复杂度。 |
| `docs/intent/INTENT_TRIGGER_RULES.md` | 是否触发 AI CTO 与 Workflow 的规则。 |
| `docs/intent/INTENT_CONFIDENCE_STANDARD.md` | L1–L4 与询问 / 建议行为。 |
| `docs/intent/INTENT_EXECUTION_MAPPING.md` | Intent → Complexity → Workflow → Capability 映射。 |
| `docs/intent/INTENT_CONFLICT_RESOLUTION.md` | 模糊、冲突、多意图和纠正处理。 |
| `docs/intent/PROACTIVE_INTERVENTION_POLICY.md` | 主动建议的允许与禁止边界。 |
| `docs/intent/INTENT_EVIDENCE_STANDARD.md` | Intent Evidence 字段与未来优化限制。 |
| `docs/adr/ADR-0015-INTENT-GATEWAY-GOVERNANCE.md` | Intent Gateway 的边界决策。 |
| 五个治理入口 | 路线、模块、操作、记忆和进度同步。 |

### Task 1: 建立总体合同与 Intent 分类体系

**Files:**
- Create: `docs/intent/INTENT_GATEWAY_STANDARD.md`
- Create: `docs/intent/INTENT_CLASSIFICATION_STANDARD.md`

**Consumes:** Layer 5 架构、Execution Routing Governance、项目生命周期与现有 Gate。

**Produces:** Intent Classification Result 合同及十类 Intent 分类定义。

- [ ] **Step 1: 写入总体标准**

定义 `User Input`、`Conversation Context`、`Project Context` 输入；定义 `Intent Type`、`Confidence`、`Risk Level`、`Suggested Workflow`、`Required Capability`、`AI CTO Trigger`、`Confirmation Required`、Evidence 与 Escalation Conditions 输出。明确 Intent Gateway 判断意图，Execution Routing 决定建议性执行方式，二者都不执行。

- [ ] **Step 2: 写入十类 Intent**

为 `NEW_PROJECT`、`FEATURE_REQUEST`、`BUG_FIX`、`INCIDENT`、`REFACTOR`、`ARCHITECTURE_CHANGE`、`RESEARCH_REQUEST`、`KNOWLEDGE_UPDATE`、`PROJECT_STATUS_QUERY`、`GENERAL_CONVERSATION` 分别写入描述、识别特征、示例和默认复杂度；增加 `AMBIGUOUS`、`OUT_OF_SCOPE` 与 `INSUFFICIENT_EVIDENCE` 的安全结果。

- [ ] **Step 3: 校验合同与分类**

运行：

```powershell
$gateway = Get-Content -Raw -Encoding utf8 'docs/intent/INTENT_GATEWAY_STANDARD.md'
foreach ($needle in @('User Input','Conversation Context','Project Context','Intent Classification Result','Execution Routing')) { if (-not $gateway.Contains($needle)) { throw "Missing gateway contract: $needle" } }
$classification = Get-Content -Raw -Encoding utf8 'docs/intent/INTENT_CLASSIFICATION_STANDARD.md'
foreach ($intent in @('NEW_PROJECT','FEATURE_REQUEST','BUG_FIX','INCIDENT','REFACTOR','ARCHITECTURE_CHANGE','RESEARCH_REQUEST','KNOWLEDGE_UPDATE','PROJECT_STATUS_QUERY','GENERAL_CONVERSATION')) { if (-not $classification.Contains($intent)) { throw "Missing intent: $intent" } }
```

预期：命令无错误退出。

### Task 2: 建立触发、置信度、映射与冲突规则

**Files:**
- Create: `docs/intent/INTENT_TRIGGER_RULES.md`
- Create: `docs/intent/INTENT_CONFIDENCE_STANDARD.md`
- Create: `docs/intent/INTENT_EXECUTION_MAPPING.md`
- Create: `docs/intent/INTENT_CONFLICT_RESOLUTION.md`

**Consumes:** Intent 分类、Task Complexity Model 与 Execution Routing 规则。

**Produces:** 可解释的触发、确认和下游 Routing 输入。

- [ ] **Step 1: 写入触发与置信度规则**

触发规则覆盖新项目、架构变化、重大功能、项目风险与 Incident；普通问答、解释、非技术聊天不触发完整 AI CTO。置信度定义 L1–L4；L1 必须提问，L2 需确认，L3 可建议，L4 可输出完整建议但不授权执行。

- [ ] **Step 2: 写入 Intent 到 Execution Routing 映射**

建立 Intent → Complexity → Workflow → Capability 表，至少包含 `NEW_PROJECT → L4 → CTO Workflow → Research + Product + Architecture Capability` 和 `BUG_FIX → L1/L2 → Instant / Engineering Workflow → Engineering + Testing Capability`；说明分类置信度不足时不能作为 Routing 事实。

- [ ] **Step 3: 写入冲突处理规则**

定义模糊表述、多 Intent、上下文矛盾、用户纠正和项目状态不明的处理。对“这个系统不太好”不得强行选 BUG_FIX、FEATURE_REQUEST 或 REFACTOR，必须提出最小澄清问题。

- [ ] **Step 4: 校验第二组规则**

运行：

```powershell
$confidence = Get-Content -Raw -Encoding utf8 'docs/intent/INTENT_CONFIDENCE_STANDARD.md'
foreach ($level in @('L1','L2','L3','L4')) { if (-not $confidence.Contains($level)) { throw "Missing confidence level: $level" } }
$mapping = Get-Content -Raw -Encoding utf8 'docs/intent/INTENT_EXECUTION_MAPPING.md'
foreach ($needle in @('NEW_PROJECT','CTO Workflow','BUG_FIX','Engineering')) { if (-not $mapping.Contains($needle)) { throw "Missing mapping: $needle" } }
$conflict = Get-Content -Raw -Encoding utf8 'docs/intent/INTENT_CONFLICT_RESOLUTION.md'
if (-not $conflict.Contains('不能强行判断')) { throw 'Missing no-forced-classification rule' }
```

预期：命令无错误退出。

### Task 3: 建立主动介入与 Intent Evidence 规则

**Files:**
- Create: `docs/intent/PROACTIVE_INTERVENTION_POLICY.md`
- Create: `docs/intent/INTENT_EVIDENCE_STANDARD.md`

**Consumes:** Intent 分类、置信度、用户当前指令、Execution Routing Evidence 标准。

**Produces:** 非打扰的主动建议边界与未来 Intent 优化 Evidence 合同。

- [ ] **Step 1: 写入主动介入政策**

允许在明确开发需求、项目风险、生产 Incident 或用户请求治理建议时介入；禁止无依据地把模糊抱怨、普通聊天或非技术交流推成复杂改造。主动建议必须说明触发依据、候选 Intent、Confidence 和可拒绝的下一步。

- [ ] **Step 2: 写入 Intent Evidence 标准**

至少记录 User Input、Detected Intent、Confidence、Actual Result、Correction、Conversation / Project Context、Trigger Decision、Evidence、适用范围和限制。单案例不训练或固化分类规则；未知值为 `NOT_CAPTURED`。

- [ ] **Step 3: 校验第三组规则**

运行：

```powershell
$proactive = Get-Content -Raw -Encoding utf8 'docs/intent/PROACTIVE_INTERVENTION_POLICY.md'
foreach ($needle in @('允许','不允许','不打扰用户')) { if (-not $proactive.Contains($needle)) { throw "Missing proactive policy: $needle" } }
$evidence = Get-Content -Raw -Encoding utf8 'docs/intent/INTENT_EVIDENCE_STANDARD.md'
foreach ($needle in @('User Input','Detected Intent','Confidence','Actual Result','Correction','NOT_CAPTURED')) { if (-not $evidence.Contains($needle)) { throw "Missing intent evidence field: $needle" } }
```

预期：命令无错误退出。

### Task 4: 创建 ADR 并同步治理入口

**Files:**
- Create: `docs/adr/ADR-0015-INTENT-GATEWAY-GOVERNANCE.md`
- Modify: `docs/strategy/AI_CTO_SYSTEM_MASTER_PLAN.md`
- Modify: `SKILL.md`
- Modify: `docs/architecture/MODULE_REGISTRY.md`
- Modify: `memory/project_memory/AI_CTO_SYSTEM_PROJECT_MEMORY.md`
- Modify: `docs/DEVELOPMENT_PROGRESS.md`

**Consumes:** 八份 Intent 规则与 Execution Routing 边界。

**Produces:** ADR、Layer 5 Intent Gateway Module 事实和 Phase 8.5 文档治理状态。

- [ ] **Step 1: 创建 ADR-0015**

记录：用户输入需要先判断是否属于 AI CTO、是否触发治理与是否需要确认；决策是建立独立 Intent Gateway，向 Execution Routing 提供分类输入；后果是 Runtime / Classifier 仍需独立准入、Evidence、ADR 与 Gate。

- [ ] **Step 2: 更新 Master Plan 与 Module Registry**

Master Plan 记录 Phase 8.5 文档治理已完成、没有 Runtime / Classifier / 调用 / 自动化，并在 ADR 索引加入 ADR-0015。Registry 将现有 Intent Gateway 从 `Planned` 更新为 `Completed`，相关文档为总体规范、分类、Evidence 与 ADR；Agent Runtime 等其他 Layer 5 Module 仍为 `Planned`。

- [ ] **Step 3: 更新 SKILL、Project Memory 与 Progress**

SKILL 加入 Intent 先分类、低置信度询问、分类与路由分离、不得强行分类或自动执行的规则。Project Memory 记录边界和历史。Progress 写入八份规则、ADR 和入口同步完成，风险为无 Runtime / Classifier / 真实 Evidence，下一步不进入 Phase 8.6。

- [ ] **Step 4: 验证结构与边界**

运行：

```powershell
$docs = @('docs/intent/INTENT_GATEWAY_STANDARD.md','docs/intent/INTENT_CLASSIFICATION_STANDARD.md','docs/intent/INTENT_TRIGGER_RULES.md','docs/intent/INTENT_CONFIDENCE_STANDARD.md','docs/intent/INTENT_EXECUTION_MAPPING.md','docs/intent/INTENT_CONFLICT_RESOLUTION.md','docs/intent/PROACTIVE_INTERVENTION_POLICY.md','docs/intent/INTENT_EVIDENCE_STANDARD.md','docs/adr/ADR-0015-INTENT-GATEWAY-GOVERNANCE.md')
foreach ($doc in $docs) { if (-not (Test-Path $doc)) { throw "Missing required document: $doc" } }
$registry = Get-Content -Raw -Encoding utf8 'docs/architecture/MODULE_REGISTRY.md'
foreach ($needle in @('Intent Gateway','Completed','Agent Runtime','Planned')) { if (-not $registry.Contains($needle)) { throw "Missing registry boundary: $needle" } }
git diff --check
```

预期：命令无错误退出。

### Task 5: 执行全仓链接校验并提交

**Files:**
- Test: 全仓 Markdown 文件

**Consumes:** 全部 Intent 文档与入口同步。

**Produces:** 可交付的 Phase 8.5 文档治理提交。

- [ ] **Step 1: 执行 Markdown 相对链接校验**

运行：

```powershell
$errors = [System.Collections.Generic.List[string]]::new()
Get-ChildItem -Recurse -File -Filter *.md | ForEach-Object {
  $file = $_; $content = Get-Content -Raw -Encoding utf8 $file.FullName
  [regex]::Matches($content, '\[[^\]]+\]\(([^)#]+)(?:#[^)]+)?\)') | ForEach-Object {
    $target = $_.Groups[1].Value.Trim('<>')
    if ($target -and $target -notmatch '^(https?:|mailto:|#)' -and -not (Test-Path (Join-Path $file.DirectoryName $target))) { $errors.Add("$($file.FullName): $target") }
  }
}
if ($errors.Count) { $errors; exit 1 }
git diff --check
```

预期：命令无错误退出。

- [ ] **Step 2: 提交治理文档**

运行：

```powershell
git add docs/intent docs/adr/ADR-0015-INTENT-GATEWAY-GOVERNANCE.md docs/strategy/AI_CTO_SYSTEM_MASTER_PLAN.md SKILL.md docs/architecture/MODULE_REGISTRY.md memory/project_memory/AI_CTO_SYSTEM_PROJECT_MEMORY.md docs/DEVELOPMENT_PROGRESS.md
git commit -m "docs: add intent gateway governance"
```

预期：产生只包含 Phase 8.5 文档治理的提交。
