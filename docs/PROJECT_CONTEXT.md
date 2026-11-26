# Contexto técnico de Beetho

**Última actualización:** 2026-11-26  
**Fuente principal:** repositorio local. Las comprobaciones externas se indican expresamente.

## Niveles de certeza

- **Confirmado:** comprobado en código, configuración, pruebas o migraciones locales.
- **Inferido:** deducido del código, sin definición completa disponible.
- **Pendiente:** solicitado o previsto, pero no implementado.
- **No verificado:** depende de Supabase, Vercel u otro entorno externo no representado por completo en Git.

## Información general

**Confirmado.** Beetho es un catálogo web de juguetes con catálogo público, reserva asistida mediante
WhatsApp y administración privada de productos. El repositorio usa:

- Next.js 16.4.6 con App Router, Cache Components y Partial Prefetching.
- React 19.3 y TypeScript estricto.
- Tailwind CSS 4 mediante `@tailwindcss/turbopack`.
- Supabase PostgreSQL, Auth y Storage mediante `@supabase/supabase-js` y `@supabase/ssr`.
- Zod 4 para validar formularios y respuestas de base de datos.
- Vitest 3 para pruebas automatizadas.
- ESLint 9 con reglas de Next.js y TypeScript.
- Vercel como destino declarado de producción; la configuración del proyecto remoto no está versionada.

## Arquitectura actual

```text
src/
  app/                     Rutas, layouts, error boundary y health check
  features/admin/          Autenticación, Server Actions y UI administrativa
  features/orders/         Consulta y gestión administrativa de reservas
  features/products/       Catálogo, CRUD, imágenes, schemas, tipos y WhatsApp
  features/reservations/   Lista pública temporal, persistencia y totales referenciales
  lib/supabase/            Configuración y clientes compartidos
  proxy.ts                 Protección y refresco de sesión para /admin
supabase/migrations/       Migraciones SQL versionadas
```

No existen hooks de negocio separados en el estado actual. Los Client Components utilizan estado local
solo donde necesitan interacción del navegador.

## Rutas de Next.js

| Ruta | Estado | Responsabilidad |
| --- | --- | --- |
| `/` | Confirmado | Catálogo público de productos activos. |
| `/admin/login` | Confirmado | Inicio de sesión del administrador. |
| `/admin` | Confirmado | Listado, búsqueda, activación y desactivación de productos. |
| `/admin/products/new` | Confirmado | Creación de producto e imagen principal. |
| `/admin/products/[id]/edit` | Confirmado | Edición de producto e imagen; código de solo lectura. |
| `/api/health/db` | Confirmado | Comprueba lectura de `categories` con la clave publicable. |
| `/reservation` | Confirmado | Datos de contacto, revisión y registro de una reserva múltiple. |
| `/admin/orders` | Confirmado | Listado, búsqueda y filtros de reservas. |
| `/admin/orders/[id]` | Confirmado | Detalle, stock actual, aceptación o rechazo de una reserva. |

## Componentes principales

### Catálogo público

- `ProductList`: consulta productos y resuelve estados de éxito, error y vacío.
- `ProductGrid`: cuadrícula responsive de una a cinco columnas.
- `ProductCard`: tarjeta con imagen, código, disponibilidad, descripción, precio y agregado a reserva.
- `ProductImage`: `next/image`, `object-contain` y alternativa ante URL ausente o error.
- `ProductListSkeleton`: diez tarjetas de carga.
- `WhatsAppButton`: abre un enlace `wa.me` o muestra estado no disponible.

### Lista pública de reserva

- `ReservationProvider`: estado cliente y sincronización validada con `localStorage`.
- `ReservationButton`: agrega productos activos y disponibles desde cada tarjeta.
- `ReservationSummary`: acceso flotante con cantidad total seleccionada.
- `ReservationList` y `ReservationItem`: edición de cantidades, eliminación, alertas de stock y total.
- `ReservationCheckout`: contacto mínimo, revisión, confirmación y resultado con código registrado.

### Administración

