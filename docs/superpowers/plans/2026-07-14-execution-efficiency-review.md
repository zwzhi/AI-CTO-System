# Execution Efficiency Review Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为 Phase 8.4 路线调整同步建立一条可审计、边界受控的 Execution Efficiency Evidence 案例。

**Architecture:** 新案例是 `docs/governance/execution_cases/` 下的单一事实记录；它引用当前 Master Plan 的路线状态，但不成为 Module 或流程授权来源。`DEVELOPMENT_PROGRESS.md` 只记录案例建立、证据限制和后续验证条件，保持 Phase 8.4 为 `PROPOSED`。

**Tech Stack:** Markdown、Git、PowerShell 文档与链接校验。

## Global Constraints

- 只使用本次对话、Git 历史和文档改动可核验的信息；精确时间、Token、内部推理数据使用 `NOT_CAPTURED`。
- 单次案例只能形成待验证假设，不能变更 Skill、Tool、Workflow、Git 策略、Module、ADR 或 Phase 状态。
- 不启动 Phase 8.4，不实现模型路由、队列、直接调用、Runtime、自动化或偏好自动应用。
- 案例必须包含任务基本信息、类型判断、执行数据、效率分析、路由假设和经验结论六个章节。

---

## 文件结构

- `docs/governance/execution_cases/EFF-001-phase-8-4-route-sync-review.md`：单次执行的事实、分析与假设记录。
- `docs/DEVELOPMENT_PROGRESS.md`：项目级进度、风险和下一步索引；不复制案例全文。

### Task 1: 创建 EFF-001 执行效率案例

**Files:**
- Create: `docs/governance/execution_cases/EFF-001-phase-8-4-route-sync-review.md`

**Consumes:** 已提交的路线调整提交 `68647ed`、`e1c4773`、`96930eb`，以及已确认的真实反馈：模型耗时、Token 效率、流程过载风险。

**Produces:** `EFF-001`，用于未来 Phase 8.4 的 Problem Validation Evidence，不提供实施授权。

- [ ] **Step 1: 创建目录与案例标题、元数据**

创建目录 `docs/governance/execution_cases/`，并写入标题 `# EFF-001：Phase 8.4 路线调整同步执行效率复盘`。在文档开头声明其用途仅为 `Problem Validation Evidence`，不改变 Skill、Git 策略、Module、ADR 或 Phase 状态。

- [ ] **Step 2: 记录六个指定章节与可核验证据**

写入以下固定章节：

```markdown
## 1. 任务基本信息
## 2. 任务类型判断
## 3. 执行数据
## 4. 效率分析
## 5. 路由假设
## 6. 经验结论
```

将任务记录为 `Phase 8.4 路线调整同步`、目的为更新路线规划入口和项目记忆；理论模式为 `Instant` / `Level 1`，实际复杂度为“高于理论预期”。对开始时间、结束时间、总耗时、Token 和内部推理等级写 `NOT_CAPTURED`，并记录已知技能、工具、Planning、上下文、修改文件数、Git 变更和人工交互事实。

- [ ] **Step 3: 写入受控的效率结论与路由假设**

将 Workflow、Skill、Tool、Context、Reasoning、Git 确认和用户偏好列为待验证观察，而非已确认缺陷。路由假设只能建议 Lightweight Documentation Update、Documentation Capability、低成本模型、低等级推理、最小相关治理上下文和在既有偏好/授权下减少 Git 摩擦；必须说明需要多案例比较后才能形成规则。

- [ ] **Step 4: 执行结构与范围校验**

运行：

```powershell
$file = 'docs/governance/execution_cases/EFF-001-phase-8-4-route-sync-review.md'
$content = Get-Content -Raw -Encoding utf8 $file
foreach ($heading in @('## 1. 任务基本信息','## 2. 任务类型判断','## 3. 执行数据','## 4. 效率分析','## 5. 路由假设','## 6. 经验结论')) { if (-not $content.Contains($heading)) { throw "Missing section: $heading" } }
foreach ($needle in @('NOT_CAPTURED','Problem Validation Evidence','不改变','多案例')) { if (-not $content.Contains($needle)) { throw "Missing boundary: $needle" } }
```

预期：命令无错误退出。

### Task 2: 同步项目进度并验证文档关系

**Files:**
- Modify: `docs/DEVELOPMENT_PROGRESS.md`
- Test: `docs/governance/execution_cases/EFF-001-phase-8-4-route-sync-review.md`

**Consumes:** 已创建的 `EFF-001`。

**Produces:** 项目进度中可检索的 Evidence 记录、风险提示与后续验证动作。

- [ ] **Step 1: 在已完成、风险与下一步中添加最小索引**

在进度文件记录 `EFF-001` 已建立，说明其只支持 Problem Validation Evidence；补充单次案例与 `NOT_CAPTURED` 数据不能直接形成路由规则的风险，并在下一步写明需要多个可比较案例、Mission Alignment、Admission、Feature Classification 和受影响 Gate 分析。

- [ ] **Step 2: 确认 Phase 8.4 状态未被改变**

在新增条目中保持 `PROPOSED`、未进入 Phase 8.4 的文字；不得添加 Module、ADR、Capability Activation 或实施完成表述。

- [ ] **Step 3: 运行链接、一致性与差异校验**

运行：

```powershell
$required = @('docs/governance/execution_cases/EFF-001-phase-8-4-route-sync-review.md','docs/DEVELOPMENT_PROGRESS.md')
foreach ($file in $required) { if (-not (Test-Path $file)) { throw "Missing file: $file" } }
if (-not ((Get-Content -Raw -Encoding utf8 'docs/DEVELOPMENT_PROGRESS.md').Contains('EFF-001'))) { throw 'Progress does not reference EFF-001' }
git diff --check
```

预期：命令无错误退出。

- [ ] **Step 4: 提交文档证据**

运行：

```powershell
git add docs/governance/execution_cases/EFF-001-phase-8-4-route-sync-review.md docs/DEVELOPMENT_PROGRESS.md
git commit -m "docs: add execution efficiency review evidence"
```

预期：产生一个只包含案例和进度同步的文档提交。
