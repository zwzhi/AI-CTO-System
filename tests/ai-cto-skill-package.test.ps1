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
Assert-Contains $skillText 'D:\AI Project\AI-CTO-System' 'Authority root must be explicit.'
Assert-Contains $skillText 'IDEA_INTAKE_PROTOCOL.md' 'New-project route must be present.'
Assert-Contains $skillText 'PROJECT_ONBOARDING_PROTOCOL.md' 'Existing-project route must be present.'
Assert-Contains $metadataText 'allow_implicit_invocation: true' 'Implicit invocation must be enabled.'
Assert-Contains $metadataText '$ai-cto-system' 'Default prompt must name the Skill.'
Assert-True ($skillText.Length -lt 12000) 'Gateway must remain thin.'

$env:PYTHONUTF8 = '1'
& python $quickValidate $skillRoot
if ($LASTEXITCODE -ne 0) {
  throw "Official Skill validation failed with exit code $LASTEXITCODE."
}

Write-Output 'PASS: AI CTO Skill package contract is valid.'
