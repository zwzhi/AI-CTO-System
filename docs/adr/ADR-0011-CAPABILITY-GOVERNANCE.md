# ADR-0011：建立 AI CTO Capability Governance

- 状态：Accepted
- 日期：2026-07-13
- 决策者：AI CTO System 项目创建者、AI CTO

## 背景

AI CTO System 已建立五层架构和战略使命。未来 Execution & Intelligence Layer 需要使用内部能力、外部 Skill、MCP 工具、第三方 Agent、模型和服务。如果缺少统一治理，能力可能被直接安装或写入 Core，造成来源与 License 不明、权限过度、质量不可比较、版本漂移、供应商锁定、不可撤销副作用和项目门禁被绕过。

Technical Asset Registry 负责可复用资产，Module Registry 负责系统职责，但两者都不能回答某个可调用能力当前是否经过评估、是否启用、允许在哪些项目和权限下调用。因此需要独立的 Capability Governance 控制面。

## Strategic Admission Record

| Field | Decision |
|---|---|
| Candidate ID / Name | `AICTO-CAP-GOV-001` / Capability Governance Framework |
| Mission Contribution | 通过安全复用、质量证据、替换能力和经验积累提高交付质量与研发复利 |
| Core Problem | AI CTO 缺少对可调用内部 / 外部能力的统一准入、注册、评估、激活和退出治理 |
| Owning Layer / Existing Module | Layer 5 / Capability Governance（既有 `Planned` Module） |
| Reuse Analysis | Module Registry 和 Technical Asset Registry 可复用 ID、证据与资产关系，但不能替代调用权限和生命周期治理 |
| Long-term Asset | Registry、Evaluation Evidence、兼容矩阵、Selection / Incident 历史和可替换 Capability Contract |
| Complexity Impact | 新增 Registry、状态和评审成本；通过封闭词汇、统一记录和 Core 解耦控制 |
| Evidence / Confidence | 已完成 Architecture Review、Strategic Alignment 和用户对 Phase 8.2 的明确授权；L3 |
| Human Decision | 2026-07-13，批准建立文档治理框架，不批准真实接入或调用 |
| Admission Result | `ADMIT_FOR_CLASSIFICATION` |
| Next Action | 在既有 Layer 5 Module 内建立标准、目录、示例与治理入口 |

Feature Classification Result 为 `USE_EXISTING_MODULE`。Phase 8.2 只作为本次历史交付标签，不改变 Module 的 Owning Layer。

## 决策

1. 在 Layer 5：Execution & Intelligence 内完成 Capability Governance Module 的文档治理；不新增第六个 Layer。
2. Capability 定义为 AI CTO 可以调用、组合或委托的内部 / 外部能力，不等同于功能 Module 或 Technical Asset。
3. 统一治理链：Mission Alignment → Admission → Registry → Evaluation → Activation → Selection / Invocation → Monitoring → Lifecycle Decision。
4. Capability Type 只使用 Engineering、Testing、Security、Deployment、Research、Documentation、Data 和 AI Model 八类。
5. Registry Status 只使用 `DISCOVERED`、`EVALUATING`、`ACTIVE`、`DEPRECATED`、`DISABLED`、`REMOVED`。
6. Admission Result 只使用 `ADMIT_FOR_EVALUATION`、`ACTIVATE_CAPABILITY`、`REJECT_OR_DEFER`。
7. 只有 `ACTIVE`、当前 Evaluation 有效且项目级权限匹配的 Capability 可以被选择；实际调用还需要 Invocation Authorization。
8. 使用 100 分质量模型评估功能、稳定、兼容、维护、安全和复用；高分不能抵消来源、License、安全、权限或不可逆副作用红线。
9. 外部能力通过稳定 Capability Contract / Adapter 接入，AI CTO Core 不直接依赖具体 Superpowers、Codex Skill、MCP、第三方 Agent、模型或供应商实现。
10. Phase 8.2 不安装、不接入、不调用任何真实外部能力，不开发具体 Agent，也不进入 Phase 8.3。

## 选择理由

Capability Governance 将“发现能力”“评估能力”“注册能力”“激活能力”和“允许某次调用”分开，避免任一分数、状态或负责人指令成为越权捷径。将实现放在可替换 Contract 之后，可以在外部能力停用、License 改变或质量下降时保持 AI CTO Core 的使命、记忆、决策和 Gate 继续运行。

## 替代方案

- **直接在各 Module 内接入工具：** 初期快速，但状态、权限、质量和替换规则分散，拒绝。
- **只使用 Technical Asset Registry：** 能管理复用资产，不能管理运行权限、调用副作用和激活状态，拒绝。
- **将外部能力硬编码到 Core：** 降低接入成本，但形成供应商锁定和单点，拒绝。
- **发现后自动安装并用运行结果评估：** 可能在风险审查前产生真实副作用，拒绝。
- **让 Quality Score 自动决定激活：** 忽略 License、安全、权限、环境和人类批准，拒绝。

## 后果

### 正面影响

- 内部和外部能力具有统一 ID、分类、状态、质量和权限记录。
- 未注册、未评估或已停用能力不能被未来 Runtime 选择。
- 外部实现可以替换、降级和撤销，不成为 Core 强依赖。
- Capability 使用、Incident 和长期质量可以沉淀为组织经验。
- 自动化执行获得明确的安全边界和人工批准点。

### 负面影响与风险

- 新能力需要额外的准入、评估、注册和复核成本。
- Registry 与实际版本、权限可能漂移，需要定期审计和自动化前的人工维护。
- 100 分模型可能制造虚假精确性，必须与 Confidence、Evidence 和红线分开。
- 过度拆分 Capability 会增加记录负担，拆分粒度应以合同、权限和风险边界为准。

## 后续行动

- 更新 SKILL、Module Registry、Architecture Principles、Project Memory 和 Development Progress。
- 等待用户确认 Phase 8.2 文档治理结果。
- 确认前不安装或调用 Superpowers、Codex Skill、MCP 工具或第三方 Agent，不进入 Phase 8.3。
