# ADR-0025: Codex Capability Implementation Design

## 状态

Accepted — 仅限 Phase 9C-5 的本地 Mock Capability Implementation Design。

## 背景

ADR-0024 已确定 Codex 只能作为经 Capability Adapter 使用的可替换 Engineering Capability。进入实现设计前，需要把该架构边界落实为一个不依赖真实 Codex 的最小实现路径，以验证请求转换、Permission、Budget、Approval、Result/Evidence 和 Audit 合同。

## 决策

先实现本地、确定性、无副作用的 Mock Codex Capability，经 provider-neutral Adapter Port 接入 Runtime。Mock 仅支持 `ANALYZE_CODE` 与 `PROPOSE_CHANGE` 的合同 fixture；`APPLY_CHANGE` 和 `CREATE_COMMIT` 保持拒绝。Workflow 继续拥有状态推进权，Adapter 不得绕过 Approval、Permission、Budget 或 Gate。

## 后果

该方案可在无网络、无真实 Provider、无文件修改的条件下验证控制面合同，且未来真实 Provider 可以替换 Invocation Port。代价是 Mock 测试不能证明真实 Codex 的质量、安全、成本、时延、License、兼容性或可靠性；Capability Registry 仍为 `ABSENT`，真实接入需单独治理与授权。

## 替代方案

1. 直接接入真实 Codex：拒绝，外部能力尚未完成准入、激活和受控测试。
2. 让 Workflow 直接调用 Codex：拒绝，会耦合控制面与供应商实现。
3. Mock 直接修改文件以模拟真实行为：拒绝，会在控制合同未验证时引入不必要副作用。

## 相关文档

- [ADR-0024](./ADR-0024-CODEX-CAPABILITY-INTEGRATION.md)
- [Implementation Design](../runtime/CODEX_CAPABILITY_IMPLEMENTATION_DESIGN.md)
- [Implementation Gate](../runtime/CODEX_CAPABILITY_IMPLEMENTATION_GATE.md)
