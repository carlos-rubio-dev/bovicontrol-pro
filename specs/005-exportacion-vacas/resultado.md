# Resultado: exportación CSV de vacas

## Implementación
VacasScreen descarga vacas.csv con las filas filtradas, en su mismo orden. La pantalla arma las nueve columnas y el helper puro serializeCsv de src/csv.ts las serializa. La descarga usa Blob y un enlace local; no necesita una ruta nueva de API.

## Criterios verificados
| Criterio | Comprobación |
|---|---|
| AC1 | Botón con texto visible, Tab y Enter; nombre vacas.csv y nueve encabezados en el orden indicado. |
| AC2 | Filas visibles tras búsqueda y estado, mismo orden, ceros y campos vacíos. Botón deshabilitado en lista vacía y sin coincidencias. |
| AC3 | BOM UTF-8, separadores CRLF, todos los campos entre comillas y comillas internas duplicadas. Acentos, comas, LF y CRLF dentro de campos conservados. |
| AC4 | Apóstrofo antes de indicadores de fórmula, también con espacios iniciales. Aserciones sobre valores y bytes. |
| AC5 | Sin PUT ni solicitudes a servicios externos durante la exportación. |
| AC6 | Estado persistido e input del serializador sin cambios; botón operable con teclado. |

## Pruebas y correcciones
Las once pruebas originales fallaron antes de producción por el botón y el módulo ausentes. La preparación de datos respondió correctamente. Se comprobó primero cómo importar el módulo TypeScript desde Playwright; esas pruebas temporales se retiraron.

La revisión complementaria detectó una expectativa equivocada en las pruebas: pedían encabezados sin comillas y entrecomillado selectivo. AC3 exige comillas en todos los campos; AC1 define los nombres de las celdas del encabezado. Se corrigieron las expectativas sin cambiar la spec. También se añadieron los casos de filtros sin coincidencias y conservación de LF/CRLF sin mutar las filas. La suite final de CSV tiene trece casos; no se atribuye un fallo previo individual a los dos añadidos.

La primera implementación también usaba comillas selectivas. Una comprobación directa de serializeCsv con ['a', 0, ''] devolvió a,0, en lugar de los tres campos entrecomillados. Se corrigió el helper en la revisión complementaria. La primera ejecución de navegador todavía utilizó el build anterior y falló en encabezados y valores con prefijo; tras regenerar el build, los trece casos de CSV pasaron. La suite completa terminó con 34 casos correctos: 29 de navegador y 5 de serialización. La suite backend tuvo 31 pruebas correctas.

## Revisión
El revisor de OpenCode contrastó los seis criterios, el fuente, las pruebas y los resultados. Confirmó el helper sin dependencias de App.tsx, las filas tomadas de filtered sin reordenar y la ausencia de escrituras en la exportación. Los archivos JavaScript y CSS nuevos se incluyen junto al índice y se eliminan los assets anteriores.

La alineación de Exportar CSV y Nueva vaca cambió dentro de la misma fila de controles. No se alteraron otras pantallas, reproducción, sincronización ni backend.

## Límites
Se comprueban el archivo exportado y su descarga. No se probó abrir, guardar y volver a abrir el CSV en Excel. El tratamiento de fórmulas puede variar según la aplicación y el flujo de importación ([OWASP, CSV Injection](https://community.owasp.org/attacks/CSV_Injection)).

## Ejecución de OpenCode

OpenCode 1.19.5 · opencode/glm-5.3-flash-free.

| Rol | Sesión | Skills cargadas |
|---|---|---|
| coordinador | `ses_e3db57f56ffeVO4B2Y24Z4uReR` | bovicontrol-csv, bovicontrol-sdd |
| verificador | `ses_e3db4e0f1ffeIPa3ZPh8JWkO2l` | bovicontrol-csv, bovicontrol-react-ui |
| interfaz | `ses_e3da9d016ffenT5FiAxId1rZUp` | bovicontrol-csv |
| verificador | `ses_e3da77c3fffebBAPhY7hLVKi7L` | bovicontrol-csv, bovicontrol-react-ui |
| revisor | `ses_e3da2ff88ffex9jGeUWOeKeXPS` | bovicontrol-csv, bovicontrol-revision |

Comprobaciones ejecutadas:

| Comando | Resultado | Ejecuciones |
|---|---|---|
| `npm.cmd run test:ui -- tests/ui/csv.spec.ts` | exit 1 | 2 |
| `python scripts/check_backend.py` | exit 0 | 1 |
| `npm.cmd run build` | exit 0 | 2 |
| `npm.cmd run test:ui -- tests/ui/csv.spec.ts` | exit 0 | 1 |
| `npm.cmd run test:ui` | exit 0 | 1 |

La herramienta rechazó 6 intentos de comandos fuera de los permisos. No se ampliaron permisos para ejecutarlos.

## Integración

[Rama y PR #17](https://github.com/carlos-rubio-dev/bovicontrol-pro/pull/17) · [Comprobaciones de CI](https://github.com/carlos-rubio-dev/bovicontrol-pro/actions/runs/42710002049). Fusionado en main con 3f8aafe.
