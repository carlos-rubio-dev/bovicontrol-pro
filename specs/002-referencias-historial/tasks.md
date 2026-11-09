# Tareas — 002 Referencias del historial

## Verificador (pruebas antes de producción)
- [x] T1. Escribir `tests/test_state_references.py` cubriendo AC1, AC2, AC3, AC5 y AC6 con SQLite temporal y CSRF (estilo de `tests/test_state_validation.py`). — 14 pruebas creadas.
- [x] T2. Escribir `tests/ui/references.spec.ts` cubriendo AC4 con eventos sintéticos y comprobación de red/persistencia. — 1 prueba creada, restaura fixture en afterEach.
- [x] T3. Ejecutar ambas suites y registrar el fallo esperado (rojo): backend 8/14 FAIL (`200 != 400` en referencias; el guardado de reprod saltaba comprobación), UI FAIL (elimina la vaca y envía PUT 200 sin ningún alert).

## API (producción backend, no tocar pruebas)
- [x] T4. Implementar en `app.py` la validación de referencias de `reprod` y `partos` contra el payload con error 400 con colección, posición y campo. — `validate_state_references(data)` llamada tras `validate_state(data)` y antes de persistir/reglas de monta.

## Interfaz (producción frontend, no tocar pruebas)
- [x] T5. Implementar en `src/App.tsx` el bloqueo de eliminación con historial y mensaje en español; el build se ejecuta con el verificador (T8) para versionar `static/dist`. — helper `hasLinkedHistory` + guardias en `delVaca`/`delToro`/`delCria` con mensajes en `role="alert"` y sin mutación de estado.
- [x] T6. Verificar AC6: la comprobación solo usa datos de la sesión autenticada. — confirmado por `test_other_account_data_is_not_used_for_reference_check` (en verde en T7).

## Verificador (verificación posterior)
- [x] T7. Ejecutar `python scripts/check_backend.py`. — OK; `test_state_references.py` 14/14 y resto de la suite en verde.
- [x] T8. Ejecutar `npm.cmd run build`. — OK; `static/dist` regenerado y versionado junto a `src/App.tsx`.
- [x] T9. Ejecutar `npm.cmd run test:ui`. — 2 passed: baseline y AC4 (0 escrituras en los rechazos, alert en español, GET confirma persistencia).
- [x] T10. Confirmar suites en verde y actualizar `resultado.md` con evidencia. — AC1–AC6 con pruebas observadas.

## Revisor
- [x] T11. Inspeccionar diff, criterios y evidencia; registrar hallazgos en `resultado.md`. — Aprobado (AC1–AC6); observaciones O1–O5 registradas en resultado.md.

## Revisión complementaria
- [x] Comprobar mensajes concretos, vaca con solo parto y borrado permitido sin historial.
- [x] Reproducir O1 con un guardado pendiente, separar los mensajes y repetir build y las siete pruebas UI.
