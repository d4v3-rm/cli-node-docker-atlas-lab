$ErrorActionPreference = "Stop"

$hostsPath = Join-Path $env:SystemRoot "System32\drivers\etc\hosts"
$markerStart = "# cli-node-lab hosts"
$markerEnd = "# end cli-node-lab hosts"

$principal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
if (-not $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
  throw "Run this script from an elevated PowerShell session."
}

if (-not (Test-Path $hostsPath)) {
  Write-Host "Hosts file not found: $hostsPath"
  exit 0
}

$content = Get-Content -Raw $hostsPath
$pattern = "(?ms)^\Q$markerStart\E\r?\n.*?^\Q$markerEnd\E\r?\n?"
$newContent = [regex]::Replace($content, $pattern, "")

Set-Content -Path $hostsPath -Value ($newContent.TrimEnd() + "`r`n") -Encoding ascii
ipconfig /flushdns | Out-Null

Write-Host "Removed cli-node-lab host mappings from $hostsPath"
