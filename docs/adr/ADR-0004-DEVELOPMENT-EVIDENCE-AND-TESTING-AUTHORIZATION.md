# ADR-0004：开发证据链与 Testing 授权分离

- 状态：Accepted
- 日期：2026-07-13
- 决策者：AI CTO System 项目创建者、AI CTO

## 背景

Design 阶段能够定义 Requirement、Design、Task 与 Test Case，但实际开发发生后还需要证明哪些 Git 修改实现了哪项任务，以及测试是否真正验证了这些修改。仅声明“开发完成”无法排除后补测试、未审查提交、孤儿修改或文档与代码基线不一致。

## 决策

- 生产代码遵循测试先行：先定义测试并观察预期失败，再编写最小实现，通过后重构并持续验证。
- 追踪链扩展为 Requirement → Design → Task → Commit → Test。
- Design Gate 阶段的 Commit 槽使用 `NOT_CREATED`；进入 Testing 前必须替换为实际 Commit SHA。
- Development 完成状态与进入 TESTING 的授权状态分离；只有 Development Approval Gate 结果为 `APPROVED_FOR_TESTING` 才能转换阶段。

## 选择理由

该决策将设计意图、执行任务、版本证据和验证结果连接起来，使变更可以正向追踪到测试，也可以从 Commit 反向定位其需求、设计和责任任务。

## 替代方案

- 不追踪 Commit：记录简单，但无法确认代码基线对应哪个 Task。
- 代码完成后补测试：测试会受实现偏见影响，且没有失败证据证明测试能捕获缺失行为。
- 开发完成即进入 Testing：会把高优先级缺陷、未审查修改和文档不同步转移给下一阶段。

## 后果

- 每项重要修改需要维护 Task、Commit、Review 与 Test 证据。
- 开发过程增加 RED/GREEN、Code Review、影响分析和门禁成本。
- 未满足五层追踪或 Testing Gate 的工作必须留在 DEVELOPMENT。
