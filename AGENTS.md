AGENTS.md — Beetho

## Documentación obligatoria

Antes de comenzar cualquier tarea, consultar:

1. [Contexto del proyecto](docs/PROJECT_CONTEXT.md)
2. [Base de datos](docs/DATABASE.md)
3. [Sistema de diseño](docs/DESIGN_SYSTEM.md)
4. [Clean Code](docs/CLEAN_CODE.md)
5. [Registro de progreso](docs/WORKLOG.md)
6. [Incidencias y recuperación](docs/TROUBLESHOOTING.md), cuando exista un error o bloqueo.

### Reglas de consulta

1. Leer primero la documentación disponible y utilizarla como referencia inicial.
2. Consultar el código local cuando sea necesario confirmar una implementación.
3. Evitar repetir consultas externas si la respuesta ya está documentada y sigue vigente.
4. Verificar el estado real de servicios externos antes de operaciones sensibles.
5. No asumir que la documentación representa automáticamente el estado actual de producción.
6. Registrar como pendiente o no verificado aquello que no pueda comprobarse.

### Reglas de actualización

La actualización documental forma parte de la entrega de cada funcionalidad. Modificar únicamente
los apartados afectados y conservar la información válida existente:

- Nueva funcionalidad o cambio arquitectónico: actualizar `docs/PROJECT_CONTEXT.md`.
- Nueva tabla, columna, función, trigger o política: actualizar `docs/DATABASE.md`.
- Nuevo componente visual o cambio de estilos: actualizar `docs/DESIGN_SYSTEM.md`.
- Nueva convención de desarrollo: actualizar `docs/CLEAN_CODE.md`.
- Incidencia, diagnóstico o solución reutilizable: actualizar `docs/TROUBLESHOOTING.md`.
- Avance, validación o siguiente actividad: actualizar `docs/WORKLOG.md`.
- Actualizar la fecha y el nivel de certeza de la información modificada.

## Protocolo de continuidad y recuperación de contexto

### Antes de cada tarea

1. Leer `AGENTS.md`.
2. Consultar los documentos relacionados con la tarea.
3. Revisar el último avance de `docs/WORKLOG.md`.
4. Consultar `docs/TROUBLESHOOTING.md` si existe un error o bloqueo.
5. Identificar qué está implementado y qué falta.
6. Continuar desde el último punto válido; no reconstruir trabajo terminado.

Antes de investigar un error, comparar su mensaje, ruta, entorno, síntomas, archivos relacionados y cambios
recientes con las incidencias registradas. Si coincide, comprobar primero si la solución anterior sigue siendo
aplicable, sin asumir que síntomas similares tienen siempre la misma causa.

### Durante el trabajo

- Reutilizar código y evidencia existentes; evitar investigaciones, diagnósticos y comandos ya concluidos.
- Trabajar incrementalmente y probar únicamente lo correspondiente a los cambios.
- No reconstruir funcionalidades terminadas ni modificar configuraciones estables sin evidencia.
- Registrar errores relevantes, diagnóstico, resultado y solución confirmada.
- Si una comprobación falla repetidamente con el mismo resultado, no ejecutarla de nuevo sin cambiar la
  hipótesis o las condiciones. Registrar lo comprobado, identificar la información faltante, formular una
  hipótesis nueva y realizar una prueba concreta.
- Después de dos intentos equivalentes sin información nueva, abandonar esa estrategia, explicar el bloqueo
  y solicitar la información o autorización necesaria.

### Recuperación de localhost y servidor de desarrollo

Cuando localhost no responda o quede cargando:

1. Revisar primero `docs/TROUBLESHOOTING.md`.
2. Identificar el puerto configurado, sin cambiarlo todavía.
3. Comprobar si un proceso exacto del proyecto está escuchando en ese puerto.
4. Comprobar la respuesta mediante una petición HTTP con tiempo límite.
5. Revisar los logs relevantes del proceso.
6. Distinguir si el fallo pertenece al proceso, puerto, aplicación o conexión externa.
7. Aplicar la corrección mínima respaldada por la evidencia y verificarla.

