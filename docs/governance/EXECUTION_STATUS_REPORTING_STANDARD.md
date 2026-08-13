# Execution Status Reporting Standard

## 1. 目的

本标准定义 AI CTO 在长任务、工具等待、外部服务不可用或需要人工确认时如何报告当前状态，降低“无响应”和“系统卡住”的误判。它只规定交互报告，不改变宿主 UI、Runtime 状态机或外部服务行为。

## 2. 状态集合

| 状态 | 含义 | 必须包含 |
|---|---|---|
| `STARTING` | 已接受任务，正在确认范围与授权 | 任务目标、复杂度、范围 |
| `LOADING_CONTEXT` | 正在读取已授权的最小上下文 | 当前来源、排除范围 |
| `ANALYZING` | 正在进行分析或规划 | 当前分析主题、预计下一检查点 |
| `VALIDATING` | 正在执行测试、证据或一致性检查 | 验证项、已完成/待完成 |
| `WAITING_USER` | 需要用户确认、澄清或选择 | 阻塞原因、明确选项 |
| `WAITING_EXTERNAL` | 等待宿主或外部服务结果 | 服务状态、是否已提交、停止/重试边界 |
| `COMPLETED` | 已完成并形成结果 | 结果、Evidence、限制、下一步 |
| `BLOCKED` | 因权限、Gate、证据或能力不可用而停止 | 原因、缺失项、可继续的只读动作 |
| `CANCELLED` | 用户或安全控制停止任务 | 已停止阶段、是否产生副作用 |

## 3. 报告时机

至少在以下时点报告一次：

1. 任务开始并完成路由后；
2. 进入新的主要阶段；
3. 预计较长时间没有可见结果时；
4. 等待用户、宿主模型或外部服务时；
5. 发生失败、取消、阻塞或回滚时；
6. 最终完成或无法完成时。

报告频率应以用户可理解为准，不为“显示进度”调用无任务价值的工具或加载额外上下文。短任务可以只报告开始和结果。

## 4. 最小报告格式

```text
Status: ANALYZING
Task: 跨项目使用反馈汇总
Route: L1 / Instant / LIGHT / R1
Current Scope: 3 个已确认项目的 Memory 与 Progress
Completed: 已完成来源定位
Next Checkpoint: 汇总共同问题并标注 Confidence
Blocked: NO
```

等待或阻塞时必须使用：

```text
Status: WAITING_EXTERNAL / BLOCKED
Reason: 具体原因或 UNKNOWN
Submitted: YES / NO / NOT_CAPTURED
Options: 等待、缩小范围、选择已授权替代路径、结束任务
Authorization: 未创建执行授权
```

## 5. 长任务与失败处理

- 不得用“正在处理”无限期替代具体状态；
- 外部模型容量、限流或服务故障应标记 `WAITING_EXTERNAL` 或 `BLOCKED`，不得声称任务仍在执行；
- 不自动重试付费或不可逆操作；重试必须有明确边界和用户/现有 Gate 授权；
- 发生失败时说明失败阶段、已完成工作、是否产生副作用和可恢复路径；
- 用户取消后停止后续工作，并记录 `CANCELLED`。

## 6. 与 Evidence 的关系

状态报告可作为 Execution Feedback 的交互 Evidence，但不等于任务成功、审批或 Gate 通过。应记录状态时间、来源和 Confidence；无法测量的时长、Token、成本保持 `NOT_CAPTURED`。

## 7. 边界

本标准不实现后台监控、队列、心跳服务、自动模型切换、自动工具调用、Runtime 修改、权限提升或外部服务恢复。
