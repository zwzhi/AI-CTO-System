# Self Evolution Architecture

## 1. Self Evolution 定位

Phase 10 是优化能力框架，不是自动修改自己：它从现有 Runtime、Audit、Evidence、Capability Governance 记录中进行 Self Observation、Analysis、Optimization Proposal 和 Validation。它不新增管理模块、Agent、Gate 或审批流程，也不拥有最终决策权。

## 2. Observation Model

| 维度 | 观察数据 |
| --- | --- |
| Execution | 任务耗时、成功率、失败原因、人工介入次数 |
| Resource | Token、成本、模型与 Context 使用 |
| Capability | 使用次数、成功率、价值贡献、维护成本 |
| Process | 流程耗时、Gate 触发、重复步骤 |
| Architecture | Module/Capability 数量、重复能力、未使用资产 |

数据仅来自既有记录；Observation 不是执行授权。

## 3. Optimization Proposal Contract

Proposal 必须包含 Proposal ID、Problem、Evidence、Current State、Recommendation、Expected Value、Risk、Impact、Rollback、Validation Method。它复用现有 Audit、Evidence、Human Control、Capability Governance 和已有 Gate，不构成新的审批模块。

## 4. Optimization Action Types

`ADD`、`MODIFY`、`MERGE`、`DEPRECATE`、`REMOVE`、`SIMPLIFY`。REMOVE 只能提出建议，绝不自动删除。

## 5. Value Evaluation Model

每项优化评估新增价值、效率提升、成本变化、复杂度变化、风险变化。不能证明净价值、维护成本可接受和验证方法明确的建议应拒绝或延后。

## 6. Human Control Boundary

低风险仅可进行无副作用分析或可逆本地实验；中风险执行前确认；高风险必须人工批准并经过适用的既有工程 Gate。Runtime Core、Permission Model、Manifesto、ADR、核心生命周期与核心 Gate 的修改始终必须人工批准。

## 7. Capability Evolution Model

沿用既有 `Adopt → Improve → Merge → Deprecate → Remove` 生命周期。真实 Capability 的准入、评估、选择、激活仍由 Capability Governance 管理。

## 8. Anti-Complexity Principle

新增 Module、Capability、Process 或 Gate 前必须回答：创造什么价值、是否已有能力覆盖、长期维护成本、能否合并已有能力。能力使用不受限；无价值复杂度应被识别并提出简化建议。

## 9. Phase 10 Boundary

本阶段只建立框架：不实现自动优化、不自动修改或删除系统、不创建 Evolution Review/Approval/Management Module 或 Evolution Agent，不绕过 Runtime、Audit、Evidence、Capability Governance、Human Control 或现有 Gate。

