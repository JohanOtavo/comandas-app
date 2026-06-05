# Comandas App

Aplicacion completa para administrar comandas de un negocio. Incluye backend REST con Node.js, Express, Prisma y PostgreSQL, mas app movil Expo React Native conectada por Axios.

## Estructura

```txt
comandas-app/
  backend/
    src/
      controllers/
      routes/
      services/
      middlewares/
      prisma/
      utils/
      app.js
      server.js
    prisma/
      migrations/
      schema.prisma
      seed.js
    package.json
    .env.example
  mobile/
    src/
      screens/
      components/
      navigation/
      services/
      context/
      utils/
      styles/
    App.js
    package.json
```

## Requisitos

- Node.js 18 o superior
- PostgreSQL 14 o superior
- Expo Go en el celular o un emulador Android/iOS

## Configurar PostgreSQL

1. Crea la base de datos:

```sql
CREATE DATABASE comandas_db;
```

2. Copia el archivo de entorno del backend:

```bash
cd backend
cp .env.example .env
```

3. Ajusta `DATABASE_URL` en `backend/.env` con tu usuario, clave, host y puerto de PostgreSQL.

## Ejecutar backend

```bash
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate
npm run seed
npm run dev
```

La API queda disponible en:

```txt
http://localhost:3000
```

Endpoint de salud:

```txt
GET http://localhost:3000/health
```

## Ejecutar app movil

En otra terminal:

```bash
cd mobile
npm install
npm start
```

Si pruebas desde un celular fisico, `localhost` apunta al celular, no a tu computador. En ese caso inicia Expo con la URL del backend en tu red local:

```bash
EXPO_PUBLIC_API_URL=http://TU_IP_LOCAL:3000/api npm start
```

En PowerShell:

```powershell
$env:EXPO_PUBLIC_API_URL="http://TU_IP_LOCAL:3000/api"
npm start
```

## Modulos implementados

- Dashboard con estado de caja y accesos rapidos.
- Categorias con crear, listar, ver datos, editar, activar/desactivar y eliminar.
- Productos con crear, listar, buscar, filtrar por categoria, editar, activar/desactivar y eliminar.
- Caja registradora con abrir, ver actual, editar observaciones, cerrar, historial y detalle con comandas pagadas.
- Comandas abiertas con crear, editar nombre, agregar productos, editar cantidades, retirar productos, pagar y eliminar.
- Comandas pagadas con listado, busqueda y detalle completo.
- Comandas eliminadas con listado, busqueda, observacion y detalle completo.
- Productos de comanda en vista por orden de agregado y vista agrupada.

## Reglas de negocio cubiertas

- Solo puede existir una caja abierta al mismo tiempo.
- No se puede pagar una comanda si no hay caja abierta.
- Una comanda pagada o eliminada no se puede editar.
- Al pagar, la comanda se asocia a la caja abierta.
- Al pagar, el total de la comanda incrementa el total vendido de la caja.
- Al cerrar caja, el total esperado se calcula como monto inicial mas total vendido.
- Los productos agregados guardan nombre y precio como snapshot.
- El total de la comanda se recalcula al agregar, editar o retirar productos.
- Las comandas eliminadas no se borran fisicamente.
- La vista agrupada suma cantidades por producto.
- La vista por orden conserva el orden exacto de agregado.
- No se pueden crear productos sin categoria.
- No se pueden crear comandas sin nombre.
- No se pueden agregar cantidades menores o iguales a cero.

## Endpoints principales

```txt
GET    /api/categories
GET    /api/categories/:id
POST   /api/categories
PUT    /api/categories/:id
PATCH  /api/categories/:id/status
DELETE /api/categories/:id

GET    /api/products
GET    /api/products?categoryId=
GET    /api/products?search=
GET    /api/products/:id
POST   /api/products
PUT    /api/products/:id
PATCH  /api/products/:id/status
DELETE /api/products/:id

POST   /api/cash-register/open
GET    /api/cash-register/current
GET    /api/cash-register/history
GET    /api/cash-register/:id
PUT    /api/cash-register/:id
POST   /api/cash-register/close

GET    /api/orders/open
GET    /api/orders/paid
GET    /api/orders/deleted
GET    /api/orders/:id
POST   /api/orders
PUT    /api/orders/:id
POST   /api/orders/:id/pay
POST   /api/orders/:id/delete

GET    /api/orders/:id/items
GET    /api/orders/:id/items?view=added
GET    /api/orders/:id/items?view=grouped
POST   /api/orders/:id/items
GET    /api/orders/:id/items/:itemId
PUT    /api/orders/:id/items/:itemId
DELETE /api/orders/:id/items/:itemId
```

## Flujo de prueba recomendado

1. Ejecuta seed para cargar categorias y productos iniciales.
2. Abre una caja desde la app.
3. Crea una comanda.
4. Agrega productos varias veces en distinto orden.
5. Revisa vista por orden y vista agrupada.
6. Edita cantidades y retira un producto.
7. Paga la comanda.
8. Revisa comandas pagadas y el total vendido de la caja.
9. Cierra caja y revisa el historial.
