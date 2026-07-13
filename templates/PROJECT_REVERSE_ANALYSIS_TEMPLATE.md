# 项目逆向分析

## 文档信息

| 字段 | 内容 |
|---|---|
| Analysis ID | {REVERSE_ANALYSIS_ID} |
| Original Source | {SOURCE_PATH_OR_REPOSITORY} |
| Baseline | {BRANCH_COMMIT_OR_SNAPSHOT} |
| Git Worktree Status | {CLEAN_OR_DOCUMENTED_DIRTY_STATE} |
| Analysis Date | {YYYY-MM-DD_TIME_TIMEZONE} |
| Analyst / Reviewers | {OWNER_AND_REVIEWERS} |
| Evidence Register | {EVIDENCE_REGISTER_REFERENCE} |
| Overall Confidence | {L1_L2_L3_OR_L4} |

所有无法从证据确认的信息填写 `UNKNOWN`，不得根据常识补写。每项关键结论使用：

`[Truth: OBSERVED / INFERRED / USER_CONFIRMED / CONFLICTED / UNKNOWN｜Confidence: L1–L4｜Evidence: E-XXXX｜Baseline: VERSION｜Boundary: SCOPE]`

## 项目基本信息

| 项目 | 内容 | Truth / Confidence | Evidence |
|---|---|---|---|
| 项目名称 | {PROJECT_NAME} | {LABEL_AND_CONFIDENCE} | {EVIDENCE_ID} |
| 版本 | {CURRENT_VERSION_OR_UNKNOWN} | {LABEL_AND_CONFIDENCE} | {EVIDENCE_ID} |
| 创建时间 | {CREATION_TIME_OR_UNKNOWN} | {LABEL_AND_CONFIDENCE} | {EVIDENCE_ID} |
| 维护状态 | {ACTIVE_LIMITED_UNMAINTAINED_OR_UNKNOWN} | {LABEL_AND_CONFIDENCE} | {EVIDENCE_ID} |
| 当前生命周期状态 | `EXISTING_PROJECT_ONBOARDING` | OBSERVED / L3 | {PROJECT_STATE_REFERENCE} |
| 生产运行状态 | {PRODUCTION_STATUS} | {LABEL_AND_CONFIDENCE} | {EVIDENCE_ID} |
| 责任人与所有权 | {OWNERSHIP} | {LABEL_AND_CONFIDENCE} | {EVIDENCE_ID} |

创建时间不能仅凭首次可见 Commit 推断；若使用该时间，只能写“当前可见 Git 历史最早时间”。

## 技术栈分析

| 分类 | 技术 / 版本 | 用途 | 来源文件 / 运行证据 | 维护状态 | Confidence |
|---|---|---|---|---|---|
| Frontend | {STACK_OR_APPROVED_NA} | {PURPOSE} | {EVIDENCE} | {STATUS} | {LEVEL} |
| Backend | {STACK_OR_APPROVED_NA} | {PURPOSE} | {EVIDENCE} | {STATUS} | {LEVEL} |
| Database | {STACK_OR_APPROVED_NA} | {PURPOSE} | {EVIDENCE} | {STATUS} | {LEVEL} |
| Infrastructure | {STACK_OR_APPROVED_NA} | {PURPOSE} | {EVIDENCE} | {STATUS} | {LEVEL} |
| AI 组件 | {STACK_OR_APPROVED_NA} | {PURPOSE} | {EVIDENCE} | {STATUS} | {LEVEL} |

### Runtime 与依赖

| Dependency ID | 名称 / 版本 | Direct / Transitive / External | 作用 | License / EOL / Security | Evidence |
|---|---|---|---|---|---|
| {DEP_ID} | {NAME_AND_VERSION} | {TYPE} | {PURPOSE} | {RISK_STATUS} | {EVIDENCE_ID} |

### 配置与环境

- 环境：{ENVIRONMENTS}
- 配置基线：{CONFIG_BASELINE}
- Feature Flags：{FLAGS_OR_NONE}
- Secret References：{REFERENCES_ONLY_NO_SECRET_VALUES}
- 环境差异：{DIFFERENCES_AND_EVIDENCE}

## 架构分析

### 系统结构

- 系统边界：{SYSTEM_BOUNDARY}
- 入口与出口：{ENTRY_AND_EXIT_POINTS}
- 部署拓扑：{DEPLOYMENT_TOPOLOGY}
- 权限与信任边界：{TRUST_BOUNDARIES}
- 可观测性与恢复：{OBSERVABILITY_AND_RECOVERY}

### 模块关系

| Module / Service ID | 职责 | 上游 | 下游 | 数据 / 接口 | 耦合与风险 | Evidence / Confidence |
|---|---|---|---|---|---|---|
| {MODULE_ID} | {RESPONSIBILITY} | {UPSTREAM} | {DOWNSTREAM} | {DATA_AND_INTERFACE} | {COUPLING_AND_RISK} | {EVIDENCE_AND_LEVEL} |

### 数据流

| Flow ID | 触发者 | 输入 | 处理链 | 存储 / 外部服务 | 输出 | 失败 / 恢复 | Evidence |
|---|---|---|---|---|---|---|---|
| {FLOW_ID} | {ACTOR} | {INPUT} | {PROCESS} | {STORAGE_OR_EXTERNAL} | {OUTPUT} | {FAILURE_AND_RECOVERY} | {EVIDENCE_ID} |

## 功能分析

### 已有功能

