# Tareas — 003 Filtro de toros por estado

## Verificador (pruebas antes de producción)
- [x] T1. Escribir `tests/ui/bulls.spec.ts` cubriendo AC1–AC6 sobre el fixture (Fuerte, Titán, Zeus) y ejecutarla para registrar el fallo esperado. — 6 pruebas en rojo; la lista final en disco es de 7 (ver resultado.md).
- [x] T2. Registrar el resultado rojo observado. — 6 failed: no se encuentran combobox 'Estado del toro', label 'Buscar toro', role status ni 'Limpiar filtros'.

## Interfaz (producción frontend, no tocar pruebas)
- [x] T3. Implementar el filtro de estado, búsqueda etiquetada, limpiar, contador accesible, mensaje específico y layout 700 px en `TorosScreen`. — en `src/App.tsx`: label+select 'Estado del toro', label 'Buscar toro' con trim/insensible, AND, botón 'Limpiar filtros' siempre visible, contador en `role="status"`, ternario de mensaje vacío, `overflow-x-auto` + `min-w-[760px]`.
- [x] T4. Regenerar `static/dist` con el build del verificador. — `npm.cmd run build` exit 0; `static/dist` con assets nuevos (`index-B4TD0xYj.js`).

## Verificador (verificación posterior)
- [x] T5. Ejecutar `npm.cmd run build`. — OK (vite v6.4.5, 2196 módulos, 5.21s).
- [x] T6. Ejecutar `npm.cmd run test:ui` y confirmar suites en verde. — 14/14 passed (26.0s): bulls 7/7, baseline y references 7/7.

## Revisor
- [x] T7. Inspeccionar diff, criterios y evidencia. — Aprobado AC1–AC6; diff acotado a TorosScreen, tests/ui/bulls.spec.ts, static/dist y specs/003; observaciones registradas en resultado.md.

## Coordinador
- [x] T8. Escribir `resultado.md` con evidencia y hallazgos. — Estado, comandos observados (rojo 6 failed → build OK → 14/14), tabla AC→evidencia y observaciones de revisión.
