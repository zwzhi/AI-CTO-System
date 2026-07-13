# Release Report

## 1. 基本信息

| 字段 | 内容 |
|---|---|
| 项目名称 | {PROJECT_NAME} |
| Release ID | {RELEASE_ID} |
| 报告版本 / 状态 | {REPORT_VERSION} / {DRAFT_IN_REVIEW_OR_FINAL} |
| 版本号 | {RELEASE_VERSION} |
| Git Base / HEAD | {BASE_SHA} / {HEAD_SHA} |
| Artifact ID / 哈希 | {ARTIFACT_REFERENCE} |
| 发布日期与时区 | {YYYY-MM-DD_TIME_TIMEZONE} |
| 发布环境 | {ENVIRONMENT_REFERENCE} |
| Release Owner | {RELEASE_OWNER} |
| Gate Record | {READY_FOR_RELEASE_RECORD_LINK} |

本报告记录已授权 Release 的实际执行结果，不替代 Testing Release Gate、部署验证或发布授权。

## 2. 发布摘要

- 发布目标：{RELEASE_OBJECTIVE}
- 发布范围：{SCOPE_REFERENCE}
- 非发布范围：{OUT_OF_SCOPE}
- 用户影响：{USER_IMPACT}
- 最终发布状态：{AUTHORIZED_DEPLOYING_SUCCEEDED_FAILED_OR_ROLLED_BACK}

## 3. 新增功能

| Requirement ID | 功能说明 | Design / Task / Commit | 用户价值 | 验证证据 |
|---|---|---|---|---|
| {REQ_ID} | {FEATURE_SUMMARY} | {TRACE_REFERENCE} | {USER_VALUE} | {EVIDENCE_REFERENCE} |

## 4. 修复问题

| Bug ID | 优先级 | 问题摘要 | 修复 Commit | 验证结果 / 证据 |
|---|---|---|---|---|
| {BUG_ID} | {P0_P1_P2_OR_P3} | {FIX_SUMMARY} | {COMMIT_SHA} | {VERIFICATION_REFERENCE} |

## 5. 测试结果

| 测试类型 | 计划数 | PASS | FAIL | BLOCKED | 证据 |
|---|---|---|---|---|---|
| Unit Test | {INTEGER} | {INTEGER} | {INTEGER} | {INTEGER} | {EVIDENCE_REFERENCE} |
| Integration Test | {INTEGER} | {INTEGER} | {INTEGER} | {INTEGER} | {EVIDENCE_REFERENCE} |
| System Test | {INTEGER} | {INTEGER} | {INTEGER} | {INTEGER} | {EVIDENCE_REFERENCE} |
| User Acceptance Test | {INTEGER} | {INTEGER} | {INTEGER} | {INTEGER} | {EVIDENCE_REFERENCE} |
| Regression Test | {INTEGER} | {INTEGER} | {INTEGER} | {INTEGER} | {EVIDENCE_REFERENCE} |

- 测试基线：{TEST_BASELINE_REFERENCE}
- Test Conclusion：{PASS_OR_FAIL}
- 覆盖与限制：{COVERAGE_AND_LIMITATIONS}

## 6. AI 评测结果

AI 项目填写评测版本和八类指标；非 AI 项目引用 Approved N/A。

| 项目 | 结果 |
|---|---|
| 适用性 | {APPLICABLE_OR_APPROVED_NA_REFERENCE} |
| 模型 / Prompt / 工具 / 数据集版本 | {AI_BASELINE_REFERENCE} |
| 输出质量 / 准确率 / 稳定性 | {RESULT_AND_EVIDENCE} |
| 幻觉风险 / Prompt 效果 / Agent 成功率 | {RESULT_AND_EVIDENCE} |
| Token 成本 / 响应时间 | {RESULT_AND_EVIDENCE} |
| AI Evaluation Conclusion | {PASS_FAIL_OR_BLOCKED} |

## 7. 安全结果

| 字段 | 内容 |
|---|---|
| Security Review ID | {SECURITY_REVIEW_REFERENCE} |
| 审核基线 | {SECURITY_BASELINE} |
| Security Review Result | {APPROVED_CHANGES_REQUIRED_OR_BLOCKED} |
| 未关闭安全问题 | {ZERO_OR_ISSUE_REFERENCES} |
| 剩余风险与批准 | {RESIDUAL_RISK_REFERENCES} |

## 8. 用户验收