### Límites de tiempo obligatorios

- Toda petición de diagnóstico a localhost debe usar un límite máximo de 10 segundos.
- Una compilación inicial de ruta puede observarse hasta 30 segundos. Si no produce salida nueva ni responde,
  registrar el bloqueo y abandonar esa estrategia; no encadenar nuevas esperas equivalentes.
- Los comandos de inspección de procesos deben tener un límite máximo de 5 segundos.
- Un servidor iniciado solo para verificación debe ejecutarse con cierre automático o con un mecanismo externo
  acotado. No depender de una escritura interactiva de `Ctrl+C` para finalizarlo.
- El cierre debe dirigirse únicamente al PID confirmado del proyecto: primero `SIGINT`, esperar como máximo
  5 segundos y, si continúa, informar antes de aplicar otra señal.
- Ninguna llamada de espera debe superar 30 segundos. Para trabajos legítimamente largos, revisar progreso
  mediante intervalos acotados y comunicar el estado, sin acumular esperas iguales.

Evitar iniciar repetidamente `npm run dev`, abrir instancias innecesarias, cambiar puertos sin explicación,
usar `killall node` o `pkill node`, terminar procesos ajenos, eliminar `.next` por rutina, reinstalar
dependencias sin evidencia o cambiar configuraciones que funcionaban. Si hace falta reiniciar, identificar
primero el PID y confirmar que pertenece a este proyecto. No terminar procesos ajenos ni realizar acciones
destructivas sin autorización.

### Al finalizar

1. Actualizar únicamente los documentos afectados.
2. Registrar en `docs/WORKLOG.md` la funcionalidad, pruebas reales, estado y siguiente paso.
3. Registrar en `docs/TROUBLESHOOTING.md` cualquier incidencia o solución reutilizable.
4. Indicar claramente los pendientes o bloqueos.
5. No realizar commits, push, merge ni despliegues sin autorización explícita.

1. Contexto del proyecto
Beetho es una tienda web de juguetes. El objetivo inicial es un MVP con catálogo público, categorías, búsqueda, detalle de productos, carrito y registro de pedidos sin autenticación de clientes.

Tecnologías establecidas: Next.js 16 (App Router), React, TypeScript estricto, Tailwind CSS, Supabase (PostgreSQL) y Vercel con integración a GitHub. Usar Vitest para las pruebas esenciales. Incorporar Zod para validar datos en los límites de la aplicación.

Identidad visual: café y blanco como colores principales. Mantener un diseño consistente y responsive. No añadir bibliotecas ni funcionalidades fuera del alcance solicitado sin justificar su necesidad.

