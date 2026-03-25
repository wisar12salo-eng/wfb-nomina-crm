@echo off
echo ============================================
echo    WFB NOMINA CRM - DESPLIEGUE GRATUITO
echo ============================================
echo.
echo PASO 1: Crear cuenta en GitHub
echo 1. Ve a https://github.com y crea una cuenta gratuita
echo 2. Crea un nuevo repositorio llamado 'wfb-nomina-crm'
echo 3. Copia la URL de tu repositorio
echo.
pause

echo.
echo PASO 2: Configurar Git (primera vez)
echo.
git --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Git no está instalado.
    echo Descarga Git desde: https://git-scm.com/downloads
    echo Luego ejecuta este script nuevamente.
    pause
    exit /b 1
)

echo ✅ Git está instalado
echo.

if not exist ".git" (
    echo Inicializando repositorio Git...
    git init
    git add .
    git commit -m "Initial commit - WFB Nómina CRM"
    echo ✅ Repositorio Git inicializado
) else (
    echo ✅ Repositorio Git ya existe
)

echo.
set /p REPO_URL="Pega la URL de tu repositorio GitHub: "

echo.
echo Conectando con GitHub...
git remote add origin %REPO_URL% 2>nul
git remote set-url origin %REPO_URL%
git push -u origin main

if errorlevel 1 (
    echo.
    echo ❌ Error al subir a GitHub.
    echo Posibles causas:
    echo - URL incorrecta
    echo - No tienes permisos
    echo - El repositorio ya tiene contenido
    echo.
    echo Intenta manualmente:
    echo git push -u origin main
    pause
    exit /b 1
)

echo.
echo ✅ ¡Código subido exitosamente a GitHub!
echo.
echo ============================================
echo    PASO 3: DESPLEGAR EN RAILWAY
echo ============================================
echo.
echo 1. Ve a https://railway.app
echo 2. Regístrate con tu cuenta de GitHub
echo 3. Haz clic en "New Project"
echo 4. Selecciona "Deploy from GitHub repo"
echo 5. Busca y selecciona "wfb-nomina-crm"
echo 6. Railway desplegará automáticamente
echo.
echo ¡Tu aplicación estará lista en minutos!
echo.
pause