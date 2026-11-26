# Registro de progreso de Beetho

**Última actualización:** 2026-11-26  
**Propósito:** indicar el último punto válido y el siguiente paso sin reproducir conversaciones completas.

## Estado actual resumido

- **Confirmado:** catálogo público, CRUD administrativo, Auth, imágenes en Supabase Storage, códigos
  automáticos por categoría y reserva mediante enlace de WhatsApp.
- **Confirmado con pruebas:** lista múltiple, registro transaccional, código de reserva, resumen de WhatsApp y
  gestión administrativa de órdenes.
- **Pendiente inmediato:** completar la validación automatizada y visual del flujo integrado; después preparar
  una comprobación en Vercel únicamente con autorización de despliegue.
- **No verificado:** configuración y comportamiento actuales del despliegue de Vercel y políticas RLS
  completas.

## 2026-11-26 — Documentación técnica persistente

- **Estado anterior:** el conocimiento técnico estaba repartido entre código e instrucciones.
- **Cambios realizados:** se documentaron arquitectura, base de datos, diseño y convenciones, y se convirtió
  `AGENTS.md` en punto de entrada obligatorio.
- **Archivos afectados:** `AGENTS.md`, `docs/PROJECT_CONTEXT.md`, `docs/DATABASE.md`,
  `docs/DESIGN_SYSTEM.md` y `docs/CLEAN_CODE.md`.
- **Pruebas:** revisión documental contra repositorio local; no se modificó lógica.
- **Problemas encontrados:** el esquema base completo y varias políticas RLS no están versionados.
- **Estado final:** completado.
- **Siguiente paso:** conservar estos documentos sincronizados con cada funcionalidad.

## 2026-11-26 — Códigos automáticos e imágenes organizadas

- **Estado anterior:** el administrador introducía códigos y las rutas de imágenes no integraban categoría y
  código de forma completa.
- **Cambios realizados:** PostgreSQL genera códigos transaccionales por categoría; el formulario dejó de
  pedirlos; nuevas imágenes usan `{categorySlug}/{productCode}/{uuid}.{ext}`.
- **Archivos afectados:** migración `supabase/migrations/202611260001_product_code_automation.sql` y módulo
  `src/features/products/`.
- **Pruebas:** generación e incremento por categoría, independencia, concurrencia, preservación del código,
  validaciones y rutas de Storage. La migración fue comprobada en Supabase mediante una transacción revertida.
- **Problemas encontrados:** falta una migración base versionada del esquema histórico.
- **Estado final:** completado; verificación visual de Storage en producción pendiente.
- **Siguiente paso:** no alterar los códigos históricos ni mover imágenes existentes.

## 2026-11-26 — Tarea 04, fase 1: mensaje de WhatsApp

- **Estado anterior:** existía el enlace de reserva; debía confirmarse el formato exacto multilínea.
- **Cambios realizados:** se centralizó y verificó el mensaje con líneas reales, cantidad singular/plural y
  precio en bolivianos.
- **Archivos afectados:** `src/features/products/utils/whatsAppReservation.ts` y su prueba.
- **Pruebas:** suite automatizada correcta en el momento de cierre de la fase.
- **Problemas encontrados:** ninguno de lógica.
- **Estado final:** completado.
- **Siguiente paso:** procesar el mismo formato de forma determinista.

## 2026-11-26 — Tarea 04, fase 2: vista previa de reserva

- **Estado anterior:** WhatsApp preparaba el mensaje, pero la aplicación no podía interpretarlo.
- **Cambios realizados:** se añadió `/admin/orders/new`, parser tolerante, validación Zod, búsqueda por código,
  cálculo con precio actual y vista previa protegida. No se registra todavía una orden.
- **Archivos afectados:** `src/features/orders/`, `src/app/admin/(protected)/orders/new/`, layout administrativo,
  servicio administrativo de productos y documentos técnicos relacionados.
- **Pruebas:** Vitest 35/35, TypeScript y ESLint correctos. La ruta sin sesión redirigió a `/admin/login`.
  La compilación quedó sin validar por `INC-002`.
