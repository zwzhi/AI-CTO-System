# ADR-0024: Codex Capability Integration

## 状态

Accepted — 仅限 Phase 9C-5 Codex Capability Integration Design。

## 背景

Runtime Foundation 和 Single Agent Runtime 已验证受控的 Task、Permission、Budget、Approval 与 Audit 边界。未来需要使用 Codex 类工程执行能力，但若让 Codex 直接成为 Core、Workflow Controller 或 Agent Manager，将破坏 Control Plane First、项目 Gate 和人工决策权。

## 决策

Codex 作为 Layer 5 的 `Engineering Capability`，只能经 `Capability Adapter` 与 Runtime 合同接入。Runtime 保留任务分配、权限/预算检查、审批、取消、审计和 Workflow 状态权；Codex 仅对一次授权请求返回 Result + Evidence。文件修改和创建 Commit 默认 `CONFIRM`，核心治理文件和 Gate 操作禁止。

## 后果

该选择提供可替换、可禁用、可审计的供应商边界，并使 Mock Adapter 能先验证控制合同。代价是首次真实接入需要独立完成 Capability Admission、Registry、Evaluation、Activation、权限/安全/成本审查、实现设计、测试与授权。

## 被拒绝的替代方案

1. Codex 直接驱动 Workflow：拒绝，会使外部能力拥有系统控制权。
2. 将 Codex 作为 Agent Manager：拒绝，会混淆 Agent、Capability 与 Workflow 职责。
3. 先接入真实 Codex 再补合同：拒绝，会在权限、审计、预算和审批边界未验证时引入副作用。

## 相关文档

- [Codex Capability Architecture](../runtime/CODEX_CAPABILITY_ARCHITECTURE.md)
- [Codex Capability Contract](../runtime/CODEX_CAPABILITY_CONTRACT.md)
- [Codex Adapter Design](../runtime/CODEX_ADAPTER_DESIGN.md)
- [Codex Permission Model](../runtime/CODEX_PERMISSION_MODEL.md)
- [Codex Human Control Flow](../runtime/CODEX_HUMAN_CONTROL_FLOW.md)
- [Codex Audit Standard](../runtime/CODEX_AUDIT_STANDARD.md)
- [Codex Failure Handling](../runtime/CODEX_FAILURE_HANDLING.md)
- [Codex Capability Test Plan](../runtime/CODEX_CAPABILITY_TEST_PLAN.md)
