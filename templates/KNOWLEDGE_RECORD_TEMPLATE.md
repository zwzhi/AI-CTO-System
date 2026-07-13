# Knowledge Record

## Record Identity

| Field | Value |
|---|---|
| Knowledge ID | `{KNOWLEDGE_ID}` |
| Title | `{TITLE}` |
| Type | `{PROJECT_EXPERIENCE / ARCHITECTURE_PATTERN / ENGINEERING_PATTERN / AGENT_PATTERN / PROMPT_PATTERN / BUG_SOLUTION / DECISION_RECORD / FAILURE_EXPERIENCE / BUSINESS_INSIGHT}` |
| Source Project | `{PROJECT_ID / VERSION / COMMIT}` |
| Owner | `{OWNER}` |
| Record Version | `{VERSION}` |
| Created Time | `{ISO_8601_WITH_TIMEZONE}` |
| Lifecycle Status | `{CAPTURED / VALIDATING / VALIDATED / ACTIVE / DEPRECATED / ARCHIVED}` |
| Last Validated | `{ISO_8601_WITH_TIMEZONE / NOT_VALIDATED}` |
| Next Review | `{ISO_8601_WITH_TIMEZONE}` |
| Related ADR | `{ADR_ID_AND_LINK / NONE}` |

## Knowledge Content

### Background

{SOURCE_CONTEXT_AND_CONSTRAINTS}

### Problem

{PROBLEM_SYMPTOMS_AND_IMPACT}

### Solution

{OBSERVED_SOLUTION_OR_PATTERN_WITH_TRADE_OFFS}

### Applicable Scenario

{MATCHING_PROJECT_TYPE_SCALE_TECHNOLOGY_ENVIRONMENT_AND_CONSTRAINTS}

### Non Applicable Scenario

{KNOWN_OUT_OF_SCOPE_OR_UNVERIFIED_SCENARIOS}

### Limitations

{KNOWN_LIMITATIONS_UNKNOWNS_AND_COUNTEREXAMPLES}

### Risk If Misapplied

{EXPECTED_HARM_IF_USED_OUTSIDE_SCOPE}

## Knowledge Admission Review

| Review Field | Value |
|---|---|
| Knowledge Type | `{TYPE}` |
| Source Evidence | `{EVIDENCE_REFERENCES}` |
| Evidence Level | `{L1 / L2 / L3 / L4}` |
| Confidence | `{L1 / L2 / L3 / L4_WITH_REASON}` |
| Applicable Scenario | `{SCOPED_APPLICABILITY}` |
| Non Applicable Scenario | `{SCOPED_EXCLUSIONS}` |
| Risk If Misapplied | `{MISAPPLICATION_RISK}` |
| Validation Requirement | `{REQUIRED_CHECKS_BEFORE_NEXT_STATUS}` |
| Review Disposition | `{ACCEPT_FOR_VALIDATION / REJECT_FROM_MIGRATION}` |

Admission Review is not a lifecycle status and never authorizes `ACTIVE`.

## Evidence

| Evidence ID | Source / Version | Observation | Supports | Limitations |
|---|---|---|---|---|
| `{EVIDENCE_ID}` | `{PATH_COMMIT_OR_EXTERNAL_SOURCE}` | `{OBSERVATION}` | `{CLAIM}` | `{LIMITATION}` |

## Confidence Level

- Evidence Level: `{L1 / L2 / L3 / L4}`
- Confidence Level: `{L1 / L2 / L3 / L4}`
- Rationale: `{WHY_CONFIDENCE_DOES_NOT_EXCEED_EVIDENCE}`

## Quality Score

| Dimension | Score | Maximum | Rationale |
|---|---:|---:|---|
| Accuracy | `{SCORE}` | 25 | `{RATIONALE}` |
| Reuse Value | `{SCORE}` | 20 | `{RATIONALE}` |
| Validation Depth | `{SCORE}` | 20 | `{RATIONALE}` |
| Completeness | `{SCORE}` | 15 | `{RATIONALE}` |
| Timeliness | `{SCORE}` | 10 | `{RATIONALE}` |
| Applicability | `{SCORE}` | 10 | `{RATIONALE}` |
| **Quality Score** | **`{TOTAL}`** | **100** | `{RECOMMENDATION}` |

## Validation Requirement

{EVIDENCE_METHOD_COUNTEREXAMPLES_AND_EXIT_CONDITIONS}

## Lifecycle Transition History

| Time | From | To | Validation Action | Evidence | Approver |
|---|---|---|---|---|---|
| `{TIME}` | `NONE` | `CAPTURED` | `{CAPTURE_ACTION}` | `{EVIDENCE}` | `{APPROVER}` |
| `{TIME}` | `CAPTURED` | `VALIDATING` | `{VALIDATION_START}` | `{EVIDENCE}` | `{APPROVER}` |

Transitions not completed must not be prefilled. `ACTIVE` requires a separate Activation Review.

## Reuse History

| Target Project | Record Version | Scope Match | Decision | Required Gates | Result / New Evidence |
|---|---|---|---|---|---|
| `{PROJECT_OR_NONE}` | `{VERSION}` | `{MATCH}` | `{ADOPT / ADAPT / REFERENCE_ONLY / REJECT}` | `{GATES}` | `{RESULT}` |

## Security, Privacy and License

{DATA_CLASSIFICATION_REDACTION_LICENSE_AND_ACCESS_BOUNDARY}

## Related Knowledge

{RELATED_KNOWLEDGE_IDS_AND_RELATION_TYPES / NONE}

## Change History

| Version | Time | Change | Reason | Author |
|---|---|---|---|---|
| `{VERSION}` | `{TIME}` | `{CHANGE}` | `{REASON}` | `{AUTHOR}` |