- `AdminLogin`: formulario cliente conectado a una Server Action.
- `AdminProductList`: búsqueda local por nombre/código y acciones de estado.
- `ProductForm`: creación y edición validadas en servidor.
- `ProductImageUpload`: selección, validación inicial y vista previa.
- `DeleteConfirmationDialog`: confirmación de desactivación lógica.
- `ProductStatusBadge`: estado activo/inactivo.
- `AdminOrderList`: búsqueda y filtros por estado de reservas.
- `OrderActions`: aceptación o rechazo confirmado desde el detalle.
- `OrderStatusBadge`: presentación consistente de estados de reserva.

## Servicios y flujos

### Lectura pública

1. `ProductList` llama a `getActiveProducts()`.
2. El servicio usa la URL y clave publicable de Supabase.
3. Consulta `products` con `is_active = true`.
4. Zod transforma filas externas al tipo `Product`.
5. La UI presenta error seguro si falla la consulta o validación.

### CRUD administrativo

1. Las páginas y Server Actions verifican el administrador.
2. `productFormSchema` valida entradas no confiables.
3. `adminProductService` usa un cliente privilegiado exclusivo del servidor.
4. PostgreSQL genera el código al insertar.
5. Si existe imagen, se valida y sube después de obtener el código.
6. Si falla la asociación de imagen, se intenta limpiar el archivo y revertir el producto creado.
7. Las mutaciones invalidan `/` y `/admin`.

### WhatsApp

Después del registro, `buildRegisteredReservationMessage()` genera un resumen únicamente con el código,
cantidad total e importe devueltos por PostgreSQL. `buildRegisteredReservationWhatsAppUrl()` aplica
`encodeURIComponent` y usa el número configurado. WhatsApp no crea, recibe ni cambia el estado de la
reserva; no se llama a la API de Meta.

### Lista múltiple de reserva

1. La página pública envuelve el catálogo en `ReservationProvider`.
2. El cliente puede agregar productos, cambiar cantidades, eliminarlos y vaciar la lista.
3. Los datos recuperados de `localStorage` se validan con Zod y se descartan si no son confiables.
4. La UI calcula subtotales y total referencial y advierte cuando la cantidad supera el stock informado.
5. `/reservation` envía únicamente identificadores y cantidades; el servidor valida contacto y productos.
6. PostgreSQL obtiene precios vigentes, calcula el total y crea orden e ítems en una transacción idempotente.
7. La confirmación muestra el código `RES-*` y permite abrir WhatsApp o copiar el código.

### Gestión administrativa de reservas

1. `/admin/orders` verifica autorización, marca vencimientos pendientes y lista reservas con filtros.
2. `/admin/orders/[id]` presenta snapshots comerciales y stock/actividad actuales de cada producto.
3. Aceptar ejecuta una función transaccional que bloquea orden y productos, valida todo el stock, descuenta
   todas las unidades y confirma; nunca acepta parcialmente.
4. Rechazar conserva inventario y admite un motivo breve.
5. Las operaciones vuelven a verificar al administrador en el servidor y revalidan catálogo y panel.

## Autenticación y autorización

**Confirmado.** Supabase Auth usa correo y contraseña. `proxy.ts` protege `/admin/:path*`, refresca las
cookies SSR y compara el usuario con `ADMIN_USER_ID`. Las páginas protegidas vuelven a verificar la sesión,
y cada servicio administrativo llama a `requireAdmin()` antes de usar privilegios.

El cliente privilegiado usa `SUPABASE_SECRET_KEY`, está marcado `server-only` y desactiva persistencia y
refresco de sesión. El cierre de sesión usa `supabase.auth.signOut()`.

**Confirmado.** El login ofrece “Mantener mi sesión iniciada”. Una cookie HttpOnly conserva únicamente el
modo elegido: las cookies de Auth no llevan expiración en modo temporal y conservan la expiración de
Supabase en modo persistente. El proxy aplica la misma política durante la renovación. No se almacenan
contraseñas ni tokens adicionales y el cierre de sesión elimina también el marcador de modo.

## Variables de entorno conocidas

