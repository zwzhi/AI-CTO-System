# AI CTO System v2：安装与首次使用

本指南面向第一次使用 AI CTO System 的 Codex 用户。当前版本是一个仓库 + Codex Skill 的治理助手，不是独立桌面应用，也不会自动读取所有历史对话。

## 1. 使用条件

- 已安装 Codex App、CLI 或 IDE；
- 已安装 Git；
- 能访问 AI CTO System 仓库；私有仓库需要 GitHub 账户权限；
- 每个用户使用自己的 AI CTO System 副本和自己的项目反馈目录。

## 2. 获取指定版本

推荐使用版本标签 `v2.0.0-codex-native`。如果远程尚未发布该标签，可以先使用 `v2-codex-native` 分支。

```powershell
git clone https://github.com/zwzhi/AI-CTO-System.git
Set-Location AI-CTO-System
git checkout v2.0.0-codex-native
```

不要把 `main` 视为 v2 版本，除非仓库维护者明确说明 v2 已合并到 `main`。

## 3. 配置权威仓库路径

Skill 不依赖开发者的固定本机路径。推荐在当前终端设置：

```powershell
$env:AI_CTO_SYSTEM_ROOT = (Get-Location).Path
```

如果需要持久化到当前 Windows 用户：

```powershell
[Environment]::SetEnvironmentVariable(
  'AI_CTO_SYSTEM_ROOT',
  (Get-Location).Path,
  'User'
)
```

也可以直接从仓库根目录运行安装器：

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\install-ai-cto-skill.ps1
```

安装器只在用户级 Codex Skill 目录创建指向当前仓库 `skills/ai-cto-system` 的 Junction；不会复制治理文档，也不会修改项目代码。

非 Windows 环境可以将 `skills/ai-cto-system` 以符号链接或受控复制方式放入用户的 Codex Skill 目录，并设置同名 `AI_CTO_SYSTEM_ROOT` 环境变量。复制方式需要在版本升级时重新同步；符号链接更容易保持单一权威来源。

安装或更新后，重新打开 Codex 对话，让 Skill 重新发现最新内容。

## 4. 第一次使用

### 新项目

```text
我想做一个新项目：……
请按 AI CTO System 先做 Idea 分析，不要直接编码。
```

### 已有项目

```text
请接管当前项目。
先完成项目扫描、文档恢复和健康评估，不要修改代码。
```

### 继续开发

```text
继续当前项目。
先读取 Project State、Project Memory 和最近进度，完成下一个已授权任务。
```

### 记录 AI CTO 使用反馈

在里程碑、阻塞、失败、回滚或项目完成后：

```text
请按 AI CTO System 的 Project Usage Feedback Sync Standard，
提取本次 AI CTO 使用反馈并同步到 AI CTO System。

只记录路由、Workflow、Skill、Tool、Model、Reasoning、Context、
耗时、人工交互、失败原因、质量结果和 Evidence。
不要记录源码、完整聊天、密钥或业务敏感信息。
```

反馈会写入当前 AI CTO System 副本的：

```text
evaluations/project_usage/<project-id>/PROJECT_USAGE_FEEDBACK.md
```

### 暂停 AI CTO 治理

```text
AI_CTO_MODE: OFF
```

## 5. 反馈目录和权限边界

- 每个用户默认使用自己的 AI CTO System 仓库副本；
- 每个项目使用独立的 `<project-id>` 目录；
- 不把原始项目源码、完整对话、API Key、Token、Cookie、密码或客户信息写入反馈目录；
- 共享反馈前先脱敏，只共享与 AI CTO 工作方式有关的摘要和 Evidence；
- 项目自身的 `PROJECT_STATE.md`、`PROJECT_MEMORY.md` 和 `DEVELOPMENT_PROGRESS.md` 仍是项目事实权威；
- Feedback 只是派生 Evidence，不会自动修改路由、模型、Skill、Tool、Permission、Gate 或 AI CTO Core。

## 6. 常见状态

| 状态 | 含义 |
|---|---|
| `NOT_AVAILABLE` | 当前 Codex 会话无法定位 AI CTO System 权威根目录；请设置 `AI_CTO_SYSTEM_ROOT` 或打开正确工作区 |
| `CAPTURED` | 已生成一条脱敏使用反馈；不代表已经形成通用规则 |
| `Observation` | 单个案例的事实观察 |
| `Candidate Pattern` | 多个可比较案例形成的候选模式；仍不自动改变系统 |
| `Optimization Proposal` | 有足够 Evidence 后形成的正式优化提案；仍遵循风险与人类控制规则 |

## 7. 当前明确不包含

- 自动跨聊天收集历史记录；
- 自动切换模型；
- 自动激活真实 Codex Capability；
- 无人监督地修改任意项目；
- 自动写入 `ACTIVE Knowledge`；
- 自动修改 Manifesto、ADR、Master Plan、Permission 或核心 Gate。
