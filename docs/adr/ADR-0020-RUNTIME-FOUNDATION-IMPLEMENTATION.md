# ADR-0020：Runtime Foundation 采用渐进实现

## 状态

Accepted — 仅限 Phase 9C-1 Implementation Design。

## 背景

Phase 9A 建立了 Control Plane First Runtime 架构，Phase 9B 定义了单 Workflow、单 Task、Mock Capability 与 Audit Evidence 的最小闭环。若直接实现真实 Agent、工具或生产执行，Workflow、状态、权限、预算、Evidence 和审计的基础问题将无法隔离，且会扩大成本、权限和安全风险。

## 决策

Runtime MVP 采用 Thin Core + Contract First 的渐进路径：先在技术栈中立层面确认 Workflow、Task、Mock Capability Adapter、Permission / Budget Guard、Execution Context、Evidence Contract 与 Audit Port，再在获得独立 Phase 9C-2 代码开发授权后确定具体技术选型并实施。

## 后果

该路径降低早期耦合和范围失控风险，并让状态、失败与审计优先接受测试。代价是当前不能交付真实 Runtime、Agent、Codex/MCP 或工具集成；Mock Capability 的结果也不能证明真实系统的可靠性、成本或安全性。

## 替代方案

1. 直接实现框架和数据库：拒绝，过早绑定技术栈。
2. 先接入真实 Codex / MCP：拒绝，绕过基础控制闭环验证。
3. 先实现多 Agent 编排：拒绝，超出单 Workflow / 单 Task MVP。

## 相关文档

- [Phase 9C-1 Spec](../superpowers/specs/2026-07-14-phase-9c-1-runtime-foundation-implementation-design.md)
- [Implementation Plan](../runtime/RUNTIME_FOUNDATION_IMPLEMENTATION_PLAN.md)
- [Implementation Gate](../runtime/RUNTIME_IMPLEMENTATION_GATE.md)
