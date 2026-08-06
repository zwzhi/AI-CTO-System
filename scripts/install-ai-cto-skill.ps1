[CmdletBinding()]
param(
  [string]$SkillRoot = (Join-Path $env:USERPROFILE '.codex\skills'),
  [switch]$Remove
)

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

function Get-JunctionTarget {
  param([Parameter(Mandatory = $true)][System.IO.FileSystemInfo]$Item)

  if ($Item.LinkType -ne 'Junction' -or -not $Item.Target) {
    return $null
  }

  $rawTarget = if ($Item.Target -is [System.Array]) { $Item.Target[0] } else { $Item.Target }
  if ([string]::IsNullOrWhiteSpace([string]$rawTarget)) {
    return $null
  }

  $targetPath = [string]$rawTarget
  if (-not [System.IO.Path]::IsPathRooted($targetPath)) {
    $targetPath = Join-Path $Item.DirectoryName $targetPath
  }

  return Get-NormalizedPath $targetPath
}

try {
  $repositoryRoot = Get-NormalizedPath (Split-Path -Parent $PSScriptRoot)
  $source = Get-NormalizedPath (Join-Path $repositoryRoot 'skills\ai-cto-system')

  if (-not (Test-PathInside $source $repositoryRoot)) {
    throw 'Canonical Skill source escaped the repository root.'
  }

  $skillFile = Join-Path $source 'SKILL.md'
  $metadataFile = Join-Path $source 'agents\openai.yaml'
  if (-not (Test-Path -LiteralPath $skillFile -PathType Leaf)) {
    throw "Canonical Skill source is missing SKILL.md: $skillFile"
  }
  if (-not (Test-Path -LiteralPath $metadataFile -PathType Leaf)) {
    throw "Canonical Skill source is missing agents/openai.yaml: $metadataFile"
  }

  $normalizedSkillRoot = Get-NormalizedPath $SkillRoot
  if (-not (Test-Path -LiteralPath $normalizedSkillRoot)) {
    New-Item -ItemType Directory -Path $normalizedSkillRoot -Force | Out-Null
  }
  if (-not (Test-Path -LiteralPath $normalizedSkillRoot -PathType Container)) {
    throw "Skill root is not a directory: $normalizedSkillRoot"
  }

  $destination = Get-NormalizedPath (Join-Path $normalizedSkillRoot 'ai-cto-system')
  if (-not (Test-PathInside $destination $normalizedSkillRoot)) {
    throw 'Discovery path escaped the configured Skill root.'
  }

  $existing = Get-Item -LiteralPath $destination -Force -ErrorAction SilentlyContinue

  if ($Remove) {
    if ($null -eq $existing) {
      Write-Output 'NOT_INSTALLED'
      Write-Output "Source: $source"
      Write-Output "Discovery: $destination"
      exit 0
    }

    $existingTarget = Get-JunctionTarget $existing
    if ($null -eq $existingTarget -or $existingTarget -ne $source) {
      throw "Refusing to remove an unverified discovery path: $destination"
    }

    [System.IO.Directory]::Delete($destination, $false)
    if (-not (Test-Path -LiteralPath $skillFile -PathType Leaf)) {
      throw 'Canonical Skill source was unexpectedly affected during rollback.'
    }

    Write-Output 'REMOVED'
    Write-Output "Source: $source"
    Write-Output "Discovery: $destination"
    exit 0
  }

  if ($null -ne $existing) {
    $existingTarget = Get-JunctionTarget $existing
    if ($null -eq $existingTarget -or $existingTarget -ne $source) {
      throw "Refusing to replace a conflicting discovery path: $destination"
    }

    Write-Output 'ALREADY_INSTALLED'
    Write-Output "Source: $source"
    Write-Output "Discovery: $destination"
    exit 0
  }

  New-Item -ItemType Junction -Path $destination -Target $source | Out-Null
  $created = Get-Item -LiteralPath $destination -Force
  $createdTarget = Get-JunctionTarget $created
  if ($createdTarget -ne $source) {
    throw "Created Junction does not resolve to the canonical source: $destination"
  }

  Write-Output 'INSTALLED'
  Write-Output "Source: $source"
  Write-Output "Discovery: $destination"
  exit 0
}
catch {
  [Console]::Error.WriteLine($_.Exception.Message)
  exit 1
}
