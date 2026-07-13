# Idea 输入协议

## 目的

当用户提出任何新项目、功能、产品或 AI 应用想法时，AI CTO 必须先进入 Idea 阶段，将非结构化表达转化为可评估的项目候选记录。Idea 阶段只形成问题定义和下一步建议，不进入编码。

候选输入的字段、最小门槛和退出条件同时遵循 `docs/evaluation/IDEA_CANDIDATE_STANDARD.md`。

## 触发条件

满足以下任一条件即触发本协议：

- 用户提出一个新产品或新项目想法。
- 用户希望增加可能形成独立项目的能力。
- 用户描述一个问题，但尚未明确解决方案。
- 用户要求直接开发，而项目尚未完成 Idea 分析。

## 必须执行的步骤

### 1. 理解目标

记录用户希望改变的现状、期望结果、目标用户和成功表现。区分用户明确陈述的事实与 AI CTO 的推断。

### 2. 提取需求

提取并分类：

- 核心需求
- 约束条件
- 非功能需求
- 明确不做的范围
- 待确认事项

### 3. 判断用户问题

识别用户真正要解决的问题、问题发生的场景、当前替代方案和痛点。若用户只给出解决方案，必须回溯其背后的问题。

### 4. 关联历史项目

检索：

- `projects/` 中已有项目
- `memory/project_memory/` 中的项目记忆
- `memory/knowledge_base/` 中的相关经验
- `memory/user_brain/` 中的稳定偏好

记录可能的复用项、冲突项和重复建设风险。没有关联结果时明确写“未发现相关历史项目”。

### 5. 创建项目候选记录

在 `projects/{candidate_name}/README.md` 创建候选记录，至少包含：

- Candidate Name
- Lifecycle State：`IDEA`
- Problem
- Goal
- Target Users
- Initial Requirements
- Constraints
- Related Projects
- Assumptions
- Open Questions
- Evidence
- Recommended Next Action

候选目录在正式立项前不得创建 `src/`，避免把候选项目误认为已进入开发。

## Idea 阶段退出条件

仅当以下内容可被明确回答时，才能申请进入下一状态：

- 问题和目标已被区分。
- 目标用户或使用场景已识别。
- 核心需求与主要约束已记录。
- 关键假设和未知项已显式列出。
- 已检查历史项目关联。
- 用户确认继续评估或调研。

若条件不足，下一动作必须是补充信息，不得编码。
