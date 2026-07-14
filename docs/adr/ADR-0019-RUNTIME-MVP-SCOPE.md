# ADR-0019：Runtime MVP 最小闭环范围

## 状态

Accepted — 仅限架构与范围设计。

## 背景

Phase 9A 已建立 Control Plane First Runtime 架构。若直接进入多 Agent、真实工具或生产执行，将难以隔离 Workflow、权限、预算、人工控制和审计的基础问题，并会扩大权限与成本风险。

## 决策

Phase 9B 采用单 Workflow、单 Task、Mock Capability、Audit Evidence 与 `AUTO` / `CONFIRM` / `BLOCK` 三类人工控制的最小闭环。它覆盖正常完成、Capability 失败、用户取消和预算超限，不接入 Codex、MCP、真实工具、真实 Agent、自动代码修改、部署或生产执行。

## 后果

该决策优先验证受控执行面的可观测性与安全停止能力，牺牲短期功能广度。Mock 结果不能证明真实工具、模型、Agent 协作或生产环境的可靠性；这些能力必须单独准入、设计、审查和授权。

## 相关文档

- [Runtime Architecture](../runtime/AI_CTO_RUNTIME_ARCHITECTURE.md)
- [Runtime MVP Scope](../runtime/RUNTIME_MVP_SCOPE.md)
- [Runtime MVP Workflow](../runtime/RUNTIME_MVP_WORKFLOW.md)