- UAT 版本与范围：{UAT_SCOPE_AND_VERSION}
- 验收人：{ACCEPTANCE_OWNER}
- 验收时间：{YYYY-MM-DD_TIME_TIMEZONE}
- 结果：{ACCEPTED_OR_REJECTED}
- 证据：{UAT_EVIDENCE_REFERENCE}

## 9. 部署结果

| 字段 | 内容 |
|---|---|
| Deployment ID | {DEPLOYMENT_ID} |
| 实际环境 / 版本 | {ENVIRONMENT_AND_VERSION} |
| 配置变化 | {CONFIG_CHANGE_REFERENCE} |
| 数据库变化 | {DATABASE_CHANGE_REFERENCE_OR_APPROVED_NA} |
| 依赖变化 | {DEPENDENCY_CHANGE_REFERENCE_OR_APPROVED_NA} |
| 开始 / 结束时间 | {START_TIME} / {END_TIME} |
| Deployment Status | {PLANNED_READY_IN_PROGRESS_SUCCEEDED_FAILED_ROLLED_BACK_OR_BLOCKED} |
| 部署验证 | {VALIDATION_EVIDENCE_REFERENCE} |

## 10. 监控与上线观察

| 监控域 | 结论 | 关键指标 / 事件 | 证据 |
|---|---|---|---|
| 系统状态 | {CONCLUSION} | {SUMMARY} | {EVIDENCE_REFERENCE} |
| 错误日志 | {CONCLUSION} | {SUMMARY} | {EVIDENCE_REFERENCE} |
| 性能指标 | {CONCLUSION} | {SUMMARY} | {EVIDENCE_REFERENCE} |
| 用户反馈 | {CONCLUSION} | {SUMMARY} | {EVIDENCE_REFERENCE} |
| AI 质量指标 | {CONCLUSION_OR_APPROVED_NA} | {SUMMARY} | {EVIDENCE_REFERENCE} |

- 观察窗口：{OBSERVATION_WINDOW}
- Monitoring Conclusion：{STABLE_OBSERVING_DEGRADED_ROLLBACK_REQUIRED_OR_BLOCKED}

## 11. 已知风险

| Risk ID | 风险与影响 | 等级 | 监控 / 缓解 | Owner | 接受记录 / 复核触发器 |
|---|---|---|---|---|---|
| {RISK_ID} | {RISK_AND_IMPACT} | {LEVEL} | {CONTROL} | {OWNER} | {APPROVAL_AND_TRIGGER} |

## 12. 回滚方案与结果

- 回滚计划：{ROLLBACK_PLAN_REFERENCE}
- 触发条件：{ROLLBACK_TRIGGERS}
- 回滚步骤：{ROLLBACK_STEPS_REFERENCE}
- 数据恢复方案：{DATA_RECOVERY_REFERENCE}
- 验证方式：{ROLLBACK_VALIDATION_REFERENCE}
- 是否触发回滚：{YES_OR_NO}
- 实际结果：{NOT_TRIGGERED_OR_EXECUTION_RESULT}

## 13. 下一步计划

| Action | Owner | Completion Condition | Target Review | 关联 Bug / Risk / Requirement |
|---|---|---|---|---|
| {NEXT_ACTION} | {OWNER} | {COMPLETION_CONDITION} | {DATE_OR_EVENT} | {REFERENCE} |

## 14. 决定与签署

| 角色 | 结论 | 签署人 | 时间 | 证据 |
|---|---|---|---|---|
| Release Owner | {CONCLUSION} | {NAME_OR_ROLE} | {TIME} | {REFERENCE} |
| Test Owner | {CONCLUSION} | {NAME_OR_ROLE} | {TIME} | {REFERENCE} |
| Security Owner | {CONCLUSION} | {NAME_OR_ROLE} | {TIME} | {REFERENCE} |
| Monitoring Owner | {CONCLUSION} | {NAME_OR_ROLE} | {TIME} | {REFERENCE} |
| 用户 / 业务责任人 | {CONCLUSION} | {NAME_OR_ROLE} | {TIME} | {REFERENCE} |

## 15. 状态与记忆同步

- PROJECT_STATE 更新：{PROJECT_STATE_REFERENCE}
- PROJECT_MEMORY 更新：{PROJECT_MEMORY_REFERENCE}
- Development Progress / Release Progress：{PROGRESS_REFERENCE}
- Knowledge Base 条目：{KNOWLEDGE_REFERENCE_OR_NONE}
