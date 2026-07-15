# ADR-0031：AI Matrix 使用独立 Git 仓库

- 状态：Accepted
- 日期：2026-07-15
- 决策者：AI Matrix 发起人、AI CTO

## 背景

AI Matrix 是一个新的业务产品。此前其应用代码和业务文档位于 AI CTO System 仓库的 `projects/ai-matrix/` 与 `docs/` 中，这混淆了“使用 AI CTO System 进行开发治理”和“属于 AI CTO System 源码”的概念，也使业务产品直接依赖 AI CTO Runtime 的相对源码路径。

## 决策

1. AI Matrix 迁移到 `D:\AI Project\AI-Matrix` 独立 Git 仓库。
2. 采用 subtree split 保留 `projects/ai-matrix` 的项目提交历史。
3. AI Matrix 独立拥有产品代码、业务数据、测试、文档、ADR、项目记忆和发布节奏。
4. AI CTO System 只负责开发治理和未来正式能力接口，不拥有 AI Matrix 业务源码。
5. AI Matrix 不直接引用 AI CTO System 文件系统源码；当前建立最小应用侧 Contract / Port，未来可由正式 SDK / Package Adapter 替换。
6. 源仓库保留本 ADR 和外部项目治理记录，移除 AI Matrix 专属实现资产。

## 选择理由

独立仓库与产品所有权、部署、权限、发布和商业边界一致。subtree split 能保留已有工程 Evidence；应用侧 Contract 能在不复制 Core 的前提下解除物理源码耦合，并为未来正式集成保留替换点。

## 替代方案

### 当前仓库继续托管

测试和联调简单，但产品边界错误，后续权限、发布和部署会持续耦合，因此拒绝。

### 当前目录建立嵌套仓库

Git 边界可以独立，但物理目录仍属于 AI CTO System，容易产生嵌套仓库、忽略规则和所有权混乱，因此拒绝。

### 复制当前快照并重新初始化

实施最快，但丢失开发提交历史和审计 Evidence，因此不采用。

## 后果

- AI Matrix 可以独立版本化、测试、部署和配置远程仓库；
- AI CTO System 与 AI Matrix 必须通过明确 Contract / Adapter 协作；
- 在正式 SDK 存在前，AI Matrix 维护兼容的最小应用侧治理合同；
- 两个仓库的进度、ADR 和项目记忆分别维护；
- 本次拆分不表示真实 Pilot、模型接入或能力复制已经完成。

## 相关文档

- [仓库拆分设计](../superpowers/specs/2026-07-15-ai-matrix-repository-separation-design.md)
- [AI Matrix 外部项目记录](../portfolio/AI_MATRIX_EXTERNAL_PROJECT_RECORD.md)
- AI Matrix 产品 ADR-0026～ADR-0030 已迁移至独立仓库 `D:\AI Project\AI-Matrix\docs\adr`。
