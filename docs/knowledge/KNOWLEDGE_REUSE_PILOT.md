# Knowledge Reuse Pilot

## 1. 模拟项目

- Project：`AI Content Workflow Platform`
- Current Stage：Design 前评估模拟
- Project Status：不存在真实项目目录，不产生开发授权
- 假设：计划长期扩展内容研究、生成、审核、发布和运营能力；采用文档驱动治理；需要明确状态和审批输出。
- 未知：真实团队规模、部署边界、数据合规、模型、吞吐、预算和最终 Architecture。

本模拟只验证 Knowledge 查询和适用性判断，不创建 PRD、Architecture、代码或 Gate 授权。

## 2. 查询过程

查询目标：长期系统如何管理能力边界、治理状态和证据不足风险。

检索 [Knowledge Registry](../../knowledge_base/knowledge_registry/KNOWLEDGE_REGISTRY.md)，命中三条：

| Knowledge ID | Status | Evidence / Confidence | Quality | Status Filter Result |
|---|---|---|---:|---|
| `KN-ARC-0001` | `VALIDATED` | L3 / L3 | 86 | 允许受控参考和适配，不作为默认 Architecture |
| `KN-ENG-0001` | `VALIDATED` | L3 / L3 | 84 | 允许在匹配治理范围内受控验证，不作为全项目通用规则 |
| `KN-FAIL-0001` | `VALIDATING` | L3 / L2 | 73 | 只能作为风险线索和验证提醒 |

## 3. 适用性与复用决定

### KN-ARC-0001

- Scope Match：部分匹配。两者都是计划长期扩展的文档驱动 AI 治理系统，但模拟项目的稳定职责和 Layer 数量尚未通过 Design。
- Applicable：区分稳定职责、Module、交付批次和 Lifecycle State 的原则。
- Not Applicable：直接复制 AI-CTO-System 的五层名称、Module 列表或 Gate。
- Reuse Decision：`ADAPT`。
- Reason：复用职责分离与 Module Registry 方法，但必须依据新项目边界重新设计 Layer，不能把五层当通用答案。
- Required Gates：Idea、Research、Evaluation、Architecture Design、ADR、Design Approval Gate。

### KN-ENG-0001

- Scope Match：强匹配于状态、Registry 和审批输出；不适用于内容创作本身。
- Applicable：项目治理状态、发布审批结果、Registry 字段等下游依赖精确值的合同。
- Not Applicable：创作 Prompt、头脑风暴和不驱动授权的自由文本。
- Reuse Decision：`ADOPT`，但仅作为受控采用建议。
- Reason：封闭词汇和固定输出字段可原样用于治理协议；词汇集合仍须由新项目 Design 定义，并保留正式演进路径。
- Required Gates：Protocol Design、Architecture Review、测试场景、Code / Document Review；不得因 `ADOPT` 跳过当前项目验证。

### KN-FAIL-0001

- Scope Match：风险情境相似，但记录仍为 `VALIDATING`，跨项目因果 Confidence 仅 L2。
- Applicable：提醒评审者区分状态、Evidence 和当前适用范围。
- Not Applicable：作为“所有非标准措辞都会造成失败”的强制禁令。
- Reuse Decision：`REFERENCE_ONLY`。
- Reason：可以加入风险清单和测试问题，但不能成为 Architecture 或 Gate 的唯一依据；模拟项目可作为未来独立验证来源。
- Required Gates：Research / Evaluation 证据审查、压力测试、人工 Review。

## 4. 结果

| Knowledge ID | Decision | Authorization Boundary |
|---|---|---|
| `KN-ARC-0001` | `ADAPT` | 只允许形成 Architecture 候选，不授权采用五层或进入 Development |
| `KN-ENG-0001` | `ADOPT` | 只允许在治理协议中受控采用，不授权跳过设计和测试 |
| `KN-FAIL-0001` | `REFERENCE_ONLY` | 只进入风险与验证问题，不形成强制规则 |

没有记录得到 `ACTIVE`，Reuse Decision 也没有改变 Knowledge Lifecycle Status。模拟结果证明 Registry 查询、状态过滤、范围比较和四类复用决定可以工作，同时保留 Architecture、Security、Testing 和 Release Gate。

## 5. 新 Evidence 回流

本次仅为模拟，不构成真实项目结果，因此不提高 Evidence Level、Confidence 或 Quality Score。若 `AI Content Workflow Platform` 以后成为真实项目，必须记录实际采用、改造、失败、维护成本和 Gate 结果后，才能作为新的验证证据。
