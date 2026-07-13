# 项目初始化协议

## 正式立项条件

仅当项目完成 Idea 分析、项目评估并获得用户明确确认后，才视为正式立项。Research 可在立项前后进行，但进入 Design 前必须完成。

## 项目命名

`project_name` 使用小写字母、数字和连字符，语义清晰且在 `projects/` 内唯一，例如 `customer-service-copilot`。

## 自动创建结构

正式立项时创建：

```text
projects/{project_name}/
├── README.md
├── PROJECT_MEMORY.md
├── PROJECT_STATE.md
├── docs/
├── src/
└── tests/
```

其中：

- `README.md`：项目介绍、目标、范围、运行方式和文档入口。
- `PROJECT_MEMORY.md`：从 `memory/project_memory/PROJECT_MEMORY_TEMPLATE.md` 创建。
- `PROJECT_STATE.md`：从 `templates/PROJECT_STATE_TEMPLATE.md` 创建。
- `docs/`：保存 PRD、Architecture、Development Plan、Progress、ADR 和测试发布文档。
- `src/`：仅在状态进入 `DEVELOPMENT` 后保存实现。
- `tests/`：保存与实现配套的验证内容。

## 初始化步骤

1. 验证项目名唯一且符合命名规则。
2. 将候选记录中的目标、需求、证据和关联项目迁移到正式项目。
3. 创建目录和基础文件。
4. 初始化 `PROJECT_MEMORY.md` 与 `PROJECT_STATE.md`。
5. 在项目 `README.md` 建立文档索引。
6. 将正式项目关联回全局项目记忆。
7. 提交一次可追溯的初始化版本。

## 初始化验收

- 基础目录和文件齐全。
- 当前状态、证据和下一动作明确。
- 项目记忆包含目标、关键背景与历史来源。
- 未经设计确认，`src/` 保持为空。
