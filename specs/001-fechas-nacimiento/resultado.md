# Resultado: fechas de nacimiento

## Implementación
La validación de fechaNacimiento rechaza fechas posteriores al día actual del servidor en vacas, toros y crías. El cambio se aplica antes de persistir y utiliza el mensaje de error de campo existente.

## Criterios verificados
| Criterio | Comprobación |
|---|---|
| AC1 | Mañana se rechaza con HTTP 400 en las tres listas. |
| AC2 | El error incluye colección, posición, campo y motivo; el GET posterior conserva el estado. |
| AC3 | Hoy y 2024-02-29 se aceptan y se recuperan sin cambios. |
| AC4 | La edición de un animal guardado con nacimiento futuro también se rechaza. |
| AC5 | proximoParto y fechaDestete futuros siguen permitidos. |

## Pruebas
`python scripts/check_backend.py` antes de producción: salida 1; nueve subcasos fallaron porque la API respondía 200 en lugar de 400. Los casos de fechas válidas y estimadas ya pasaban.

Después del cambio: salida 0; 5 pruebas de fechas, 1 de reproducción y 11 de validación de estado correctas. La suite volvió a pasar tras la corrección de la revisión.

## Revisión y correcciones
El revisor de OpenCode no encontró bloqueos funcionales. Señaló que el caso AC2 podía comprobar también el motivo específico del rechazo. El verificador añadió esa aserción y repitió la suite con resultado correcto.

El verificador intentó guardar un informe fuera de tests/ y el permiso lo rechazó. El coordinador registró el resultado sin ampliar el permiso del especialista. También se rechazaron comandos de diagnóstico fuera de la lista permitida; la ejecución válida usó el comando exacto.

## Alcance
Validación comprobada con SQLite temporal. No cambia los intervalos reproductivos, la interfaz ni la configuración de producción.

## Ejecución de OpenCode

OpenCode 1.19.5 · opencode/glm-5.3-flash-free.

| Rol | Sesión | Skills cargadas |
|---|---|---|
| coordinador | `ses_e3df99526ffePCKs6gdie44r28` | bovicontrol-sdd |
| verificador | `ses_e3df892e4ffed0WSulQPAmJBKn` | bovicontrol-api-tests |
| api | `ses_e3df55a45ffeJVilktMIt0ZUYB` | bovicontrol-api-tests |
| verificador | `ses_e3df4bff3ffe8n1iBNIOij1Mtx` | bovicontrol-api-tests |
| revisor | `ses_e3df368d6ffeht5RFKEyUoOVVp` | bovicontrol-revision |
| verificador | `ses_e3df1fb13ffe971F36b2OQy0F2` | bovicontrol-api-tests |

Comprobaciones ejecutadas:

| Comando | Resultado | Ejecuciones |
|---|---|---|
| `python scripts/check_backend.py` | exit 1 | 1 |
| `python scripts/check_backend.py` | exit 0 | 3 |

La herramienta rechazó 3 intentos de comandos fuera de los permisos. No se ampliaron permisos para ejecutarlos.

## Integración

[Rama y PR #13](https://github.com/carlos-rubio-dev/bovicontrol-pro/pull/13) · [Comprobaciones de CI](https://github.com/carlos-rubio-dev/bovicontrol-pro/actions/runs/42696291797). Fusionado en main con 8745e68.
