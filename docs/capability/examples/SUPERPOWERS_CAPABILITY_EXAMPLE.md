# Superpowers Capability 架构示例

## 1. 示例边界

本文只演示未来如何把名为 Superpowers 的外部能力候选放入 Capability Governance 流程。它不是安装说明、准入批准、Registry 正式记录或调用授权。

本阶段不安装、不读取、不执行、不调用 Superpowers，也不验证任何实际仓库、版本、License 或安全状态。所有外部事实均保持 `UNKNOWN`，正式接入时必须重新取证。

## 2. 候选分类

| Field | Example Value |
|---|---|
| Candidate Name | Superpowers Capability Candidate |
| Type | `Engineering Capability` |
| Purpose | 增强 Planning、TDD、Debugging 和 Code Review |
| Applicable Layer | Layer 3：Product & Engineering（消费者）；治理归属仍为 Layer 5 |
| Applicable Phase | `DEVELOPMENT` |
| Source | `UNKNOWN`，正式评审时确认官方来源 |
| Version | `UNKNOWN` |
| License | `UNKNOWN` |
| Status | `DISCOVERED` 示例，不表示已创建正式 Registry Record |
| Quality Score | `NOT_EVALUATED` |
| Permission Requirement | `UNKNOWN`，需逐 Skill / Script / Tool 枚举 |
| Admission Result | 尚未执行；不得写 `ACTIVATE_CAPABILITY` |

## 3. 潜在能力拆分

Superpowers 不应只登记为一个宽泛 Capability。若未来取证证明其内部能力拥有不同合同和风险，应分别建立候选记录，例如：

- Planning Capability；
- TDD Guidance Capability；
- Debugging Capability；
- Code Review Capability。

每项分别记录输入输出、触发范围、脚本 / 工具权限、依赖、质量和失败边界。共享来源通过 Related Capabilities 关联，不共享激活结论。

## 4. 未来接入流程

1. 证明它服务 AI CTO 的工程质量、知识沉淀和研发复利使命。
2. 确认官方来源、不可变版本、Artifact、Publisher 和 License。
3. 检查 instruction 注入、脚本、Shell、文件、网络、子 Agent、工具和数据权限。
4. 在隔离环境分别验证 Planning、TDD、Debugging 和 Review 的功能、稳定性与兼容性。
5. 按 100 分模型评分，记录 Evidence、Confidence、限制、成本和替代方案。
6. 为通过准入的原子能力创建 Registry Record；先 `ADMIT_FOR_EVALUATION`，全部条件满足后才可能 `ACTIVATE_CAPABILITY`。
7. 通过 Adapter / Capability Contract 接入未来 Runtime，保持 Core 对实现无直接依赖。

## 5. 替换与降级

Core 只依赖抽象的工程能力合同，例如计划输出、测试证据、诊断报告和 Review 结果。未来若 Superpowers 被停用、License 改变、维护停止或质量下降，应能切换到其他 `ACTIVE` Capability 或人工流程，不影响 AI CTO 的需求、设计、测试和 Gate 规则。

## 6. 当前结论

该示例不产生 Capability ID，不改变 Module Registry，不连接任何外部系统，不授予任何权限。它只证明 Capability Governance 能表达未来候选接入路径。
