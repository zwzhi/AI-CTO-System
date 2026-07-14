# Intent Classification Standard

| Intent | 描述与识别特征 | 示例 | 默认复杂度 |
|---|---|---|---|
| `NEW_PROJECT` | 新想法、目标用户、产品或立项 | “做一个面向创作者的系统” | L4 |
| `FEATURE_REQUEST` | 已有项目新增或改变用户能力 | “给项目增加导出功能” | L2–L3 |
| `BUG_FIX` | 可复现错误、异常或预期偏差 | “登录后页面报错” | L1–L2 |
| `INCIDENT` | 生产不可用、数据或安全影响 | “线上服务无法访问” | L3–L4 |
| `REFACTOR` | 改善内部结构而不以新功能为主 | “拆分这个耦合模块” | L2–L3 |
| `ARCHITECTURE_CHANGE` | 系统边界、服务、数据或部署结构变化 | “从单体拆成服务” | L3–L4 |
| `RESEARCH_REQUEST` | 技术、开源、方案或市场调研 | “调研可用的工作流框架” | L1–L3 |
| `KNOWLEDGE_UPDATE` | 捕获、验证、更新或纠正经验 | “记录这次故障经验” | L1–L2 |
| `PROJECT_STATUS_QUERY` | 查询项目阶段、风险、状态或进度 | “项目现在到哪一步了” | L1 |
| `GENERAL_CONVERSATION` | 普通问答、解释或非技术交流 | “你怎么看这个想法” | L0 |

`AMBIGUOUS` 表示多个分类合理但证据不足；`OUT_OF_SCOPE` 表示不属于 AI CTO 职责；`INSUFFICIENT_EVIDENCE` 表示关键上下文缺失。三者均不得伪装为已分类 Intent。
