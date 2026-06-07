@echo off
REM Double-click to install and configure the app (Windows).
cd /d "%~dp0"
call npm run setup
echo.
echo Done. Double-click "start.bat" to run the app.
pause
