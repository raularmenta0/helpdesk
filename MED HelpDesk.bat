@echo off

title MED HelpDesk

echo ==========================================
echo        INICIANDO MED HELPDESK
echo ==========================================
echo.

set "BASE_DIR=%~dp0"
set "BACKEND_DIR=%BASE_DIR%backend"
set "FRONTEND_DIR=%BASE_DIR%frontedn"

echo Carpeta base:
echo %BASE_DIR%
echo Backend:
echo %BACKEND_DIR%
echo Frontend:
echo %FRONTEND_DIR%
echo.

if not exist "%BACKEND_DIR%\package.json" (
    echo ERROR: No se encontro backend\package.json
    echo Ruta buscada:
    echo %BACKEND_DIR%\package.json
    pause
    exit /b 1
)

if not exist "%FRONTEND_DIR%\package.json" (
    echo ERROR: No se encontro frontedn\package.json
    echo Ruta buscada:
    echo %FRONTEND_DIR%\package.json
    pause
    exit /b 1
)

echo Abriendo Outlook...
start "" outlook.exe

timeout /t 8 /nobreak >nul

echo Iniciando backend...
start "MED HelpDesk - Backend" /D "%BACKEND_DIR%" cmd /k "npm run dev"

timeout /t 5 /nobreak >nul

echo Iniciando frontend...
start "MED HelpDesk - Frontend" /D "%FRONTEND_DIR%" cmd /k "npm run dev"

timeout /t 8 /nobreak >nul

echo Abriendo HelpDesk...
start "" "http://localhost:5173"

echo.
echo MED HelpDesk iniciado correctamente.
echo.

pause