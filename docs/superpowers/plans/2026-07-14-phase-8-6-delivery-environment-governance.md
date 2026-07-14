# Phase 8.6 Delivery & Environment Governance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 建立交付、环境、配置、用户文档、诊断、Gate 与资产复用治理。

**Architecture:** Layer 4 的 Delivery & Environment Governance 管理 Development → Validation → Delivery → User Environment 的交付条件，与 Release Approval、Deployment & Rollback 分离；全部为 Markdown 治理，不创建工具实现。

**Tech Stack:** Markdown、Git、PowerShell 文档校验。

## Global Constraints

- 不开发代码、部署工具、Installer、CI/CD、Runtime 或外部集成。
- `READY_FOR_DELIVERY` 不等于部署、上线或用户成功使用。
- 禁止敏感信息进入代码；不进入 Phase 9。

---

### Task 1: 建立交付、环境、兼容性与配置规范

**Files:** Create `docs/delivery/DELIVERY_GOVERNANCE_STANDARD.md`, `ENVIRONMENT_SPECIFICATION_STANDARD.md`, `ENVIRONMENT_COMPATIBILITY_STANDARD.md`, `CONFIGURATION_MANAGEMENT_STANDARD.md`.

- [ ] 定义交付目标、边界、责任、风险；环境规格记录 OS、Runtime、Language、Framework、Database、External Services、Hardware、Network；兼容矩阵覆盖开发/测试/生产/用户环境；配置覆盖 Environment Variables、API Keys、Secrets、Database / External Service Config、`.example` 与权限控制。
- [ ] 验证四文件存在，环境字段完整，兼容矩阵含 Supported / Unsupported，配置禁止敏感信息进入代码。

### Task 2: 建立交付包、用户文档、诊断、Gate 与资产规范

**Files:** Create `DELIVERY_PACKAGE_STANDARD.md`, `USER_DOCUMENTATION_STANDARD.md`, `ENVIRONMENT_DIAGNOSTIC_STANDARD.md`, `DELIVERY_READINESS_GATE.md`, `DELIVERY_ASSET_REGISTRY_STANDARD.md` under `docs/delivery/`.

- [ ] 定义 Application、Configuration Template、User Documentation、Startup / Troubleshooting Guide、Version Information，并覆盖 Desktop、Web、Internal Tool、API Service。
- [ ] 定义用户安装、启动、停止、配置、FAQ；Diagnostic Report 的 System Info、Version、Dependencies、Logs、Configuration Status；Gate 的六项输入与 `READY_FOR_DELIVERY` / `CHANGES_REQUIRED`；资产复用的 Evidence、质量和适用范围要求。

### Task 3: 创建 ADR 并同步入口

**Files:** Create `docs/adr/ADR-0016-DELIVERY-AND-ENVIRONMENT-GOVERNANCE.md`; modify Master Plan, SKILL, Module Registry, Project Memory, Development Progress.

- [ ] ADR 记录交付不是复制代码，必须治理环境、配置、可理解性、支持与用户可运行性；明确与 Release / Deployment 边界。
- [ ] 登记 Layer 4 `Delivery & Environment Governance` 为 `Completed` 文档治理 Module；同步五个入口，明确无 CI/CD、Installer、部署工具、Runtime，且未进入 Phase 9。

### Task 4: 验证与提交

- [ ] 确认 9 份 Delivery 文档与 ADR-0016 存在、Registry 保留 Release / Deployment、Progress 含“未进入 Phase 9”；运行 `git diff --check` 和全仓 Markdown 相对链接校验。
- [ ] 提交 `docs: add delivery environment governance`。
