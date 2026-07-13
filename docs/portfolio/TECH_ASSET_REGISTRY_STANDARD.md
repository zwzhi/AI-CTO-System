# 技术资产注册标准

## 1. 目的

本标准建立跨项目可检索、可评估、可复用的技术资产注册体系。新项目进入 DESIGN 时必须先检索已有资产，再决定复用、二次开发、参考或自研。

资产注册不等于自动批准复用。项目仍须验证适用性、License、安全、数据、质量、成本、版本和退出能力。

## 2. 资产类型

- Agent 模板
- Prompt 模板
- 代码模块
- 架构方案
- 数据库设计
- 部署方案
- 解决方案

## 3. Asset Record

每个资产至少记录：

| 字段 | 要求 |
|---|---|
| Asset ID | 稳定唯一的 `AST-XXXX` |
| Name | 清晰描述能力，不使用来源项目内部缩写作为唯一名称 |
| Type | 七种规范资产类型之一 |
| Source Project | 产生资产的 Project ID、版本和 Commit / 文档基线 |
| Usage Count | 已验证的实际项目使用次数，不统计浏览、下载或试验 |
| Quality Score | 0–100、评估版本、Evidence 和日期 |
| Applicable Scenario | 适用用户、问题、规模、技术环境、数据和限制 |

同时记录 Owner、Version、接口、依赖、License / IP、Security、Data Classification、测试、文档、成本、已知风险、使用项目、变更历史、状态和替代资产。

## 4. 资产质量评分

| 维度 | 分值 | 核心判断 |
|---|---:|---|
| 功能与适用性 | 20 | 能否解决声明问题并明确不适用边界 |
| 可靠性与测试 | 20 | 测试、运行、失败与回归证据是否充分 |
| 文档与可用性 | 20 | 接口、示例、配置、限制、迁移和排障是否完整 |
| 安全、数据与 License | 20 | 权限、敏感数据、供应链、版权和许可是否清晰 |
| 维护与兼容 | 20 | Owner、版本、升级、依赖、兼容与弃用能力 |
| **合计** | **100** | 分数、Confidence 和红线分开判断 |

85–100 可作为优先复用候选；70–84 关闭明确缺口后复用；50–69 仅用于受控参考或验证；低于 50 不建议直接复用。安全、数据、License 或来源红线不受总分抵消。

## 5. 资产状态

Asset Status 只允许：`DRAFT`、`VALIDATED`、`APPROVED_FOR_REUSE`、`DEPRECATED`、`RETIRED`。

只有当前版本取得 `APPROVED_FOR_REUSE` 才能被标记为正式复用资产。该状态只说明注册质量达到组合要求，不替代使用项目的 Architecture、Agent Design、Security、Testing 或 Release Gate。

## 6. 设计阶段检索与采用

新项目 DESIGN 前按问题、类型、技术栈、数据、规模、License 和质量搜索 Asset Registry，并记录：检索条件、候选资产、适配分析、Build vs Buy / Reuse 结论、选用版本、缺口、成本、风险和回退。

采用资产时创建 Usage Record，关联 Project ID、Requirement / Design、资产版本、适配修改、测试、Commit 和结果。只有完成目标场景验证后 Usage Count 才增加。

## 7. 资产维护与经验闭环

资产接口、依赖、安全、License、Owner、质量或适用边界变化时重新评估所有使用项目。弃用必须通知使用方、提供迁移期、替代方案和最终停止日期。

Incident、Bug、演进和项目退出产生的可复用经验先按 Knowledge Governance 沉淀到权威 `knowledge_base/`；达到稳定、可验证和可维护条件后再注册为技术资产，不能把未经验证的知识条目直接标记为可复用资产。
