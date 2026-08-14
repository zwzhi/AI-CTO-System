[CmdletBinding()]
param()

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Assert-True {
  param(
    [Parameter(Mandatory = $true)][bool]$Condition,
    [Parameter(Mandatory = $true)][string]$Message
  )

  if (-not $Condition) {
    throw $Message
  }
}

function Assert-Contains {
  param(
    [Parameter(Mandatory = $true)][string]$Text,
    [Parameter(Mandatory = $true)][string]$Expected,
    [Parameter(Mandatory = $true)][string]$Message
  )

  if (-not $Text.Contains($Expected)) {
    throw "$Message Missing: $Expected"
  }
}

$repoRoot = Split-Path -Parent $PSScriptRoot
$skillFile = Join-Path $repoRoot 'skills\ai-cto-system\SKILL.md'
$skillText = Get-Content -LiteralPath $skillFile -Raw -Encoding UTF8

$routeFirst = 'Classify the route before loading authority documents.'
$authorityLoading = 'Load authority documents only after routing.'

Assert-Contains $skillText $routeFirst 'Routing must precede authority loading.'
Assert-Contains $skillText $authorityLoading 'Authority loading must be route-dependent.'

$routeIndex = $skillText.IndexOf($routeFirst, [System.StringComparison]::Ordinal)
$authorityIndex = $skillText.IndexOf($authorityLoading, [System.StringComparison]::Ordinal)
$optOutIndex = $skillText.IndexOf('## Apply opt-out first', [System.StringComparison]::Ordinal)
Assert-True ($optOutIndex -ge 0 -and $optOutIndex -lt $routeIndex) 'Explicit opt-out must be applied before routing.'
Assert-True ($routeIndex -ge 0 -and $routeIndex -lt $authorityIndex) 'The route-first rule must appear before authority loading.'

Assert-Contains $skillText '| `L0` | No AI CTO workflow / `R0` | Current request only |' 'L0 must stay outside AI CTO workflow.'
Assert-Contains $skillText '| `L1` | Instant / LIGHT / `R1` / TARGETED | Current file, governing paragraph, necessary Git state |' 'L1 must use the light route.'
Assert-Contains $skillText '| `L2` | Engineering / STANDARD / `R2` / CHANGE_IMPACT_AND_TARGETED | Project Memory and related requirement, design, task, tests |' 'L2 must use the engineering route.'
Assert-Contains $skillText '| `L3` | Design + Engineering / STANDARD / `R3` / CHANGE_IMPACT_AND_TARGETED | Project Memory, Architecture, related ADR, Knowledge, impact scope |' 'Normal L3 must use the standard route while preserving design and impact controls.'
Assert-Contains $skillText '| `L4` | CTO / STRICT / `R4` / FULL_GATE | User Brain, Portfolio, Knowledge, project context, applicable Gates |' 'L4 must use the CTO route.'

Assert-Contains $skillText 'For L0, use ordinary handling without AI CTO context or a route line.' 'L0 must not expose or start AI CTO routing.'
Assert-Contains $skillText 'Do not create a new Phase, ADR, design specification, review document, or Gate artifact for L1' 'L1 must resist process inflation.'
Assert-Contains $skillText 'do not scan the full repository or load the complete Memory or Knowledge corpus' 'L1 must keep context targeted.'
Assert-Contains $skillText 'Using this Skill does not itself raise a request to L3 or L4.' 'Skill invocation must not inflate task weight.'
Assert-Contains $skillText 'Route: L1 / Instant / LIGHT / R1 | Context: targeted | Validation: targeted' 'Governed project work must expose one concise route line.'
Assert-Contains $skillText 'The route line must contain the actual selected values; the L1 line above is only a format example.' 'Route visibility must report the current decision rather than a fixed L1 value.'
Assert-Contains $skillText 'The route line is informational, not an approval pause.' 'Route visibility must not add a confirmation round.'
Assert-Contains $skillText 'Preserve existing ADR, Gate, Human Control, memory, audit, evidence, permission, and budget rules.' 'Routed work must preserve governance controls.'

Assert-Contains $skillText '## Automatic intervention contract' 'The automatic contract heading must exist.'
Assert-Contains $skillText 'Apply opt-out first' 'Opt-out must remain the first decision.'
Assert-Contains $skillText 'Resolve the target project' 'Target project resolution must be explicit.'
Assert-Contains $skillText 'For a new idea, enter Idea Intake' 'New ideas must enter Idea Intake.'
Assert-Contains $skillText 'For an existing project, read PROJECT_STATE.md' 'Existing projects must resume from project state.'
Assert-Contains $skillText 'For each relevant message' 'Continuation output must be explicit.'
Assert-Contains $skillText 'Current result' 'Continuation output must include the current result.'
Assert-Contains $skillText 'Evidence and limitations' 'Continuation output must include evidence and limitations.'
Assert-Contains $skillText 'Unique next action' 'Continuation output must include one next action.'
Assert-Contains $skillText 'Do not create a new session state source' 'No second session state source may be created.'

$contractIndex = $skillText.IndexOf('## Automatic intervention contract', [System.StringComparison]::Ordinal)
$automaticRouteIndex = $skillText.IndexOf('## Route before loading authority', [System.StringComparison]::Ordinal)
$automaticAuthorityIndex = $skillText.IndexOf('## Load routed authority', [System.StringComparison]::Ordinal)
Assert-True ($contractIndex -ge 0 -and $contractIndex -lt $automaticRouteIndex) 'Automatic intervention must be declared before route selection.'
Assert-True ($automaticRouteIndex -ge 0 -and $automaticRouteIndex -lt $automaticAuthorityIndex) 'Route-first ordering must remain intact.'

Write-Output 'PASS: AI CTO Skill routing preflight contract is valid.'