| Requirement ID | 当前功能 | 用户 / 调用方 | 实现位置 | 启用 / 使用证据 | 状态 | Confidence |
|---|---|---|---|---|---|---|
| {REQ_ID} | {FUNCTION} | {USER_OR_CALLER} | {IMPLEMENTATION_REFERENCE} | {USAGE_EVIDENCE} | {ACTIVE_INACTIVE_OR_UNKNOWN} | {LEVEL} |

### 核心流程

| Process ID | 目标 | 前置条件 | 主路径 | 失败路径 | 数据变化 | 验证证据 |
|---|---|---|---|---|---|---|
| {PROCESS_ID} | {GOAL} | {PRECONDITIONS} | {HAPPY_PATH} | {FAILURE_PATH} | {DATA_CHANGE} | {EVIDENCE} |

### 外部依赖

| External ID | 服务 / 系统 | 数据与权限 | 契约 / 版本 | 失败影响 | 降级 / 退出 | Owner / Evidence |
|---|---|---|---|---|---|---|
| {EXTERNAL_ID} | {SERVICE} | {DATA_AND_PERMISSION} | {CONTRACT_AND_VERSION} | {FAILURE_IMPACT} | {FALLBACK_AND_EXIT} | {OWNER_AND_EVIDENCE} |

## 代码质量分析

### 代码结构

- 目录与分层：{STRUCTURE}
- 核心入口：{ENTRY_POINTS}
- 公共组件：{SHARED_COMPONENTS}
- 生成 / Vendor / 废弃代码：{GENERATED_VENDOR_RETIRED}
- 构建与静态检查：{BUILD_AND_STATIC_CHECKS}

### 重复代码

| Finding ID | 重复范围 | 影响 | 证据 | 建议 | 优先级 |
|---|---|---|---|---|---|
| {FINDING_ID} | {DUPLICATION_SCOPE} | {IMPACT} | {EVIDENCE} | {RECOMMENDATION} | {PRIORITY} |

### 复杂模块

| Finding ID | 模块 | 复杂度信号 | 变更 / 故障历史 | 风险 | 建议 |
|---|---|---|---|---|---|
| {FINDING_ID} | {MODULE} | {COMPLEXITY_SIGNAL} | {CHANGE_OR_FAILURE_HISTORY} | {RISK} | {RECOMMENDATION} |

### 技术债

| Debt ID | 技术债 | 原因 / 来源 | 当前影响 | 增长触发器 | Owner | 处置建议 |
|---|---|---|---|---|---|---|
| {DEBT_ID} | {DEBT} | {CAUSE_OR_SOURCE} | {CURRENT_IMPACT} | {TRIGGER} | {OWNER} | {ACTION} |

## 风险分析

### 安全风险

| Risk ID | 风险 | 影响 | Evidence | 红线状态 | 缓解 / 遏制 | Owner |
|---|---|---|---|---|---|---|
| {RISK_ID} | {SECURITY_RISK} | {IMPACT} | {EVIDENCE} | {RED_LINE_STATUS} | {CONTROL} | {OWNER} |

### 维护风险

| Risk ID | 风险 | 影响 | 发生条件 | 监控 | 缓解 | Owner |
|---|---|---|---|---|---|---|
| {RISK_ID} | {MAINTENANCE_RISK} | {IMPACT} | {CONDITION} | {MONITORING} | {MITIGATION} | {OWNER} |

### 扩展风险

| Risk ID | 风险 | 当前边界 | 触发规模 / 场景 | 替代方案 | Evidence / Confidence |
|---|---|---|---|---|---|
| {RISK_ID} | {SCALABILITY_RISK} | {CURRENT_BOUNDARY} | {TRIGGER} | {ALTERNATIVE} | {EVIDENCE_AND_LEVEL} |

## 后续建议

| 方案 | 适用条件 | 收益 | 成本 / 风险 | 必要门禁 | 是否推荐 |
|---|---|---|---|---|---|
| 继续维护 | {CONDITIONS} | {BENEFITS} | {COST_AND_RISK} | MAINTENANCE 管理基线 | {YES_OR_NO} |
| 重构 | {CONDITIONS} | {BENEFITS} | {COST_AND_RISK} | Evaluation / Design / Development Gates | {YES_OR_NO} |
| 迁移 | {CONDITIONS} | {BENEFITS} | {COST_AND_RISK} | Build vs Buy、Design、Testing、Release Gates | {YES_OR_NO} |
| 停止 | {CONDITIONS} | {BENEFITS} | {COST_AND_RISK} | 数据、用户、合同和归档退出方案 | {YES_OR_NO} |

### 推荐结论

- 推荐方案：{CONTINUE_REFACTOR_MIGRATE_OR_STOP}
- Health Score / 等级：{SCORE_AND_GRADE}
- 决定性证据：{EVIDENCE_IDS}
- Overall Confidence：{LEVEL}
- 当前不能支持的决定：{UNSUPPORTED_DECISIONS}
- 最小下一动作：{ACTION_OWNER_COMPLETION_CONDITION}

## 缺口与复核

| Gap ID | UNKNOWN / CONFLICTED 项 | 影响 | 补证动作 | Owner | 完成条件 |
|---|---|---|---|---|---|
| {GAP_ID} | {GAP} | {IMPACT} | {EVIDENCE_ACTION} | {OWNER} | {COMPLETION_CONDITION} |

- 最后复核日期：{YYYY-MM-DD}
- 复核触发器：{SOURCE_VERSION_ENVIRONMENT_OR_EVIDENCE_CHANGE}
