
# Catálogo Digital — Preparación de despliegue

## Arquitectura

- Frontend: Next.js 16 y TypeScript.
- Backend: Spring Boot y Java.
- Base de datos: PostgreSQL.
- Imágenes: Cloudinary.
- Autenticación administrativa: JWT mediante cookie HttpOnly.

## Variables del frontend

### API_BASE_URL

Dirección de la API de Spring Boot accesible desde
el servidor de Next.js.

Desarrollo local:

API_BASE_URL=http://127.0.0.1:8080/api/v1

En producción, configurar la URL real del backend
mediante las variables de entorno del alojamiento.

No agregar el prefijo NEXT_PUBLIC_ a esta variable.

## Validación de configuración

Desarrollo:

```powershell
node --env-file=.env.local scripts/check-server-config.mjs
```

Producción:

```powershell
node scripts/check-server-config.mjs --production
```

## Seguridad

- No subir archivos .env.local al repositorio.
- No publicar contraseñas ni tokens JWT.
- Mantener HTTPS en el acceso público.
- Mantener la cookie administrativa HttpOnly y Secure.
- Validar permisos ADMIN en Spring Boot.
- No confiar exclusivamente en controles visuales.
- Comprobar la autorización de cada operación de escritura.
- Utilizar secretos distintos para cada entorno.

## Backend

Pendiente de verificar:

- Perfil de Spring Boot para producción.
- Variables de conexión a PostgreSQL.
- Configuración segura de JWT.
- Configuración de Cloudinary.
- Migraciones y esquema de base de datos.
- Orígenes permitidos y encabezados del proxy.
- Registros y manejo de errores.

## Pruebas antes del despliegue

- Catálogo público.
- Inicio de sesión administrativo.
- Cierre de sesión.
- Expiración de JWT.
- Gestión de productos.
- Gestión de categorías.
- Subida de fotografías.
- Cambio de fotografía principal.
- Reordenamiento de fotografías.
- Eliminación de fotografías.
- Comprobación de solicitudes sin autorización.

## Estado

Documento inicial de preparación.

El despliegue real todavía no está configurado.
