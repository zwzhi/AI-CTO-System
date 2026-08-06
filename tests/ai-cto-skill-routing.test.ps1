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
Assert-True ($routeIndex -ge 0 -and $routeIndex -lt $authorityIndex) 'The route-first rule must appear before authority loading.'

Assert-Contains $skillText '| `L0` | No AI CTO workflow / `R0` | Current request only |' 'L0 must stay outside AI CTO workflow.'
Assert-Contains $skillText '| `L1` | Instant / LIGHT / `R1` / TARGETED | Current file, governing paragraph, necessary Git state |' 'L1 must use the light route.'
Assert-Contains $skillText '| `L2` | Engineering / STANDARD / `R2` / CHANGE_IMPACT_AND_TARGETED | Project Memory and related requirement, design, task, tests |' 'L2 must use the engineering route.'
Assert-Contains $skillText '| `L3` | Design + Engineering / STRICT / `R3` / FULL_GATE | Project Memory, Architecture, related ADR, Knowledge, impact scope |' 'L3 must preserve design and impact controls.'
Assert-Contains $skillText '| `L4` | CTO / STRICT / `R4` / FULL_GATE | User Brain, Portfolio, Knowledge, project context, applicable Gates |' 'L4 must use the CTO route.'

Assert-Contains $skillText 'For L0, use ordinary handling without AI CTO context or a route line.' 'L0 must not expose or start AI CTO routing.'
Assert-Contains $skillText 'Do not create a new Phase, ADR, design specification, review document, or Gate artifact for L1' 'L1 must resist process inflation.'
Assert-Contains $skillText 'Using this Skill does not itself raise a request to L3 or L4.' 'Skill invocation must not inflate task weight.'
Assert-Contains $skillText 'Route: L1 / Instant / LIGHT / R1 | Context: targeted | Validation: targeted' 'Governed project work must expose one concise route line.'
Assert-Contains $skillText 'The route line is informational, not an approval pause.' 'Route visibility must not add a confirmation round.'

Write-Output 'PASS: AI CTO Skill routing preflight contract is valid.'