Modelo inicial de datos: categories, products, orders y order_items. Comprobar el esquema real antes de crear migraciones o asumir campos adicionales. El carrito puede persistirse en localStorage, sin tratarlo como fuente confiable de precios ni inventario.
2. Reglas obligatorias de trabajo
1. Idioma: nombres de variables, funciones, tipos, componentes, rutas internas y archivos de código en inglés. Comentarios explicativos en español. Los textos visibles de la tienda pueden estar en español.
2. Organización por funcionalidad: agrupar productos, carrito y pedidos por módulos; evitar carpetas globales que mezclen lógica de negocio de distintas funciones.
3. Pruebas esenciales: probar lógica de negocio, servicios, validaciones y operaciones críticas. No escribir pruebas triviales que solo verifiquen detalles de implementación.
4. Datos temporales: permitir mocks o datos hardcodeados únicamente cuando sea necesario. Identificar claramente qué reemplazar, dónde y de qué tabla/API procederá el dato.
5. Trabajo incremental: implementar una funcionalidad por vez, validarla y después avanzar. No modificar módulos no relacionados sin necesidad.
6. Responsabilidades separadas: componentes para UI; hooks para estado y lógica React; servicios para acceso a datos; schemas para validación; types para contratos tipados.
7. Clean Code estricto: camelCase para variables y funciones; PascalCase para componentes y tipos; nombres descriptivos; variables al inicio de la función cuando mejore la lectura; funciones pequeñas, cohesionadas y reutilizables; evitar duplicación y abstracciones innecesarias.
8. TypeScript estricto: no utilizar any ni ignorar errores de tipos. Preferir unknown y estrechar tipos de forma segura. Usar Zod para validar entradas y respuestas externas cuando corresponda.
9. Errores y logs: gestionar errores de forma estructurada, devolver respuestas HTTP consistentes y mensajes claros; registrar contexto técnico útil sin filtrar datos sensibles.
10. Entrega breve: al finalizar cada funcionalidad, reportar cambios, archivos afectados, cómo probar y resultados reales de las pruebas. No afirmar que algo se probó si no se ejecutó.
11. Git con autorización: se puede editar código local y ejecutar pruebas, pero no hacer git commit, git push, merge, deploy ni rollback sin autorización explícita del usuario. No hacer cambios destructivos en bases de datos o recursos remotos sin aprobación.
3. Estructura de proyecto recomendada
Adaptar a la estructura existente; no mover archivos por estética si eso no aporta valor.
src/
  app/                       # Rutas, layouts y endpoints de Next.js
    api/                     # Route Handlers del backend
  features/
    products/
      components/
      hooks/
      services/
      schemas/
      types/
    cart/
      components/
      hooks/
      services/
      schemas/
      types/
    orders/
      components/
      hooks/
      services/
      schemas/
      types/
  components/
    ui/                      # Componentes verdaderamente compartidos
  lib/                       # Clientes e integraciones compartidas
  test/                      # Utilidades comunes de pruebas, si hacen falta
