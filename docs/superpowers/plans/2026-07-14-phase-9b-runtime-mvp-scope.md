# Phase 9B Runtime MVP Scope Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 建立 Runtime MVP 的单 Workflow、单 Task、Mock Capability 和 Audit Evidence 范围、数据合同、场景与实现计划。

**Architecture:** MVP 通过 Capability Adapter Contract 调用 Mock Capability，Human Control 使用 AUTO / CONFIRM / BLOCK，所有状态和结果写入 Audit。仅定义未来实现合同，不创建代码、Agent 或真实工具调用。

**Tech Stack:** Markdown、Git、文档校验。

## Global Constraints

- 不开发 Runtime 代码、不接入 Codex/MCP、不创建真实 Agent、不调用外部工具、不自动执行。
- 单 Workflow、单 Task；无复杂循环、递归、多 Agent、生产执行、自动修改或自动部署。
- 必须覆盖成功、Capability 失败、用户取消和预算超限。

---

### Task 1: 建立 MVP 范围、边界、数据与 Workflow

**Files:** Create `RUNTIME_MVP_SCOPE.md`, `RUNTIME_MVP_BOUNDARY.md`, `RUNTIME_DATA_MODEL.md`, `RUNTIME_MVP_WORKFLOW.md` under `docs/runtime/`.

- [ ] 定义 MVP 闭环、包含 / 非包含项、六个核心实体及字段 / 状态 / 关系；定义正常、失败、取消、预算超限流程与 Mock Adapter 边界。

### Task 2: 建立 Agent、Adapter、Human Control、Audit 与约束

**Files:** Create `AGENT_CONTRACT_MVP.md`, `CAPABILITY_ADAPTER_MVP.md`, `HUMAN_CONTROL_MVP.md`, `AUDIT_MVP_STANDARD.md`, `RUNTIME_MVP_TECHNICAL_CONSTRAINTS.md`.

- [ ] 定义未来 Agent 输入 / 输出 / Permission / Budget / Status，Mock Adapter Contract，AUTO / CONFIRM / BLOCK，最小 Audit 字段和禁止项。

### Task 3: 建立实施计划、ADR 与入口同步

**Files:** Create `RUNTIME_MVP_IMPLEMENTATION_PLAN.md`, `docs/adr/ADR-0019-RUNTIME-MVP-SCOPE.md`; modify Master Plan, Module Registry, SKILL, Project Memory, Development Progress.

- [ ] 定义未来开发顺序、依赖、测试和验收；记录为何采用最小闭环；同步 Phase 9B 仅为范围设计、未进入代码开发。

### Task 4: 验证与提交

- [ ] 校验 10 份 MVP 文档、ADR-0019、五个入口、Success Criteria、四类场景与非实现边界；运行 `git diff --check` 和链接校验，提交 `docs: add Phase 9B runtime MVP scope`。
