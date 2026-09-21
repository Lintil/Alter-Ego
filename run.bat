@echo off
title ALTER EGO - Multiverse Experience
echo ===================================================
echo   Launching ALTER EGO Web Application...
echo ===================================================
cd /d "%~dp0"

start "" "http://127.0.0.1:8000"

python server.py
if %ERRORLEVEL% NEQ 0 (
    echo Python was not found in PATH or exited with an error.
    echo Trying direct Python 3.13...
    "C:\Program Files\Python313\python.exe" server.py
)
pause
