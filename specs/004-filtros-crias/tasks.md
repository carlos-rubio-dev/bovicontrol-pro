# Tareas — 004 Filtros de crías por sexo y salud

## Verificador (pruebas antes de producción)
- [x] T1. Escribir `tests/ui/calves.spec.ts` cubriendo AC1–AC6 sobre el fixture (Lucero, Trueno, Nube), incluyendo lista inicialmente vacía y restauración del fixture, y ejecutarla para registrar el fallo esperado. — 7 pruebas (AC4 en dos escenarios); afterEach restaura el fixture.
- [x] T2. Registrar el resultado rojo observado (fallos de comportamiento, no de preparación). — `npm.cmd run test:ui`: 7 failed (solo calves: `getByLabel('Buscar cría')` no encontrado, timeouts y `role="status"` sin /Mostrando 3 de 3 registros/), 14 passed (baseline, bulls, references).

## Interfaz (producción frontend, no tocar pruebas)
- [ ] T3. Implementar etiquetas Buscar cría/Sexo/Estado de salud, AND con trim/insensible, Limpiar filtros, contador accesible, mensajes vacíos diferenciados y layout 700 px en `CriasScreen`.
- [ ] T4. Regenerar `static/dist` con `npm.cmd run build`.

## Verificador (verificación posterior)
- [ ] T5. Ejecutar `npm.cmd run build` y confirmar éxito.
- [ ] T6. Ejecutar `npm.cmd run test:ui` y confirmar suites en verde (calves, bulls, baseline, references).

## Revisor
- [ ] T7. Inspeccionar diff, criterios y evidencia; devolver veredicto AC1–AC6.

## Coordinador
- [ ] T8. Escribir `resultado.md` con comandos, evidencia y hallazgos.
