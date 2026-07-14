# ADR-0014：Execution Routing Governance

- **状态：** Accepted
- **日期：** 2026-07-14
- **范围：** AI CTO System Layer 5 文档治理

## 背景

EFF-001 显示，一项已确认范围的治理文档同步任务可能使用高于理论复杂度的流程、Skill、Tool、Context 和人工确认。该案例不证明任何具体 Skill、模型、工具或 Git 规则有问题，但证明 AI CTO 需要可审计地判断“如何执行”，而不只是判断“做什么”。

Capability Governance 解决能力的准入、注册、评估、选择、权限和生命周期；它不定义面对一个具体任务时如何按复杂度、风险、成本、质量、上下文和用户偏好组合 Workflow 与资源。Intent Gateway、Agent Runtime、Tool Calling、Codex Integration 和 Automation 均仍为 Layer 5 `Planned` 能力，不能承担当前治理职责。

## 决策

建立独立的 **Execution Routing Governance** Module，Owning Layer 为 Layer 5，状态为 `Completed`（仅文档治理）。该模块：

1. 把 User Intent、Task Context、Project Context、偏好和 Evidence 转换为建议性的 Execution Plan。
2. 定义 L0–L4 复杂度、Instant / Engineering / CTO Workflow，以及 Skill、Tool、Model 类别、Reasoning Budget、Context 和用户偏好的选择规则。
3. 建立 Execution Routing Evidence 标准，将质量、时延、Token、成本、风险和人工交互作为未来 Evolution 的证据，而非即时自动化依据。
4. 明确 Router 不执行、不调用、不切换、不提交、不合并、不绕过 Gate，也不修改 Codex 行为。

## 后果

### 正面后果

- 为未来 Runtime 或 Router 的准入提供稳定、可审计的决策合同。
- 把复杂度、资源选择、Evidence、用户偏好和升级条件分离，减少“最高配置默认化”的风险。
- 与 Capability Governance、项目 Gate、ADR 和人类决策保持边界。

### 约束与风险

- EFF-001 是单案例，且部分指标为 `NOT_CAPTURED`；不得据此固定默认模型、流程、Git 偏好或自动执行规则。
- 文档治理完成不表示 Runtime、自动模型切换、工具调用或用户偏好自动应用已经实现。
- 未来任何实现、外部能力接入或自动化仍需独立的 Mission Alignment、Evidence Review、Module / Capability Admission、Feature Classification、Architecture Review、必要 ADR 和受影响 Gate。

## 替代方案

1. **将规则并入 Capability Governance：** 拒绝。会混淆“能力是否可调用”和“某任务应如何建议执行”。
2. **等待 Runtime 后再定义规则：** 拒绝。会导致实现先于可审计边界和 Evidence 合同。
3. **只保存 EFF-001，不建立模块：** 拒绝。单案例无法形成持续的统一路由治理入口。
