# Resultado: filtro de toros

## Implementación
TorosScreen combina búsqueda por nombre o código con el estado del toro. Limpiar filtros restablece ambos controles. El contador anuncia los registros visibles y la pantalla distingue una lista vacía de una consulta sin coincidencias. A 700 px los controles se acomodan y la tabla conserva su desplazamiento horizontal.

## Pruebas
Antes del código, las seis pruebas originales fallaron por los controles ausentes. Hubo que corregir la preparación del viewport: test.use debe estar en un describe síncrono, no dentro del cuerpo de una prueba. Se reforzó también la restauración del fixture cuando no hay sesión.

La revisión complementaria añadió la prueba de lista inicialmente vacía antes de implementar, después de la ejecución roja de seis casos. Esa séptima prueba no tiene registro de fallo individual. El build posterior terminó con código 0 y las catorce pruebas UI pasaron: siete de toros, seis de referencias y la prueba base.

## Criterios verificados
| AC | Evidencia |
|---|---|
| AC1 | Prueba AC1: label+select `Estado del toro` con opciones exactas Todos los estados / Activo / En cuarentena / Inactivo; `<label htmlFor="estado-toro">` en App.tsx. |
| AC2 | Prueba AC2 con `'  fuerte '`, `'titán'` y código `T-003`: filtro AND con trim + minúsculas en ambos lados; label `Buscar toro` asociada al input. |
| AC3 | Prueba AC3: `Limpiar filtros` por click y por teclado (focus + Enter) restablece búsqueda y selector; contador `role="status"` `Mostrando X de Y registros` con valores correctos. |
| AC4 | 2 pruebas: Zeus+Activo → "Ningún toro coincide con los filtros aplicados"; lista `toros: []` → "No hay toros registrados" (ternario en el `<td colSpan={9}>`). Mensajes distintos. |
| AC5 | Prueba AC5 (viewport 700×800): type/ArrowDown/Enter en controles nativos, boundingBox de controles dentro de 700 px, scroll horizontal real (`overflowX` auto + `scrollWidth > clientWidth` con `overflow-x-auto` y `min-w-[760px]`). |
| AC6 | Prueba AC6: contador de PUT `/api/state` tras filtrar/limpiar = 0 y `GET /api/state` intacto (`toEqual` fixture). El diff confirma solo `useState` local; sin llamadas a sync ni cambios en el autoguardado preexistente. |


## Revisión y decisiones
El revisor pidió aclarar la diferencia entre las seis pruebas de la fase roja y las siete de la suite final; quedó registrada en tareas y en este resultado.

La prueba de red cuenta PUT durante las acciones y usa networkidle más una espera acotada de 300 ms. El GET final conserva el estado completo. La pantalla solo modifica sus filtros locales; no modifica las listas del estado global.

La prueba de lista vacía siembra datos por API y la suite restaura el fixture al terminar cada caso. Esas solicitudes de preparación y limpieza se distinguen de las acciones de filtrar y limpiar. El botón Limpiar filtros permanece visible para poder operarlo también por teclado.

## Alcance
Solo TorosScreen, sus pruebas y el build generado. Sin dependencias nuevas ni cambios de backend, otras pantallas o reglas reproductivas. La suite backend queda incluida en CI del PR.

## Ejecución de OpenCode

OpenCode 1.19.5 · opencode/glm-5.3-flash-free.

| Rol | Sesión | Skills cargadas |
|---|---|---|
| coordinador | `ses_e3dd520c3ffeOkBb3zDL3xrqAX` | bovicontrol-sdd |
| verificador | `ses_e3dd44904ffeje1dGNtZNBYH7o` | bovicontrol-react-ui |
| interfaz | `ses_e3dcd2ed4ffeSC5kWuHZU4i7tz` | bovicontrol-react-ui |
| verificador | `ses_e3dca012cffewK5AbyHge3x4by` | — |
| revisor | `ses_e3dc8fa33ffe73rgnMb40GZmPU` | bovicontrol-revision |

Comprobaciones ejecutadas:

| Comando | Resultado | Ejecuciones |
|---|---|---|
| `npm.cmd run test:ui -- bulls` | exit 1 | 3 |
| `npm.cmd run build` | exit 0 | 1 |
| `npm.cmd run test:ui` | exit 0 | 1 |

La herramienta rechazó 5 intentos de comandos fuera de los permisos. No se ampliaron permisos para ejecutarlos.
