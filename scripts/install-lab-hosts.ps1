$ErrorActionPreference = "Stop"

$hostsPath = Join-Path $env:SystemRoot "System32\drivers\etc\hosts"
$markerStart = "# cli-node-lab hosts"
$markerEnd = "# end cli-node-lab hosts"
$entries = @(
  "127.0.0.1 lab.home.arpa",
  "127.0.0.1 gitea.lab.home.arpa",
  "127.0.0.1 n8n.lab.home.arpa",
  "127.0.0.1 webui.lab.home.arpa",
  "127.0.0.1 ollama.lab.home.arpa",
  "127.0.0.1 node.lab.home.arpa",
  "127.0.0.1 python.lab.home.arpa",
  "127.0.0.1 ai.lab.home.arpa",
  "127.0.0.1 cpp.lab.home.arpa"
)

$principal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
if (-not $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
  throw "Run this script from an elevated PowerShell session."
}

$content = if (Test-Path $hostsPath) { Get-Content -Raw $hostsPath } else { "" }
$pattern = "(?ms)^\Q$markerStart\E\r?\n.*?^\Q$markerEnd\E\r?\n?"
$cleanContent = [regex]::Replace($content, $pattern, "")
$block = ($markerStart, $entries, $markerEnd) -join "`r`n"
$newContent = ($cleanContent.TrimEnd(), "", $block, "") -join "`r`n"

Set-Content -Path $hostsPath -Value $newContent -Encoding ascii
ipconfig /flushdns | Out-Null

Write-Host "Installed cli-node-lab host mappings into $hostsPath"
Write-Host ""
Write-Host ($entries -join "`n")
