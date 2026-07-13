# ADR-0009：AI CTO System 采用 Layer + Module 架构模型

- 状态：Accepted
- 日期：2026-07-13
- 决策者：AI CTO System 项目创建者、AI CTO

## 背景

AI CTO System 通过 Phase 1、2、3、4、5、6、6.5、7 和 8 逐步建立了 Kernel、协议、决策、设计、开发、测试发布、已有项目接管、维护演进和组合治理。Phase 对交付管理有效，但随着能力增加，开始同时承担三种含义：历史交付批次、架构职责和项目生命周期步骤。

这些含义并不一致。Phase 2 同时包含记忆、决策入口和生命周期；Phase 6.5 是已有项目替代入口而非顺序阶段；Phase 8 的 Portfolio Management 是跨项目治理覆盖层，而不是单项目状态。继续按 Phase 扩展，会造成小数 Phase、单功能 Phase、模块重复、状态混淆和未来执行层越权。

基线压力测试也表明：当路线图已写“Phase 8.2”、评审期限临近且已有沟通投入时，现有规则会直接接受新 Phase，并可能把外部 Capability Governance 归入 Portfolio，而没有先判断稳定职责边界。

## 决策

1. 采用五层稳定架构：
   - Layer 1：Identity & Memory
   - Layer 2：Decision & Governance
   - Layer 3：Product & Engineering
   - Layer 4：Operation Lifecycle
   - Layer 5：Execution & Intelligence
2. 使用 Module 作为层内可独立治理的能力单元；每个 Module 必须有且只有一个 Owning Layer。
3. 使用 [MODULE_REGISTRY](../architecture/MODULE_REGISTRY.md) 作为模块名称、归属和状态的权威索引。
4. Phase 只保留为历史交付批次，不再作为未来需求的架构分类或模块所有权模型。
5. Lifecycle State 继续描述单项目当前阶段，由 Layer 4 管理；Portfolio Status 继续作为 Layer 2 的组合处置状态。
6. 所有未来需求先执行 [FEATURE_CLASSIFICATION_RULES](../architecture/FEATURE_CLASSIFICATION_RULES.md)，结果只能是复用、扩展、在现有层创建 Module、提议新 Layer 或暂缓。
7. 新 Layer 必须通过系统级架构评审；重大结构变化必须创建 ADR。
8. Layer 5 负责未来安全执行和编排，不拥有或覆盖 Layer 2 决策、Layer 3 工程基线、Layer 4 生命周期门禁或 Layer 1 记忆规则。
9. Capability Governance 登记为 Layer 5 的 `Planned` Module。本决策不进入 Phase 8.2，也不实现其功能。

## 选择理由

Layer 对应变化较慢的责任平面，Module 对应可演进的能力，Phase 对应已发生的交付历史，Lifecycle State 对应项目运行状态。分离四种概念后，可以在不改写历史的前提下稳定扩展系统，并让每个数据、决策和 Gate 都有明确权威来源。

五层也建立了清晰控制方向：记忆提供上下文，治理决定做什么，工程定义如何做，生命周期验证和运营结果，执行层只在授权范围内编排动作。

## 替代方案

- **继续按 Phase 扩展：** 容易理解交付顺序，但会继续产生 Phase 6.5、8.2 等分类补丁，拒绝。
- **每个新功能创建 Module，但不定义 Layer：** 避免 Phase 膨胀，但缺少稳定责任和跨模块边界，拒绝。
- **把 Portfolio 作为最高控制层并容纳执行能力：** 会混淆“决定资源”与“执行工具”，增加越权和重复，拒绝。
- **立即实现 Layer 5：** 超出本次架构审查范围，且没有完成需求、设计和门禁，拒绝。

## 后果

### 正面影响

- 未来需求有稳定的分类入口，不因路线图名称直接产生新 Phase。
- Module 的 Owner、状态和相关文档可以统一检索。
- 评分、状态、Gate、记忆和执行的边界更清楚。
- Layer 5 的自动化被约束为治理的执行面，不能成为旁路审批器。
- 历史 Phase 得以保留，无需破坏性重命名或移动现有文档。

### 负面影响与风险

- Phase、Layer、Module、Lifecycle State 四种概念需要被持续区分。
- 现有文档存在相似评分和 Gate 名称，需要逐步统一元数据和交叉引用。
- 模块注册表会增加维护成本；若不随结构变化更新，会形成新的过期索引。
- Layer 5 尚未实现，架构图中的执行入口暂时仍由人工或 Codex 按协议完成。

## 后续行动

- 同步 SKILL、Project Lifecycle、Project Memory 和 Development Progress 的 Layer + Module 规则。
- 使用 Phase 映射审查记录现有能力归属和重叠边界，不进行破坏性合并。
- 对未来需求先形成 Feature Classification Record。
- 等待用户确认本次架构审查；确认前不进入 Phase 8.2。
