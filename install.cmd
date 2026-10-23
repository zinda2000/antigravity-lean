@echo off
setlocal
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js 20+ is required. Download from https://nodejs.org/
  pause
  exit /b 1
)
node "%~dp0bin\antigravity-lean.mjs" wizard %*
set "LEAN_EXIT=%ERRORLEVEL%"
pause
exit /b %LEAN_EXIT%
