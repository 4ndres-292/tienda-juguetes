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
  features/orders/         Parser, validación y vista previa de reservas
  features/products/       Catálogo, CRUD, imágenes, schemas, tipos y WhatsApp
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
| `/admin/orders/new` | Confirmado | Parser y vista previa de mensajes de reserva; todavía no registra órdenes. |
| `/admin/orders` | Pendiente | Listado y filtros de órdenes. |
| `/admin/orders/[id]` | Pendiente | Detalle y gestión de una orden. |

## Componentes principales

### Catálogo público

- `ProductList`: consulta productos y resuelve estados de éxito, error y vacío.
- `ProductGrid`: cuadrícula responsive de una a cinco columnas.
- `ProductCard`: tarjeta con imagen, código, disponibilidad, descripción, precio y reserva.
- `ProductImage`: `next/image`, `object-contain` y alternativa ante URL ausente o error.
- `ProductListSkeleton`: diez tarjetas de carga.
- `WhatsAppButton`: abre un enlace `wa.me` o muestra estado no disponible.

### Administración

- `AdminLogin`: formulario cliente conectado a una Server Action.
- `AdminProductList`: búsqueda local por nombre/código y acciones de estado.
- `ProductForm`: creación y edición validadas en servidor.
- `ProductImageUpload`: selección, validación inicial y vista previa.
- `DeleteConfirmationDialog`: confirmación de desactivación lógica.
- `ProductStatusBadge`: estado activo/inactivo.

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

`buildWhatsAppReservationMessage()` centraliza el texto y
`buildWhatsAppReservationUrl()` aplica `encodeURIComponent`. El formato multilínea, las líneas en blanco,
la cantidad singular/plural y el precio `Bs` están cubiertos por pruebas exactas. La tarjeta usa cantidad 1.
No se registra una orden ni se llama a la API de Meta.

### Procesamiento manual de reservas

1. `/admin/orders/new` recibe un mensaje pegado por el administrador.
2. `parseReservationMessage()` extrae nombre, código, cantidad y precio referencial de forma determinista.
3. La Server Action vuelve a verificar autorización y consulta el producto por código.
4. `prepareReservationPreview()` calcula el total con el precio actual de PostgreSQL.
5. La UI advierte diferencias de nombre/precio, stock insuficiente o producto inactivo.
6. **Pendiente:** registrar la orden después de inspeccionar `orders` y `order_items`.

## Autenticación y autorización

**Confirmado.** Supabase Auth usa correo y contraseña. `proxy.ts` protege `/admin/:path*`, refresca las
cookies SSR y compara el usuario con `ADMIN_USER_ID`. Las páginas protegidas vuelven a verificar la sesión,
y cada servicio administrativo llama a `requireAdmin()` antes de usar privilegios.

El cliente privilegiado usa `SUPABASE_SECRET_KEY`, está marcado `server-only` y desactiva persistencia y
refresco de sesión. El cierre de sesión usa `supabase.auth.signOut()`.

**Pendiente.** No existe opción “Mantener mi sesión iniciada” ni una política diferenciada entre sesión
temporal y persistente.

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
- Registro, listado y gestión de órdenes.
- Webhook oficial de WhatsApp Cloud API.
- Persistencia opcional de sesión administrativa.

### Descartado para el alcance actual

- Automatización de WhatsApp Web con librerías no oficiales.
- Pagos electrónicos y autenticación de clientes.

## Registro de decisiones

| Fecha | Decisión | Motivo |
| --- | --- | --- |
| 2026-11-26 | Generar códigos en PostgreSQL mediante trigger y contador por categoría. | Evitar cálculos en cliente, colisiones y condiciones de carrera. |
| 2026-11-26 | Conservar códigos al cambiar datos o categoría. | Evitar romper referencias existentes. |
| 2026-11-26 | Guardar imágenes bajo `categoria/codigo/uuid.ext` dentro del bucket `products`. | Organización estable sin duplicar el nombre del bucket. |
| 2026-11-26 | Separar parser y preparación de vista previa de la Server Action. | Permitir reutilizar la lógica desde un webhook oficial futuro sin duplicarla. |
| Confirmado en código | Usar desactivación lógica mediante `is_active`. | Conservar registros e imágenes para restauración. |
| Confirmado en código | Autorizar administración por un único `ADMIN_USER_ID`. | Mantener una autenticación administrativa sencilla para esta versión. |

## Mantenimiento

Actualizar este documento cuando cambien rutas, módulos, flujos, integraciones, estado funcional o decisiones
arquitectónicas. El código local prevalece cuando exista una discrepancia; corregir después la documentación.
