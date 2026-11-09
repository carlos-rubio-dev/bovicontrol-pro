# Tareas — 002 Referencias del historial

## Verificador (pruebas antes de producción)
- [x] T1. Escribir `tests/test_state_references.py` cubriendo AC1, AC2, AC3, AC5 y AC6 con SQLite temporal y CSRF (estilo de `tests/test_state_validation.py`). — 14 pruebas creadas.
- [x] T2. Escribir `tests/ui/references.spec.ts` cubriendo AC4 con eventos sintéticos y comprobación de red/persistencia. — 1 prueba creada, restaura fixture en afterEach.
- [x] T3. Ejecutar ambas suites y registrar el fallo esperado (rojo): backend 8/14 FAIL (`200 != 400` en referencias; el guardado de reprod saltaba comprobación), UI FAIL (elimina la vaca y envía PUT 200 sin ningún alert).

## API (producción backend, no tocar pruebas)
- [ ] T4. Implementar en `app.py` la validación de referencias de `reprod` y `partos` contra el payload con error 400 con colección, posición y campo.

## Interfaz (producción frontend, no tocar pruebas)
- [ ] T5. Implementar en `src/App.tsx` el bloqueo de eliminación con historial y mensaje en español; regenerar `static/dist` con el build.
- [ ] T6. Verificar AC6: la comprobación solo usa datos de la sesión autenticada.

## Verificador (verificación posterior)
- [ ] T7. Ejecutar `python scripts/check_backend.py`.
- [ ] T8. Ejecutar `npm.cmd run build`.
- [ ] T9. Ejecutar `npm.cmd run test:ui`.
- [ ] T10. Confirmar suites en verde y actualizar `resultado.md` con evidencia.

## Revisor
- [ ] T11. Inspeccionar diff, criterios y evidencia; registrar hallazgos en `resultado.md`.
