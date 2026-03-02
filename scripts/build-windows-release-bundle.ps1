$ErrorActionPreference = 'Stop'

$rootDir = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$packageJsonPath = Join-Path $rootDir 'package.json'
$distDir = Join-Path $rootDir 'dist'

$packageJson = Get-Content $packageJsonPath | ConvertFrom-Json
$version = $packageJson.version
$packageName = $packageJson.name
$bundleName = "atlas-lab-$version-win-x64"
$bundleDir = Join-Path $distDir $bundleName
$zipPath = Join-Path $distDir "$bundleName.zip"

if (Test-Path $bundleDir) {
  Remove-Item $bundleDir -Recurse -Force
}

if (Test-Path $zipPath) {
  Remove-Item $zipPath -Force
}

New-Item -ItemType Directory -Path $bundleDir -Force | Out-Null

Push-Location $rootDir
try {
  & npm.cmd pack --pack-destination $bundleDir | Out-Host

  if ($LASTEXITCODE -ne 0) {
    throw 'npm pack failed while building the Windows bundle.'
  }
} finally {
  Pop-Location
}

$packageArchive = Get-ChildItem $bundleDir -Filter '*.tgz' | Select-Object -First 1

if (-not $packageArchive) {
  throw 'Could not find the packaged npm archive in the Windows bundle staging directory.'
}

$installScript = @'
@echo off
setlocal
set "SCRIPT_DIR=%~dp0"
set "PACKAGE_FILE="

for %%F in ("%SCRIPT_DIR%*.tgz") do (
  set "PACKAGE_FILE=%%~fF"
  goto :package_found
)

echo Could not find the Atlas Lab package archive in %SCRIPT_DIR%.
exit /b 1

:package_found
echo Installing Atlas Lab globally from %PACKAGE_FILE%
npm.cmd install -g "%PACKAGE_FILE%"
if errorlevel 1 (
  echo Installation failed.
  exit /b 1
)

echo.
echo Atlas Lab installed successfully.
echo Run atlas-lab --help to get started.
'@

$uninstallScript = @'
@echo off
setlocal
echo Removing the global Atlas Lab installation
npm.cmd uninstall -g cli-node-docker-atlas-lab
if errorlevel 1 (
  echo Uninstall failed.
  exit /b 1
)

echo Atlas Lab removed successfully.
'@

$bundleReadme = @"
Atlas Lab Windows Bundle
Version: $version

Contents:
- $($packageArchive.Name): self-contained npm package
- install-atlas-lab.cmd: global install helper
- uninstall-atlas-lab.cmd: uninstall helper
- README.md: project documentation
- CHANGELOG.md: release history
- LICENSE: MIT license text
- SHA256SUMS.txt: bundle checksums

Requirements:
- Node.js 20 or newer
- npm
- Docker Engine with Docker Compose v2
- NVIDIA GPU support if you plan to enable the AI layer

Install:
1. Open a terminal in this directory.
2. Run install-atlas-lab.cmd
3. Run atlas-lab --help

Typical commands:
- atlas-lab up
- atlas-lab up --with-ai
- atlas-lab up --with-workbench
- atlas-lab up --with-ai --with-workbench
"@

Set-Content -Path (Join-Path $bundleDir 'install-atlas-lab.cmd') -Value $installScript -Encoding Ascii
Set-Content -Path (Join-Path $bundleDir 'uninstall-atlas-lab.cmd') -Value $uninstallScript -Encoding Ascii
Set-Content -Path (Join-Path $bundleDir 'README-WINDOWS.txt') -Value $bundleReadme -Encoding Ascii

Copy-Item (Join-Path $rootDir 'README.md') (Join-Path $bundleDir 'README.md')
Copy-Item (Join-Path $rootDir 'CHANGELOG.md') (Join-Path $bundleDir 'CHANGELOG.md')
Copy-Item (Join-Path $rootDir 'LICENSE') (Join-Path $bundleDir 'LICENSE')

$hashLines = Get-ChildItem $bundleDir -File |
  Sort-Object Name |
  ForEach-Object {
    $hash = (Get-FileHash $_.FullName -Algorithm SHA256).Hash.ToLowerInvariant()
    "$hash *$($_.Name)"
  }

Set-Content -Path (Join-Path $bundleDir 'SHA256SUMS.txt') -Value $hashLines -Encoding Ascii

Compress-Archive -Path $bundleDir -DestinationPath $zipPath -Force

Write-Host "Created Windows bundle: $zipPath"
