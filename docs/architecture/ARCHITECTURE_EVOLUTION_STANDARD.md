# AI CTO System 架构演进标准

## 1. 目的

本标准约束 AI CTO System 自身的长期结构变化，防止单个功能引发 Phase 膨胀、职责复制或 Layer 边界漂移。它只管理系统元架构，不替代被管理项目的产品 Architecture、ADR 和工程门禁。

## 2. 强制原则

1. **优先扩展已有 Module。** 先检索模块注册表，证明现有合同无法容纳后才提出新 Module。
2. **禁止为了单个功能创建新 Phase。** Phase 只记录历史交付批次，不是未来需求的架构分类结果。
3. **新增 Layer 必须经过系统级架构评审。** 必须证明现有五层均无法承载，且新职责长期稳定、可容纳多个 Module。
4. **重大结构变化必须创建 ADR。** Layer、Module 权威边界、跨层数据流、核心状态或兼容性发生重大变化时，先接受 ADR 再实施。

## 3. 变化等级

| Change Type | 判定 | 最低治理要求 |
|---|---|---|
| Artifact Update | Module 职责和合同不变，仅更新模板、示例或说明 | 更新相关文档、Progress；按影响更新 Memory |
| Module Extension | Owner 与核心目的不变，扩展输入输出、规则或消费者 | Feature Classification、影响分析、注册表与相关文档更新；重大时创建 ADR |
| New Module | 现有 Layer 内出现长期、独立、可治理职责 | Feature Classification、架构评审、Owner、合同、状态、注册表；按影响创建 ADR |
| Module Merge / Split / Move | 权威职责或消费者迁移 | 架构评审、ADR、迁移与兼容方案、废弃计划、注册表更新 |
| New Layer | 五层无法承载且形成新的稳定责任平面 | 完整系统架构评审、Accepted ADR、数据流、治理、迁移、回滚和用户批准 |
| Layer Removal / Redefinition | 系统根职责发生变化 | 完整系统架构评审、Accepted ADR、全量影响与迁移验证 |

## 4. 演进流程

1. 按[需求归类规则](./FEATURE_CLASSIFICATION_RULES.md)创建 Feature Classification Record。
2. 检索[模块注册表](./MODULE_REGISTRY.md)，优先选择 `USE_EXISTING_MODULE` 或 `EXTEND_EXISTING_MODULE`。
3. 记录受影响 Layer、Module、Artifact、Lifecycle State、Gate、记忆、权限、消费者和外部合同。
4. 确定变化等级、Owner、Evidence、Confidence、风险、兼容、迁移、回滚和验收标准。
5. 若触发 ADR 条件，先创建并接受 ADR；未接受时状态保持 `PROPOSED`，不得实施。
6. 更新系统架构、模块注册表、治理文件、PROJECT_MEMORY 和 DEVELOPMENT_PROGRESS。
7. 验证链接、词汇、状态、责任归属和跨层合同一致性；保留旧决策及迁移历史。

## 5. 新 Layer 评审门槛

只有以下条件全部满足，才能输出 `PROPOSE_NEW_LAYER`：

- 现有五层无法在不破坏核心职责的情况下承载该需求；
- 该职责在多个项目、场景和版本周期中稳定存在；
- 至少能容纳多个独立 Module，而不是包装单一功能；
- 有独立的权威数据、Owner、输入输出、风险和审计边界；
- 与五层的依赖方向、授权边界和失败处理明确；
- 提供迁移、兼容、废弃、回滚、测试和运营方案；
- 系统级架构评审和 ADR 均获明确批准。

任一条件不满足时，返回现有 Layer 内扩展、重述需求或 `REJECT_OR_DEFER`。

## 6. ADR 触发条件

以下任一情况必须创建 ADR：

- 新增、删除或重新定义 Layer；
- 新建 Module 将成为跨项目或跨层权威来源；
- Module 在 Layer 间移动，或发生合并、拆分、替代；
- 修改跨层数据流、授权边界、生命周期状态或 Gate 权威来源；
- 引入难回滚的运行时、权限、数据、供应商或兼容性承诺；
- 废弃现有合同会影响多个 Module、项目或历史可追溯性。

小型 Artifact 更新不强制创建 ADR，但不能借“小改动”分批规避重大结构评审。

## 7. Architecture Change Record

每次结构变化至少记录：Change ID、Request、Classification Result、Owning Layer、Affected Modules、Current / Proposed Contracts、Evidence、Confidence、Risks、Compatibility、Migration、Rollback、ADR、Registry Update、Approval、Validation 和 Next Action。

变更状态只使用：`PROPOSED`、`APPROVED`、`REJECTED`、`IMPLEMENTED`、`SUPERSEDED`。`APPROVED` 只授权已记录的结构变更，不自动授权代码、外部工具、生产配置或部署。

## 8. 废弃与兼容

- Module 进入 `Deprecated` 前必须列出消费者、替代方案、迁移责任人、截止时间和回滚路径。
- 迁移期间保留旧合同的版本、决策和已知风险，不覆盖历史。
- 所有消费者完成验证后，Module 才能进入 `Retired`。
- Dashboard、索引和自动化投影必须在权威来源变更后同步更新，不能先切换投影再补事实源。

## 9. 本次审查边界

本标准确认 Capability Governance 属于 Layer 5 的 `Planned` Module。本次只完成分类与架构治理，不创建该模块的功能规范、Agent、运行时、插件接入或 Phase 8.2。