Solo se documentan nombres, nunca valores:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SECRET_KEY`
- `ADMIN_USER_ID`
- `NEXT_PUBLIC_WHATSAPP_NUMBER`

## Entornos

- **Desarrollo confirmado:** scripts `dev`, `build`, `start`, `lint`, `test` y `typecheck` en `package.json`.
- **Producción inferida:** despliegue en Vercel conectado a Supabase; no hay `vercel.json` ni metadatos
  locales suficientes para confirmar dominios, variables o despliegue vigente.
- `next.config.ts` autoriza imágenes únicamente desde el proyecto Supabase configurado.

## Estado del desarrollo

### Implementado y verificado con pruebas automatizadas

- Catálogo público y estados vacío/error.
- Presentación de precios y disponibilidad.
- CRUD lógico de productos y validación de formularios.
- Validación de imágenes JPEG, PNG y WebP, máximo 2 MB.
- Construcción del mensaje y enlace de WhatsApp.
- Parser tolerante de mensajes y preparación de vista previa con precio confiable.
- Comprobaciones unitarias de autorización administrativa.
- Política diferenciada de sesión administrativa temporal o persistente.
- Lista de reserva múltiple, cantidades, total referencial y persistencia temporal validada.
- Registro transaccional e idempotente de reservas con precios actuales de PostgreSQL.
- Código público, confirmación y mensaje de WhatsApp posterior al registro.
- Listado, detalle, aceptación, rechazo y vencimiento administrativo de reservas.

### Implementado y comprobado directamente en Supabase el 2026-11-26

- Prefijos de categoría y contadores independientes.
- Generación de `PEL-0001`, `PEL-0002` y `CAR-0001` dentro de una transacción revertida.
- Conservación del código ante actualización.
- Conservación de los códigos históricos existentes.

### Implementado, con verificación externa pendiente

- Flujo visual completo de creación y reemplazo de imágenes en producción.
- Variables y comportamiento del despliegue actual de Vercel.
- Conjunto completo de políticas RLS.

### Pendiente

- Detalle público de producto.
- Carrito, checkout y registro de pedidos del MVP original.
- Comprobación manual cerrando y reabriendo un navegador real para ambos modos de sesión.
- Verificación visual completa del flujo de reservas en un navegador real y en producción.

### Descartado para el alcance actual

- Automatización de WhatsApp Web con librerías no oficiales.
- Lectura automática de WhatsApp, webhooks y WhatsApp Cloud API.
- Pagos electrónicos y autenticación de clientes.

## Registro de decisiones

| Fecha | Decisión | Motivo |
| --- | --- | --- |
| 2026-11-26 | Generar códigos en PostgreSQL mediante trigger y contador por categoría. | Evitar cálculos en cliente, colisiones y condiciones de carrera. |
| 2026-11-26 | Conservar códigos al cambiar datos o categoría. | Evitar romper referencias existentes. |
| 2026-11-26 | Guardar imágenes bajo `categoria/codigo/uuid.ext` dentro del bucket `products`. | Organización estable sin duplicar el nombre del bucket. |
| 2026-11-26 | Conservar el modo de sesión en una cookie HttpOnly sin credenciales. | Permitir que las renovaciones de Supabase respeten la elección temporal o persistente. |
| 2026-11-26 | Procesar reservas íntegramente en Beetho y usar WhatsApp solo para comunicar su código. | Mantener PostgreSQL como fuente de verdad y eliminar la dependencia de mensajes entrantes. |
| 2026-11-26 | Vencer reservas pendientes después de 24 horas. | Evitar aceptar solicitudes antiguas sin introducir un programador externo. |
| Confirmado en código | Usar desactivación lógica mediante `is_active`. | Conservar registros e imágenes para restauración. |
| Confirmado en código | Autorizar administración por un único `ADMIN_USER_ID`. | Mantener una autenticación administrativa sencilla para esta versión. |

## Mantenimiento

Actualizar este documento cuando cambien rutas, módulos, flujos, integraciones, estado funcional o decisiones
arquitectónicas. El código local prevalece cuando exista una discrepancia; corregir después la documentación.
