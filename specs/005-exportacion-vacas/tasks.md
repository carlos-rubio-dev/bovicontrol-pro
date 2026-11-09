# Tareas — spec 005-exportacion-vacas

| # | Rol | Tarea | Estado |
|---|-----|-------|--------|
| 1 | plan | plan.md (decisiones y rutas) | completada |
| 2 | verificador | escribir `tests/ui/csv.spec.ts` cubriendo AC1–AC6 y registrar el fallo esperado antes del código (11/11 fallidos por feature ausente; preparación con PUT/GET 200) | completada |
| 3 | interfaz | implementar `src/csv.ts` (serializeCsv) y botón Exportar CSV en VacasScreen; sin tocar pruebas | completada |
| 4 | plan | generar `static/dist` para las pantallas nuevas | completada |
| 5 | verificador | ejecutar `npm.cmd run build`, `npm.cmd run test:ui -- tests/ui/csv.spec.ts` (13 passed) y `npm.cmd run test:ui` (34 passed); además `python scripts/check_backend.py` (31 tests OK) | completada |
| 6 | revisor | contrastar diff, criterios y evidencia: 6/6 AC cumplen, diff acotado a frontend + build | completada |
| 7 | plan | resultado.md y cierre con evidencia | completada |

## Revisión complementaria
- [x] Corregir el entrecomillado de pruebas y helper para conservar AC3.
- [x] Retirar los archivos temporales de sondeo.
- [x] Regenerar el build, comprobar los trece casos CSV y la suite completa de 34 casos.
- [x] Incluir assets nuevos y retirar los anteriores del build.