- Crear únicamente las carpetas necesarias para la funcionalidad actual; no generar archivos vacíos.
- Mantener page.tsx, layout.tsx y route.ts enfocados en composición, enrutamiento o recepción de peticiones.
- Preferir Server Components. Usar "use client" solo para componentes que requieran estado, eventos o APIs del navegador.
- No consultar Supabase directamente desde componentes de presentación si esa lógica pertenece a un servicio.
- Compartir componentes o helpers solo cuando exista reutilización real.
4. Estilo de implementación
- Escribir funciones con una responsabilidad clara, argumentos y retornos tipados.
- Priorizar nombres explícitos como calculateCartTotal, getActiveProducts y createOrder frente a nombres vagos.
- Declarar variables cerca del inicio del bloque funcional cuando sea práctico, sin sacrificar alcance mínimo, inmutabilidad ni legibilidad; preferir const a let.
- Evitar números mágicos, cadenas repetidas, anidamiento excesivo y comentarios que repitan lo evidente.
- Comentar en español decisiones no obvias, reglas de negocio y puntos de integración pendientes; no comentar cada línea.
- Evitar dependencias innecesarias, duplicación, lógica de negocio en JSX y componentes demasiado grandes.
- No introducir soluciones complejas (estado global, patrones, capas) sin necesidad demostrada.
Comentario obligatorio para datos temporales
Colocar un comentario inmediatamente antes de la declaración o uso que será reemplazado. Ejemplo:
// TODO(INTEGRACIÓN): Reemplazar estos productos temporales.
// Origen: tabla public.products de Supabase, solo registros is_active = true.
// Campos requeridos: id, name, price, stock, image_url y category_id.
// Ubicación definitiva: servicio getActiveProducts() de features/products/services.
const temporaryProducts: Product[] = [];
- No mezclar datos de prueba con credenciales reales.
- No mantener mocks activos silenciosamente una vez implementada la integración.
- Documentar qué parte sigue simulada en el resumen de entrega.
5. Seguridad y Supabase
- Nunca exponer claves secretas, tokens, contraseñas ni información privada en código del cliente, logs, ejemplos o commits.
- Las variables NEXT_PUBLIC_* son accesibles desde el navegador: usar allí solo la URL y la clave publicable que Supabase permite exponer.
- SUPABASE_SECRET_KEY debe utilizarse solo del lado del servidor y únicamente cuando sea necesario; jamás importarla desde módulos cliente.
- Aplicar el principio de mínimo privilegio y verificar las políticas de Row Level Security (RLS).
- Permitir lectura pública únicamente de datos previstos para catálogo, como productos activos; impedir el acceso público a datos privados de pedidos.
- Validar en el servidor los pedidos con Zod; consultar precios y disponibilidad en PostgreSQL antes de calcular el total. Nunca confiar en el total, precio o stock enviados desde localStorage o el navegador.
- Evitar guardar más datos personales de los necesarios. No registrar teléfono, dirección ni otros datos del cliente en logs.
- Para operaciones que crean pedido e ítems, mantener consistencia transaccional; si todavía no se implementa, señalarlo explícitamente como pendiente antes de aceptar pedidos reales.
- No ejecutar DROP, TRUNCATE, migraciones destructivas o cambios a producción sin autorización.
6. APIs, validación y errores
- Definir schemas Zod para entradas no confiables: body, params, query y respuestas externas relevantes.
- Diferenciar errores de validación (400), recurso no encontrado (404), conflicto de negocio (409) y fallo interno (500) cuando aplique.
- Mantener un formato de error consistente, por ejemplo:
{
  "error": {
    "code": "INVALID_ORDER",
    "message": "Los datos del pedido no son válidos"
  }
}
- No enviar al cliente stack traces, cadenas de conexión ni detalles internos de Supabase.
- Usar logs breves con contexto de operación y errores técnicos; ocultar datos sensibles.
- Respetar la configuración existente de Next.js 16: no añadir export const dynamic = "force-dynamic" si cacheComponents está habilitado.
7. Pruebas y controles de calidad
Con Vitest, priorizar como mínimo:
- Cálculo de subtotal/total y actualización de cantidades en el carrito.
- Validaciones de productos y formularios de pedido.
- Reglas de stock, precios y disponibilidad de los productos.
- Servicios y endpoints críticos, con mocks de Supabase cuando proceda.
- Casos de error y respuestas HTTP relevantes.
Antes de cerrar una funcionalidad:
1. Ejecutar las pruebas relacionadas (por ejemplo, npx vitest run si Vitest está configurado).
2. Ejecutar npm run lint y npm run build, cuando los scripts y el entorno lo permitan.
3. Verificar manualmente el flujo principal en pantalla y su versión móvil cuando haya cambios de UI.
4. Informar los comandos ejecutados, si terminaron bien y cualquier fallo o prueba pendiente.
No inventar resultados ni asegurar cobertura sin haberla medido.
8. Proceso de trabajo del agente
Para cada solicitud:
1. Revisar la funcionalidad pedida y los archivos directamente relacionados.
2. Explicar brevemente el alcance y las decisiones relevantes si el cambio no es trivial.
3. Implementar el cambio mínimo completo, reutilizando la arquitectura existente.
4. Probar, corregir fallos encontrados y revisar tipos, lint y compilación aplicables.
5. Entregar un resumen técnico corto con el formato de la siguiente sección.
6. Solicitar autorización antes de hacer commit, push, merge o despliegue.
No reescribir funcionalidades estables, cambiar dependencias importantes o alterar el esquema de base de datos sin motivo y sin explicarlo. Si falta información no esencial, elegir una opción sencilla y documentar la suposición.
9. Formato obligatorio de entrega
Funcionalidad: [nombre]
Cambios: [resumen breve]
Archivos: [rutas creadas o modificadas]
Pruebas: [comandos ejecutados y resultado real]
Cómo verificar: [pasos concretos]
Pendientes: [integraciones simuladas, limitaciones o ninguno]
Git/Despliegue: Sin realizar; pendiente de autorización.
10. Alcance del MVP actual
Priorizar, en este orden:
1. Verificar el esquema y los datos de categories, products, orders y order_items.
2. Construir los componentes base de la identidad visual Beetho (café y blanco).
3. Implementar catálogo, categorías y búsqueda con productos reales de Supabase.
4. Implementar detalle del producto y carrito persistido localmente.
5. Implementar el checkout y registro seguro de pedidos.
6. Validar flujos principales y desplegar solo después de la autorización.
Dejar autenticación de clientes, panel administrativo completo, pagos electrónicos y facturación fuera del MVP salvo solicitud expresa.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
