# Incidencias y recuperación de Beetho

**Última actualización:** 2026-11-26  
**Alcance:** memoria operativa confirmada; no reemplaza la revisión de logs ni demuestra el estado actual de
producción.

## Uso de este documento

Antes de diagnosticar, comparar mensaje, ruta, entorno, síntomas, archivos relacionados y cambios recientes.
Reutilizar una solución solo después de comprobar que las condiciones coinciden. Cuando la causa no esté
demostrada, mantenerla como pendiente.

## Protocolo rápido para localhost

1. Identificar el puerto configurado.
2. Comprobar si existe un proceso del proyecto escuchando.
3. Hacer una petición HTTP con tiempo límite.
4. Revisar los logs de esa instancia.
5. Clasificar el fallo como proceso, puerto, aplicación o conexión externa.
6. Aplicar y verificar el cambio mínimo.

Límites: HTTP 10 segundos, inspección de procesos 5 segundos y compilación inicial de ruta 30 segundos sin
salida nueva. Al alcanzar el límite, cambiar de hipótesis o registrar el bloqueo. Los servidores temporales
deben tener cierre automático; no usar una espera interactiva de `Ctrl+C` como único mecanismo de cierre.

No iniciar varias instancias, cambiar el puerto, borrar `.next`, reinstalar dependencias ni terminar procesos
sin evidencia. Nunca usar `killall node` o `pkill node`; identificar el proceso exacto.

## Incidencias registradas

### INC-001 — El comando de cierre del servidor quedó esperando

- **Síntomas:** después de verificar una ruta, el comando usado para enviar `Ctrl+C` a la sesión del servidor
  permaneció esperando y la interacción pareció congelada. Reapareció al verificar `/admin/login`.
- **Entorno:** Local, puerto 3100.
- **Diagnóstico:** la implementación y sus validaciones ya habían concluido. Tras interrumpir la espera, una
  petición HTTP con límite de dos segundos devolvió error de conexión (`curl` código 7), confirmando que no
  quedaba un servidor accesible en el puerto 3100.
- **Causa:** pendiente de confirmar. No se obtuvo evidencia de un fallo de Next.js ni de la aplicación; el
  bloqueo observado perteneció al mecanismo usado para esperar/cerrar la sesión de terminal.
- **Solución:** interrumpir la espera bloqueada, comprobar el puerto mediante HTTP y continuar sin iniciar
  otra instancia innecesaria. Para verificaciones futuras, iniciar el servidor con cierre automático y usar
  señales sobre el PID confirmado con esperas externas máximas de cinco segundos.
- **Verificación:** `curl --max-time 2 http://127.0.0.1:3100/admin/orders/new` no pudo conectar; las pruebas,
  TypeScript y ESLint de la funcionalidad habían terminado correctamente.
- **Estado:** recurrente confirmado; mitigación documentada, causa del bloqueo interactivo pendiente.
- **Fecha:** última aparición y actualización 2026-11-26.

### INC-002 — Next.js no puede abrir un puerto en el entorno aislado

- **Síntomas:** la compilación con Turbopack termina con `binding to a port: Operation not permitted`; una
  verificación posterior con `next dev -p 3100` terminó inmediatamente con `listen EPERM`.
- **Entorno:** entorno local aislado del agente.
- **Diagnóstico:** ambos fallos aparecieron al intentar abrir puertos dentro del sandbox; incluso `ss` no
  pudo abrir su socket netlink. Pruebas, TypeScript y ESLint sí pudieron ejecutarse. No existe evidencia para
  atribuirlo al código de Beetho.
- **Causa:** restricción de permisos del entorno aislado, confirmada solo para esta sesión de agente; no
  verificada en una terminal normal ni en Vercel.
- **Solución:** pendiente. Ejecutar una sola vez en un entorno que permita la operación y conservar su salida;
  no repetir el mismo comando dentro del sandbox esperando un resultado distinto.
- **Verificación:** el proceso temporal tuvo cierre automático y terminó con código 1; la verificación
  funcional sigue pendiente fuera del entorno aislado.
- **Estado:** pendiente y conocido.
- **Fecha:** última aparición y actualización 2026-11-26.

### INC-003 — `npm` no está disponible en el `PATH` del agente

- **Síntomas:** los comandos `npm run test`, `npm run typecheck` y `npm run lint` terminan inmediatamente con
  `npm: command not found`.
- **Entorno:** entorno local aislado del agente.
- **Diagnóstico:** `node_modules` y los ejecutables de Vitest, TypeScript y ESLint sí existen; también existe
  el runtime Node en `/usr/lib/chatgpt/resources/cua_node/bin/node`.
- **Causa:** el `PATH` de esa sesión no expone Node/npm. No es un fallo confirmado del repositorio.
- **Solución:** ejecutar una sola vez los binarios instalados mediante la ruta explícita del runtime Node.
- **Verificación:** Vitest, TypeScript y ESLint terminaron correctamente usando esa ruta.
- **Estado:** resuelto para esta sesión; puede reaparecer en el entorno aislado.
- **Fecha:** última aparición y actualización 2026-11-26.

## Incidencias todavía no documentadas con evidencia

No hay diagnósticos confirmados para fallos de rutas en Vercel, autenticación, conexión con Supabase,
variables de entorno o puertos ocupados. Si aparecen, registrar evidencia antes de atribuir una causa.

## Cómo añadir una incidencia

Usar un identificador secuencial e incluir síntomas, entorno, diagnóstico, causa, solución, verificación,
estado y fechas. Actualizar una entrada existente cuando sea la misma incidencia; no crear duplicados.
