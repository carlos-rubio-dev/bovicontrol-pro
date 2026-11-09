# Fechas de nacimiento válidas

## Problema
El servidor valida el formato de fecha, pero permite guardar nacimientos futuros. Eso produce edades negativas y registros de animales que todavía no han nacido.

## Alcance
Validar fechaNacimiento en vacas, toros y crías al guardar PUT /api/state. No cambia las reglas ni fechas estimadas de reproducción, parto o destete.

## Criterios de aceptación
- AC1. Una fechaNacimiento posterior a la fecha actual del servidor se rechaza con HTTP 400 en las tres listas.
- AC2. El error identifica la colección, la posición y el campo fechaNacimiento; el GET posterior conserva íntegro el estado anterior.
- AC3. Se aceptan nacimientos de hoy y anteriores con formato YYYY-MM-DD, incluida una fecha bisiesta válida.
- AC4. La nueva regla también se aplica al editar un animal existente, no solo al añadirlo.
- AC5. Una fecha estimada futura en proximoParto o fechaDestete sigue permitida; no se cambia el contrato ni los intervalos reproductivos.

## Validación
Cliente Flask con SQLite temporal, sesión y CSRF reales de la prueba. Nuevo script tests/test_birth_dates.py. Ejecutar junto a la regresión existente mediante scripts/check_backend.py. Revisión independiente del diff por revisor.
