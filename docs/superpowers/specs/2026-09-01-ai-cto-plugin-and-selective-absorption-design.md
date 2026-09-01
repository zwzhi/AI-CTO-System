# AI CTO System：选择性吸收与薄 Plugin 设计规格

## 1. 文档状态

- 日期：2026-09-01
- 设计状态：`DESIGN_READY_FOR_IMPLEMENTATION`
- 目标版本基线：`v2.0.0-codex-native` / `0300474`
- 目标：吸收外部 Codex 长期助手中有长期价值的机制，并将 AI CTO System 以薄 Plugin 形态分发
- 当前执行授权：`NONE`

本设计已经过一次完整的内部基线审查和外部仓库只读审查。设计获用户确认后，才能进入 Plugin 实现；本文件本身不授予自动执行、模型切换、Hook、MCP 或生产写入权限。

## 2. 审查基线

### 2.1 当前 AI CTO System

- 产品定位：AI CTO Governance Plane；Codex App / CLI / IDE 为 Execution Plane。
- 当前仓库：`main`，工作区干净，`v2.0.0-codex-native` 与远程 `main` 对齐。
- 当前验证：全量 Node 测试 `212 / 212` 通过；Skill 包、路由和安装器校验通过。
- 已有能力：Mission、五层架构、Project Memory、Evidence / Audit、Gate、L0–L4 路由、Progress Sync、Project Usage Feedback、Self Evolution Proposal、Portable Skill Gateway。
- 当前限制：没有后台跨聊天采集、真实模型自动切换、真实 Codex Capability Activation、生产级 Runtime 或共享多用户记忆服务。

### 2.2 外部仓库

审查对象为 `JimmyVGDY/codex-long-term-assistant-skills` 当前公开快照。其公开 README 和 Manifest 声明了 Plugin-first 发行、10 个 Skill、7 个逻辑 Reviewer、6 类生命周期 Hook、项目/仓库指纹隔离、检查点、事件链和受控自进化；这些内容作为候选机制，不作为 AI CTO 的权威规则。

外部仓库的 V5.0 文档明确把“AICTO 式完整组织治理层”作为对照，V5.1 文档明确说明没有复制 AICTO 的 TypeScript 实现代码，而是重新实现对应治理思想。这证明存在概念层面的直接参考，但不足以证明任何具体代码或全部设计来自本仓库。

外部仓库的包级验证在临时测试索引中通过 `121 / 121` Python 测试；源码 ZIP 初始缺少 `.git` 时，链接审计无法执行 `git ls-files`，这类事实已与真实 Codex 宿主验证分开记录。

## 3. 选择性吸收清单

### 3.1 吸收为既有 Module 的轻量扩展

| 候选机制 | 归属 | 设计处理 | 当前边界 |
|---|---|---|---|
| `Project ID + Repository Fingerprint` | Layer 1 Evidence / Project Usage Feedback | 在现有 Feedback 和 Evidence 记录中增加项目身份与仓库基线字段；敏感路径只保留哈希或脱敏引用 | 不扫描未授权项目，不建立后台采集器 |
| 模型证据三分法 | Layer 5 Execution Routing | 增加 `Requested Model Policy`、`Runtime Model Evidence`、`Diagnostic Model Observation`；不可验证时保留 `NOT_CAPTURED` / `UNAVAILABLE` | 不覆盖 Codex Host 模型选择，不设置固定全局模型上限 |
| Skill 路由预算 | Layer 5 Intent Gateway / Execution Routing | 默认一个主能力、少量辅助能力；超出时记录唯一职责和理由；加入路由回归用例 | 采用软约束，不用固定数字阻断必要任务 |
| Self Evolution 证据门槛与提案去重 | Phase 10 Self Evolution | 为现有 Proposal 记录 Evidence 数、独立 Task 数、观察窗口、稳定 Fingerprint 和重复检查 | 不改变现有 MVP 合同，不自动执行 Proposal |

以上四项只扩展现有文档和记录合同，不创建新的 Phase、Layer、Module、Runtime 或审批系统。

### 3.2 后置候选

以下机制只有在真实使用证据证明手动同步或发行维护已成为瓶颈时，才另行评估：

