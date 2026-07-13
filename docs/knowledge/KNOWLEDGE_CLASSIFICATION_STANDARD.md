# Knowledge 分类标准

## 1. 权威目录结构

```text
knowledge_base/
├── project_experience/
├── architecture_patterns/
├── engineering_patterns/
├── agent_patterns/
├── prompt_patterns/
├── bug_solutions/
├── decisions/
├── failures/
└── business_insights/
```

## 2. 分类定义

| Directory | Type | 用途 | 主要来源 | 适用范围必须说明 |
|---|---|---|---|---|
| `project_experience/` | Project Experience | 复用项目路径、权衡、结果与运营经验 | Project Memory、Release、Retirement、Onboarding | 项目类型、规模、用户、时间、技术和结果窗口 |
| `architecture_patterns/` | Architecture Pattern | 支持系统边界、组件、数据与部署设计 | Architecture、ADR、性能 / 扩展验证 | 负载、数据、一致性、部署、安全、团队和约束 |
| `engineering_patterns/` | Engineering Pattern | 改善开发、测试、Review、调试与维护 | Task、Commit、Review、Test、Incident | 语言、框架、代码规模、团队、流程和风险 |
| `agent_patterns/` | Agent Pattern | 复用 Agent 责任、工具、Memory 和失败治理 | Agent Design、Evaluation、运行轨迹 | 模型、工具、权限、任务、数据、环境和成功定义 |
| `prompt_patterns/` | Prompt Pattern | 复用经评测的 Prompt 结构和约束 | Prompt 版本、Dataset、AI Evaluation | 模型、语言、任务、输入分布、工具和阈值 |
| `bug_solutions/` | Bug Solution | 加速相似缺陷诊断、修复和防复发 | Bug、Commit、Test、Incident、Postmortem | 症状、版本、环境、根因、修复和不适用条件 |
| `decisions/` | Decision Record | 复用决策方法、取舍和结果证据 | ADR、Evaluation、Portfolio、Evolution Proposal | 决策对象、约束、选项、风险和复核触发器 |
| `failures/` | Failure Experience | 识别失败信号、根因和恢复方式 | Incident、Postmortem、失败实验、回滚 | 失败条件、影响、检测、恢复和防复发边界 |
| `business_insights/` | Business Insight | 支持用户、价值、流程、成本和投资判断 | Research、用户反馈、指标、销售 / 运营数据 | 用户群、市场、时间、地区、渠道和数据口径 |

## 3. 分类规则

1. 按 Knowledge 主要复用目的选择 Primary Type，不按文件来源分类。
2. 同一事件可以提取多项 Knowledge，但每项必须有不同问题、合同或适用范围。
3. 同一结论不得复制到多个目录；使用 Related Knowledge IDs 和引用建立关系。
4. 无法确认类型时保持提取记录，不进入权威 Knowledge Base。
5. Prompt、Agent 或 Bug 文件只有形成可验证模式后才进入对应目录；原始 Artifact 留在来源项目。
6. Business Insight 与技术模式分离，避免短期业务假设被包装成长期工程规则。

## 4. Legacy Capture Area

`memory/knowledge_base/` 的历史 `agents/`、`architectures/`、`prompts/`、`bugs/`、`solutions/`、`best_practices/` 目录不再接收新的权威 `ACTIVE` Knowledge。其映射仅用于未来受控迁移：

| Legacy | 新目录候选 |
|---|---|
| `agents/` | `agent_patterns/` |
| `architectures/` | `architecture_patterns/` |
| `prompts/` | `prompt_patterns/` |
| `bugs/` | `bug_solutions/` 或 `failures/` |
| `solutions/` | 按主要用途分入 architecture / engineering / bug |
| `best_practices/` | 经验证后分入对应 Pattern，不保留宽泛类型 |

迁移不是机械移动；每项必须重新分类、验证、去重、登记并保留 Legacy Source Path。

## 5. 文件命名

正式 Knowledge 文件建议使用 `{Knowledge-ID}-{slug}.md`。同一 Knowledge 的新版本更新当前记录并追加不可覆盖 Change History；重大范围分裂时创建新 ID 并建立 `SUPERSEDES`、`CONFLICTS_WITH` 或 `DERIVED_FROM` 关系。
