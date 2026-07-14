# Phase 9A Runtime Architecture Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 Phase 9A 控制平面优先 Runtime 规格转化为正式架构合同，不实现 Runtime。

**Architecture:** 十份 `docs/runtime/` 文档定义 Input、Processing、Capability、Memory、Control、Output 层，以及 Workflow、Agent、Approval、Permission、Adapter、Audit、Budget 与 Safety。所有外部工具经未来 Capability Adapter；Core 不直接依赖工具。

**Tech Stack:** Markdown、Git、文档校验。

## Global Constraints

- 不开发 Runtime 代码、不创建真实 Agent、不接入 Codex、MCP 或外部工具、不自动执行。
- Agent 禁止直接调用；所有任务流转经 Workflow Engine。
- Workflow 必含失败、暂停、恢复、回滚、取消和 Audit。
- 预算覆盖 Token、工具、时间、成本与重试；Kill Switch 可人工停止。
- 不进入 Phase 9B。

---

### Task 1: 建立 Runtime、Workflow、Agent、Control 与 Permission 架构

**Files:** Create `AI_CTO_RUNTIME_ARCHITECTURE.md`, `RUNTIME_LAYER_INTEGRATION.md`, `AGENT_ORCHESTRATION_ARCHITECTURE.md`, `WORKFLOW_ENGINE_DESIGN.md`, `HUMAN_CONTROL_MODEL.md`, `PERMISSION_MODEL.md` under `docs/runtime/`.

- [ ] 定义 Layer 5 Runtime、Control Plane / Execution Plane、六层数据流与不拥有业务决策权的边界；定义 Planner、Researcher、Product、Architect、Developer、QA、Security、Release、Memory 的输入、输出、权限与禁止项。
- [ ] 定义状态 `CREATED`、`PLANNING`、`WAITING_APPROVAL`、`EXECUTING`、`VALIDATING`、`PAUSED`、`ROLLING_BACK`、`COMPLETED`、`FAILED`、`CANCELLED`；以及 AUTO_EXECUTE、NOTIFY_AFTER、CONFIRM_BEFORE、MANDATORY_APPROVAL。

### Task 2: 建立 Adapter、Memory、Audit、Budget 与 Safety 架构

**Files:** Create `CAPABILITY_ADAPTER_ARCHITECTURE.md`, `MEMORY_RUNTIME_DESIGN.md`, `EXECUTION_AUDIT_STANDARD.md`, `RUNTIME_BUDGET_GOVERNANCE.md`, `RUNTIME_SAFETY_BOUNDARY.md` under `docs/runtime/`.

- [ ] 定义 Codex、GitHub、MCP、文件、浏览器、数据库、部署工具均经 Capability Adapter；定义记忆读写、审批、冲突；Audit 字段；Phase 8.4 Token / 工具 / 时间 / 成本 / 重试预算；Kill Switch、安全边界与回滚。

### Task 3: ADR 与入口同步、验证、提交

**Files:** Create `docs/adr/ADR-0018-AI-CTO-RUNTIME-ARCHITECTURE.md`; modify Master Plan, Module Registry, SKILL, Project Memory, Development Progress.

- [ ] ADR 记录 Control Plane First；入口记录 Phase 9A 架构设计完成、Runtime 仍 Planned、未进入 9B。
- [ ] 校验 10 份 Runtime 文档、ADR、五个入口、状态机、预算、Kill Switch 与“Agent 不直接调用”文本；运行链接与 `git diff --check`，提交 `docs: add Phase 9A runtime architecture`。
