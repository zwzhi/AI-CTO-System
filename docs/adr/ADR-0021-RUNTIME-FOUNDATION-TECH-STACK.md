# ADR-0021：Runtime Foundation MVP 技术选型

## 状态

Accepted。

## 背景

Phase 9C-2 需要将已批准的 Runtime Foundation 最小闭环实现为可测试模块，同时保持 Thin Core + Contract First、单 Workflow / 单 Task、Mock Capability 和无外部副作用的范围。

## 决策

采用 TypeScript、Node.js 24 与 Node.js Built-in Test Runner。Node 24 通过 `--experimental-strip-types` 执行仅含可剥离类型语法的 TypeScript；测试使用 `node:test` 和 `node:assert/strict`。Repository 以 Port 表达，当前只提供 In-memory Adapter。

不引入 Web 框架、数据库、ORM、消息队列、第三方工具 SDK、真实 Agent、Codex、MCP、外部工具或生产部署。

## 后果

该选择让 MVP 可以用静态合同和内存实现验证状态、Guard、Mock Result 与 Audit Evidence，且不绑定持久化或工具实现。代价是代码不是生产 Runtime：进程重启会丢失数据，类型剥离不会提供独立编译期类型检查，且没有真实工具、Agent 或外部环境 Evidence。

## 替代方案

1. 引入 TypeScript 编译器和第三方测试框架：拒绝，当前 MVP 不需要额外依赖。
2. 直接使用数据库 / ORM：拒绝，超出内存级 MVP 与 Port 优先边界。
3. 直接接入 Codex / MCP 或真实工具：拒绝，未通过后续 Capability、Permission、安全与外部副作用评审。

## 相关文档

- [Phase 9C-2 Spec](../superpowers/specs/2026-07-14-phase-9c-2-runtime-foundation-implementation.md)
- [Phase 9C-2 Plan](../superpowers/plans/2026-07-14-phase-9c-2-runtime-foundation-implementation.md)
- [Runtime Implementation Gate](../runtime/RUNTIME_IMPLEMENTATION_GATE.md)