- Codex 生命周期 Hook 与 SessionEnd 延迟封印；
- 持久事件哈希链、锁和崩溃恢复；
- Doctor / Dry-run / 安装事务 Journal；
- 可复现构建、Release Attestation 和安装后 Payload Digest。

它们不属于本次 Plugin MVP。

### 3.3 明确拒绝

不迁入外部仓库的以下内容：

- 10 个领域 Skill 的整包复制；
- 默认启动 7 个 Reviewer；
- 第二套全局 `AGENTS.md` 权威；
- 第二套 Runtime 或 Evolution Runtime；
- 固定 Terra High 模型天花板；
- 默认接入 Hook、MCP、App、数据库或外部工具；
- 将个人 Memory、项目反馈或私有路径打入公开 Plugin 制品。

## 4. Plugin 定位

### 4.1 核心原则

```text
AI CTO Git Repository = 唯一权威源
AI CTO Plugin = 版本化分发包装
ai-cto-system Skill = 自动入口
Codex Host = 实际执行平面
```

Plugin 不拥有业务价值判断、项目 Gate、Permission、Runtime 状态或 Knowledge 激活权。安装 Plugin 不等于激活外部 Codex Capability，也不改变 `Execution Authorization: NONE`。

### 4.2 轻 Plugin 组成

Plugin manifest 使用 Codex 可识别的 `.codex-plugin/plugin.json`，只声明一个 `ai-cto-system` Skill 目录，不声明 Hooks、Apps、MCP 或第二套 Runtime。具体版本必须在发布时由严格 SemVer 标签冻结：

```json
{
  "name": "ai-cto-system",
  "version": "2.1.0",
  "description": "Governed AI CTO project-work entry for Codex",
  "author": { "name": "AI CTO System" },
  "skills": "./skills/",
  "interface": {
    "displayName": "AI CTO System",
    "shortDescription": "Governed project work in Codex",
    "longDescription": "Mission-aligned project analysis, engineering governance and evidence-driven continuity for Codex.",
    "category": "Productivity",
    "capabilities": ["Skill"]
  }
}
```

示例版本 `2.1.0` 代表发布时的候选 SemVer；实现前必须以实际发布基线替换并由 Git tag、构建产物和 manifest 读回共同确认，不能把未发布版本宣称为已发布。

### 4.3 发行制品与私有数据隔离

源码仓库可能包含创建者的 User Brain、Project Memory、项目反馈和历史资料。Plugin 发行制品必须使用白名单 staging 构建，只包含：

- `.codex-plugin/plugin.json`；
- `skills/ai-cto-system/SKILL.md` 和 `agents/openai.yaml`；
- Manifesto、Master Plan、Module Registry、V2 Document Index、Active Operating Core、Codex Operating Model；
- 任务所需的通用治理标准、模板和 `docs/GETTING_STARTED.md`；
- 不含个人 User Brain、创建者 Project Memory、真实项目目录、项目反馈正文、Secrets、`.git`、工作树和缓存。

用户自己的长期记忆和项目反馈继续保存在自己的 AI CTO System 副本或目标项目中，不进入共享 Plugin 包。

## 5. 自动发现与使用语义

### 5.1 目标体验

安装并启用 Plugin 后，用户在目标项目中可以直接提出：

```text
我想新增一个功能：……
```

Skill 根据 Intent、风险和复杂度自动判断是否进入 AI CTO 路由；用户不需要每条消息重复写“使用 AI CTO”。`AI_CTO_MODE: OFF` 仍然优先。

### 5.2 诚实边界

Plugin 不是所有 Codex 界面的强制开关。实际可见性和调用方式取决于 Codex surface、账户、Workspace、角色和安装状态；某些任务界面可能需要一次性从 Sources 中启用 Plugin。Skill 自动触发仍由 description、路由和当前上下文决定。

### 5.3 权威根目录解析

保留当前 Portable Skill 规则：

1. 使用 `AI_CTO_SYSTEM_ROOT` 指向用户自己的治理仓库；
2. 否则从包含 `skills/ai-cto-system/SKILL.md` 和 Master Plan 的 Plugin / 仓库根目录发现通用权威文档；
3. 无法定位时返回 `NOT_AVAILABLE`，不猜路径、不读取其他用户仓库。

