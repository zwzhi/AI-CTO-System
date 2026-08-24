# Finalization Integrity Design

## 1. Goal

将 GitHub 上 `no-negative-echo` Skill 的有效思想吸收到 AI CTO System 的现有治理体系中，减少被否决的临时方案、用户措辞纠正和会话过程残留进入最终交付物的风险。

本设计只增强最终交付质量，不改变 AI CTO System 的使命、五层架构、生命周期、Runtime、Permission、Gate、Capability 或 Knowledge 权威关系。

## 2. Adopted Principles

### 2.1 Accepted Final State First

最终标题、文件名、注释、Commit、PR、Release 文案和 Handoff 必须从当前已接受、已验证的最终状态生成，而不是从完整会话记录逐词删改。

### 2.2 Session Residue versus Real Change

区分两类信息：

- 仅在会话中讨论、被否决、未进入基线的临时方案：默认不进入最终交付；
- 已经实际执行、进入基线或为安全、迁移、兼容、审计所必需的事实：必须如实保留。

### 2.3 Surface-by-Surface Review

交付检查覆盖所有可见表面：

- 文件名和标题；
- 正文和代码注释；
- 元数据、标签和生成包装；
- Commit subject/body；
- Pull Request 标题/body；
- Release 报告；
- Handoff 和用户交付说明；
- 必须保留的 Audit Evidence。

### 2.4 Positive Regeneration

当用户否定了某个方案时，优先重新描述采用的正向结果，而不是把“没有采用某方案”改写成同义词、括号说明或隐晦表达。

### 2.5 Frozen Finalization for High-Assurance Surfaces

涉及 Commit、PR、Release、外部发送、生产变更、敏感信息、难回滚动作或压缩/委托上下文时，采用：

```text
Preflight → Freeze → Authorized Action → Readback → Postflight
```

冻结内容后不得在执行动作中重新生成；读取真实结果后再次检查。

## 3. Deliberately Excluded

本设计不引入以下内容：

1. 不安装或依赖外部 `no-negative-echo` Skill；
2. 不创建新的 Phase、Layer、Module、Capability、Agent 或审批系统；
3. 不建立对词语的全局禁用清单；
4. 不因“避免负向回声”而隐藏真实删除、迁移、安全、兼容、审计或用户要求的对比事实；
5. 不把文本扫描通过解释为语义正确或模型行为得到证明；
6. 本次整合不实现或触发自动模型切换、工具调用或 Runtime 行为变化；Phase 8.4 的模型路由治理保持独立、现状不变，未来仍可在单独授权下实现宿主模型切换；
7. 不覆盖用户已有改动、已执行外部事件或真实失败记录。

## 4. Integration Design

### 4.1 AI CTO Skill Gateway

在 `skills/ai-cto-system/SKILL.md` 增加最终交付规则：先确定 Accepted Final State，再按表面检查交付包装；重要交付需要 Readback 和结果/限制报告。

### 4.2 Root Governance Skill

在根 `SKILL.md` 增加同一规则的权威摘要，确保项目内 Codex 读取入口时知道：会话历史不是最终交付事实，真实基线变化和审计事实不能被隐藏。

### 4.3 Delivery and Release

在现有 Delivery、Release 和 Git 规范中加入交付表面清单与高保障顺序，不增加新的 Gate。现有 Release Gate 和回滚规则继续拥有最终授权权。

### 4.4 Audit and Evidence

Audit 记录真实发生的动作、结果、失败和必要变更；不把临时草案或被否方案当作最终事实，也不删除为审计所需的过程证据。

### 4.5 Execution Feedback

将“最终交付是否含会话残留”作为可记录的 Quality Outcome / Routing Evidence，但单次发现只形成 Observation，不自动改变路由或 Skill 行为。

## 5. Authority and Data Flow

```text
Requirement / Approved Design / Actual Diff / Validation Evidence
                              ↓
                    Accepted Final State
                              ↓
                    Surface Classification
                              ↓
             Positive Finalization + Required Facts
                              ↓
                       Readback / Audit
                              ↓
                   Commit / PR / Release / Handoff
```

Finalization Integrity 是横向质量约束，不拥有项目价值判断、架构决策、Gate 授权、Capability 激活或 Runtime 状态推进权。

## 6. Acceptance Criteria

实施完成后必须满足：

1. Skill Gateway 与根治理入口都包含 Accepted Final State、真实变化保留和 Surface Review 规则；
2. Delivery/Git/Audit 规范之间没有互相冲突的表述；
3. Commit、PR、Release、Handoff 都有明确的最终状态来源和 Readback 要求；
4. 安全、迁移、兼容、审计和真实外部事件不会因本规则被隐藏；
5. 明确声明文本扫描不是语义正确性证明；
6. 不修改 Runtime、Permission、Gate、Manifesto、ADR、Capability Registry 或 Knowledge 生命周期；
7. `git diff --check`、范围扫描和文档交叉引用检查通过。

## 7. Evidence and Confidence

- Source: `LB623/no-negative-echo` public repository, MIT License。
- Evidence: `README.md`、`SKILL.md`、`high-assurance-finalization.md` 和 `evaluation-protocol.md`。
- Confidence: `L2`，公开资料支持；尚未在 AI CTO System 中完成实施后验证。
- Limitation: 该 Skill 自身明确属于提示词层缓解，不保证语义级绝对消除；集成后仍需在真实项目中收集 Evidence。

## 8. Implementation Boundary

下一步只允许实施本文定义的文档和入口同步。实施完成后需要更新 Project Memory 与 Development Progress，并进行针对性的交付表面示例验证；不得借此进入新的 Runtime、Capability 或自动化开发阶段，也不改变 Phase 8.4 的模型路由实施边界。

## 9. Implementation Status

2026-08-24：已完成文档-only 集成。状态源漂移已修复；Finalization Integrity Standard、根 SKILL、Gateway Skill、Delivery、Git、Audit、Execution Feedback 和 Release Approval 入口已同步。未安装外部 Skill、未新增 Module、未修改 Runtime、Permission、Gate、模型路由执行或 `executionAuthorization`。
