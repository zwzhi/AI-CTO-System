# ADR-0001：项目生命周期中的 Research 与 Evaluation 顺序

- 状态：Accepted
- 日期：2026-07-13
- 决策者：AI CTO System 项目创建者、AI CTO

## 背景

AI CTO 的 Phase 定义先执行项目评估再执行开源调研，而生命周期状态枚举同时包含 RESEARCH 与 EVALUATION。不同项目的不确定性来源不同，固定单一路径可能造成无效调研或缺少证据的评估。

## 决策

IDEA 之后允许根据首要不确定性选择 RESEARCH 或 EVALUATION。进入 DESIGN 前，两种状态都必须完成。

## 选择理由

该方案保留 Phase 0–7 的职责边界，同时允许状态机按证据需求调整执行顺序，并设置进入 DESIGN 的统一门槛。

## 替代方案

- 固定先 RESEARCH：可能在价值尚未确认前投入调研。
- 固定先 EVALUATION：可能在证据不足时形成低质量判断。

## 后果

PROJECT_STATE 必须明确当前状态、转换证据和下一动作；AI CTO 不得因路径可调整而跳过任一状态。
