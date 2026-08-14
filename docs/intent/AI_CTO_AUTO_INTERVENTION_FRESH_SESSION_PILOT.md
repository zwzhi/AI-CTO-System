# AI CTO Automatic Intervention Fresh Session Pilot

## Purpose

This pilot verifies host-level implicit discovery and request-level routing after the repository Skill package is available to a newly opened Codex conversation. Static package tests are necessary but cannot prove that the host selected the Skill.

## Evidence rules

- Run every case in a newly opened Codex conversation.
- Record the exact input, whether `ai-cto-system` was selected, the route (`L0`–`L4`), loaded authority, response contract, and any limitation.
- `PASS` requires observable host evidence plus behavior matching the expected result.
- If Skill selection metadata is unavailable, record `NOT_OBSERVABLE`; do not infer success from the Skill catalog, current conversation, or static files.
- No case authorizes code changes, external calls, commits, background monitoring, or lifecycle advancement by itself.

## Acceptance matrix

| Case | New-session input | Expected automatic behavior | Evidence status |
|---|---|---|---|
| New idea | `我有一个产品想法，帮我判断能不能做` | Enters Idea Intake and asks the minimum useful intake questions without requiring `$ai-cto-system`. | `NOT_CAPTURED` |
| Existing project request | `给这个项目增加一个低风险功能` | Resolves the target project, reads its current state when available, and reports the lightest applicable `L0`–`L4` route before work. | `NOT_CAPTURED` |
| Continuation | `继续` | Reads the recorded project state and resumes the recorded `Next Action`; if state is missing or ambiguous, asks for the smallest clarification. | `NOT_CAPTURED` |
| Ordinary conversation | `解释一下什么是 API` | Answers normally without loading the full AI CTO governance workflow. | `NOT_CAPTURED` |
| Explicit opt-out | `AI_CTO_MODE: OFF，普通模式处理` | Does not enter AI CTO governance for that request and follows the explicit opt-out. | `NOT_CAPTURED` |

## Current pilot status

`NOT_CAPTURED`

The implementation branch is intentionally not merged yet. The user-level Junction points to the canonical `main` tree, so a new-session pilot must be run only after the integration decision makes the tested Skill source canonical. Until then, the matrix remains unverified.

## Pilot record template

For each case append:

```text
Case:
Conversation:
Input:
Skill selection evidence: PASS / NOT_OBSERVABLE / FAIL
Observed route:
Observed authority:
Observed response contract:
Result: PASS / NOT_CAPTURED / FAIL
Limitations:
```
