# Routing Deviation Analysis

## 1. 目的

本标准用于分析任务的理论复杂度、建议执行路由与实际执行之间是否存在偏差。它是只读分析工具，不是自动调度规则。

## 2. 偏差分类

| 类型 | 判断 | 例子 |
|---|---|---|
| `NONE` | 建议与实际在允许范围内一致 | L1 / LIGHT / R1 实际按同档完成 |
| `WORKFLOW_OVERHEAD` | 实际 Workflow 明显高于任务需要 | 局部文档同步使用完整 CTO 流程 |
| `CONTEXT_OVERLOAD` | 实际 Context 超出最小必要范围 | 读取无关项目、快照或完整知识库 |
| `REASONING_OVERBUDGET` | 实际推理档位高于复杂度且无风险依据 | L1 任务使用 R3/R4 |
| `SKILL_TOOL_OVERUSE` | 调用了无明确任务价值的 Skill/Tool | 纯文本整理调用浏览器或 Git 执行 |
| `HUMAN_FRICTION` | 重复确认、澄清或返工显著增加 | 同一授权被重复询问 |
| `SAFETY_ESCALATION` | 因安全、Gate、ADR、权限或证据红线而升级 | 低复杂度但涉及权威文件 |
| `CAPABILITY_UNAVAILABLE` | 建议能力不可用，实际未执行或进入人工路径 | 宿主模型容量不足 |

## 3. 分析步骤

```text
Feedback Record
  ↓
核对任务范围与复杂度
  ↓
比较 Recommended / Actual
  ↓
排除安全与 Gate 的合法升级
  ↓
标记偏差类型
  ↓
记录质量、成本、时延和交互 Evidence
  ↓
形成 Observation / Hypothesis
```

安全、权限、ADR、Gate、数据边界和不可逆影响导致的升级必须标记为 `SAFETY_ESCALATION`，不得为了“流程过轻”将其判为冗余。

## 4. 结论等级

| 结论 | 条件 | 后续 |
|---|---|---|
| `OBSERVATION_ONLY` | 单案例或关键指标缺失 | 只保留 Evidence |
| `CANDIDATE_PATTERN` | 至少 3 个同类案例，方向一致 | 可形成 Optimization Proposal |
| `REPEATABLE_PATTERN` | 至少 5 个可比较案例，质量不下降且风险可控 | 可进入正式风险评估 |
| `REJECTED_PATTERN` | 案例冲突、证据不足或只适用于一个项目 | 不固化为通用规则 |

数量阈值是最低证据门槛，不替代项目适用范围、Confidence 和安全审查。

## 5. 质量对照

任何声称“路由更轻且更好”的结论，至少比较：

- 完成质量和验收结果；
- 返工、澄清和错误次数；
- Duration、Token、Cost；
- 人工交互和阻塞次数；
- 安全、权限、Gate 和 Evidence 完整性。

缺少任一关键项时，结论保持 `OBSERVATION_ONLY` 或标记 `NOT_CAPTURED`。

## 6. 当前案例边界

`EFF-001` 与跨项目反馈记录目前只能支持“需要继续收集执行 Evidence”的假设，不足以直接改变默认路由。单次模型容量失败只能标记 `CAPABILITY_UNAVAILABLE`，不等于 AI CTO 路由过重，也不授权自动切换模型。

## 7. 禁止事项

- 不因效率目标降低安全、Gate、ADR 或权限要求；
- 不将快照、交接副本或同一项目的重复记录当作多个独立案例；
- 不用内部推理猜测补齐 Duration、Token 或 Cost；
- 不直接修改 Advisory Router、Runtime 或宿主模型设置；
- 不把分析结论自动升级为 Knowledge `ACTIVE`。
