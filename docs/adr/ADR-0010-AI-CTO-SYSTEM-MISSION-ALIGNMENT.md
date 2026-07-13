# ADR-0010：建立 AI CTO System 战略使命对齐机制

- 状态：Accepted
- 日期：2026-07-13
- 决策者：AI CTO System 项目创建者、AI CTO

## 背景

AI CTO System 已建立项目生命周期、决策治理、产品设计、开发管理、测试发布、已有项目接管、维护进化、多项目治理和五层架构。架构审查解决了“能力放在哪一层”的问题，但仍不能独立回答“这项能力是否应该进入系统”。

随着能力增加，任何可以归入现有 Layer 的功能都可能被包装成 Module。若没有稳定使命、边界和长期价值判断，系统会逐步成为通用 AI 工具集合：功能越来越多，维护和权限复杂度持续上升，但想法到产品的转化、技术资产和组织能力没有同步增长。

## 决策

1. 以 [AI CTO System Manifesto](../strategy/AI_CTO_SYSTEM_MANIFESTO.md) 定义系统使命、核心价值、边界和长期愿景。
2. 采用六项[架构设计原则](../strategy/AI_CTO_ARCHITECTURE_PRINCIPLES.md)：使命扩展、优先复用、能力插件化、数据经验沉淀、决策有据、AI 建议而人类最终决策。
3. 在 Feature Classification 之前执行[模块加入评估](../strategy/MODULE_ADMISSION_CRITERIA.md)，先判断是否应该加入，再判断属于哪个 Layer / Module。
4. Module Admission 必须评估使命贡献、Layer 候选、核心问题、复用、长期资产和复杂度。
5. 准入结果只使用 `ADMIT_FOR_CLASSIFICATION`、`CONDITIONAL_ADMISSION` 或 `REJECT_OR_DEFER`；只有第一种结果允许进入架构归类。
6. 使用[核心价值飞轮](../strategy/AI_CTO_VALUE_LOOP.md)解释并验证真实使用如何转化为经验、资产、下一项目效率和 AI CTO 能力。
7. AI CTO 提供分析和建议，人类保留使命变化、模块准入、重大资源和风险的最终决策权。
8. Strategic Alignment 是跨层治理检查点，不是第六个架构 Layer、新生命周期状态或新的功能 Phase；五层架构保持不变。

## 选择理由

架构分类只能保证结构一致，不能保证方向正确。把使命准入放在 Layer / Module 分类之前，可以先过滤无关功能，再为真正有长期价值的能力寻找合适归属。将真实使用、经验和技术资产连接成飞轮，则为“长期价值”提供了可验证路径，而不是依赖愿景口号。

## 替代方案

- **只依赖五层架构分类：** 可以减少结构混乱，但任何邻近功能都能找到位置，拒绝。
- **由 Portfolio Priority 决定是否加入：** Priority 比较已纳管项目的资源顺序，不定义系统使命边界，拒绝。
- **允许所有 AI 工具进入，后续再淘汰：** 初期速度快，但会积累权限、数据、依赖和维护负担，拒绝。
- **新增第六个 Strategy Layer：** 会破坏刚建立的五层稳定模型；战略使命应约束所有层，而不是与它们并列，拒绝。
- **完全由 AI 自动决定准入：** 缺少人类对使命、资源和风险的最终控制，拒绝。

## 后果

### 正面影响

- 系统功能增长与中心使命建立可审计关系。
- 通用邻近工具可以被明确留在系统外，而不污染核心架构。
- 复用、资产和复杂度成为 Module 准入前置条件。
- README、SKILL 和 Project Memory 共享同一使命基线。
- 五层架构得到战略约束，同时保持结构不变。

### 负面影响与风险

- 新能力进入架构分类前增加一次评审成本。
- 使命贡献有被写成空泛口号的风险，必须绑定指标、Evidence 和 Confidence。
- 对创新能力过早拒绝可能错失机会，因此保留 `CONDITIONAL_ADMISSION`、外部实验和重新评审路径。
- Manifesto 若长期不复核可能失去现实性，需要由重大变化、长期指标和用户方向触发复审。

## 后续行动

- 在 README、SKILL、Project Memory 和 Module Registry 中建立使命入口。
- 对未来 AI CTO System 能力先生成 Admission Record，再执行 Feature Classification。
- 等待用户确认本次 Strategic Alignment Review；确认前不进入下一阶段或功能开发。
