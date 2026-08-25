# Project Usage Feedback Sync Standard

## 1. Purpose

本标准规定如何把各个外部项目使用 AI CTO System 时产生的工作方式反馈，脱敏后同步到 AI CTO System。它复用现有的 `Execution Feedback Record Standard`、`Progress Synchronization Standard` 和 Phase 10 Self Evolution，不创建新的 Module、Phase、Runtime、采集服务或后台监控。

目标是形成可比较的 Evidence，而不是收集完整聊天记录。

## 2. Storage Convention

中央反馈记录使用现有 `evaluations/` 目录下的：

```text
evaluations/project_usage/
└── <project-id>/
    └── PROJECT_USAGE_FEEDBACK.md
```

每个项目默认只有一份主记录。重要检查点追加到该文件；不得为每个工具调用、普通对话或临时推理创建文件。

该目录是 AI CTO 的跨项目 Evidence 汇总区，不是外部项目的源码目录，也不替代外部项目自己的 `PROJECT_STATE.md`、`PROJECT_MEMORY.md` 或 `DEVELOPMENT_PROGRESS.md`。

## 3. Authority and Data Flow

```text
外部项目 State / Memory / Progress
          ↓  明确授权、最小字段、脱敏
Project Usage Feedback Record
          ↓  多项目比较
Self Observation / Analysis
          ↓
Optimization Proposal
```

- 外部项目文件是该项目事实与进度的权威来源。
- `PROJECT_USAGE_FEEDBACK.md` 是 AI CTO 工作方式的派生 Evidence，不覆盖项目事实。
- Feedback 不直接写入 Knowledge Base，也不直接改变路由、模型、Skill、Tool、Context、Git Policy 或 Gate。

## 4. Sync Triggers

按照现有 Progress Checkpoint 规则，在以下节点同步：

1. 任务完成并形成可验证结果；
2. 重要里程碑完成；
3. 发生阻塞、失败、取消、回滚或明显路由偏差；
4. 用户明确要求提取 AI CTO 使用反馈。

不要求在每次对话、Shell、Skill、Tool 或模型调用后同步。

## 5. Sync Procedure

### Step 1：确认范围

确认项目身份、观察时间段、任务范围和写入目标。若当前工作区无法同时访问外部项目与 AI CTO System，输出待同步记录，不声称已经写入中央目录。

### Step 2：提取最小字段

使用 [`PROJECT_USAGE_FEEDBACK_TEMPLATE.md`](../../templates/PROJECT_USAGE_FEEDBACK_TEMPLATE.md)，分别记录“建议路由”和“实际执行”。不可获得的 Duration、Token、Cost、宿主模型或 Reasoning 必须写 `NOT_CAPTURED`，禁止推测。

### Step 3：脱敏

删除或概括：

- 源码、完整提示词和完整工具输出；
- API Key、Token、Cookie、密码和配置秘密；
- 用户个人信息和未授权业务数据；
- 可识别客户、供应商或内部系统的敏感细节。

只保留能够证明 AI CTO 工作方式的摘要、引用和结果 Evidence。

### Step 4：写入与校验

写入 `evaluations/project_usage/<project-id>/PROJECT_USAGE_FEEDBACK.md`，使用稳定 `Feedback ID` 和 `Source Checkpoint`，避免重复追加。检查记录是否包含授权范围、Evidence、Confidence、限制和下一动作。

### Step 5：状态同步

在外部项目的进度记录中保留“已提取 AI CTO 使用反馈”的引用；中央记录不反向覆盖外部项目状态。失败、取消或回滚必须按真实结果记录，不能写成完成。

## 6. Evidence Interpretation

- 单个项目、单个案例：只形成 `Observation`。
- 至少三个可比较案例：可以提出 `Candidate Pattern`，仍不能自动改规则。
- 多个项目具备稳定的质量、成本、时延和安全结果后：才可形成正式 `Optimization Proposal`。
- 一次性事件不得直接升级为通用最佳实践；必须标记适用范围与不适用范围。

这些是证据建议，不是新的生命周期 Gate。

## 7. Conflict and Concurrency

- 同一项目记录使用稳定 `Feedback ID`；重复同步时先读取现有文件再合并。
- 同一文件发生并行修改时停止自动合并，保留冲突并请求人工处理。
- 不通过 Feedback 记录推断没有记录的项目经历。
- 业务项目之间不得互相读取未经授权的反馈内容。

## 8. Explicit Non-Goals

本标准不实现：

- 跨聊天后台扫描；
- 自动读取所有项目；
- 遥测、队列、定时采集或向量数据库；
- 自动模型切换、Skill / Tool 选择或重试；
- 自动写入 `ACTIVE Knowledge`；
- 自动执行或修改 AI CTO Core、Runtime、Permission、Manifesto、ADR、Master Plan 或 Gate。

## 9. Current Authorization

当前只授权创建和维护脱敏 Feedback Evidence。`Execution Authorization` 仍为 `NONE`。任何由这些记录产生的 Optimization Proposal，仍须遵循 Phase 10 的 Risk Assessment、Autonomy Decision 和既有 Human Control 边界。
