# Guía de Clean Code de Beetho

**Última actualización:** 2026-11-26  
**Autoridad:** complementa `AGENTS.md`; si existe conflicto, prevalece `AGENTS.md`.

## Nomenclatura e idioma

- Usar inglés en variables, funciones, tipos, componentes, archivos y rutas internas.
- Usar español en textos visibles y comentarios explicativos.
- `camelCase` para variables y funciones.
- `PascalCase` para componentes y tipos.
- Elegir nombres descriptivos; evitar abreviaturas ambiguas y términos como `data`, `item` o `helper` cuando
  exista un nombre de dominio más preciso.

## Organización por funcionalidades

```text
src/features/<feature>/
  components/   interfaz y composición visual
  hooks/        estado y lógica React reutilizable, solo cuando sea necesario
  services/     acceso a datos e integraciones
  schemas/      validación de entradas y datos externos
  types/        contratos del dominio
  utils/        lógica pura específica de la funcionalidad
```

- Mantener `page.tsx`, `layout.tsx` y `route.ts` enfocados en composición y enrutamiento.
- No consultar Supabase desde componentes de presentación.
- Compartir código globalmente solo cuando exista reutilización real entre funcionalidades.
- Preferir Server Components; usar `"use client"` solo para eventos, estado o APIs del navegador.
- Mantener Server Actions como fronteras no confiables: autenticar, autorizar y validar en cada operación.

## Separación de responsabilidades

- Componentes: presentación y eventos de UI.
- Hooks: lógica React con estado reutilizable.
- Servicios: PostgreSQL, Auth, Storage y otras integraciones.
- Schemas Zod: formularios, filas externas, parámetros o payloads no confiables.
- Types: contratos internos ya validados.
- Utilidades: lógica pura y determinista.

Una función debe tener una responsabilidad clara, argumentos y retorno tipados. Evitar capas genéricas que no
reduzcan duplicación o riesgo real.

## Legibilidad y TypeScript

- Mantener funciones pequeñas y cohesionadas.
- Preferir `const`; declarar variables cerca del inicio del bloque cuando mejore la lectura.
- Evitar anidamiento excesivo mediante retornos tempranos.
- No usar `any`, `@ts-ignore` ni silencios equivalentes.
- Usar `unknown` y estrechar de forma segura.
- No duplicar reglas de negocio en JSX, cliente y servidor.
- Centralizar números, límites y cadenas repetidas con significado de negocio.
- Comentar decisiones no obvias, no lo que la línea ya expresa.

## Validación y errores

- Validar con Zod en fronteras: `FormData`, params, query, respuestas externas y webhooks futuros.
- Diferenciar validación, recurso inexistente, conflicto y fallo interno cuando exista una API HTTP.
- Mostrar mensajes seguros y útiles al usuario.
- Registrar contexto técnico breve, nunca claves, tokens, contraseñas o datos personales.
- No devolver mensajes internos de Supabase ni stack traces al navegador.

## Seguridad

- Importar clientes privilegiados únicamente desde módulos `server-only`.
- Verificar `requireAdmin()` en cada servicio o acción administrativa.
- No confiar en precios, stock, totales o identidad enviados por el navegador.
- Usar variables `NEXT_PUBLIC_*` solo para valores explícitamente publicables.
- No modificar RLS, tablas, migraciones o producción sin autorización.
- No hacer commit, push, merge, rollback o despliegue sin autorización explícita.

## Datos temporales

Los mocks o datos hardcodeados temporales deben llevar inmediatamente antes un comentario en español con:

1. Qué debe reemplazarse.
2. Dónde debe modificarse.
3. Tabla, API o servicio definitivo.
4. Campos necesarios.

Ejemplo:

```ts
// TODO(INTEGRACIÓN): Reemplazar estas órdenes temporales.
// Origen: tabla public.orders mediante getPendingOrders().
// Campos: id, status, total, source y created_at.
// Ubicación definitiva: features/orders/services/orderService.ts.
const temporaryOrders: Order[] = [];
```

No mezclar mocks con credenciales ni conservarlos silenciosamente cuando la integración ya exista.

## Pruebas y calidad

Herramientas confirmadas:

- Vitest para lógica, schemas, servicios y componentes que no requieran un navegador completo.
- TypeScript con `tsc --noEmit`.
- ESLint con Core Web Vitals y TypeScript.
- `next build` para compilación de producción.

Priorizar pruebas de:

- Reglas de negocio y transformaciones.
- Validación de entradas y respuestas externas.
- Servicios críticos con fuentes de datos simuladas.
- Autorización y manejo de errores.
- Precio, stock, disponibilidad y operaciones de órdenes.
- Idempotencia y concurrencia cuando correspondan a base de datos.

No escribir pruebas que solo reproduzcan detalles internos sin proteger comportamiento. No afirmar que una
prueba pasó si no se ejecutó.

Antes de cerrar una funcionalidad:

```bash
npm run test
npm run typecheck
npm run lint
npm run build
```

Si el entorno impide algún comando, registrar el error real y no atribuirlo automáticamente al código.

## Flujo de trabajo

1. Leer `AGENTS.md` y la documentación de `docs/`.
2. Confirmar en código solo lo necesario para la tarea.
3. Implementar el cambio mínimo completo.
4. Probar y corregir.
5. Actualizar únicamente la documentación afectada.
6. Entregar cambios, archivos, pruebas, verificación, pendientes y estado de Git/despliegue.

## Mantenimiento documental

- El código y las migraciones versionadas son la fuente primaria ante discrepancias.
- La documentación es memoria inicial, no prueba automática del estado de producción.
- Marcar cada dato relevante como confirmado, inferido, pendiente o no verificado.
- Cambiar solo apartados afectados y conservar información válida.
- Actualizar la fecha al modificar contenido sustancial.
