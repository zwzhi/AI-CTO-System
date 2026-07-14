# Phase 8.4 Intelligent Resource & Execution Routing Governance — 实施计划

> **For Codex:** 本计划仅同步路线元数据与治理边界。完成后不得自动进入 Phase 8.4，不得实现模型路由、队列或自动化能力。

**目标：** 将 Phase 8.4 正式命名为 `Intelligent Resource & Execution Routing Governance`，把模型耗时、Token 效率与流程过载风险作为已确认的路线研究输入，并在核心治理入口中明确其 `PROPOSED` 状态、证据要求和非授权边界。

**架构：** `AI_CTO_SYSTEM_MASTER_PLAN.md` 是路线与总体规划的主来源；README、SKILL、项目记忆和进度记录同步该路线的用户可见状态与执行约束。此次不登记 Module、不创建 ADR，亦不修改单项目生命周期。

**技术栈：** Markdown、Git、现有文档验证脚本。

---

## 全局约束

- Phase 8.4 是路线标签，不是实施、Module Admission、Capability Activation 或生命周期状态授权。
- 只能记录未来研究方向：任务/风险/质量/预算/时延约束下的资源与执行路径建议。
- 不得实现或接入模型路由、直接模型调用、任务队列、限流、Agent Runtime、工具调用、自动化、监控服务或外部集成。
- 后续如需进入审查，必须先收集任务类型、模型、Token、时延、成功/失败、成本、队列/重试/阻塞/人工介入，以及质量、成本、时延与安全权衡证据。
- 不因单次使用反馈就写成已验证的通用最佳实践。

## 任务 1：更新 Master Plan 的路线主来源

**文件：** `docs/strategy/AI_CTO_SYSTEM_MASTER_PLAN.md`

1. 将“未启动”的后续路线表述改为 `Phase 8.4 Intelligent Resource & Execution Routing Governance（PROPOSED）`。
2. 新增该路线的来源、拟研究范围、明确排除项和未来准入证据要求。
3. 保留“必须经过 Mission Alignment、Admission 与 Layer/Module 分类”的规则，说明不能由路线名称直接授权实施。
4. 移除已过期的“等待用户确认”措辞，保持主计划已同步的事实状态。

## 任务 2：同步四个治理入口

**文件：**

- `README.md`
- `SKILL.md`
- `memory/project_memory/AI_CTO_SYSTEM_PROJECT_MEMORY.md`
- `docs/DEVELOPMENT_PROGRESS.md`

1. 在 README 记录完整路线名称、`PROPOSED`/未启动状态和“无实施授权”边界。
2. 在 SKILL 中要求未来相关请求先记录可比较证据，再走使命对齐、准入和分类；禁止仅凭反馈直接实现运行时路由能力。
3. 在项目记忆记录调整原因、当前证据限制、未来准入条件及本次不创建 Module/ADR 的决策。
4. 在进度记录写明路线同步完成、验证结果、已知风险与等待用户确认的下一步；不得将其记为 Phase 8.4 已启动。

## 任务 3：验证并提交

1. 检查五个治理入口均出现完整路线名称，并一致使用 `PROPOSED`、未启动、无实施授权的语义。
2. 检查文档未引入模型路由、队列、运行时或外部能力实现承诺。
3. 运行 Markdown 快速校验、链接校验和 `git diff --check`。
4. 提交信息：`docs: align Phase 8.4 resource routing roadmap`。

