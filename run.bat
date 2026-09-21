@echo off
setlocal
start "US Client Vibe Backend" /D "%~dp0backend" cmd /k npm run dev
start "US Client Vibe Frontend" /D "%~dp0frontend" cmd /k npm run dev
endlocal
