# AI CTO System 模块加入评估规则

## 1. 目的与顺序

本规则决定一项未来能力是否应该进入 AI CTO System。它是战略准入门禁，执行顺序早于 Layer / Module 架构归类：

`Mission Alignment → Module Admission → Feature Classification → Architecture / Design`

“可以归入某个 Layer”只说明架构位置可能成立，不证明该能力应该成为系统的一部分。战略准入不通过时，不创建 Module、不更新系统路线图，也不进入实现。

## 2. 六项必答问题

### 1. 是否服务 AI CTO 使命？

说明它如何帮助个人或组织把想法持续转化为可交付、可维护、可进化的产品资产，或如何增强 AI 技术组织能力。必须给出直接因果链和可验证结果。

### 2. 属于哪个 Layer？

给出唯一 Owning Layer、可能的 Existing Module 和跨层输入输出。无法确定稳定 Owner 通常意味着边界尚未成熟，而不是创建新 Layer 的理由。

### 3. 解决什么核心问题？

描述目标用户、当前阻碍、问题频率、影响和现有替代方案。禁止用功能描述代替问题定义。

### 4. 是否可以复用？

记录对 Module Registry、Knowledge Base、Technical Asset Registry、已有协议和外部产品的检索结果，比较复用、扩展、购买、独立产品和自研。

### 5. 是否增加长期资产？

说明将产生什么可验证、可维护、可复用的知识、数据、技术模块、方法、评测或组织能力，以及资产 Owner、适用范围和质量证明。

### 6. 是否增加系统复杂度？

评估新增概念、状态、权限、依赖、数据、成本、维护、供应商、安全面、用户认知和退出负担。复杂度必须与长期价值、复用次数和风险降低相匹配。

## 3. Admission Record

每项候选能力必须按以下字段记录：

| 字段 | 要求 |
|---|---|
| Candidate ID / Name | 稳定标识与名称 |
| Mission Contribution | 使命贡献、因果链、指标 |
| Core Problem | 用户、问题、频率、影响、替代方案 |
| Owning Layer / Existing Module | 候选归属；未确定时写 `UNRESOLVED` |
| Reuse Analysis | 已检索范围与复用 / 扩展 / 外购 / 独立方案 |
| Long-term Asset | 可沉淀资产、Owner、验证与适用边界 |
| Complexity Impact | 新增与移除复杂度、持续成本和退出能力 |
| Evidence / Confidence | 支持、反证、未知项与可信等级 |
| Human Decision | 决策人、决定、范围、版本和日期 |
| Admission Result | 使用第 4 节固定结果 |
| Next Action | 补证、分类、独立管理或停止 |

## 4. 准入结果

- `ADMIT_FOR_CLASSIFICATION`：六项均有充分证据，长期价值明确，允许进入 Feature Classification；不等于批准设计或实现。
- `CONDITIONAL_ADMISSION`：使命方向成立，但证据、复用、资产或复杂度条件尚未关闭；保持候选状态，不进入实现。
- `REJECT_OR_DEFER`：无法证明使命价值、只是通用邻近功能，或复杂度明显高于长期贡献；不纳入系统。

只有 `ADMIT_FOR_CLASSIFICATION` 可以继续执行[未来需求归类规则](../architecture/FEATURE_CLASSIFICATION_RULES.md)。人类最终批准不能把缺失证据改写为已满足；若选择 Override，必须独立记录理由、风险、期限和复核条件。

## 5. 判定规则

以下任一情况不得直接准入：

- 使命贡献只能描述为“方便”“流行”“可以自动化”或“适合演示”；
- 只证明存在 Layer 位置，没有证明系统价值；
- 未检索复用方案，或重复已有权威能力；
- 没有可验证长期资产，主要收益是一次性交付；
- 引入永久维护、权限或数据负担，但没有退出方案；
- 关键依据为职位指令、截止日期、预算已批或沉没投入。

无法证明价值时，保持外部独立产品、受控实验或停止，不把其放入 AI CTO System 以等待未来证明。

## 6. 复核触发器

候选需求、用户、使命贡献、Layer、复用结论、资产计划、复杂度、风险或 Evidence 发生变化时，旧 Admission Result 失效并重新评审。已加入 Module 若持续不再服务使命，应进入合并、拆分、迁出、Deprecated 或 Retired 评审，而不是因历史投入永久保留。