- **Problemas encontrados:** la espera usada para cerrar el servidor se bloqueó; ver `INC-001`.
- **Estado final:** fase 2 completada; inspección autenticada visual pendiente.
- **Siguiente paso:** fase 3: inspeccionar `orders` y `order_items`, documentar el esquema real y presentar SQL
  mínimo para autorización si hace falta. Después implementar confirmación y registro transaccional.

## 2026-11-26 — Protocolo de continuidad e incidencias

- **Estado anterior:** no existían bitácora cronológica ni historial de recuperación.
- **Cambios realizados:** se añadieron este registro, el historial de incidencias y las reglas obligatorias de
  continuidad, recuperación de localhost y corte de diagnósticos repetitivos.
- **Archivos afectados:** `AGENTS.md`, `docs/WORKLOG.md` y `docs/TROUBLESHOOTING.md`.
- **Pruebas:** enlaces relativos y estructura documental revisados localmente.
- **Problemas encontrados:** no hay evidencia histórica suficiente para diagnosticar incidentes antiguos de
  Vercel, Auth o Supabase; permanecen sin inventar.
- **Estado final:** completado.
- **Siguiente paso:** continuar la fase 3 de órdenes desde la entrada anterior.

## 2026-11-26 — Tarea 05, fase A: mantener sesión administrativa

- **Estado anterior:** Supabase SSR persistía automáticamente todas las sesiones; el login no permitía elegir
  entre una cookie de sesión y una cookie persistente.
- **Cambios realizados:** se añadió la casilla de login, validación Zod, política de cookies temporal o
  persistente, conservación del modo durante renovaciones del proxy y eliminación al cerrar sesión.
- **Archivos afectados:** módulo `src/features/admin/`, `src/lib/supabase/server.ts`, `src/proxy.ts` y
  documentación relacionada.
- **Pruebas:** Vitest 40/40, TypeScript y ESLint correctos; `git diff --check` correcto. Se usó el runtime Node
  explícito por `INC-003`. No se repitió `next build` por la incidencia conocida `INC-002`.
- **Problemas encontrados:** la superficie compartida del navegador no estuvo disponible para verificar el
  cierre y reapertura real.
- **Estado final:** implementación y pruebas automatizadas completadas; verificación manual entre reinicios de
  navegador pendiente.
- **Siguiente paso:** comprobar ambos modos en un navegador real y después iniciar la fase B, lista de reserva
  con varios productos.

## Regla de mantenimiento

Añadir una entrada breve al terminar una funcionalidad relevante. Actualizar el estado o la entrada existente
si se corrige el mismo trabajo; no convertir este archivo en una transcripción ni duplicar el contexto general.

## 2026-11-26 — Límites para servidores y diagnósticos bloqueados

- **Estado anterior:** `INC-001` describía el bloqueo, pero el cierre interactivo todavía podía esperar sin un
  límite efectivo.
- **Cambios realizados:** se establecieron límites de 10 segundos para HTTP, 5 para inspección de procesos y
  30 para compilación sin progreso; los servidores temporales deberán usar cierre automático.
- **Archivos afectados:** `AGENTS.md`, `docs/TROUBLESHOOTING.md` y `docs/WORKLOG.md`.
- **Pruebas:** se confirmó con una búsqueda acotada que la instancia iniciada por el agente ya no estaba activa.
- **Problemas encontrados:** la herramienta de escritura interactiva no respetó el tiempo esperado al enviar
  `Ctrl+C`; no debe volver a utilizarse como mecanismo único de cierre.
- **Estado final:** mitigación documental completada.
- **Siguiente paso:** retomar la validación de la fase A sin iniciar un servidor interactivo sin cierre automático.

## 2026-11-26 — Tarea 05, fase B: lista de reserva múltiple

- **Estado anterior:** cada tarjeta preparaba una reserva individual; no existía una selección compartida.
- **Cambios realizados:** se añadió una lista cliente con agregado, cantidades, eliminación, vaciado,
  subtotales, total, advertencia de stock y persistencia validada mediante Zod en `localStorage`.
- **Archivos afectados:** `src/features/reservations/`, tarjeta de producto, página principal y documentación
  visual/arquitectónica.
- **Pruebas:** lógica y almacenamiento 6/6; catálogo integrado 3/3; TypeScript y ESLint correctos. La suite
  completa se ejecuta al cerrar esta fase. No se repite `next build` por `INC-002`.
