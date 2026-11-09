# Tareas — 004 Filtros de crías por sexo y salud

## Verificador (pruebas antes de producción)
- [x] T1. Escribir `tests/ui/calves.spec.ts` cubriendo AC1–AC6 sobre el fixture (Lucero, Trueno, Nube), incluyendo lista inicialmente vacía y restauración del fixture, y ejecutarla para registrar el fallo esperado. — 7 pruebas (AC4 en dos escenarios); afterEach restaura el fixture.
- [x] T2. Registrar el resultado rojo observado (fallos de comportamiento, no de preparación). — `npm.cmd run test:ui`: 7 failed (solo calves: `getByLabel('Buscar cría')` no encontrado, timeouts y `role="status"` sin /Mostrando 3 de 3 registros/), 14 passed (baseline, bulls, references).

## Interfaz (producción frontend, no tocar pruebas)
- [x] T3. Implementar etiquetas Buscar cría/Sexo/Estado de salud, AND con trim/insensible, Limpiar filtros, contador accesible, mensajes vacíos diferenciados y layout 700 px en `CriasScreen`. — 3 ediciones en el bloque `CriasScreen` de `src/App.tsx` (~1124–1223); sin tocar otras pantallas ni backend.
- [x] T4. Regenerar `static/dist` con `npm.cmd run build`. — exit 0 (vite v6.4.5, 2196 módulos, 5.48s); assets `index-BiIfLY68.js` / `index-DjTJRERB.css`.

## Verificador (verificación posterior)
- [x] T5. Ejecutar `npm.cmd run build` y confirmar éxito. — exit 0; aviso preexistente de chunk > 500 kB, no bloqueante.
- [x] T6. Ejecutar `npm.cmd run test:ui` y confirmar suites en verde (calves, bulls, baseline, references). — 21 passed / 0 failed (34.8s): calves 7/7, resto 14/14.

## Revisor
- [x] T7. Inspeccionar diff, criterios y evidencia; devolver veredicto AC1–AC6. — Aprobado AC1–AC6; diff acotado a CriasScreen, calves.spec.ts y static/dist; hallazgos D1–D4 en resultado.md.

## Coordinador
- [x] T8. Escribir `resultado.md` con comandos, evidencia y hallazgos. — Estado, comandos observados (rojo 7 failed → build exit 0 → 21/21), tabla AC→evidencia y hallazgos D1–D4.

## Integración del build
- [x] Incluir los nuevos archivos JavaScript y CSS junto al índice generado.
- [x] Revisar visualmente las pantallas de toros y crías a 700 px.
