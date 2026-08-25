# AI CTO–Codex Operating Model Design

## 1. 目标

把 AI CTO System 的治理能力转换为一条清晰、可直接使用的 Codex 操作路径，减少用户在多个 Phase、Runtime、Capability 和历史文档之间选择的负担。

## 2. 统一工作链

```text
User Request
  → Intent / Project Resolution
  → L0–L4 Route
  → Minimum Context
  → Codex Host Surface
  → Bounded Execution
  → Test / Review / Gate
  → Evidence / Memory / Handoff
```

AI CTO 只在需要治理时介入；低风险普通交流不加载完整治理。Codex Host 负责实际执行，Skill 负责把请求映射到最小充分的 Codex 操作面。

## 3. Codex Host Surface 选择

| 任务特征 | 默认 Codex Surface | AI CTO 约束 |
|---|---|---|
| 单项目、单任务、局部修改 | 当前项目直接工作区 | 明确范围、测试和 Diff |
| 两个以上可独立验证的子任务 | Subagents / Custom Agents | 明确角色、边界、共享文件冲突和汇总证据 |
| 需要外部数据或专业工具 | MCP / Plugin | Capability Admission、License、权限、数据边界和审计 |
| 多步骤、可暂停、需要持续状态 | Goal / Long-running Work | 明确完成条件、停止条件和 Checkpoint |
| 定期检查或复盘 | Scheduled Task | 优先 Worktree、窄权限、首次运行人工检查和停止条件 |
| 高风险或生产影响 | 受控项目工作区 + Approval | 必须满足项目 Gate、Security、Release 和回滚 |
| 模型 / Reasoning 选择 | Codex Host 配置 / Profile | AI CTO 只给建议，不把建议写成已切换事实 |

## 4. Context Loading 选择

| Route | 最小上下文 | 明确排除 |
|---|---|---|
| L0 | 当前请求 | 项目治理、完整 Memory、历史语料 |
| L1 | 当前文件、相关规则、必要 Git 状态 | 全仓库、完整 Knowledge、无关项目 |
| L2 | Project State / Memory、相关 Requirement / Design / Task / Test | 无关模块和跨项目语料 |
| L3 | L2 + Architecture、ADR、Change Impact、相关 Evidence | 组合治理和全量历史 |
| L4 | 项目上下文 + User Brain、Portfolio、Knowledge、适用 Gates | 未授权项目、敏感数据和无关 Provider |

Context 表是允许范围，不是预加载清单；Evidence、敏感性和当前任务可以进一步缩小或升级范围。

## 5. 用户操作契约

### 新项目

```text
我想做一个新项目：……
请按 AI CTO System 先做 Idea 分析，不要直接编码。
```

### 已有项目

```text
请接管当前项目，先完成 Onboarding 和健康评估，不修改代码。
```

### 日常开发

```text
继续当前项目，读取项目状态和 Memory，完成下一个已授权任务。
```

### 明确退出

```text
AI_CTO_MODE: OFF
```

在已正确加载 AI CTO Skill 的项目和新对话中，用户不需要每条消息重复唤醒；若目标项目、权限、状态或意图不清晰，Skill 必须只问最小必要问题。

## 6. 状态与交付

每个进入 AI CTO 的请求都应简要报告：

- Route / Current Stage；
- 当前结果；
- 已读取的 Context 与排除范围；
- Evidence / Confidence / 未知；
- Codex Host Surface；
- 唯一 Next Action；
- 是否需要用户 Approval。

最终文件、Commit、PR、Release 和 Handoff 遵循 Finalization Integrity；不能把会话过程、被否方案或未经验证的能力状态写成最终结果。

## 7. 当前边界

- 不新增 AI CTO Runtime、模型切换服务、Subagent 调度器、MCP 层、部署系统、RAG 服务或后台监控服务；
- 不自动修改 Manifesto、ADR、Master Plan、Permission、Gate 或模块边界；
- 不把 Codex Host 的日常使用记录为外部 Codex Capability Activation；
- 不把 Scheduled Task、Long-running Work 或 `danger-full-access` 解释为无限授权；
- 所有自动化都必须有项目范围、权限、预算、停止条件、验证和回滚路径。
