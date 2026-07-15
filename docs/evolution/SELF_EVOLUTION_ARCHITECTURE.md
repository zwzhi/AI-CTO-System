# Self Evolution Architecture

## Optimization Autonomy Model

Phase 10 不要求每一项优化都等待人工决策。未来执行遵循以下风险驱动路径：

```text
Observation
  → Analysis
  → Optimization Proposal
  → Risk Assessment
  → Autonomy Decision
  → Execute / Confirm
  → Validation Evidence
```

### Risk Assessment（风险评估）

未来 Proposal 进入执行路径前，必须评估：影响范围、可逆性、数据与权限影响、外部副作用、Gate 影响和 Evidence 完整度。风险未知、Evidence 不完整或冲突、验证方法不可用、回滚路径不明确时，必须升级为 `CONFIRM_REQUIRED` 或 `MANDATORY_APPROVAL`。

### Autonomy Decision（自主决策）

| 决策 | 适用条件 | 未来执行边界 |
| --- | --- | --- |
| `AUTO_EXECUTE` | 低风险、无外部副作用、仅影响非权威内部资产、可逆且不影响 Gate。 | 仅可由未来已授权的 Runtime 实现使用；必须保留 Audit 与结果 Evidence。 |
| `AUTO_WITH_VALIDATION` | 低至中风险、影响受限且可逆，并具有明确验证方法。 | 必须生成 Validation Evidence；验证失败时停止后续动作，并在适用时安全回滚。 |
| `NOTIFY` | 中风险、影响受限且执行范围明确。 | 未来获得授权的执行必须通知用户或责任人，并保留 Evidence。 |
| `CONFIRM_REQUIRED` | 影响项目行为、文件、配置、用户体验或跨模块接口。 | 执行前必须获得明确确认；确认不能替代任何适用 Gate。 |
| `MANDATORY_APPROVAL` | Runtime Core、Permission Model、Manifesto、ADR、核心生命周期、安全边界、大规模架构变化、生产发布或不可逆影响。 | 必须经授权人批准，并满足全部适用的既有 Gate。 |

自主决策不能覆盖既有 Gate、核心权威、安全或审批规则。前三种决策是未来执行策略，不是当前授权。

### Current MVP Boundary（当前边界）

当前 Self Evolution MVP 保持仅分析与提案。`OptimizationProposal.executionAuthorization` 仍为 `NONE`；当前 Proposal 不得执行、通知、写入、激活或删除任何内容。Execution Authorization 属于未来 Runtime 设计事项，本模型不向当前 Contract 或代码加入该能力。

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

