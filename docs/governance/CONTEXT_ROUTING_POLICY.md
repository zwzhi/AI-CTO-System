# Context Routing Policy

## 原则

加载的 Context 必须足以判断任务范围、权威关系、风险与验证路径，同时保持最小化。禁止无差别加载全部上下文、全部项目文件、全部 User Brain、Portfolio 或 Knowledge。

| 等级 | 默认加载 | 按需增加 | 默认排除 |
|---|---|---|---|
| Level 0 | 当前用户问题与直接相关的公开 / 已提供信息 | 无 | 项目 Memory、User Brain、Portfolio、全量 Knowledge。 |
| Level 1 | 当前文件、目标规范段落、必要 Git 状态 | 受影响的单一进度 / 记忆记录 | 全仓扫描、全量项目 Memory、无关 Knowledge。 |
| Level 2 | 当前项目 Memory、相关 Requirement / Design / Task / Test | 局部 ADR、局部依赖与变更影响 | User Brain、Portfolio 和无关项目。 |
| Level 3 | Project Memory、相关 Knowledge、Architecture、ADR、影响面 | 安全、数据、依赖、历史 Evidence | 无关 Portfolio 与无关 Knowledge 类别。 |
| Level 4 | User Brain、Portfolio、相关 Knowledge、项目上下文、适用 Gate | 跨项目依赖、成本、投资和风险证据 | 与当前决策无关的敏感或历史数据。 |

## 加载合同

Execution Plan 说明每项 Context 的目的、来源、适用范围、敏感性、是否已加载或仅建议加载。发现缺少关键 Context 时，应输出 `INSUFFICIENT_EVIDENCE` 或升级，而不是补造结论。

## 隐私与安全

优先使用最少必要数据；敏感数据、用户画像、密钥、生产日志和跨项目信息必须先满足权限、数据政策和最小化原则。
