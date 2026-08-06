[CmdletBinding()]
param()

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Get-NormalizedPath {
  param([Parameter(Mandatory = $true)][string]$Path)
  return [System.IO.Path]::GetFullPath($Path).TrimEnd('\')
}

function Test-PathInside {
  param(
    [Parameter(Mandatory = $true)][string]$Child,
    [Parameter(Mandatory = $true)][string]$Parent
  )

  $normalizedChild = Get-NormalizedPath $Child
  $normalizedParent = (Get-NormalizedPath $Parent) + '\'
  return $normalizedChild.StartsWith(
    $normalizedParent,
    [System.StringComparison]::OrdinalIgnoreCase
  )
}

function Assert-True {
  param(
    [Parameter(Mandatory = $true)][bool]$Condition,
    [Parameter(Mandatory = $true)][string]$Message
  )

  if (-not $Condition) {
    throw $Message
  }
}

function Assert-Equal {
  param(
    [Parameter(Mandatory = $true)]$Actual,
    [Parameter(Mandatory = $true)]$Expected,
    [Parameter(Mandatory = $true)][string]$Message
  )

  if ($Actual -ne $Expected) {
    throw "$Message Expected: $Expected Actual: $Actual"
  }
}

function Assert-JunctionTarget {
  param(
    [Parameter(Mandatory = $true)][string]$Path,
    [Parameter(Mandatory = $true)][string]$ExpectedTarget
  )

  $item = Get-Item -LiteralPath $Path -Force
  Assert-Equal $item.LinkType 'Junction' 'Destination must be a Junction.'
  $rawTarget = if ($item.Target -is [System.Array]) { $item.Target[0] } else { $item.Target }
  Assert-True (-not [string]::IsNullOrWhiteSpace([string]$rawTarget)) 'Junction target must be present.'
  Assert-Equal (Get-NormalizedPath ([string]$rawTarget)) (Get-NormalizedPath $ExpectedTarget) 'Junction target must match canonical source.'
}

function Invoke-Installer {
  param([Parameter(Mandatory = $true)][string[]]$Arguments)

  $output = & powershell -NoProfile -ExecutionPolicy Bypass -File $installer @Arguments 2>&1
  return [pscustomobject]@{
    ExitCode = $LASTEXITCODE
    Output = ($output -join [Environment]::NewLine)
  }
}

$repoRoot = Split-Path -Parent $PSScriptRoot
$installer = Join-Path $repoRoot 'scripts\install-ai-cto-skill.ps1'
$expectedSource = Join-Path $repoRoot 'skills\ai-cto-system'
$tempRoot = Get-NormalizedPath $env:TEMP
$testRoot = Join-Path $tempRoot ("ai-cto-skill-gateway-tests-{0}" -f [guid]::NewGuid().ToString('N'))
$testSkillRoot = Join-Path $testRoot 'skills'
$destination = Join-Path $testSkillRoot 'ai-cto-system'

Assert-True (Test-Path -LiteralPath $installer) 'Installer script must exist.'
Assert-True (Test-PathInside $testRoot $tempRoot) 'Test root must remain inside the system temp directory.'

New-Item -ItemType Directory -Path $testSkillRoot -Force | Out-Null

try {
  $firstInstall = Invoke-Installer @('-SkillRoot', $testSkillRoot)
  Assert-Equal $firstInstall.ExitCode 0 'First installation must succeed.'
  Assert-JunctionTarget $destination $expectedSource

  $secondInstall = Invoke-Installer @('-SkillRoot', $testSkillRoot)
  Assert-Equal $secondInstall.ExitCode 0 'Second installation must succeed.'
  Assert-True $secondInstall.Output.Contains('ALREADY_INSTALLED') 'Second installation must report idempotent success.'
  Assert-JunctionTarget $destination $expectedSource

  $rollback = Invoke-Installer @('-SkillRoot', $testSkillRoot, '-Remove')
  Assert-Equal $rollback.ExitCode 0 'Verified rollback must succeed.'
  Assert-True (-not (Test-Path -LiteralPath $destination)) 'Rollback must remove the Junction only.'
  Assert-True (Test-Path -LiteralPath $expectedSource) 'Rollback must preserve the canonical source.'

  New-Item -ItemType Directory -Path $destination | Out-Null
  $sentinel = Join-Path $destination 'preserve-me.txt'
  Set-Content -LiteralPath $sentinel -Value 'preserve' -Encoding ASCII

  $conflictInstall = Invoke-Installer @('-SkillRoot', $testSkillRoot)
  Assert-True ($conflictInstall.ExitCode -ne 0) 'Conflict installation must fail.'
  Assert-True (Test-Path -LiteralPath $sentinel) 'Conflict contents must remain untouched.'

  $conflictRollback = Invoke-Installer @('-SkillRoot', $testSkillRoot, '-Remove')
  Assert-True ($conflictRollback.ExitCode -ne 0) 'Unverified rollback must fail.'
  Assert-True (Test-Path -LiteralPath $sentinel) 'Unverified target must remain untouched.'

  Write-Output 'PASS: AI CTO Skill installer is idempotent and conflict-safe.'
}
finally {
  if (Test-Path -LiteralPath $testRoot) {
    Assert-True (Test-PathInside $testRoot $tempRoot) 'Cleanup target escaped the system temp directory.'
    Remove-Item -LiteralPath $testRoot -Recurse -Force
  }
}
