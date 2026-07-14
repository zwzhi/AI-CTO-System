# Codex Capability Evidence Acquisition

## Scope and non-action boundary

本记录只收集重新评估所需的公开与本地 Evidence。没有接入、安装、调用真实 Codex、API、MCP、网络 Provider 或工具，也没有创建 Capability Registry Record、Activation 或 Runtime 变更。

## 1. Capability Identity

| Field | Evidence | Status | Level / Confidence |
|---|---|---|---|
| Capability Name | 官方公开资料将 Codex 描述为用于软件开发的 coding agent。 | VERIFIED | L2 / Medium |
| Provider | OpenAI 官方 Terms 与 Codex 公开资料。 | VERIFIED | L2 / High |
| Source | Official public product and policy pages; exact integration source/artifact has not been selected. | PARTIALLY_VERIFIED | L2 / Medium |
| Version | No selected provider version, model, CLI build, SDK or immutable artifact. | UNKNOWN | N/A |
| Artifact | No package, binary, container, API endpoint or commit has been acquired. | UNKNOWN | N/A |

Official sources: [Codex collection](https://help.openai.com/en/collections/14937394-codex), [Terms of Use](https://openai.com/policies/terms-of-use/).

## 2. License Evidence

| Field | Evidence | Status |
|---|---|---|
| License | No selected Codex artifact license has been verified. | UNKNOWN |
| Usage Terms | OpenAI Terms of Use and Service Terms are publicly available and must be reviewed against the selected surface/account agreement. | VERIFIED at policy level |
| Commercial Restriction | Agreement and plan specific; no target plan or contract is selected. | UNKNOWN for this candidate |
| Attribution Requirement | No general attribution rule has been verified. Generated code may carry third-party/open-source license obligations. | PARTIALLY_VERIFIED |

The official Service Terms state that code-generation output, including Codex output, may be subject to third-party licenses. This is a License Review input, not proof that any proposed output is license-clean. [OpenAI Service Terms](https://openai.com/policies/service-terms/)

## 3. Permission Evidence

### Least Privilege Requirement

| Permission | Minimum future scope | Current evidence / status |
|---|---|---|
| File access | Task-scoped, read-only references in Execution Context. | Local contract verified L3; real Provider enforcement UNKNOWN. |
| Project access | Explicit project/task allowlist only. | Required by governance; Provider enforcement UNKNOWN. |
| Git operations | None for analysis/proposal; any future Commit must be separately `CONFIRM_REQUIRED`. | Local Mock rejects; real behavior UNKNOWN. |
| Network access | None for current Mock; future Provider access requires distinct approval and egress review. | UNKNOWN for selected Provider. |
| API permission | None granted. | VERIFIED: no API key or API invocation exists in this project. |

Official Codex guidance describes approval modes with different file/command scopes; its applicability to a future selected integration must be revalidated when a concrete surface/version is chosen. [Codex CLI getting started](https://help.openai.com/en/articles/11096431)

## 4. Security Evidence

| Area | Evidence | Status |
|---|---|---|
| Data flow | OpenAI Terms identify supplied Input and generated Output as Content; a concrete future integration data flow is not designed. | PARTIALLY_VERIFIED / L2 |
| Execution environment | Local Mock has no external execution. A real Provider's sandbox, network, storage and retention scope is not selected. | UNKNOWN |
| Secret requirement | No credential is configured or requested in the current project. | VERIFIED / L3 |
| Code access range | Local contract limits references; real Provider enforcement is unknown. | PARTIALLY_VERIFIED |
| Potential risk | Sensitive code/context disclosure, excessive file/Git permission, supply-chain/license risk, output error and budget exhaustion. | High risk candidate |

OpenAI's Terms require users to review output for accuracy and appropriateness; that supports human review but does not replace a project-specific security review. [Terms of Use](https://openai.com/policies/terms-of-use/)

## 5. Cost Evidence

| Field | Evidence | Status |
|---|---|---|
| Fee model | Official Codex materials describe plan- and token/credit-based usage models. | VERIFIED at model level / L2 |
| Token cost | No selected plan, model or rate card baseline. | UNKNOWN |
| Call limits | Plan and usage dependent; no account or plan is selected. | UNKNOWN |
| Budget impact | Cannot calculate Cost per Task or Cost per Successful Output. | UNKNOWN |

Official pricing materials show that Codex usage and pricing vary by plan and token/credit model; exact cost must be frozen for the selected surface/version before evaluation. [Codex rate card](https://help.openai.com/en/articles/20001106-codex-rate-card), [OpenAI pricing](https://openai.com/business/pricing/)

## 6. Compatibility Evidence

| Target | Evidence | Status |
|---|---|---|
| Runtime | Local Mock path ran `Runtime → Adapter → Result/Evidence → Audit` with 33 passing local tests. | VERIFIED / L3, Mock-only |
| Capability Adapter | Provider-neutral `CodexInvocationPort` and Adapter contract exist. | VERIFIED / L3, contract-only |
| Audit | Local Runtime appends Result, Evidence, permission references and budget snapshot. | VERIFIED / L3, Mock-only |
| Permission / Budget | Local tests verify missing permission, approval barrier and budget denial. | VERIFIED / L3, Mock-only |
| Real Provider compatibility | Protocol, auth, cancellation, timeout, version drift, data format and platform behavior untested. | UNKNOWN |

## 7. Fallback Evidence

| Fallback | Evidence | Status |
|---|---|---|
| Local `MockCodexCapability` | Implemented deterministic local fixture; no external side effects. | VERIFIED / L3 |
| Alternate Engineering Capability | No provider has passed Admission/Evaluation. | UNKNOWN |
| Manual human workflow | Existing Design/Development/Gate workflow remains available without a Capability invocation. | VERIFIED / L3 |

Fallback does not authorize another Provider; every replacement must complete its own Admission, Evaluation, Registry and Activation evidence chain.

## 8. Evidence Confidence and sources

| Evidence group | Level | Confidence | Source |
|---|---|---|---|
| Local Mock contract, Guard and Audit tests | L3 | High within Mock scope | [Mock implementation report](../runtime/MOCK_CODEX_CAPABILITY_IMPLEMENTATION_REPORT.md) |
| Provider identity and public service/usage policies | L2 | Medium | Official OpenAI public pages cited above |
| Source artifact, version, exact license, plan/rate, real compatibility | N/A | None | UNKNOWN; no selected Provider artifact or account |

## Capability status conclusion

No Registry transition is authorized by this acquisition pass:

| Field | Value |
|---|---|
| Registry Record | `ABSENT` |
| Registry Status | `N/A` |
| Proposed Registry Status | `DISCOVERED` |
| Evaluation Result | `BLOCKED` |
| Admission Result | `REJECT_OR_DEFER` |
| Selection | `PROHIBITED` |
| Activation Scope | `NONE` |

The acquired public evidence improves readiness documentation but does not remove the License, source/version, permission, security, cost or real-compatibility blockers.
