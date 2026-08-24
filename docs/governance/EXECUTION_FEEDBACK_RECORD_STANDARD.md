# Execution Feedback Record Standard

## 1. 目的

本标准定义 AI CTO 每次受治理任务完成后，如何记录“建议路由”和“实际执行”之间的可比较反馈。它服务于现有 `Execution Routing Evidence` 与 Phase 10 Self Evolution，不负责执行、模型切换、工具调用、审批或项目 Gate。

## 2. 记录范围

仅在任务确实进入 AI CTO 路由、或用户明确要求记录时创建。普通 L0 对话不强制创建记录。记录应使用最小必要字段，不保存提示词全文、密钥、个人敏感数据或未授权项目内容。

## 3. 统一字段

| 字段 | 要求 |
|---|---|
| Feedback ID | 稳定唯一标识 |
| Task Type / Intent | 用户意图和任务类别 |
| Requested Scope | 用户明确授权的范围 |
| Complexity | L0–L4 及判断依据 |
| Recommended Workflow | 建议 Workflow |
| Actual Workflow | 实际使用 Workflow；不一致时说明原因 |
| Recommended Profile | LIGHT / STANDARD / STRICT |
| Actual Profile | 实际执行档位 |
| Recommended Skill / Tool | 建议的能力类别；无需求时记录 `NONE` |
| Actual Skill / Tool | 实际使用；未使用记录 `NONE` |
| Recommended Model / Reasoning | 模型类别建议与 R0–R4 |
| Actual Model / Reasoning | 宿主实际使用值；不可见时 `NOT_CAPTURED` |
| Recommended Context | 建议加载范围 |
| Actual Context | 实际读取范围和排除范围 |
| Start / End / Duration | 时间和采集方式；不可得时 `NOT_CAPTURED` |
| Token / Cost | 输入、输出、总量和成本；不可得时 `NOT_CAPTURED` |
| Human Interaction | 确认、澄清、返工、取消和阻塞次数 |
| Quality Outcome | 验收、测试、返工或用户反馈 Evidence |
| Routing Deviation | 偏差类型及原因；没有偏差记录 `NONE` |
| Evidence / Confidence | 来源、适用范围、L1–L4 和限制 |
| Next Action | 仅记录建议，不授予执行权 |

## 4. 记录原则

1. “建议”和“实际”必须分栏，不能用实际结果反推建议原本正确。
2. 未采集的 Duration、Token、Cost、Reasoning 或宿主模型字段统一记录 `NOT_CAPTURED`。
3. 一次案例只形成 Observation 或 Hypothesis，不自动改变默认 Workflow、Model、Skill、Tool、Context 或 Git 策略。
4. 只有多个可比较案例、质量证据和适用治理审查，才能形成 Evolution Proposal。
5. 记录必须保留授权范围、敏感数据排除和证据来源，避免为测量效率扩大访问范围。

## 5. 最小示例

```text
Feedback ID: EFF-FB-0001
Task Type: 只读项目反馈汇总
Complexity: L1
Recommended Workflow: Instant / LIGHT / R1
Actual Workflow: STANDARD / R3
Recommended Context: 相关项目 Memory 与 Progress
Actual Context: 相关 Memory、Progress、Handoff；快照副本已排除
Duration: NOT_CAPTURED
Token: NOT_CAPTURED
Human Interaction: 1 次澄清
Routing Deviation: WORKFLOW_OVERHEAD
Quality Outcome: 用户确认摘要可用
Confidence: L3；样本量 1
Next Action: 收集可比较案例，不自动改规则
```

## 6. 边界

本标准不创建遥测系统、不读取文件系统、不调用网络、不选择具体模型、不自动重试、不自动切换、不修改 Runtime、Capability、Permission、Gate 或权威治理文件。

## 7. Finalization Integrity Observation

Quality Outcome 可以记录最终交付是否出现会话残留、标题 / 文件名 / Commit / PR / Handoff 是否与 Accepted Final State 一致，以及是否完成 Readback。该字段只形成 Observation / Evidence；单案例不得自动修改路由、模型、Skill、Tool、Context、Git 策略或执行授权。
