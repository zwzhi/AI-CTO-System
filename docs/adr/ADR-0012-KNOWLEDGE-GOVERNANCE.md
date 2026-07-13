# ADR-0012：Knowledge Governance

- Status：Accepted
- Date：2026-07-13
- Decision Owner：AI CTO System Maintainer

## 背景

AI CTO System 已经能够从项目、Incident、Bug、评审和 Evolution 中产生大量经验，但早期 `memory/knowledge_base/` 只提供目录，没有统一分类、Evidence、生命周期、质量、冲突和复用约束。继续按“生成文件即沉淀知识”的方式扩展，会形成过期结论、适用范围混淆、互相覆盖和低可信内容参与强制决策等风险。

Knowledge Governance 服务系统使命：让真实项目经验转化为可验证、可复用、可进化的长期资产，使下一项目获得研发复利。

## Strategic Admission Record

| 字段 | 结论 |
|---|---|
| Candidate ID / Name | `AICTO-KNOW-GOV-001` / Knowledge Governance |
| Mission Contribution | 将真实经验转化为可复用资产，增强价值飞轮 |
| Core Problem | 知识缺少分类、证据、状态、质量、冲突和复用治理 |
| Owning Layer / Existing Module | Layer 1 / Knowledge Base |
| Reuse Analysis | 复用既有 Project Memory、Confidence、Evidence、Gate 和 Technical Asset 规则，但现有规则不足以治理知识全生命周期 |
| Long-term Asset | 形成可审计的知识注册表、证据链和跨项目复用机制 |
| Complexity Impact | 新增治理文档和一个权威目录；不新增运行时、Agent 或存储基础设施 |
| Evidence / Confidence | 用户明确授权，结合已有项目治理实践；L3 |
| Human Decision | 用户批准进入 Phase 8.3 文档治理 |
| Admission Result | `ADMIT_FOR_CLASSIFICATION` |
| Next Action | 扩展 Layer 1 的 Knowledge Base Module |

Feature Classification Result：`EXTEND_EXISTING_MODULE`。Phase 8.3 仅作为历史交付标签，不新增 Layer 或独立 Module。

## 决策

1. 根目录 `knowledge_base/` 是治理知识资产的唯一权威目录。
2. `memory/knowledge_base/` 保留为 Legacy Capture Area，不再接收新的权威 `ACTIVE` Knowledge；历史内容以后按受控流程迁移。
3. 使用九类知识：Project Experience、Architecture Pattern、Engineering Pattern、Agent Pattern、Prompt Pattern、Bug Solution、Decision Record、Failure Experience、Business Insight。
4. 生命周期只使用 `CAPTURED`、`VALIDATING`、`VALIDATED`、`ACTIVE`、`DEPRECATED`、`ARCHIVED`。
5. 每项知识必须有 Evidence，并使用 L1–L4 可信等级；低可信知识不能成为强制决策依据。
6. 质量分与可信等级分开记录；质量分不能抵消安全、许可、隐私、适用范围或 Gate 红线。
7. 冲突知识不互相覆盖，必须按 Evidence、时间、适用范围和实际效果决定共存、替代、合并、重验或拒绝新主张。
8. 复用知识不得跳过 Architecture、Security、Testing 或 Release Gate。
9. 本阶段不开发 Agent，不实现 RAG，不接入向量数据库，也不进入 Phase 8.4。

## 未采用方案

- **继续把知识当普通文件保存**：无法判断可信度、适用范围和当前有效性。
- **继续以 `memory/knowledge_base/` 为权威目录**：会把长期记忆结构和治理资产结构混为一体，并产生双重权威。
- **用最新内容覆盖旧知识**：会丢失历史证据和不同场景下同时成立的经验。
- **直接实施 RAG 或向量数据库**：检索基础设施不能替代内容治理，会放大低质量知识。
- **只依赖 Project Memory**：Project Memory 面向单项目连续性，不能替代跨项目验证和复用资产。

## 影响

正面影响：知识来源、状态、质量、冲突和复用结果可审计；真实使用可以持续提升知识可信度并形成研发复利。

代价：知识进入 `ACTIVE` 前需要补充 Evidence、适用范围、评分和人工判断；旧目录未来需要逐项迁移，不能批量自动升级状态。

## 后续

- 等待用户确认 Phase 8.3。
- 后续如需迁移历史条目，必须独立立项并逐项验证。
- RAG、向量数据库、自动提取和自动检索不在本 ADR 授权范围内。
