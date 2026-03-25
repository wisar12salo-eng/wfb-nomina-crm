# 🚀 GUÍA PASO A PASO: Despliegue Gratuito de WFB Nómina CRM

## 📋 REQUISITOS PREVIOS

- ✅ Cuenta de GitHub (gratuita)
- ✅ Cuenta de Railway (gratuita)
- ✅ Tu código de WFB Nómina CRM

---

## 📝 INSTRUCCIONES DETALLADAS

### PASO 1: Preparar GitHub

1. **Crear cuenta en GitHub**
   - Ve a [github.com](https://github.com)
   - Haz clic en "Sign up" (Registrarse)
   - Elige plan gratuito
   - Verifica tu email

2. **Crear repositorio**
   - Haz clic en "+" → "New repository"
   - Nombre: `wfb-nomina-crm`
   - Descripción: "Sistema de nómina WFB"
   - Déjalo público o privado
   - NO marques "Add a README file"
   - Haz clic en "Create repository"
   - **Copia la URL** que aparece (ej: `https://github.com/tuusuario/wfb-nomina-crm.git`)

### PASO 2: Subir tu Código

**Opción A: Script Automático (Recomendado)**
```cmd
# Ejecuta el archivo desplegar.bat que está en tu carpeta del proyecto
# Te guiará paso a paso
```

**Opción B: Manual**
```cmd
# Abre la terminal en tu carpeta del proyecto
cd "C:\Users\PERSONAL\OneDrive\Desktop\WFB-Nomina-CRM"

# Inicializar Git
git init
git add .
git commit -m "Initial commit - WFB Nómina CRM"

# Conectar con GitHub (reemplaza TU_USUARIO)
git remote add origin https://github.com/TU_USUARIO/wfb-nomina-crm.git
git push -u origin main
```

### PASO 3: Desplegar en Railway

1. **Crear cuenta en Railway**
   - Ve a [railway.app](https://railway.app)
   - Haz clic en "Sign up"
   - Elige "Continue with GitHub"
   - Autoriza el acceso

2. **Crear proyecto**
   - Haz clic en "New Project"
   - Selecciona "Deploy from GitHub repo"
   - Busca "wfb-nomina-crm" en tus repositorios
   - Haz clic en "Connect + Deploy"

3. **Esperar el despliegue**
   - Railway construirá tu aplicación (toma 2-5 minutos)
   - Verás logs en tiempo real
   - Cuando termine, verás "Deployment successful"

4. **Configurar variables de entorno**
   - En el panel de Railway, ve a "Variables"
   - Haz clic en "Add Variable"
   - Agrega:
     ```
     NODE_ENV = production
     JWT_SECRET = tu_clave_super_secreta_aqui_12345
     ```

### PASO 4: ¡Acceder a tu Aplicación!

- Railway te dará una URL como: `https://wfb-nomina-crm-production.up.railway.app`
- **¡Esa es tu aplicación web!** Funciona desde cualquier dispositivo

---

## 🔐 PRIMER ACCESO

- **URL de login**: `TU_URL/login.html`
- **Usuario**: `admin`
- **Contraseña**: `admin123`

---

## 🆘 SOLUCIÓN DE PROBLEMAS

### "Git no está instalado"
- Descarga desde: https://git-scm.com/downloads
- Instala con opciones por defecto

### "Error al hacer push"
- Verifica que la URL de GitHub sea correcta
- Asegúrate de tener permisos en el repositorio

### "Railway no encuentra el repositorio"
- Espera 5 minutos y refresca
- Verifica que el repositorio sea público o que Railway tenga acceso

### "Error en el despliegue"
- Revisa los logs en Railway
- Busca errores de dependencias o archivos faltantes

---

## 💰 COSTOS

- **GitHub**: 100% gratuito
- **Railway**: Gratuito (512MB RAM, 1GB disco)
- **Dominio**: Opcional ($10-15/año si quieres uno personalizado)

---

## 🎉 ¡FELICITACIONES!

Tu aplicación WFB Nómina CRM ahora está **viva en internet** y accesible desde cualquier parte del mundo.

¿Necesitas ayuda con algún paso específico?