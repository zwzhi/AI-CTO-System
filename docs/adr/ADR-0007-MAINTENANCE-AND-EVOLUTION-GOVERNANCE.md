# ADR-0007：Maintenance 与 Evolution 长期治理

- 状态：Accepted
- 日期：2026-07-13
- 决策者：AI CTO System 项目创建者、AI CTO

## 背景

项目上线不是生命周期终点。长期运行会持续产生 Bug、Incident、依赖与安全更新、技术债、用户反馈、成本变化和 AI 能力漂移。如果 AI CTO 只管理从 Idea 到 Release，项目上线后的变更会失去统一优先级、证据、复盘、记忆和门禁；相反，如果所有问题都被升级为重大项目，日常维护又会失去效率。

AI 系统还会受到模型、Prompt、工具、数据分布、供应商和成本变化影响。一次发布时通过评测，不能证明能力长期保持。

## 决策

- 以 `MAINTENANCE` 管理稳定运营中的 Bug、小版本需求、性能、依赖、安全和技术债。
- 以 Incident 流程优先隔离生产影响，并把临时恢复、永久修复与 Postmortem 分开记录。
- 用不可覆盖的 Debt、Feedback 和 AI Capability History 建立长期趋势与责任。
- 当重复 Bug、大量反馈、技术路线变化、AI 能力不足或流程低效形成系统性变化时，执行 Maintenance → Evolution Gate。
- AI CTO 不能直接实施演进机会；必须创建版本化 Evolution Proposal，完成评分、风险与替代方案分析，并取得用户对精确版本的批准。
- Gate 的唯一进入授权为 `APPROVED_FOR_EVOLUTION`。它只允许进入 `EVOLUTION`，不授权编码、测试、发布或生产修改。
- Evolution 的实现继续遵守适用的 Research、Evaluation、Design、Development、Testing 和 Release Gate。
- 项目周期复核必须在继续维护、重构、归档和停止之间形成证据化结论。
- Incident、Postmortem、技术债、反馈和演进结果中可复用且已脱敏的经验进入 `memory/knowledge_base/`。

## 选择理由

Maintenance 与 Evolution 分层可以把“保持当前价值”与“改变系统能力”分离。Incident、Postmortem 和历史指标为问题提供事实链；Evolution Proposal 和 Gate 则确保重大改变有用户价值、证据、预算、风险控制和明确授权，而不是在维护压力下直接修改系统。

## 替代方案

- **上线后只使用 Bug 和普通 Backlog**：无法管理 Incident、系统性债务、AI 漂移和重大演进，拒绝。
- **所有变化都重新从 IDEA 开始**：可追溯但忽略现有项目基线，日常维护成本过高，拒绝。
- **AI CTO 发现机会后自动优化**：速度快，但绕过用户审批、基线、测试和发布授权，拒绝。
- **只按定期路线图演进**：容易错过 Incident、安全、用户和 AI 漂移触发的紧急复核，拒绝。

## 后果

### 正面影响

- 上线项目拥有统一的维护优先级、Incident、复盘、债务和反馈闭环。
- AI 能力变化可以跨版本、模型、Prompt、成本和时延长期比较。
- 重大优化从证据和 Proposal 开始，不以临时修复替代系统治理。
- 项目可以有序继续维护、重构、归档或停止。

### 负面影响与风险

- 长期记录、周期评估和复盘增加治理成本。
- Maintenance 与 Evolution 边界需要结合影响而不是只看代码量判断。
- Proposal 评分可能被误当作自动审批，必须持续与 Confidence、红线和用户授权分开。
- 行动项如果缺少 Owner、期限和验证，Postmortem 可能退化为形式文档。

## 后续行动

- 在 SKILL、生命周期、PROJECT_STATE、PROJECT_MEMORY、文档关系和 Progress 中同步 Maintenance 与 Evolution 规则。
- 用重复故障、AI 能力退化、成本上升和高压直接修改场景验证 Gate 边界。
- Phase 7 完成后停止，等待用户确认，不进入 Phase 8。