- **Problemas encontrados:** la prueba del catálogo requería el proveedor real y la hidratación inicial debía
  diferirse para cumplir las reglas de React; ambos se corrigieron.
- **Estado final:** selección múltiple completada; confirmación deliberadamente deshabilitada porque todavía
  no existe creación transaccional en servidor.
- **Siguiente paso:** fase C: inspeccionar el esquema real de `orders` y `order_items` y presentar cualquier
  migración SQL antes de ejecutarla.

## 2026-11-26 — Tarea 05, fase C: propuesta de modelo de órdenes

- **Estado anterior:** el esquema base no estaba versionado ni confirmado; los datos de cliente podían impedir
  solicitudes incompletas.
- **Cambios realizados:** OpenAPI confirmó columnas y nulabilidad; no hay órdenes actuales. Se preparó una
  migración con contacto opcional, código `BEE-000001`, origen, idempotencia, snapshots y RPC transaccionales.
- **Archivos afectados:** `supabase/migrations/202611260002_order_workflow.sql`, `docs/DATABASE.md` y este registro.
- **Pruebas:** consulta remota de solo lectura al esquema y a los estados; cero órdenes encontradas. El SQL no
  fue ejecutado.
- **Problemas encontrados:** el editor SQL compartido no estaba accesible para las herramientas; se usó
  PostgREST sin imprimir secretos ni consultar datos personales.
- **Estado final:** propuesta preparada, pendiente de autorización.
- **Siguiente paso:** revisar y autorizar la migración antes de implementar el servicio público de órdenes.

## 2026-11-26 — Fase 06: revisión del plan de reservas

- **Estado anterior:** la migración propuesta usaba código `BEE-`, contacto opcional y contemplaba WhatsApp
  como posible origen; todavía no había sido ejecutada.
- **Cambios realizados:** el nuevo plan reutiliza la lista múltiple y la sesión persistente ya implementadas.
  La migración se ajustó a `RES-0001`, nombre/teléfono obligatorios, vencimiento de 24 horas, estado `expired`
  y motivo de rechazo. WhatsApp queda únicamente como canal de comunicación posterior al registro.
- **Archivos afectados:** migración de órdenes, `docs/PROJECT_CONTEXT.md`, `docs/DATABASE.md` y este registro.
- **Pruebas:** revisión estática y `git diff --check`; la migración revisada no fue ejecutada.
- **Problemas encontrados:** la autorización previa ya no cubre la versión materialmente modificada.
- **Estado final:** arquitectura reconciliada sin reconstruir las fases completadas.
- **Siguiente paso:** obtener autorización para la migración revisada y después implementar formulario y
  registro público transaccional.

## 2026-11-26 — Fase 06: registro y gestión completa de reservas

- **Estado anterior:** la lista múltiple estaba terminada y la migración revisada esperaba ejecución.
- **Cambios realizados:** se verificó la migración ejecutada; se añadieron confirmación con nombre/teléfono,
  creación idempotente, código `RES-*`, resumen de WhatsApp, listado/detalle administrativo y acciones
  transaccionales de aceptación o rechazo. Se retiró el parser manual de WhatsApp por quedar fuera del plan.
- **Archivos afectados:** `supabase/migrations/202611260002_order_workflow.sql`, rutas `/reservation` y
  `/admin/orders`, módulos `src/features/reservations/` y `src/features/orders/`, layout y documentación.
- **Pruebas:** Vitest 58/58, `next typegen`, TypeScript, ESLint completo y `git diff --check` correctos.
  `next build` no se repite dentro del sandbox por `INC-002`.
- **Problemas encontrados:** los tipos generados de rutas aún no incluían la nueva ruta dinámica; se usó la
  firma explícita compatible con App Router y `next typegen`. La verificación HTTP no pudo iniciarse porque
  el sandbox devolvió `listen EPERM` en el puerto 3100; ver `INC-002`.
- **Estado final:** implementación y validación automatizada completadas; verificación visual integrada y
  pruebas transaccionales concurrentes contra Supabase pendientes.
- **Siguiente paso:** verificar manualmente creación, aceptación/rechazo y persistencia de sesión; después
  validar el build fuera del sandbox antes de autorizar un despliegue.
