# WFB Nómina CRM

Sistema de gestión de nómina y empleados desarrollado con Node.js, Express y SQLite.

## 🚀 Despliegue Gratuito en Railway

### Paso 1: Preparar tu Código

1. **Crear cuenta en GitHub**
   - Ve a [github.com](https://github.com) y crea una cuenta gratuita
   - Crea un nuevo repositorio llamado `wfb-nomina-crm`

2. **Subir tu código**
   ```bash
   # En tu terminal, ve a la carpeta del proyecto
   cd "C:\Users\PERSONAL\OneDrive\Desktop\WFB-Nomina-CRM"

   # Inicializar Git (solo la primera vez)
   git init
   git add .
   git commit -m "Initial commit"

   # Conectar con GitHub (reemplaza TU_USUARIO y TU_REPOSITORIO)
   git remote add origin https://github.com/TU_USUARIO/wfb-nomina-crm.git
   git push -u origin main
   ```

### Paso 2: Desplegar en Railway

1. **Crear cuenta en Railway**
   - Ve a [railway.app](https://railway.app)
   - Regístrate con tu cuenta de GitHub (es gratis)

2. **Crear nuevo proyecto**
   - Haz clic en "New Project"
   - Selecciona "Deploy from GitHub repo"
   - Conecta tu repositorio `wfb-nomina-crm`

3. **Configurar variables de entorno**
   - En Railway, ve a "Variables"
   - Agrega estas variables:
     ```
     NODE_ENV=production
     JWT_SECRET=tu_clave_secreta_muy_segura_aqui
     ```

4. **¡Listo!** Railway desplegará automáticamente tu aplicación

### Paso 3: Acceder a tu Aplicación

Después del despliegue, Railway te dará una URL como:
`https://wfb-nomina-crm-production.up.railway.app`

## 📋 Características

- ✅ Gestión de empleados
- ✅ Liquidación de nómina
- ✅ Cálculos automáticos de seguridad social
- ✅ Asientos contables PUC
- ✅ Exportación a Excel
- ✅ Generación de PDFs

## 🔐 Usuario por Defecto

- **Usuario**: admin
- **Contraseña**: admin123

## 🛠️ Desarrollo Local

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# O ejecutar normalmente
node server.js
```

## 📞 Soporte

Si tienes problemas, revisa los logs en Railway o contacta al desarrollador.

---

**Desarrollado con ❤️ para WFB Originals**