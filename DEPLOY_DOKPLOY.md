# Despliegue en Dokploy

Usa `comandas-app` como raiz del repositorio en GitHub.

## 1. Base de datos PostgreSQL

En Dokploy crea una base de datos PostgreSQL.

Guarda estos datos:

- Host
- Puerto
- Usuario
- Password
- Nombre de base de datos

La variable final del backend debe quedar asi:

```txt
DATABASE_URL=postgresql://USUARIO:PASSWORD@HOST:5432/NOMBRE_DB?schema=public
```

## 2. Backend

En la app `Backend_comandas` selecciona:

```txt
Provider: Github
Repository: tu repositorio
Branch: main
Build Path: /backend
Trigger Type: On Push
```

Si Dokploy pregunta el tipo de build, usa Dockerfile. El Dockerfile ya esta en:

```txt
backend/Dockerfile
```

## 3. Variables de entorno del backend

En `Environment` agrega:

```txt
DATABASE_URL=postgresql://USUARIO:PASSWORD@HOST:5432/NOMBRE_DB?schema=public
PORT=3000
NODE_ENV=production
CORS_ORIGIN=*
```

## 4. Deploy

Presiona `Deploy`.

El contenedor ejecuta automaticamente:

```bash
npx prisma migrate deploy
node src/server.js
```

## 5. Probar

Abre el dominio que te asigne Dokploy:

```txt
https://TU-DOMINIO/health
```

Debe responder:

```json
{
  "ok": true,
  "message": "API de comandas funcionando"
}
```

## 6. App movil

En la app movil abre `Conexion` y guarda:

```txt
https://TU-DOMINIO
```

La app lo convertira a:

```txt
https://TU-DOMINIO/api
```
