# Evolution Proposal 标准

## 1. 核心原则

AI CTO 发现系统性优化机会后不能直接修改系统。必须先生成 Evolution Proposal，把问题、证据、目标、方案、收益、风险、成本和授权边界转化为可审计决策。

Proposal 的批准只允许项目进入 `EVOLUTION` 并开展已批准范围的后续设计与执行准备，不等于编码、测试、发布或生产变更授权。

## 2. 标准流程

`发现问题 → 分析影响 → 生成 Proposal → 评分 → 用户审批 → 执行升级 → Git 记录`

| 阶段 | 必须动作 | 输出 |
|---|---|---|
| 发现问题 | 记录反馈、Incident、技术债、AI 退化、战略或流程证据 | Trigger Record 与 Evidence |
| 分析影响 | 确认用户、业务、技术、数据、安全、成本和不改变的后果 | Impact Analysis |
| 生成 Proposal | 比较继续维护、局部优化、演进、替换和停止 | 版本化 Evolution Proposal |
| 评分 | 按统一模型评分，同时报告 Confidence 和红线 | Score、建议与短板 |
| 用户审批 | 对当前精确版本、范围、预算、风险和成功标准作出决定 | Gate Record |
| 执行升级 | 按适用 Research / Evaluation / Design / Development / Testing / Release Gate 实施 | Task、Commit、Test、Release Evidence |
| Git 记录 | 提交文档、实现和结果，更新追踪、状态和记忆 | Commit、ADR、Progress、History |

## 3. Proposal 必填字段

每份 Proposal 必须包含：

- Proposal ID，格式 `EVO-XXXX`；
- 项目、当前版本、Current Stage、创建时间、Owner 和状态；
- 发现原因、触发器、关联 Incident / Bug / Feedback / Debt / AI Capability Record；
- 当前问题、Evidence、Confidence 和不处理的影响；
- 优化目标、用户结果、成功指标、失败阈值和时间窗口；
- 影响范围，包括产品、架构、数据、API、AI、依赖、运维、安全和团队；
- 风险、红线、可逆性、回滚和替代方案；
- 预期收益、成本、资源、依赖、里程碑和机会成本；
- 执行方案、验证方案、灰度 / 迁移、监控和停止条件；
- 评分明细、总体 Confidence、用户审批和后续门禁；
- Git、ADR、PROJECT_STATE、PROJECT_MEMORY 和知识沉淀计划。

## 4. Proposal 评分模型

| 维度 | 分值 | 判断重点 |
|---|---:|---|
| 用户与业务价值 | 25 | 用户结果、覆盖、收益、风险降低和业务持续性 |
| 问题严重性与紧迫性 | 15 | 退化幅度、重复频率、时间成本和不处理后果 |
| 证据质量与 Confidence | 15 | 来源、可复现性、历史趋势和关键结论可信度 |
| 技术可行性 | 15 | 架构适配、依赖、技能、数据、验证和迁移能力 |
| 战略与复用价值 | 10 | 长期路线、跨项目复用、数据和知识资产 |
| 成本效率 | 10 | 总拥有成本、资源、时间、机会成本和替代方案 |
| 可逆性与风险控制 | 10 | 灰度、隔离、回滚、数据恢复、安全和停止条件 |
| **合计** | **100** | 分数与 Confidence、红线分开判断 |

建议区间：

- 80–100：可提交用户审批；
- 60–79：先补证、缩小范围或进行受控验证；
- 0–59：保留在 Maintenance，暂不进入 Evolution。

评分不能抵消未关闭的安全、数据、合规、License、不可恢复或证据来源红线。关键结论 Confidence 不足时，必须补证或缩小承诺。

## 5. 状态与版本

Proposal 状态只允许：`DRAFT`、`UNDER_REVIEW`、`CHANGES_REQUIRED`、`APPROVED`、`REJECTED`、`DEFERRED`、`IN_EXECUTION`、`VALIDATED`、`CLOSED`、`SUPERSEDED`。

修改范围、目标、成本、风险、候选方案或成功指标时创建新版本并保留差异。旧审批只对其精确版本有效；关键内容变化会使审批失效并重新执行 Evolution Gate。

`DEFERRED` 必须记录原因、有效期、监控和重新触发条件。`SUPERSEDED` 必须引用替代 Proposal，不得删除旧决策。

## 6. 审批与执行边界

用户审批必须明确 Proposal ID / Version、批准范围、预算、风险、成功指标、停止条件和后续阶段。Evolution Gate 的唯一进入授权结果是 `APPROVED_FOR_EVOLUTION`。

取得该结果后才能把 Current Stage 从 `MAINTENANCE` 改为 `EVOLUTION`。随后根据变化规模重新执行适用的 Research、Evaluation、Design、Development、Testing 和 Release Gate；不得从 Proposal 直接修改生产系统。

## 7. 验证与关闭

演进完成后必须将实际用户结果、七维 AI 能力、性能、成本、风险、Incident、回滚和长期观察与 Proposal 目标比较。达到成功标准且没有未处理红线时才能 `VALIDATED`；知识沉淀、状态、记忆和剩余风险完成后才能 `CLOSED`。

目标未达到时执行回滚、缩小范围、建立新版本或返回 Maintenance，不得只以“已完成开发”关闭 Proposal。

