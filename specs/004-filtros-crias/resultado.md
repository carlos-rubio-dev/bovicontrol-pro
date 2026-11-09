# Resultado: filtros de crías

## Implementación
CriasScreen combina búsqueda por nombre o código con sexo y estado de salud. Los tres filtros usan AND. Limpiar filtros los restablece y el contador anuncia visibles frente al total. La pantalla distingue una consulta sin coincidencias de una lista sin registros.

## Criterios verificados
| Criterio | Comprobación |
|---|---|
| AC1 | Etiquetas visibles y opciones exactas de sexo y salud. |
| AC2 | Búsqueda con mayúsculas y espacios, código en minúsculas y combinación de los tres controles. |
| AC3 | Limpiar con clic y Enter restablece los controles y el contador. |
| AC4 | Mensajes distintos para filtros sin coincidencias y lista inicialmente vacía. |
| AC5 | Teclado, controles sin solaparse a 700 px y documento sin desbordamiento horizontal. |
| AC6 | Cero PUT al filtrar y limpiar; el GET final conserva el estado completo. |

## Pruebas
Antes de producción, npm.cmd run test:ui terminó con siete fallos de crías por los controles ausentes y catorce pruebas anteriores correctas. Los siete casos ya incluían la lista inicialmente vacía.

Después del cambio, npm.cmd run build terminó con código 0 y npm.cmd run test:ui tuvo veintiuna pruebas correctas: siete de crías y las catorce anteriores. Los datos se restauran después de cada prueba.

## Revisión y decisiones
El revisor aprobó los seis criterios y señaló que los nuevos archivos de static/dist debían incluirse en el commit junto al índice. Se incluyen tanto JavaScript como CSS. Las pruebas se habían confirmado antes del código; son commits del desarrollo, no una operación automática del coordinador.

Se mantuvo el fixture de pruebas siguiendo el patrón de toros. Su duplicación no afecta el comportamiento y no se amplió esta spec con una reorganización de helpers. Se conserva el recorte de espacios de búsqueda y campos.

La revisión complementaria comprobó las pantallas de crías y toros a 700 px con datos sintéticos: los controles se acomodan, las tarjetas permanecen dentro del área visible y la tabla de toros conserva su desplazamiento propio. La comprobación visual complementa las aserciones geométricas; no demuestra accesibilidad completa.

## Alcance
Solo CriasScreen, sus pruebas y el build generado. Sin dependencias nuevas, cambios de backend ni cambios de reglas reproductivas. La suite backend forma parte de CI del PR.

## Ejecución de OpenCode

OpenCode 1.19.5 · opencode/glm-5.3-flash-free.

| Rol | Sesión | Skills cargadas |
|---|---|---|
| coordinador | `ses_e3dc3db9affeqONe6JA69efk5E` | bovicontrol-sdd |
| verificador | `ses_e3dc2c30fffenJnK6ODTkP5Az0` | — |
| interfaz | `ses_e3dbe72dfffe4KRJH2U39MK6g0` | bovicontrol-react-ui |
| verificador | `ses_e3dbd1f00ffedWFsARaGNEOVW5` | — |
| revisor | `ses_e3dbb6f90ffeSMpAJlILpPtmip` | bovicontrol-revision |

Comprobaciones ejecutadas:

| Comando | Resultado | Ejecuciones |
|---|---|---|
| `npm.cmd run test:ui` | exit 1 | 1 |
| `npm.cmd run build` | exit 0 | 1 |
| `npm.cmd run test:ui` | exit 0 | 1 |

La herramienta rechazó 4 intentos de comandos fuera de los permisos. No se ampliaron permisos para ejecutarlos.
