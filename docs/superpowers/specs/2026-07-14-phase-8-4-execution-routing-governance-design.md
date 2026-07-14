# Phase 8.4 Execution Routing Governance 设计规格

## 目标

建立 Layer 5 的 `Execution Routing Governance` 文档治理模块，使未来 AI CTO 能基于任务特征输出可审计的 `Execution Plan`，说明应采用何种 Workflow、Capability、Skill、Tool、Model 类别、Reasoning Budget 与 Context Scope。

## 架构定位与边界

- Owning Layer：Layer 5 — Execution & Intelligence。
- Module：`Execution Routing Governance`；`Completed` 仅表示治理标准、决策模型和证据规则已建立，不表示存在 Runtime、Router 代码、自动化或真实调用能力。
- 输入：`User Intent`、`Task Context`、`Project Context`、受限的 `User Execution Preference`、Capability Registry / Knowledge / 历史 Evidence，以及现有 Gate、ADR、安全和授权约束。
- 输出：`Execution Plan`。它必须包含复杂度、Workflow、能力 / Skill / Tool 类别、模型类别、推理预算、上下文范围、交互与 Git 建议、证据、置信度和升级条件。
- Router 只做“如何执行”的建议，不执行模型、Skill、Tool、Git 或外部能力调用；不修改 Codex 执行行为，不实现自动模型切换。

## 决策模型

### 任务复杂度

| Level | 典型范围 | 默认 Workflow | 默认 Context |
|---|---|---|---|
| L0 | 普通咨询、无需项目事实或变更 | 退出 AI CTO 流程 | 用户当前问题 |
| L1 | 已确认范围的低风险文档或局部修改 | Instant Workflow | 当前文件与必要规则 |
| L2 | 常规工程任务 | Engineering Workflow | 当前项目 Memory 与相关设计 / 任务 |
| L3 | 模块级变化 | 设计加工程流程 | Project Memory、相关 Knowledge、架构与影响面 |
| L4 | 新项目、重大架构或跨项目资源变化 | CTO Workflow | User Brain、Portfolio、Knowledge、项目上下文与适用 Gate |

风险、数据敏感性、安全、ADR / Gate 影响、不可逆副作用、证据不足或用户偏好冲突均可把任务升级到更高 Level；任何规则不得把任务自动降级到绕过必要门禁。

### 路由维度

- Workflow：`Instant Workflow`、`Engineering Workflow`、`CTO Workflow`；低风险任务禁止无理由启动完整 CTO Workflow。
- Skill：以任务类型、风险、复杂度和所需 Capability 为依据；禁止无任务需求预加载 Skill。
- Tool：只在存在明确任务价值、权限和必要性时建议；禁止为了“流程完整”调用浏览器、Git、代码执行、文件扫描或 MCP。
- Model：只选择类别（快速、标准、高推理、代码），以复杂度、风险、质量与成本为依据；不规定具体供应商或自动切换机制。
- Reasoning：`R0`–`R4`，从直接响应到 CTO 级推理；默认从满足质量与安全的最低等级开始。
- Context：按 Level 最小化加载；禁止无差别加载 User Brain、Portfolio、Knowledge 与全部项目文件。
- 用户偏好：只在已明确、可撤销、当前适用且不与安全、Gate、ADR、权限或用户当前指令冲突时影响建议。

## Evidence 与 EFF-001

Execution Routing Evidence 必须记录 Task Type、Complexity、Workflow、Skill、Tool、Model、Reasoning、Context、Duration、Token 与 Quality，以及结果、风险、人工交互和适用边界。未捕获值使用 `NOT_CAPTURED`，不能补造。

`EFF-001` 是 L3 / 中等置信度的单案例：它支持“复杂度与流程可能失配、需要收集路由证据”的假设；不能作为默认轻量流程、默认模型、自动 Git 偏好或跳过确认的依据。只有多个可比较案例及后续 Mission Alignment、Evidence Review、Module Admission、Feature Classification 和受影响 Gate 分析后，才可提出运行时或自动化方向。

## 文档组成

1. 总体规范：目标、输入 / 输出、职责、边界、禁止事项。
2. 复杂度模型：L0–L4 的判断、例子、默认 Workflow 与 Context。
3. Workflow、Skill、Tool、Model、Reasoning、Context 与用户偏好政策：分别定义选择因素、升级条件和禁止事项。
4. Evidence 标准：记录字段、证据状态、质量与 Evolution 使用限制。
5. ADR-0014：路由治理为何独立于 Capability Governance 与执行 Runtime。
6. 五个治理入口：Master Plan、SKILL、Module Registry、Project Memory、Development Progress。

## 明确排除

- 不开发 Runtime、Router 代码、Agent、队列、调度器、模型调用、工具调用、MCP 接入或自动化。
- 不调用外部工具，不安装或激活 Skill / Capability。
- 不修改 Codex 执行行为、当前 Git 策略或用户偏好。
- 不自动选择或切换模型，不授予执行、提交、合并、发布或生产变更授权。
- 不进入 Phase 8.5。

## 验收标准

1. 10 份指定治理规则、ADR-0014 与五个治理入口同步存在。
2. Module Registry 将 Execution Routing Governance 登记为 Layer 5 `Completed` 文档治理模块，且不混同 Capability Governance、Intent Gateway 或 Runtime。
3. 全部规则明确“建议而非执行”、最小上下文、最低充分推理与必要工具调用原则。
4. EFF-001 被引用为受限 Evidence，不被提升为通用规则或执行授权。
5. Markdown 相对链接、结构断言和 Git 差异校验通过。
