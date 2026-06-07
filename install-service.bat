@echo off
REM Installs the app as a Windows service (auto-start on boot).
REM RIGHT-CLICK this file and choose "Run as administrator".
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0install-service.ps1"
echo.
pause
