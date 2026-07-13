# 已有项目迁移检查清单

## 1. 目的与结果

本清单是已有项目正式进入 AI CTO 生命周期管理前的唯一接管门禁。它核验项目来源、扫描、理解、文档、健康、状态、风险、Git 和测试证据。

门禁最终结果只允许：

- `ONBOARDING_COMPLETED`
- `ONBOARDING_BLOCKED`

不存在条件通过、口头通过、自动通过或“先进入 Maintenance 后补证据”。

## 2. 门禁基线

每次评审创建唯一 `ONBOARD-GATE-XXXX`，冻结项目名称、Original Source、Repository / Snapshot、Branch、HEAD、工作区状态、文档版本、环境、数据库基线、扫描时间和责任人。重新扫描或基线变化必须创建新记录，不覆盖旧结果。

## 3. 必需输入

- [ ] 项目接管状态记录和用户授权范围；
- [ ] Source / Git / Environment / Database Baseline Manifest；
- [ ] 项目扫描报告和 Evidence Register；
- [ ] 项目逆向分析；
- [ ] 恢复或确认的 PRD、Architecture、Database Design、ADR 与 PROJECT_MEMORY；
- [ ] Final Health Report 或按本清单阻断的 Provisional Report；
- [ ] 风险登记、Missing Documents、冲突与未知项；
- [ ] Git 状态确认和测试状态确认；
- [ ] 拟创建的 PROJECT_STATE、PROJECT_MEMORY 和维护责任边界。

## 4. 代码扫描

- [ ] 目录、代码、依赖、配置、数据库和 Git 历史扫描范围完整。
- [ ] 排除目录、无法读取项、生成物和敏感边界已记录。
- [ ] Source、Commit / Snapshot、环境和扫描时间可复核。
- [ ] 没有把文件存在误判为功能上线或运行有效。

## 5. 技术栈确认

- [ ] Frontend、Backend、Database、Infrastructure、AI 组件逐项确认或记录 Approved N/A。
- [ ] Runtime、Framework、主要依赖和版本来源可追溯。
- [ ] 模块、服务、数据流、部署和外部依赖关系已恢复。
- [ ] 未维护、EOL、License、供应链和厂商锁定风险已登记。

## 6. 文档恢复

- [ ] PRD 描述当前可验证用户、功能、流程、范围和限制。
- [ ] Architecture 描述系统边界、模块关系、数据流、服务和部署。
- [ ] Database Design 描述实体、关系、索引、生命周期、迁移、备份和恢复。
- [ ] ADR 区分当前决定、回溯重建和未知历史。
- [ ] PROJECT_MEMORY 保存来源、事实、决策、风险、当前状态与下一动作。
- [ ] 所有关键结论具有真值标签、Evidence ID 与 L1–L4 Confidence。
- [ ] 未解决关键冲突、未知和 Missing Documents 有 Owner 与补证条件。

## 7. 状态建立

- [ ] PROJECT_STATE Current Stage 为 `EXISTING_PROJECT_ONBOARDING`，并记录 Confidence、Evidence 和 Next Action。
- [ ] 接管状态模板中的 Project Name、Current Version、Original Source、Onboarding Date、Health Score、Known Risks、Missing Documents 和 Next Actions 完整。
- [ ] 生命周期目标落点、责任人、授权边界和第一项管理动作明确。
- [ ] `ONBOARDING_COMPLETED` 未被写成开发、测试、发布或生产变更授权。

## 8. 风险登记

- [ ] 安全、数据、合规、License、运行、维护、扩展和交接风险已覆盖。
- [ ] 每个风险有影响、等级、Evidence、Owner、缓解、停止条件和复核触发器。
- [ ] 有效密钥泄露、越权、数据泄露、不可恢复风险和其他红线已遏制或明确阻断。
- [ ] 用户接受只用于有权接受的非红线剩余风险。

## 9. Git 状态确认

