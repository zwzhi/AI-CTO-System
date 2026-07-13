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

## 历史修改

- 2026-07-13：完成 Phase 1 Kernel 初始化。
- 2026-07-13：建立 Phase 2 Operating Protocol。
- 2026-07-13：建立 Phase 3 Decision Intelligence。
- 2026-07-13：建立 Phase 4 Design Intelligence。
- 2026-07-13：建立 Phase 5 Development Execution Intelligence。

## 当前状态

Phase 5 工程执行规范、五层追踪与 Testing Gate 已编写，等待验证与用户确认。

## 未来计划

用户确认后进入 Phase 6；当前不得提前推进。
