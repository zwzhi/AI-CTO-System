# AI CTO System 架构设计原则

## 1. 适用范围

本原则约束 AI CTO System 的所有 Layer、Module、协议、模板、数据、Agent、工具集成和自动化。它补充五层[系统架构](../architecture/AI_CTO_SYSTEM_ARCHITECTURE.md)与[架构演进标准](../architecture/ARCHITECTURE_EVOLUTION_STANDARD.md)，不取代工程 Gate。

## 2. 六项原则

### 原则 1：围绕中心使命扩展

每项变化必须说明它如何提高想法到产品的转化、产品长期可维护与可进化能力，或技术组织的资产与判断能力。仅仅“可以实现”“市场流行”或“适合演示”不能证明战略价值。

**检查：** 使命贡献、目标用户、核心问题和可衡量结果是否明确？

### 原则 2：优先复用已有能力

先检索 Module Registry、Knowledge Base、Technical Asset Registry、协议和模板，再决定复用、扩展或新增。禁止因名称、团队或交付批次不同重复建立同一权威能力。

**检查：** 已检索哪些能力？为什么复用或扩展不足？

### 原则 3：能力插件化

需要独立演进的能力应具有明确 Owner、输入输出、版本、权限、状态、失败边界、替代方案和退出路径。插件化强调可替换与隔离，不等于未经审核即可安装或执行。

**检查：** 能力能否独立启停、替换、测试、审计和回滚？

### 原则 4：数据和经验必须沉淀

真实使用产生的决策、Evidence、指标、失败、反馈和经验必须进入适当的 Project Memory、Knowledge Base 或 Technical Asset Registry。没有来源、适用范围、Confidence、隐私和许可边界的内容不能冒充资产。

**检查：** 产生什么可保留资产？由谁维护？如何验证、脱敏和复用？

### 原则 5：重大决策必须有依据

影响使命、Layer、Module 权威、数据、权限、成本、安全、长期兼容或难回滚承诺的决策必须记录 Evidence、Confidence、替代方案、风险和 ADR。职位、紧急程度和沉没成本不能替代依据。

**检查：** 决策证据、反证、未知项、风险接受者和复核条件是否完整？

### 原则 6：AI 建议，人类最终决策

AI CTO 可以分析、评分、推荐、模拟和执行已授权动作，但项目立项、重大资源投入、风险接受、结构变化、生产发布和系统使命变化由人类作最终决定。

**检查：** AI 的建议范围、人工批准点、授权版本、撤销和升级路径是否明确？

## 3. 冲突处理顺序

原则冲突时按以下顺序处理：使命与用户长期价值 → 安全、数据与可逆性 → 人类决策权 → 证据与可追溯性 → 复用与简化 → 交付速度。冲突、取舍和剩余风险必须记录，不能通过删除不利指标解决。

## 4. 评审输出

每次架构或 Module 评审至少输出：Mission Alignment、Reuse Decision、Plugin Boundary、Memory / Asset Contribution、Evidence / Confidence、Human Decision Point、Complexity Impact、Risks 和 Next Action。未满足项返回补证、缩小范围、改为外部独立项目或拒绝加入系统。