- [ ] Repository / 无 Git Snapshot 状态、Branch、HEAD、Tags、Remotes 和历史范围已记录。
- [ ] 已暂存、未暂存、未跟踪、冲突与进行中操作逐项记录。
- [ ] 现有修改的来源、所有者、业务含义和保存方式明确。
- [ ] 未自动执行 reset、checkout、stash、commit、rebase、clean 或历史改写。
- [ ] 来源不明且会影响项目基线的修改数量为 0；否则结果为 `ONBOARDING_BLOCKED`。

Git 工作区可以不是干净状态，但不能是未知状态。只有差异已完整保存、归属明确且不会被接管动作覆盖时，Git 确认才能 PASS。

## 10. 测试状态确认

- [ ] 测试目录、Framework、命令、环境、数据和依赖已清点。
- [ ] 能安全执行的测试已针对冻结基线运行并保存结果；不能执行时记录原因和风险。
- [ ] Unit、Integration、System、UAT、Regression 的当前覆盖和缺口已说明。
- [ ] 失败、Flaky、Skipped、Blocked、无测试和旧版本证据均未被隐藏。
- [ ] 测试不足可以降低健康分并形成维护计划，但只有在其风险边界可确认时才能完成接管。

## 11. 门禁判定

### 11.1 `ONBOARDING_COMPLETED`

只有以下条件全部满足才能记录：

- 七类必需检查全部 PASS；
- 项目与 Git / Snapshot 基线唯一且可追溯；
- 八维 Final Health Score、等级、Confidence 和 Evidence Coverage 已形成；
- 恢复文档忠实标记事实、推断、冲突和未知；
- 未关闭接管红线为 0，非红线风险具有 Owner 与处置计划；
- PROJECT_STATE、PROJECT_MEMORY、ADR 和目标生命周期落点已准备；
- 用户明确确认当前接管范围、基线、风险和后续管理方式。

已上线且仍运行的项目可在记录完成后将 Current Stage 转为 `MAINTENANCE`。该转换只授权维护管理，不授权代码修改或发布。

### 11.2 `ONBOARDING_BLOCKED`

出现以下任一情况必须记录：

- 缺少读取授权、来源不明或基线无法冻结；
- 关键安全、数据、权限、License 或生产风险无法遏制；
- Git 现场存在来源不明且可能被覆盖的修改；
- 关键文档结论为 L1 / CONFLICTED 且会改变管理或变更决策；
- 代码、数据库、环境或测试状态无法建立可信边界；
- 必需责任人、访问、证据或用户确认不可获得。

项目保持 `EXISTING_PROJECT_ONBOARDING`。每个 Blocker 必须记录事实、影响、Owner、解除条件、禁止动作和 Next Action。

## 12. 门禁记录格式

| 字段 | 内容 |
|---|---|
| Gate Record ID | `ONBOARD-GATE-XXXX` |
| Project / Original Source | 项目与来源 |
| Baseline | Repository / Snapshot、Branch、HEAD、Git 状态、环境和时间 |
| 检查结果 | 扫描、技术栈、文档、状态、风险、Git、测试的 PASS / FAIL |
| Health | Score / 100、等级、Confidence、Evidence Coverage |
| Blocking Items | Blocker ID、Owner 与解除条件；没有时为 `NONE` |
| Gate Result | `ONBOARDING_COMPLETED` 或 `ONBOARDING_BLOCKED` |
| Current Stage | 完成前为 `EXISTING_PROJECT_ONBOARDING`；获准后按生命周期更新 |
| Code Change Authorization | `NO` |
| Next Action | 动作、Owner 与 Completion Condition |

## 13. 基线变化与复审

源代码、未提交修改、依赖、配置、Schema、环境、部署版本或关键文档变化会使受影响检查失去当前性。必须登记变化、冻结新基线、更新逆向分析和健康报告，并创建新的 Gate Record；不得只复查上次失败项。
