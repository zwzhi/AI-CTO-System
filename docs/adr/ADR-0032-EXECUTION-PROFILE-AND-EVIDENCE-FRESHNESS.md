# ADR-0032：Execution Profile 与 Evidence Freshness 对齐

- **状态：** Accepted（文档设计决策）
- **日期：** 2026-08-06
- **范围：** Layer 5 — Execution Routing Governance

## 背景

AI CTO 已定义 L0–L4 任务复杂度、R0–R4 推理预算、Workflow、Model、Context 与 Evidence 路由规则。真实使用和外部 Skills 包的只读审查显示，仍需清楚区分三件事：任务需要多少分析、任务须受到多严格的执行控制、以及已有验证证据是否仍适用于当前范围。

直接安装外部 Skills 包不合适：它会引入全局 AGENTS/Skill 安装与另一套记忆和 Gate 体系，且 Provider/License 证据和 Windows 验证兼容性仍未满足。因此本决策只吸收问题模式，不采用其实现。

## 决策

在既有 `Execution Routing Governance` Module 内建立以下设计语义：

1. 使用建议性的 `LIGHT`、`STANDARD`、`STRICT` Execution Profile 描述执行与验证强度；不创建新的 Module、Phase、Agent 或审批系统。
2. 继续由 L0–L4 决定默认 R0–R4；风险、可逆性、权限、数据影响与既有 Gate 决定最低 Profile；质量与 Evidence Freshness 决定验证义务。
3. 使用 `CURRENT`、`STALE`、`NOT_CAPTURED` 描述证据与其相关范围的当前性。该标签只服务审计与验证，不改变 Knowledge 或 Capability 生命周期。
4. Profile 与 Freshness 均只扩展建议性 Execution Plan；不执行、不自动切换模型、不调用工具、不改变 Git 策略，也不授予任何执行权限。

正式设计见 [Execution Profile & Evidence Freshness Design](../superpowers/specs/2026-08-06-execution-profile-evidence-freshness-design.md)。

## 后果

### 正面后果

- 将“轻量任务不应被过度流程化”与“高风险操作不得被效率目标降级”放在同一可审计模型中。
- 降低复用旧测试、审查或执行案例时误把过期证据视为当前证据的风险。
- 不引入第二套 Runtime、Gate、Memory、Capability 或审批权威。

### 约束与风险

- 目前只有文档设计和有限问题证据，不得把 Profile 当作自动路由、固定模型选择或自动执行规则。
- `STALE` 不能自动触发工具调用或重跑验证；`NOT_CAPTURED` 不能被推断为成功或失败。
- 未来实现仍须获得独立授权、收集多案例 Evidence，并通过相应的架构、权限与项目 Gate。

## 替代方案

1. **安装并直接采用外部 Skills 包：** 拒绝。会改变全局行为、重复系统权威且证据未完成。
2. **建立新的 Execution Profile Module：** 拒绝。职责已由 Execution Routing Governance 覆盖。
3. **只保留 L0–L4/R0–R4，不记录证据当前性：** 拒绝。无法解释风险控制强度和证据复用边界。
