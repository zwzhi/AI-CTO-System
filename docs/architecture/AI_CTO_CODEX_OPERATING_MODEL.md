# AI CTO–Codex Operating Model

## 1. 统一工作链

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

## 2. Host Surface 选择

| 任务特征 | 默认 Codex Surface | 必要治理 |
|---|---|---|
| 单项目、单任务、局部修改 | 当前项目直接工作区 | Scope、Diff、测试 |
| 可独立验证的多个子任务 | Subagents / Custom Agents | 角色边界、共享文件冲突、汇总 Evidence |
| 外部数据或专业工具 | MCP / Plugin | Capability、License、安全、权限、数据边界 |
| 可暂停的多步骤工作 | Goal / Long-running Work | 完成条件、停止条件、Checkpoint |
| 定期检查或复盘 | Scheduled Task | 优先 Worktree、窄权限、首次运行人工检查 |
| 高风险 / 生产影响 | 受控工作区 + Approval | 项目 Gate、Security、Release、Rollback |
| 模型 / Reasoning 选择 | Codex Host Config / Profile | AI CTO 建议，不伪造已切换事实 |

## 3. Context Loading

| Route | 最小上下文 | 排除范围 |
|---|---|---|
| L0 | 当前请求 | 项目治理、完整 Memory、历史语料 |
| L1 | 当前文件、相关规则、必要 Git 状态 | 全仓库、完整 Knowledge、无关项目 |
| L2 | Project State / Memory、相关 Requirement / Design / Task / Test | 无关模块和跨项目语料 |
| L3 | L2 + Architecture、ADR、Change Impact、相关 Evidence | 组合治理和全量历史 |
| L4 | 项目上下文 + User Brain、Portfolio、Knowledge、适用 Gates | 未授权项目、敏感数据、无关 Provider |

Context 表是允许范围，不是预加载清单；Evidence、敏感性和当前任务可以进一步缩小或升级范围。

## 4. 用户操作

### 新项目

```text
我想做一个新项目：……
请按 AI CTO System 先做 Idea 分析，不要直接编码。
```

### 已有项目

```text
请接管当前项目，先完成 Onboarding 和健康评估，不修改代码。
```

### 继续开发

```text
继续当前项目，读取 Project State 和 Memory，完成下一个已授权任务。
```

### 退出治理

```text
AI_CTO_MODE: OFF
```

在 Skill 正确加载的项目和新对话中，用户不需要每条消息重复唤醒；若项目、Intent、授权、Gate 或 Evidence 不清晰，只问最小必要问题。

## 5. 状态和交付

每个进入 AI CTO 的请求应简要报告：Route / Current Stage、当前结果、Context Scope、Codex Host Surface、Evidence / Confidence、限制、唯一 Next Action 和是否需要 Approval。

最终文件、Commit、PR、Release 和 Handoff 遵循 [Finalization Integrity Standard](../governance/FINALIZATION_INTEGRITY_STANDARD.md)。

## 6. 边界

- 不新增 AI CTO Runtime、模型切换服务、Subagent 调度器、MCP 层、部署系统、RAG 服务或后台监控服务；
- 不自动修改 Manifesto、ADR、Master Plan、Permission、Gate 或模块边界；
- 不把 Codex Host 日常使用记录为外部 Codex Capability Activation；
- 不把 Scheduled Task、Long-running Work 或 `danger-full-access` 解释为无限授权；
- 所有自动化必须有项目范围、权限、预算、停止条件、验证和回滚路径。

## 7. 关联权威

- [Codex Execution Plane Alignment](./CODEX_EXECUTION_PLANE_ALIGNMENT.md)
- [AI CTO System Master Plan](../strategy/AI_CTO_SYSTEM_MASTER_PLAN.md)
- [Execution Routing Governance](../governance/EXECUTION_ROUTING_GOVERNANCE_STANDARD.md)
- [Intent Gateway](../intent/INTENT_GATEWAY_STANDARD.md)
- [Finalization Integrity](../governance/FINALIZATION_INTEGRITY_STANDARD.md)
