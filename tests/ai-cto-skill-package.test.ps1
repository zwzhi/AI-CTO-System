[CmdletBinding()]
param()

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Assert-True {
  param(
    [Parameter(Mandatory = $true)]
    [bool]$Condition,
    [Parameter(Mandatory = $true)]
    [string]$Message
  )

  if (-not $Condition) {
    throw $Message
  }
}

function Assert-Contains {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Text,
    [Parameter(Mandatory = $true)]
    [string]$Expected,
    [Parameter(Mandatory = $true)]
    [string]$Message
  )

  if (-not $Text.Contains($Expected)) {
    throw "$Message Missing: $Expected"
  }
}

function Assert-Match {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Text,
    [Parameter(Mandatory = $true)]
    [string]$Pattern,
    [Parameter(Mandatory = $true)]
    [string]$Message
  )

  if ($Text -notmatch $Pattern) {
    throw "$Message Pattern: $Pattern"
  }
}

$repoRoot = Split-Path -Parent $PSScriptRoot
$skillRoot = Join-Path $repoRoot 'skills\ai-cto-system'
$skillFile = Join-Path $skillRoot 'SKILL.md'
$metadataFile = Join-Path $skillRoot 'agents\openai.yaml'
$quickValidate = Join-Path $env:USERPROFILE '.codex\skills\.system\skill-creator\scripts\quick_validate.py'

Assert-True (Test-Path -LiteralPath $skillFile) 'SKILL.md must exist.'
Assert-True (Test-Path -LiteralPath $metadataFile) 'agents/openai.yaml must exist.'
Assert-True (Test-Path -LiteralPath $quickValidate) 'Official quick_validate.py must exist.'

$skillText = Get-Content -LiteralPath $skillFile -Raw -Encoding UTF8
$metadataText = Get-Content -LiteralPath $metadataFile -Raw -Encoding UTF8
$doNotUse = (-join @([char]0x4E0D, [char]0x8981, [char]0x4F7F, [char]0x7528)) + ' AI CTO System'
$ordinaryMode = -join @([char]0x666E, [char]0x901A, [char]0x6A21, [char]0x5F0F, [char]0x5904, [char]0x7406)
$disableForRequest = (-join @([char]0x672C, [char]0x6B21, [char]0x7981, [char]0x7528)) + ' AI CTO Skill'

Assert-Match $skillText '^---\r?\nname: ai-cto-system\r?\n' 'Skill name must be canonical.'
Assert-Contains $skillText 'AI_CTO_MODE: OFF' 'Explicit OFF must be documented.'
Assert-Contains $skillText 'AI_CTO_MODE: ON' 'Explicit ON must be documented.'
Assert-Contains $skillText $doNotUse 'Chinese opt-out must be documented.'
Assert-Contains $skillText $ordinaryMode 'Ordinary-mode opt-out must be documented.'
Assert-Contains $skillText $disableForRequest 'Request opt-out must be documented.'
Assert-Contains $skillText 'AI_CTO_SYSTEM_ROOT' 'Portable authority-root configuration must be documented.'
Assert-Contains $skillText 'NOT_AVAILABLE' 'Missing authority roots must fail honestly.'
Assert-Contains $skillText 'Never hard-code a developer''s local path' 'Machine-specific authority paths must be prohibited.'
Assert-True (-not $skillText.Contains('D:\AI Project\AI-CTO-System')) 'The Skill must not contain the original developer-specific authority path.'
Assert-Contains $skillText 'IDEA_INTAKE_PROTOCOL.md' 'New-project route must be present.'
Assert-Contains $skillText 'PROJECT_ONBOARDING_PROTOCOL.md' 'Existing-project route must be present.'
Assert-Contains $metadataText 'allow_implicit_invocation: true' 'Implicit invocation must be enabled.'
Assert-Contains $metadataText 'Automatically classify this request' 'The default prompt must describe implicit classification.'
Assert-True ($skillText.Length -lt 12000) 'Gateway must remain thin.'

Assert-Contains $skillText 'Automatic intervention contract' 'The Skill must expose an automatic-intervention contract.'
Assert-Contains $skillText 'Do not require the user to invoke $ai-cto-system' 'Automatic entry must not require a manual Skill command.'
Assert-Contains $skillText 'PROJECT_STATE.md' 'Continuation must use the target project state.'
Assert-Contains $skillText 'PROJECT_MEMORY.md' 'Continuation must use the target project memory.'
Assert-Contains $skillText 'Current result' 'Governed responses must report the current result.'
Assert-Contains $skillText 'Unique next action' 'Governed responses must report one next action.'
Assert-True (Test-Path -LiteralPath (Join-Path $repoRoot 'docs\intent\AI_CTO_AUTO_INTERVENTION_STANDARD.md')) 'The automatic-intervention standard must exist.'

$env:PYTHONUTF8 = '1'
& python $quickValidate $skillRoot
if ($LASTEXITCODE -ne 0) {
  throw "Official Skill validation failed with exit code $LASTEXITCODE."
}

Write-Output 'PASS: AI CTO Skill package contract is valid.'
