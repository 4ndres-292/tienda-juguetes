# Base de datos e integraciones de Supabase

**Última actualización:** 2026-11-26  
**Fuente principal:** migración local, schemas, servicios y consultas del repositorio.

## Alcance y certeza

El repositorio no contiene una migración base con la creación original de `categories`, `products`, `orders`
y `order_items`. Por ello se documentan como **confirmadas** únicamente las columnas usadas por el código o
declaradas en la migración disponible. Los tipos originales, defaults, índices y políticas no visibles se
marcan como **pendientes de verificar**.

Las migraciones `supabase/migrations/202611260001_product_code_automation.sql` y
`supabase/migrations/202611260002_order_workflow.sql` fueron ejecutadas y comprobadas en el proyecto
conectado el 2026-11-26. Esto no garantiza por sí solo que cualquier otro entorno tenga el mismo estado.

## Esquema conocido

### `public.categories`

| Columna | Tipo/estado conocido | Restricciones conocidas |
| --- | --- | --- |
| `id` | bigint confirmado por la FK versionada | Clave primaria inferida por consultas y FK. |
| `name` | Texto inferido | No verificadas localmente. |
| `slug` | Texto inferido | Usado para rutas de Storage. |
| `code_prefix` | text confirmado | `NOT NULL`, `UNIQUE`, formato `^[A-Z]{2,5}$`. |

Prefijos configurados por la migración: `peluches → PEL`, `vehiculos → CAR`, `munecas → MUN`,
`educativos → EDU`, `juegos-de-mesa → JME`, `otros → OTR`.

### `public.products`

| Columna | Tipo/estado conocido | Uso o restricción conocida |
| --- | --- | --- |
| `id` | Identificador transformado a string en aplicación | Clave primaria inferida. |
| `code` | Texto | Índice o restricción `UNIQUE` exigida por la migración. |
| `category_id` | Identificador | FK hacia `categories.id` confirmada por la migración. |
| `name` | Texto | Obligatorio según formulario, restricción DB no verificada. |
| `description` | Texto nullable | Opcional. |
| `price` | Numérico | Aplicación exige valor positivo. |
| `stock` | Entero | Aplicación exige valor mayor o igual a cero. |
| `image_url` | Texto/URL nullable | URL pública de Storage. |
| `is_active` | Booleano | Lectura pública filtra `true`; desactivación lógica. |

### `public.product_code_counters`

Tabla confirmada por migración:

| Columna | Tipo | Restricciones |
| --- | --- | --- |
| `category_id` | bigint | PK, FK a `categories.id`, `ON DELETE RESTRICT`. |
| `last_value` | bigint | `NOT NULL`, default 0, check `>= 0`. |

RLS está habilitado y no se versionan políticas para esta tabla. Las escrituras se realizan indirectamente
por una función `SECURITY DEFINER`.

### `public.orders` y `public.order_items`

**Confirmado mediante migración y OpenAPI de PostgREST el 2026-11-26.** `orders` conserva `id`,
`customer_name`, `customer_phone`, `address`, `total`, `status` y `created_at`; nombre y teléfono son
obligatorios, y dirección es opcional. También contiene `public_code`, `source`, `idempotency_key`,
`expires_at`, `confirmed_at`, `rejected_at` y `rejection_reason`. Los estados admitidos son `pending`,
`confirmed`, `rejected` y `expired`.

`order_items` contiene `id`, `order_id`, `product_id`, `quantity`, `unit_price`, `product_code` y `subtotal`.
La combinación orden/producto es única; el código, precio y subtotal conservan el snapshot comercial de la
reserva. Las FK existentes conectan los ítems con `orders.id` y `products.id`.

## Funciones y triggers

### `public.generate_product_code()`

- Trigger function PL/pgSQL `SECURITY DEFINER` con `search_path` vacío.
- Lee `categories.code_prefix`.
- Incrementa `product_code_counters.last_value` mediante `INSERT ... ON CONFLICT DO UPDATE`.
- Forma códigos con al menos cuatro dígitos, por ejemplo `PEL-0001`.
- La operación atómica mantiene secuencias independientes y evita colisiones concurrentes.

Trigger: `products_generate_code_before_insert`, `BEFORE INSERT` sobre `products`.

### `public.preserve_product_code()`

Reemplaza cualquier intento de actualización de `code` con `OLD.code`.

Trigger: `products_preserve_code_before_update`, `BEFORE UPDATE OF code` sobre `products`.

### Flujo transaccional de reservas

- `next_order_public_code()`: consume una secuencia y genera códigos `RES-0001` sin reutilizarlos.
- `create_pending_order(...)`: valida artículos únicos, consulta productos activos y precios vigentes, crea
  orden e ítems juntos y devuelve el mismo resultado ante una clave de idempotencia repetida.
- `confirm_pending_order(order_id)`: bloquea orden y productos, comprueba vencimiento y stock completo,
  descuenta inventario y confirma en una sola transacción.
