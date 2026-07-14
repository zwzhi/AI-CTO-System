# Skill Routing Policy

## 目的与边界

Skill Routing 只建议应使用的能力类别和候选 Skill，不加载、不安装、不激活、不调用任何 Skill。它服从 Capability Governance 的 Admission、Registry、License、安全、兼容性、权限和生命周期规则。

## 选择输入

每项建议必须依据 `Task Type`、`Risk`、`Complexity`、`Required Capability`、当前项目限制与可用证据。缺少明确任务需求时，输出 `NO_SKILL_REQUIRED` 或 `INSUFFICIENT_EVIDENCE`。

| 任务情形 | 候选 Required Capability | 路由说明 |
|---|---|---|
| 简单文档修改 | Documentation Capability | 仅在格式、链接、文档结构或受控写入确有价值时建议。 |
| 代码开发与测试 | Engineering / Testing Capability | 必须与批准设计、测试和工程 Gate 对齐。 |
| 安全、发布或部署 | Security / Deployment Capability | 必须保留现有权限和审查，不以 Skill 建议替代 Gate。 |
| 新项目、重大架构 | AI CTO Capability（治理组合） | 使用 CTO Workflow 中已有决策、设计与生命周期规范，不把它视为单个外部 Skill。 |
| 普通咨询 | 无 | Level 0 默认不加载 Skill。 |

## 规则

1. **禁止无任务需求加载 Skill**；“可能有用”“方便”“曾经使用”不是充分理由。
2. 候选 Skill 必须映射到已登记、适用且允许的 Capability；Registry 不存在或权限不足时不得建议调用。
3. 一个任务可以建议 `NO_SKILL_REQUIRED`，并不因未使用 Skill 降低质量。
4. 风险、敏感数据、License、维护状态、兼容性或项目 Gate 冲突时升级审查，不通过 Skill 组合规避。
5. Execution Plan 必须记录建议原因、替代方案、风险、是否实际需要调用和 Confidence。

## 禁止事项

不得把具体 Skill、插件、MCP 或第三方 Agent 设为 AI CTO Core 的不可替代依赖；不得将建议状态误写为 Capability `ACTIVE` 或 Invocation Authorization。
