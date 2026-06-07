# Registers the Cisterni app as a Windows service so it starts on boot
# and restarts automatically if it crashes.
# Run this as Administrator (right-click install-service.bat -> Run as administrator).

$ErrorActionPreference = 'Stop'
$root        = Split-Path -Parent $MyInvocation.MyCommand.Path
$backend     = Join-Path $root 'backend'
$serviceName = 'Cisterni'

# 1. Locate Node.js
$node = (Get-Command node -ErrorAction SilentlyContinue).Source
if (-not $node) {
  Write-Error 'Node.js not found in PATH. Install Node LTS, then run setup, then this script.'
  exit 1
}

# 2. Make sure the app is set up (frontend built + .env present)
if (-not (Test-Path (Join-Path $root 'frontend\dist\index.html'))) {
  Write-Error 'frontend\dist not found. Run setup first (double-click setup.bat).'
  exit 1
}
if (-not (Test-Path (Join-Path $backend '.env'))) {
  Write-Error 'backend\.env not found. Run setup first (double-click setup.bat).'
  exit 1
}

# 3. Ensure NSSM (downloads it once into .\tools)
$toolsDir = Join-Path $root 'tools'
$nssmExe  = Join-Path $toolsDir 'nssm.exe'
if (-not (Test-Path $nssmExe)) {
  Write-Host 'Downloading NSSM (service helper)...'
  New-Item -ItemType Directory -Force -Path $toolsDir | Out-Null
  $zip = Join-Path $toolsDir 'nssm.zip'
  Invoke-WebRequest -Uri 'https://nssm.cc/release/nssm-2.24.zip' -OutFile $zip
  Expand-Archive -Path $zip -DestinationPath $toolsDir -Force
  $win64 = Get-ChildItem -Path $toolsDir -Recurse -Filter 'nssm.exe' |
           Where-Object { $_.FullName -match 'win64' } | Select-Object -First 1
  Copy-Item $win64.FullName $nssmExe -Force
}

# 4. (Re)create the service
$logDir = Join-Path $root 'logs'
New-Item -ItemType Directory -Force -Path $logDir | Out-Null

& $nssmExe stop   $serviceName 2>$null | Out-Null
& $nssmExe remove $serviceName confirm 2>$null | Out-Null

& $nssmExe install $serviceName $node 'src\app.js'
& $nssmExe set $serviceName AppDirectory $backend
& $nssmExe set $serviceName Start SERVICE_AUTO_START
& $nssmExe set $serviceName AppStdout (Join-Path $logDir 'cisterni.log')
& $nssmExe set $serviceName AppStderr (Join-Path $logDir 'cisterni.log')
& $nssmExe start $serviceName

Write-Host ''
Write-Host 'Service "Cisterni" installed and started.' -ForegroundColor Green
Write-Host 'It will now start automatically on every boot, and restart if it crashes.'
Write-Host 'Open: http://localhost:4000'
Write-Host 'Manage it in services.msc, or: nssm stop/start/remove Cisterni'