- `reject_pending_order(order_id, reason)`: bloquea la orden pendiente, registra rechazo y no toca stock.
- `expire_pending_orders()`: marca como vencidas las solicitudes pendientes cuyo plazo terminó.

Las funciones son `SECURITY DEFINER`, tienen `search_path` vacío y solo conceden ejecución a `service_role`.

## Relaciones conocidas

```text
categories 1 ─── N products
categories 1 ─── 1 product_code_counters

orders 1 ─── N order_items
products 1 ─── N order_items
```

## Clientes y seguridad

### Cliente SSR de sesión

`src/lib/supabase/server.ts#createSupabaseServerClient` usa URL y clave publicable con cookies de Next.js.
El proxy actualiza cookies porque los Server Components no siempre pueden escribirlas.

### Cliente privilegiado

`createPrivilegedSupabaseClient` usa `SUPABASE_SECRET_KEY` solo en módulos `server-only`. No persiste sesión
ni refresca tokens. Todo servicio que lo utiliza debe ejecutar primero `requireAdmin()`.

### Cliente público del catálogo

`productService.ts` crea un cliente con variables públicas y consulta solo `is_active = true`.

### RLS

- **Confirmado:** RLS habilitado en `product_code_counters` por migración.
- **Inferido como requisito operativo:** la clave publicable puede leer productos activos y categorías.
- **No verificado:** políticas exactas de `categories`, `products`, Storage, `orders` y `order_items`.

## Servicios y operaciones

| Operación | Implementación |
| --- | --- |
| Obtener productos públicos activos | `src/features/products/services/productService.ts#getActiveProducts` |
| Obtener productos administrativos | `adminProductService.ts#getAdminProducts` |
| Obtener producto por ID | `adminProductService.ts#getProductById` |
| Obtener categorías | `adminProductService.ts#getCategories` |
| Crear producto | `adminProductService.ts#createProduct` |
| Actualizar producto | `adminProductService.ts#updateProduct` |
| Desactivar/restaurar | `deactivateProduct` / `reactivateProduct` |
| Actualizar referencia de imagen | `updateProductImage` |
| Buscar producto por código | `adminProductService.ts#getProductByCode` |
| Registrar reserva pendiente | `reservationOrderService.ts#createReservationOrder` mediante `create_pending_order` |
| Listar y consultar reservas | `adminOrderService.ts#getAdminOrders` / `getAdminOrderById` |
| Aceptar o rechazar | `adminOrderService.ts#confirmOrder` / `rejectOrder` |

## Supabase Storage

- Bucket esperado por el código: `products`.
- Acceso visual: URL pública guardada en `products.image_url`.
- Ruta interna nueva: `{categorySlug}/{productCode}/{uuid}.{ext}`.
- Formatos: JPEG, PNG y WebP.
- Límite de aplicación: 2 MB.
- `upsert: false` evita sobrescrituras.
- Se valida MIME, tamaño y firma básica del archivo tanto en la frontera del servicio como en UI.
- Al reemplazar, la referencia nueva se guarda antes de intentar retirar la anterior.
- Al desactivar un producto, la imagen se conserva.

**No verificado:** configuración real de privacidad, límite y MIME del bucket; políticas exactas de Storage.

## Autenticación administrativa

Supabase Auth autentica por correo/contraseña. La autorización adicional compara `user.id` con
`ADMIN_USER_ID`. `proxy.ts`, layouts/páginas protegidas y servicios administrativos aplican controles
complementarios. No hay registro público de administradores.

El login admite sesión temporal o persistente. `beetho-admin-session-mode` es una cookie HttpOnly que solo
guarda esa preferencia, nunca credenciales ni tokens. En modo temporal, el adaptador SSR elimina `maxAge` y
`expires` de las cookies nuevas o renovadas de Auth; en modo persistente conserva la duración estándar de
Supabase. Las cookies de eliminación (`maxAge: 0`) se preservan para mantener funcional el cierre de sesión.

## Variables de entorno

- Públicas: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
- Privadas: `SUPABASE_SECRET_KEY`, `ADMIN_USER_ID`.

No documentar valores, tokens, contraseñas o identificadores privados.

## Discrepancias y pendientes

1. Falta versionar el esquema base completo.
2. Falta confirmar las restricciones e índices no incluidos en la migración disponible.
3. Falta documentar y verificar todas las políticas RLS.
4. La limitación pública por frecuencia vive en memoria de cada instancia; la idempotencia de PostgreSQL sí
   es durable entre instancias.
5. `rollbackCreatedProduct` elimina físicamente un producto recién creado solo para compensar un fallo de
   imagen; cualquier cambio a esta estrategia debe revisar también el contador de códigos.

## Reglas de mantenimiento

- Actualizar este documento con cada migración, tabla, columna, función, trigger, política o servicio.
- No ejecutar migraciones desde una tarea documental.
- No alterar producción para “completar” documentación.
- Comparar el esquema remoto antes de operaciones sensibles; registrar diferencias sin exponer secretos.
