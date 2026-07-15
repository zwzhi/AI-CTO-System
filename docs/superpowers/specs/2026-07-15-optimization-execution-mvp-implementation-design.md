# Phase 10 Optimization Execution MVP 实现设计规格

## 目标

实现第一个受控、内存级的 Optimization Execution 闭环，用于验证低风险、显式授权的非权威 Markdown 文档结构整理。

该实现不读取或写入文件系统，不接入网络、Provider、LLM、Codex、MCP、Git 或其他外部工具。它不会修改现有 `self-evolution/` 合同或服务；`OptimizationProposal.executionAuthorization` 继续固定为 `NONE`。

唯一允许的自动路径是测试调用方显式提供 `AUTO_EXECUTE` 授权的模拟场景。该模拟授权属于新执行请求的专用字段，不得回写或改变既有 Proposal 的授权语义。

## 范围

包含：

- 专用 `optimization-execution/` 目录中的轻量合同、资格检查、确定性 Markdown 优化器、验证器、回滚协调服务及测试。
- 显式传入的内存 Markdown 文档白名单和基线内容。
- 三类语义不变动作：精确重复块合并、空行与列表缩进规范化、合法 Markdown 标题结构规范化。
- 使用既有 `AuditService` 与 `AuditRepositoryPort` 追加执行 Evidence。
- 失败或验证不通过时返回原始基线内容并记录回滚 Evidence。

不包含：

- 文件系统读写、目录扫描、文档发现、真实 Git 变更、Commit、部署或网络访问。
- 任何权威文件、项目状态、规则、决策、Runtime、Permission、Capability 或 Knowledge 的变更。
- 语义改写、摘要生成、模型调用、自动删除资产或跨文档推断。
- 修改 `self-evolution/self-evolution-contract.ts`、`SelfEvolutionMvpService` 或 `OptimizationProposal.executionAuthorization`。

## 架构与职责

```text
Explicit In-memory Document Scope
  → OptimizationExecutionRequest
  → OptimizationEligibilityService
  → DeterministicMarkdownOptimizer
  → OptimizationValidationService
  → OptimizationExecutionService
  → OptimizationExecutionResult + Evidence
  → existing AuditService
```

### `optimization-execution-contract.ts`

定义此 MVP 的专用实体，不扩展 Self Evolution 合同：

- `AuthorizedMarkdownDocument`：`documentRef`、`content`、`baselineContent`、`authority` 固定为 `NON_AUTHORITATIVE`。
- `OptimizationExecutionRequest`：Proposal 引用、Risk Assessment 引用、Autonomy Decision、显式 `AUTO_EXECUTE` 测试授权、白名单文档、允许动作、验证计划、回滚计划、审计元数据。
- `OptimizationExecutionResult`：`COMPLETED`、`BLOCKED`、`ROLLED_BACK` 三种结果，实际 `changedScope`、文档结果、Validation Evidence、Audit Evidence、限制项。

`OptimizationExecutionRequest` 中只允许 `SIMPLIFY`，而 `AUTO_EXECUTE` 是唯一可运行的 Autonomy Decision。其他决策必须在资格检查阶段返回 `BLOCKED`。

### `OptimizationEligibilityService`

只负责执行前拒绝，不进行文本修改。它要求：

1. Proposal、Risk Assessment 和目标文档引用均非空；
2. Autonomy Decision 为 `AUTO_EXECUTE`，且测试授权显式为真；
3. 每个白名单文档引用唯一、内容和基线存在、权威级别为 `NON_AUTHORITATIVE`；
4. 动作集合只含 `DEDUPLICATE_EXACT_BLOCKS`、`NORMALIZE_FORMATTING`、`NORMALIZE_HEADINGS`；
5. 验证与回滚计划均存在。

任一条件不满足时不得调用优化器，结果为 `BLOCKED`，并生成拒绝 Evidence 与 Audit。

### `DeterministicMarkdownOptimizer`

只接受单个内存 Markdown 文本和白名单动作，不接收路径、文件句柄、网络或工具实例。

- `DEDUPLICATE_EXACT_BLOCKS`：仅移除连续、逐字完全相同的非空段落块，保留第一次出现；不合并近似文本。
- `NORMALIZE_FORMATTING`：将连续三行及以上空行收敛为一行空行，并保留每个非空行的原始文字与前导空格。
- `NORMALIZE_HEADINGS`：只将第一个标题前的多余空行移除；不改动任何标题文字或标题层级。

这些规则不改变非空行的文本内容、顺序或标题标记，从而避免语义推断。

### `OptimizationValidationService`

只负责验证，不生成修改。对候选输出验证：

1. `changedScope` 只包含请求白名单中的 `documentRef`；
2. 标题行仍符合 `#{1,6} ` 结构，且标题文本与标记未被改变；
3. 去除格式允许差异后，所有基线非空行按原顺序仍存在于候选文本；
4. 每个修改均可以从候选结果恢复为请求的 `baselineContent`；
5. Evidence 覆盖范围、结构、语义保持和回滚可用性。

验证不通过时，协调服务不得返回候选修改，必须返回每个文档的 `baselineContent`，状态为 `ROLLED_BACK`。

### `OptimizationExecutionService`

协调资格检查、优化、验证、回滚和既有 Audit：

- 成功：返回 `COMPLETED`、变更后的内存内容、`changedScope` 和完整 Validation Evidence。
- 资格拒绝：返回 `BLOCKED`，不调用优化器，不产生文档变化。
- 验证失败：返回 `ROLLED_BACK` 与基线内容，不保留候选变更。
- 每种路径只通过既有 `AuditService.append()` 写入一条可追溯 Audit Event；Audit 不拥有执行授权。

## Audit 与 Evidence

每个 Audit Event 至少携带：Proposal ID、Risk Assessment 引用、Autonomy Decision、授权白名单、实际 `changedScope`、Before/After 文档引用、验证状态、回滚状态和失败原因（如有）。

Evidence 的来源固定为 `optimization-execution`，其 Confidence 不得高于 `L3`；在没有真实项目或长期数据验证时不产生 `L4` 声明。

## 测试策略

在专用 `optimization-execution/optimization-execution-mvp.test.ts` 中使用 `node:test` 和 `assert`，并把它加入现有 `npm.cmd test` 命令。

必须覆盖：

1. 显式白名单的非权威 Markdown 文档在 `AUTO_EXECUTE` 模拟授权下完成确定性整理。
2. 未授权文档引用在优化器运行前被拒绝。
3. `AUTHORITATIVE` 文档在优化器运行前被拒绝。
4. 标题与非空文本片段保持不变，且 Validation Evidence 完整。
5. 注入非法候选输出时，验证失败并返回基线内容，状态为 `ROLLED_BACK`。
6. 成功、阻断与回滚路径均写入完整 Audit Evidence。
7. 优化服务没有文件、网络、Provider、Git 或 Runtime 状态副作用。

## 验收标准

- 不修改 Self Evolution MVP 核心合同或 `executionAuthorization = NONE`。
- 只有显式测试授权的 `AUTO_EXECUTE` 内存请求可进入优化器。
- 优化器只执行定义的确定性规则，不改变非空行文本、标题层级或文档语义。
- 资格拒绝不调用优化器；验证失败一律恢复基线内容。
- Audit 与 Evidence 覆盖成功、拒绝和回滚路径。
- 完整 `npm.cmd test` 通过，且只新增本 MVP 所需的实现与测试文件。