Plugin 不把创建者的个人记忆作为默认上下文。项目 State / Memory 仍优先于通用治理文档。

## 6. 安装、升级与回滚设计

### 安装

- 支持从本地 Plugin 目录或版本化 ZIP 安装；
- 保留现有 Portable Skill Gateway 作为兼容兜底；
- 首次安装后要求新建或重新打开 Codex 对话验证发现；
- 安装不自动修改 Codex 主模型、权限、MCP 或项目代码。

### 升级

- 由 Git tag 和 Plugin version 绑定同一发布基线；
- 先构建 staging，再执行 manifest、Skill、链接、敏感文件和版本校验；
- 只替换由 Plugin 所有的制品，不覆盖用户未知资产；
- 升级后重新打开 Codex，并进行 Fresh Session 读回。

### 回滚

- 通过上一个版本化 Plugin 制品恢复；
- 不删除用户项目、Project Memory、反馈记录或 Codex 其他 Plugin；
- 失败时保留错误状态和原版本，不静默切换到未知路径。

## 7. 验收设计

### 7.1 选择性吸收验收

- Feedback 能记录 Project ID 与 Repository Fingerprint；
- 模型记录能区分 Requested / Runtime / Diagnostic 三类证据；
- Skill 路由用例能验证主能力、辅助能力和禁止能力；
- Self Evolution Proposal 能拒绝证据不足或重复提案；
- 以上变化不修改 Runtime Core、Permission、Gate、Manifesto、ADR 或核心生命周期。

### 7.2 Plugin 验收

- `.codex-plugin/plugin.json` 通过官方 Plugin 校验；
- Plugin 仅包含一个 AI CTO Skill，不包含未批准的 Hook、App、MCP 或 Runtime；
- 发行 staging 不包含个人 Memory、真实项目反馈、Secrets、`.git` 或工作树；
- Skill 的 Portable Root、`NOT_AVAILABLE` 和显式 OFF 行为通过测试；
- 现有 `212 / 212` Node 回归保持通过；
- 安装、重复安装、版本升级、冲突和回滚测试通过；
- 新 Codex 对话完成 Fresh Session Pilot；
- 实际执行仍由 Codex Host 承担，AI CTO 只提供治理和上下文。

## 8. 非目标

本设计不实现：

- 自动模型切换；
- 自动跨聊天采集；
- 自动多 Agent Reviewer；
- 真实 Codex Capability Activation；
- MCP / App / Hook 接入；
- AI CTO 自身无人监督修改；
- 共享多用户中央 Memory；
- 把 Plugin 安装视为生产可用或权限授权。

## 9. 风险与回滚边界

| 风险 | 等级 | 处理 |
|---|---|---|
| Plugin 包误包含创建者私人记忆 | High | 白名单 staging、敏感路径扫描、发布前内容读回 |
| Plugin 与现有 Skill 重复加载 | Medium | 保留单一 Skill 名称，安装前检查冲突，旧 Gateway 作为兼容路径 |
| Codex 不同 surface 行为不一致 | Medium | Fresh Session Pilot；无法验证时标记 `NOT_AVAILABLE` |
| Plugin manifest 或宿主版本不兼容 | Medium | 官方校验、版本绑定、安装前 doctor/dry-run 候选 |
| 用户误以为 Plugin 获得自动执行权 | High | 描述、README、Skill 和安装结果明确 `NONE` 边界 |

任何风险未关闭时，Plugin 发布状态保持 `NOT_READY`，不以文件存在或 manifest 可解析代替宿主验收。

## 10. 实施顺序

1. 在现有 Governance / Evidence / Execution Routing / Self Evolution 文档中实现四项小增强；
2. 为增强项补充确定性测试与当前边界扫描；
3. 创建根 `.codex-plugin/plugin.json` 和白名单发行 staging；
4. 使用 Plugin 校验器验证 manifest、Skill、敏感路径和版本；
5. 构建本地 Plugin ZIP，运行安装/重复安装/回滚验证；
6. 在新 Codex 对话完成 Fresh Session Pilot；
7. 形成 Release Evidence 后再决定是否创建新的版本标签或推送制品。

任何步骤失败都停留在当前步骤，不进入自动执行或真实外部 Capability 接入。
