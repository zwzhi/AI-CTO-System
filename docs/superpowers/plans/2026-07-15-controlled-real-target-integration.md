# Controlled Real Target Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在未来实现 Proposal 到真实非权威 Markdown 目标的确认式、可回滚接入，而不绕过现有治理边界。

**Architecture:** 建立独立的真实目标路由与安全执行适配层，消费既有 Proposal、Audit、Validation 与内存优化器。路由、文件边界、快照/漂移检查、确认、持久审计和停止控制分别负责单一职责；不修改 Self Evolution MVP 或 Runtime Core。

**Tech Stack:** TypeScript、Node.js 24、Node.js Built-in Test Runner、既有 AuditService；具体持久化适配器在实施授权时确定。

## Global Constraints

- 未获后续实现授权前不得创建文件读写、持久化或真实目标执行代码。
- 真实写入一律在单次明确确认后进行；`AUTO_EXECUTE` 不构成文件写入授权。
- 仅项目根目录内、显式白名单、非权威 Markdown 文件；禁止 Manifesto、ADR、Master Plan、Module Registry、Project Memory、Development Progress、README、Gate、生命周期/权限/安全/Runtime 文件。
- 保持 `OptimizationProposal.executionAuthorization = NONE`，不改变 Self Evolution MVP、Runtime Core、Permission 或系统边界。

---

### Task 1: 定义真实目标请求与路由合同

**Files:**
- Create: `optimization-execution/real-target/real-target-contract.ts`
- Create: `optimization-execution/real-target/proposal-routing-service.ts`
- Test: `optimization-execution/real-target/real-target-integration.test.ts`

**Interfaces:**
- Consumes: Proposal/Risk/Autonomy 引用与显式目标列表。
- Produces: `RealTargetExecutionRequest`，状态仅可为 `PREFLIGHT_ONLY`、`WAITING_CONFIRMATION`、`CONFIRMED`、`STOPPED`、`EXPIRED`。

- [ ] 先写失败测试：缺失任一引用、风险未知、白名单为空或禁用目标时，路由拒绝并升级 `CONFIRM_REQUIRED`。
- [ ] 实现最小合同与路由服务：只创建引用型请求，绝不读取或写入文件。
- [ ] 运行专用测试，确认路由只生成 `PREFLIGHT_ONLY` / `WAITING_CONFIRMATION` 请求。
- [ ] 提交：`feat: add real target routing contract`。

### Task 2: 实现预检快照、漂移检查与确认门槛

**Files:**
- Create: `optimization-execution/real-target/real-target-preflight-service.ts`
- Create: `optimization-execution/real-target/real-target-confirmation-service.ts`
- Modify: `optimization-execution/real-target/real-target-integration.test.ts`

**Interfaces:**
- Consumes: 已路由请求与未来文件访问 Port。
- Produces: Before Snapshot、内容摘要、路径规范化结果和一次性确认令牌。

- [ ] 先写失败测试：路径逃逸、符号链接、非 Markdown、权威文件、确认前内容漂移、过期确认均阻断。
- [ ] 实现预检只读 Port；Before Snapshot 必须包含路径、内容摘要、时间和回滚引用；确认前不允许写入。
- [ ] 实现一次性确认：令牌绑定 Proposal、目标、允许动作与 Before Snapshot 摘要。
- [ ] 运行专用测试，确认确认不能复用或扩大范围。
- [ ] 提交：`feat: add real target preflight safety`。

### Task 3: 实现受限写入、回滚、持久审计与停止控制

**Files:**
- Create: `optimization-execution/real-target/real-target-execution-service.ts`
- Create: `optimization-execution/real-target/persistent-audit-port.ts`
- Modify: `optimization-execution/real-target/real-target-integration.test.ts`

**Interfaces:**
- Consumes: 已确认请求、Before Snapshot、既有确定性优化器与验证器。
- Produces: After Snapshot、Validation Evidence、Persistent Audit、完成或回滚结果。

- [ ] 先写失败测试：Audit 写入失败、Kill Switch、验证失败与漂移均停止并恢复 Before Snapshot。
- [ ] 实现单次有界写入：写入前再次检查摘要；写后验证失败必须回滚；不得执行第二个 Proposal。
- [ ] 持久审计仅保存引用、摘要、授权、范围、结果和 Evidence；不保存敏感完整内容。
- [ ] 运行全量测试、范围扫描并验证 Self Evolution/Runtime Core 无差异。
- [ ] 提交：`feat: add confirmed real target execution`。
