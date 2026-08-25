# Progress Synchronization Standard

## 1. 目的

本标准定义 AI CTO 如何把实际项目工作同步到状态、进度和记忆文档。它采用检查点同步，不把每个工具调用、临时推理或后台心跳写入项目文件。

目标是让用户在长任务、跨会话和多人协作中看到可信的：

- 当前阶段和任务；
- 已完成内容；
- Evidence 和 Validation；
- 阻塞、风险和取消；
- 唯一下一动作。

## 2. 同步触发点

### 必须同步

1. 任务开始并完成 Route / Scope 确认后；
2. 完成一个用户可验证的里程碑后；
3. 进入 `WAITING_USER`、`WAITING_EXTERNAL`、`BLOCKED` 或 `CANCELLED` 时；
4. 发生批准、拒绝、失败、回滚或风险等级变化时；
5. 任务完成并形成最终 Evidence 后；
6. 生命周期阶段或 Gate 发生合法转换时。

### 不强制同步

- 每个 Shell / Apply Patch / MCP / Subagent 调用；
- 尚未验证的中间推理；
- 临时草稿和被否方案；
- 没有改变任务状态的重复读取。

## 3. 文档写入范围

| 文档 | 写入内容 | 禁止写入 |
|---|---|---|
| 对话状态报告 | Route、当前动作、Checkpoint、阻塞、下一步 | 私密数据、完整内部推理 |
| `PROJECT_STATE.md` | Current Stage、Current Task、Confidence、Evidence、Next Action | 未确认历史、未经授权阶段转换 |
| `DEVELOPMENT_PROGRESS.md` | 已完成任务、Commit / Test Evidence、风险、阻塞、下一动作 | 每次工具调用日志、临时方案 |
| `PROJECT_MEMORY.md` | 稳定目标、决策、当前状态、长期限制和复用经验 | 原始日志、Secrets、未验证推测 |
| Knowledge Base | 经过提取、Evidence、Confidence 和生命周期审查的知识 | 自动 `ACTIVE` 写入 |

AI CTO System 自身的 `Manifesto`、ADR、Master Plan、Module Registry、Permission、Gate 和核心 Skill 不属于普通进度同步目标；修改它们必须走系统级变更流程。

## 4. Checkpoint 最小格式

```text
Checkpoint ID:
Task:
Current Stage:
Status:
Completed:
Evidence:
Confidence:
Blocked / Risk:
Next Action:
Approval Required:
```

文档写入必须使用稳定 Task / Checkpoint 引用，避免重复追加同一事实。重新执行任务时先读取现有状态，再合并当前新增 Evidence。

## 5. 失败、取消和回滚

- 失败时记录失败阶段、已完成范围、是否产生副作用、恢复路径和下一动作；
- 用户取消时停止后续执行，记录 `CANCELLED` 和停止边界；
- 回滚时记录恢复基线、验证结果和剩余风险；
- 失败或取消不能被写成完成，旧的成功状态不能覆盖新的失败事实。

## 6. 跨会话恢复

下一次继续任务时，先读取：

1. 当前项目 `PROJECT_STATE.md`；
2. 当前项目 `PROJECT_MEMORY.md`；
3. 最近的 `DEVELOPMENT_PROGRESS.md`；
4. 最近有效的 Checkpoint / Gate / Evidence。

如果这些来源冲突，保留冲突、报告证据和唯一澄清问题，不静默覆盖。

## 7. 边界

- 本标准不创建后台监控、遥测、队列或自动记忆系统；
- 不自动推进生命周期、Gate、Approval 或 Knowledge；
- 不把进度文档写入视为代码完成、测试通过或发布授权；
- 不修改 Runtime Core、Codex Host、模型、MCP、工具或宿主权限；
- Progress Sync 是项目范围内的受治理文档动作，不是无限自动化。
