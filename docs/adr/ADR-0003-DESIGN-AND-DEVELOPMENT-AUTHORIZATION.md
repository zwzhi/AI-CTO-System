# ADR-0003：设计完成与开发授权分离

- 状态：Accepted
- 日期：2026-07-13
- 决策者：AI CTO System 项目创建者、AI CTO

## 背景

单独完成 PRD 或 Architecture 不能证明需求可追踪、测试可执行、数据与 Agent 设计适用、风险可接受或回滚方案可用。如果把“文档已写完”直接等同于“可以开发”，容易在实现阶段发现范围冲突、孤儿需求和不可逆风险。

## 决策

DESIGN 的文档完成状态与进入 DEVELOPMENT 的授权状态分离。

项目只有在以下条件全部满足时才能获得 `APPROVED_FOR_DEVELOPMENT`：

- PRD 与 Architecture 已确认。
- Database Design 与 Agent Design 已按适用性完成或有获准的 N/A 记录。
- Development Plan、Test Plan、风险与回滚方案和相关 ADR 已确认。
- Requirement → Design → Development Task → Test Case 可以双向追踪。
- 用户明确批准当前文档版本进入 DEVELOPMENT。

## 选择理由

该决策把“设计内容完整”和“组织愿意承担实现风险”分开，形成可审计门禁，并使需求变化能够定位到受影响的设计、任务与测试。

## 替代方案

- PRD 完成即开发：速度快，但技术、测试和风险缺口后移。
- Architecture 完成即开发：覆盖技术结构，但无法保证产品验收和端到端追踪。
- 仅由 AI CTO 自动批准：缺少用户对当前范围、成本和风险的明确授权。

## 后果

- DESIGN 阶段增加追踪矩阵和门禁评审成本。
- 文档变更后必须重新基线化受影响内容。
- 即使所有设计文档完成，门禁未通过前仍禁止编码和不可逆实施。
