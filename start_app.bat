@echo off
echo Starting Animal App...
echo.

:: Check for Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed or not in your PATH.
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b
)

:: Script de Inicio para la Aplicación "Animal Favorito"
echo Iniciando la aplicacion...

:: 1. Verificar si la carpeta node_modules existe
if not exist "node_modules" (
    echo Instalando dependencias - esto puede tardar unos segundos la primera vez...
    call npm install
)

:: 2. Iniciar el servidor Node.js
echo.
echo Iniciando el servidor...
echo Abre tu navegador en: http://localhost:3000
node server.js

pause
