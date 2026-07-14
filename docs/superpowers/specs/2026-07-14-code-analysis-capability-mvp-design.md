# Code Analysis Capability MVP Design

**Goal:** Validate a deterministic, evidence-first, read-only Code Analysis Capability without any external access or state change.

**Chosen approach:** A specialised thin contract and adapter, mirroring the isolated Documentation Capability pattern without extending the generic Runtime Core. The caller supplies immutable authorised code contexts; the adapter is the sole component that checks scope, permission, cancellation, and budget before a deterministic assistant creates findings.

**Non-goals:** repository scanning, filesystem reads/writes, network, LLM/Codex/MCP/Provider access, patches, commits, deployment, Workflow/Task/Agent changes, Registry changes, Knowledge writes, or capability activation.

**Required output:** `analysisReport`, `architectureFindings`, `riskFindings`, `technicalDebt`, `evidence`, `confidence`, and `limitations`.

**Success condition:** the end-to-end invocation adds an Audit Event for either a validated analysis or controlled rejection; all evidence is derived from the explicitly authorised in-memory input scope.
