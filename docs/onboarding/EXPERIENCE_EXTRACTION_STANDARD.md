# 历史项目经验沉淀标准

## 1. 目的与触发条件

已有项目取得 `ONBOARDING_COMPLETED` 后，AI CTO 必须检查哪些证据能够形成跨项目复用经验，并将通过审核的条目保存到 `memory/knowledge_base/`。

经验提取不等于复制项目全部内容。只有具有明确来源、适用边界、复用价值和使用权的知识才能进入全局知识库。

## 2. 必须评估的经验类型

| 经验类型 | 提取内容 | 知识库目标 |
|---|---|---|
| 技术方案 | 已验证架构、数据流、部署、扩展、降级与选型边界 | `memory/knowledge_base/architectures/` |
| 解决方案 | 可重复的问题诊断、修复、迁移、恢复和自动化方法 | `memory/knowledge_base/solutions/` |
| Bug 经验 | 症状、影响、根因、检测、修复、回归和预防 | `memory/knowledge_base/bugs/` |
| 失败原因 | 失败条件、错误假设、遗漏控制、停止信号与改进 | `memory/knowledge_base/best_practices/` 或 `bugs/` |
| 可复用模块 | 模块职责、接口、依赖、测试、License 和复用限制 | `memory/knowledge_base/solutions/` 或 `architectures/` |

AI Agent、Prompt 或评测经验分别进入既有 `agents/`、`prompts/` 或 `best_practices/` 分类。

## 3. 提取门槛

知识条目必须同时满足：

- 有稳定 Source Project、版本 / Commit 和 Evidence ID；
- 事实、推断和用户确认已区分；
- 结论达到其复用风险所需 Confidence；
- 适用场景、前置条件、限制、反例和失效触发器明确；
- 已移除 API Key、用户数据、内部凭据和无关敏感信息；
- License、知识产权、合同和组织授权允许该层级的复用；
- 不是只对单一文件或一次偶发操作有意义的项目私有细节。

不能满足门槛的内容留在项目 PROJECT_MEMORY 或受控项目文档中，不进入全局知识库。

## 4. 提取流程

1. 从 Reverse Analysis、Health Report、Recovered Documents、Bug / Incident 和 Git 历史创建候选清单。
2. 合并重复候选，确认它与现有 Knowledge Base 条目是新增、更新、冲突还是反例。
3. 核验 Source、Evidence、Confidence、License、敏感信息和复用边界。
4. 由技术、安全、数据或产品领域责任人按内容评审。
5. 创建唯一 Knowledge ID 和版本化条目，反向链接 Source Project。
6. 在 PROJECT_MEMORY 中记录已提取条目，不复制其全文。
7. 当源项目新证据推翻结论时，更新、降级或 Supersede 知识条目，保留历史。

## 5. 知识条目必填字段

| 字段 | 要求 |
|---|---|
| Knowledge ID / Type | 唯一 ID 与技术方案、解决方案、Bug、失败或模块类型 |
| Title / Summary | 可搜索标题和一段结论 |
| Source Project | 项目、Original Source、版本 / Commit 和文档引用 |
| Problem / Context | 问题、规模、环境和前置条件 |
| Solution / Learning | 经验证做法、失败原因或可复用模块说明 |
| Evidence / Confidence | Evidence ID、验证方式、L1–L4 和最后验证时间 |
| Applicability | 适用场景、限制、反例和禁止使用条件 |
| Security / Data / License | 脱敏、权限、License 和知识产权边界 |
| Verification | 测试、运行历史、故障或复核记录 |
| Owner / Review | 责任人、评审人、状态和复核触发器 |

## 6. 各类提取规则

### 6.1 技术方案

提取架构目的、约束、数据流、权衡、运行证据和扩展边界。不能把“项目采用了该方案”写成“该方案是最佳实践”；必须说明为何在当前条件下有效。

### 6.2 解决方案

记录症状、诊断、根因、动作、验证与回滚。只有能被另一个项目按步骤复核的方案才进入 `solutions/`。

### 6.3 Bug 经验

记录 Bug 表现、影响、根因、失败检测、修复 Commit、定向测试、回归和预防控制。不得复制敏感生产数据或未脱敏日志。

### 6.4 失败原因

记录被证据否定的假设、触发条件、造成的影响、当时缺少的信号和未来停止条件。失败案例不得被改写成成功叙事。

### 6.5 可复用模块

记录职责、接口、依赖、配置、数据、测试、性能、安全、License 和抽离成本。代码存在不等于可复用；缺少授权、边界或测试时只记录候选，不复制实现。

## 7. Confidence 与时效

一次静态扫描通常只能支持 L1–L2 的可复用结论；目标项目实测可以支持 L3；跨版本长期运行或多个项目复用可以支持 L4。环境、依赖、License、安全公告、规模或业务目标变化后必须复核。

## 8. 完成记录

每次接管结束在 PROJECT_MEMORY 中记录：候选数、已提取数、拒绝数、Knowledge ID、拒绝理由、Owner 和下一次复核触发器。没有合格经验时记录“0 个合格条目”及检查范围，不创建空知识文件。
