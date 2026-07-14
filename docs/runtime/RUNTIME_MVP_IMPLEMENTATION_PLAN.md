# Runtime MVP 实施计划

## 前提

本文件只定义未来实现顺序，不授权现在开发 Runtime 代码。所有实现开始前必须重新确认范围、受影响 Gate、安全审查与人类批准。

## 建议顺序

| 顺序 | 工作项 | 依赖 | 验收 |
|---|---|---|---|
| 1 | 固化 ID、实体与状态转换合同。 | Phase 9B 数据模型。 | 单 Workflow / 单 Task 的合法状态转换可验证。 |
| 2 | 实现受限 Workflow 与 Task 存储。 | 步骤 1。 | 可创建、暂停、取消、失败和完成 Workflow。 |
| 3 | 实现 Mock Capability Adapter 合同。 | 步骤 1–2。 | 不依赖真实工具即可产生受控 Result。 |
| 4 | 接入 Permission、Human Control、预算与 Kill Switch 检查。 | 步骤 2–3。 | `AUTO`、`CONFIRM`、`BLOCK` 和超限停止可验证。 |
| 5 | 实现最小 Audit Evidence。 | 步骤 2–4。 | 每个关键事件具备七项必填字段。 |
| 6 | 运行场景测试与安全复核。 | 步骤 1–5。 | 正常、失败、取消、预算超限四场景均符合 Success Criteria。 |

## 测试策略

先为状态、预算、控制和审计写测试，再实现对应行为。测试不得调用真实工具、模型、生产环境或真实 Agent。应至少断言：非法状态转换被拒绝、Capability 失败无自动回退、取消阻止后续调用、超限不自动增加预算、Audit 字段完整且敏感数据被排除。

## 实施完成条件

只有在所有 Success Criteria 与四类 Failure Scenario 均有可复查证据、Git 状态正常、审计与安全审查完成、且用户明确授权后，才可提出下一阶段的实现评审；本计划本身不产生实现授权。
