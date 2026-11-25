@echo off
chcp 65001 >nul
title AI-VIDEO-STUDIO
cd /d "%~dp0"
set "STUDIO_ROOT=%~dp0"
set "HF_HOME=%~dp0models\hf"
set "PYTHONUTF8=1"
if exist "%~dp0pexels.key" set /p PEXELS_API_KEY=<"%~dp0pexels.key"
if not exist "%~dp0envs\core\Scripts\python.exe" (
  echo Studio is not installed yet. Running installer...
  powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0install\install-windows.ps1"
)
"%~dp0envs\core\Scripts\python.exe" "%~dp0studio.py" %*
if "%~1"=="" pause
