# Sistema de diseño de Beetho

**Última actualización:** 2026-11-26  
**Fuente:** `src/app/globals.css` y componentes React actuales.

## Identidad de marca

Beetho usa una estética cálida, simple y orientada a un catálogo familiar. El fondo crema separa las
superficies blancas y el café principal concentra títulos, navegación y acciones principales.

## Colores confirmados

| Token/clase | Valor | Uso actual |
| --- | --- | --- |
| `brand-primary` | `#553723` | Encabezados, texto principal, botones y foco. |
| `brand-secondary` | `#97765F` | Texto secundario, bordes, hover y skeletons. |
| `brand-cream` / fondo | `#F7F1E8` | Fondo general y superficies suaves. |
| Blanco | `#FFFFFF` | Tarjetas, formularios, cabecera administrativa. |
| Verde WhatsApp | `#25D366` | Botón de reserva. |
| Verde éxito | Tailwind `emerald-50/700/800` | Disponibilidad, producto activo y confirmación. |
| Rojo error | Tailwind `red-50/200/700/800` | Errores y desactivación. |
| Piedra neutral | Tailwind `stone-100/500/600` | Agotado, inactivo y acción deshabilitada. |

Los tokens de marca se definen como variables CSS en `globals.css` y se exponen a Tailwind mediante
`@theme inline`.

## Tipografía

- El tema referencia `--font-geist-sans` y `--font-geist-mono`.
- **Inconsistencia confirmada:** `layout.tsx` no importa ni inicializa `next/font`, por lo que esas variables
  no se definen localmente. El README todavía afirma que Geist está configurada.
- Hasta resolverlo, el render final depende de los fallbacks de Tailwind/navegador.
- Pesos usados con frecuencia: `font-semibold`, `font-bold`, `font-extrabold`.

## Escala visual aplicada

No existe un archivo de tokens específico; se utiliza la escala estándar de Tailwind.

- Contenedores: `max-w-7xl` para catálogo/panel, `max-w-4xl` para formularios y `max-w-md` para login/dialog.
- Padding horizontal: `px-4`, luego `sm:px-6` y `lg:px-8`.
- Separación frecuente: `gap-3`, `gap-4`, `gap-5`, `space-y-5` y `space-y-6`.
- Tarjetas: `rounded-2xl`; formularios/login: `rounded-3xl`; botones/campos: `rounded-xl` o `rounded-full`.
- Bordes: normalmente `brand-secondary` entre 10% y 40% de opacidad.
- Sombras: `shadow-sm`, `shadow-md`, `shadow-lg` y `shadow-xl` según jerarquía.

## Responsive

Breakpoints usados: los estándares `sm`, `md`, `lg`, `2xl` de Tailwind y un breakpoint arbitrario de 400 px.

Cuadrícula del catálogo:

```text
< 400 px: 1 columna
≥ 400 px: 2 columnas
md:       3 columnas
lg:       4 columnas
2xl:      5 columnas
```

Los formularios pasan a dos columnas en `sm`; listados administrativos adoptan una estructura de imagen,
contenido y acciones desde `sm`.

## Componentes visuales

### Catálogo

- Tarjetas blancas de altura uniforme, borde suave y hover discreto.
- Imagen cuadrada `1:1`, `object-contain`, padding interno y escala ligera en hover.
- Código en mayúsculas visuales, badge de disponibilidad y nombre limitado a dos líneas.
- Descripción limitada a dos líneas con texto alternativo cuando falta.
- Precio destacado al pie y botón verde de WhatsApp.
- Skeleton con diez tarjetas y pulsos en tonos café.

### Administración

- Shell crema con cabecera blanca y navegación compacta.
- La navegación incluye acceso directo a “Procesar reserva”.
- Listado en tarjetas blancas; búsqueda por nombre o código.
- Formularios blancos, `rounded-3xl`, campos con borde café y anillo de foco.
- El procesamiento de reservas utiliza dos paneles responsive: mensaje y vista previa.
- Modal de desactivación con overlay negro al 40%.
- Login centrado en una tarjeta blanca de ancho máximo `md`.

### Imágenes

- Catálogo: placeholder crema con icono SVG y texto “Imagen no disponible”.
- Administración: vista previa cuadrada; archivos locales usan `blob:` y `unoptimized`.

## Estados de interfaz

- **Carga:** skeletons con `animate-pulse` y `aria-busy`.
- **Vacío:** tarjeta blanca con explicación centrada.
- **Error:** fondo/blorde rojo y mensajes seguros en español.
- **Foco:** borde `brand-primary` y ring `brand-secondary/20`.
- **Pendiente:** botones deshabilitados con cursor de espera y opacidad reducida.
- **Éxito:** bloque `emerald-50` con texto `emerald-800`.
- **No disponible:** control neutral con `aria-disabled`.

## Accesibilidad aplicada

- `lang="es"`, textos alternativos y labels de formularios.
- `role="alert"`, `role="status"`, `aria-busy`, `aria-modal` y encabezados de diálogo.
- Estados no disponibles no dependen únicamente del color.

## Oportunidades de mejora, sin aplicar en esta tarea

1. Configurar realmente Geist o retirar tokens y afirmaciones obsoletas.
2. Extraer la clase repetida de inputs a un componente compartido si aumenta su reutilización.
3. Añadir navegación administrativa escalable antes de incorporar órdenes.
4. Revisar foco atrapado y cierre por teclado del diálogo de desactivación.
5. Verificar manualmente contraste y experiencia móvil en cada cambio visual.

## Mantenimiento

Actualizar este documento al cambiar tokens, tipografía, breakpoints, patrones visuales, estados o componentes
reutilizables. Documentar inconsistencias; no corregirlas silenciosamente durante tareas no visuales.
