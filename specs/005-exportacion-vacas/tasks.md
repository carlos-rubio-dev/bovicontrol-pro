# Tareas — spec 005-exportacion-vacas

| # | Rol | Tarea | Estado |
|---|-----|-------|--------|
| 1 | plan | plan.md (decisiones y rutas) | completada |
| 2 | verificador | escribir `tests/ui/csv.spec.ts` cubriendo AC1–AC6 (serialización sin navegador + descarga real + lista vacía + sin PUT) y registrar el fallo esperado ejecutándolas antes del código | pendiente |
| 3 | interfaz | implementar `src/csv.ts` (serializeCsv) y botón Exportar CSV en VacasScreen; generar static/dist con build; sin tocar pruebas | pendiente |
| 4 | verificador | ejecutar `npm.cmd run build` y `npm.cmd run test:ui` y validar AC1–AC6 | pendiente |
| 5 | revisor | contrastar diff, criterios y evidencia con bovicontrol-csv y bovicontrol-revision | pendiente |
| 6 | plan | resultado.md, hallazgos y tasks con evidencia | pendiente |

Notas: sin commit/push/PR. Sin backend: no corre `python scripts/check_backend.py` (no cambia app.py); si el revisor lo pide, se ejecuta igualmente.
