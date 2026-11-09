# Resultado: relaciones del historial

## Implementación
La API comprueba las referencias de reproducciones y partos contra las listas del mismo payload, incluidos los eventos ya guardados. La validación ocurre antes de persistir. La interfaz impide eliminar animales con esos vínculos y muestra el motivo.

## Criterios verificados
| Criterio | Comprobación |
|---|---|
| AC1 | Reproducciones nuevas y guardadas rechazan vacas o toros ausentes. |
| AC2 | Los partos exigen su vaca y, si se indica, su cría. criaId vacío u omitido se permite. |
| AC3 | HTTP 400 con colección, posición y campo; el GET posterior mantiene el estado. |
| AC4 | La pantalla conserva vaca, toro y cría vinculados y no envía su eliminación. Incluye vaca con solo parto. |
| AC5 | Se permite eliminar sin historial en las tres pantallas y eliminar eventos junto con el animal en un payload. |
| AC6 | Una segunda cuenta no puede utilizar como referencias los animales de la primera; ambas conservan sus datos. |

## Pruebas
Antes de producción, la suite nueva de API tuvo ocho fallos entre catorce pruebas. Aceptaba referencias inexistentes o devolvía un mensaje genérico. La prueba UI también falló porque eliminaba la vaca vinculada y enviaba PUT 200.

La primera prueba de navegador necesitó corregir su navegación: buscaba la tabla desde el dashboard. Tras abrir Vacas, el fallo observado correspondió al comportamiento de eliminación.

Después de implementar: python scripts/check_backend.py terminó con 31 pruebas correctas, npm.cmd run build terminó con código 0 y npm.cmd run test:ui tuvo dos pruebas correctas.

## Revisión y correcciones
El revisor encontró que la respuesta de un guardado pendiente podía borrar el mensaje de eliminación bloqueada (O1). En la revisión complementaria se añadió una prueba que mantuvo ese PUT en espera: falló al completarlo porque desaparecía el mensaje. Se separó deleteError de saveError. El mensaje de eliminación se limpia al navegar o al eliminar un registro permitido.

También se reforzaron las aserciones de los mensajes en español, la igualdad del estado completo, el caso de vaca con solo parto y la eliminación permitida en las tres pantallas. Antes de corregir O1, seis pruebas de navegador pasaban y la de guardado pendiente fallaba. Tras la corrección, build pasó y las siete pruebas de navegador terminaron con código 0. Estas ampliaciones y la corrección de O1 se hicieron en la revisión complementaria posterior a la sesión de OpenCode.

La lista de tareas se actualizó para reflejar la comprobación de la segunda cuenta y la revisión. Los cambios de texto del error de referencias son los pedidos por la spec. criaId con solo espacios se trata como vacío; un identificador con espacios alrededor debe coincidir exactamente. Los parentescos de texto libre permanecen fuera de esta validación.

## Alcance
Datos sintéticos y SQLite temporal. Sin cambios en intervalos reproductivos, autenticación, CSRF o despliegue. El verificador intentó escribir el informe fuera de su carpeta; el permiso lo bloqueó y el coordinador guardó el resultado.

## Ejecución de OpenCode

OpenCode 1.19.5 · opencode/glm-5.3-flash-free.

| Rol | Sesión | Skills cargadas |
|---|---|---|
| coordinador | `ses_e3deb2574ffeyumoHShLieTqYN` | bovicontrol-sdd |
| verificador | `ses_e3de9ee6bffeazO2r6M9e59kbw` | bovicontrol-api-tests |
| api | `ses_e3de2b363ffeWx971kuymc10gH` | bovicontrol-api-tests |
| interfaz | `ses_e3de0f567ffeeBtZqzIhZMvyQG` | bovicontrol-react-ui |
| verificador | `ses_e3ddfb4e3ffeJVt0F9vdCT3c6i` | bovicontrol-revision |
| revisor | `ses_e3ddce835ffe6CxZVF9wOdLiqJ` | bovicontrol-revision |

Comprobaciones ejecutadas:

| Comando | Resultado | Ejecuciones |
|---|---|---|
| `python scripts/check_backend.py` | exit 1 | 1 |
| `npm.cmd run build` | exit 0 | 2 |
| `npm.cmd run test:ui` | exit 1 | 2 |
| `python scripts/check_backend.py` | exit 0 | 1 |
| `npm.cmd run test:ui` | exit 0 | 1 |

La herramienta rechazó 8 intentos de comandos fuera de los permisos. No se ampliaron permisos para ejecutarlos.
