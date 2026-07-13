# AI CTO System Project Memory

## 项目目标

建立一个用于管理未来 AI 项目开发的 AI CTO 操作系统。

## 技术选择

- Markdown 管理协议、模板与记忆。
- Git 管理系统版本。
- 当前不包含具体 Agent 实现。

## 关键决策

- 所有新项目需求必须从 IDEA 开始。
- RESEARCH 与 EVALUATION 可调整先后，但进入 DESIGN 前必须全部完成。
- 重大决策使用 ADR 追加记录，不覆盖历史。
- 项目评估采用 100 分制，但分数、Confidence 与风险红线分别判断。
- 进入 DESIGN 前必须完成 Research、Evaluation、风险分析、立项门禁和用户确认。
- Design 完成与 Development 授权分离；只有 Design Approval Gate 通过后才能编码。
- DESIGN 阶段必须先建立 Requirement → Design → Development Task → Test Case 计划链，并为尚未产生的 Commit 明确标记 `NOT_CREATED`。
- Development 执行采用测试先行，禁止代码完成后补测试。
- Requirement → Design → Task → Commit → Test 必须形成五层追踪。
- Development 完成与 Testing 授权分离；只有 Development Approval Gate 通过后才能进入 TESTING。
- 五层身份链之外，每项测试执行必须生成可复核 Evidence；进入 RELEASE 前形成 Requirement → Test Case → Evidence 投影。
- AI 项目不能只通过功能测试，必须以冻结的模型、Prompt、工具、数据集和环境基线完成八维 AI Evaluation。
- Bug 使用 P0 Blocker、P1 Critical、P2 Major、P3 Minor；发布前未关闭 P0/P1 必须为 0。
- 安全评审只允许 `APPROVED`、`CHANGES_REQUIRED`、`BLOCKED`；只有当前候选基线的 `APPROVED` 能作为发布输入。
- Testing 完成与 Release 授权分离。Release Approval Gate 负责端到端就绪判断，Testing Release Gate 是 TESTING → RELEASE 的唯一状态转换授权。
- `READY_FOR_RELEASE` 仅允许进入 RELEASE，不表示部署成功、上线稳定或进入 MAINTENANCE / EVOLUTION。
- 发布必须具备可执行的部署、回滚、数据恢复与监控方案，并以观察窗口和 Release Report 记录实际结果。

## 历史修改

- 2026-07-13：完成 Phase 1 Kernel 初始化。
- 2026-07-13：建立 Phase 2 Operating Protocol。
- 2026-07-13：建立 Phase 3 Decision Intelligence。
- 2026-07-13：建立 Phase 4 Design Intelligence。
- 2026-07-13：建立 Phase 5 Development Execution Intelligence。
- 2026-07-13：建立 Phase 6 Testing & Release Intelligence。

## 当前状态

Phase 6 测试、Bug、AI 评测、安全、Release Gate、部署回滚、监控和报告体系已建立；当前停留在 Phase 6 完成状态，等待用户确认，不进入 Phase 7。

## 未来计划

用户确认后进入 Phase 7；当前不得提前推进。
