# Tareas: 001-fechas-nacimiento

Cada tarea se marca completa solo con resultado observado (salida de comandos o diff).

## T1. tests/test_birth_dates.py (rol: verificador) — antes de producción
- [ ] Escribir `tests/test_birth_dates.py` siguiendo el arnés de `tests/test_state_validation.py`: SQLite temporal (`DATABASE_URL`), `SECRET_KEY`, sesión y CSRF reales; cubrir AC1–AC5:
  - AC1: una fechaNacimiento futura (mañana del servidor) se rechaza con HTTP 400 en vacas, toros y crías.
  - AC2: el error menciona la colección, "registro 1" y el campo "fechaNacimiento"; el GET posterior devuelve el estado anterior íntegro.
  - AC3: se aceptan nacimientos de hoy y anteriores; incluir una fecha bisiesta válida (2024-02-29).
  - AC4: la regla aplica al editar un registro existente (estado guardado con fecha válida y reescrito con fecha futura).
  - AC5: proximoParto y fechaDestete futuros siguen aceptados sin cambios de contrato.
- [ ] Ejecutar `python scripts/check_backend.py` y REGISTRAR EL FALLO ESPERADO (la nueva suite debe fallar; check_backend termina con código distinto de 0). Guardar la salida en specs/001-fechas-nacimiento/evidencia_t1.md.

## T2. app.py (rol: api) — cambio mínimo
- [ ] En `validate_state_fields`, cuando el campo de fecha es `fechaNacimiento` y la fecha convertida es posterior a `date.today()`, rechazar mediante `invalid_state_field` con un mensaje que mencione el campo. No tocar ninguna otra validación, ruta, contrato ni regla reproductiva.

## T3. Verificación posterior (rol: verificador)
- [ ] Ejecutar `python scripts/check_backend.py` de nuevo: la suite completa (regresión + test_birth_dates.py) debe pasar. Guardar la salida en specs/001-fechas-nacimiento/evidencia_t3.md.

## T4. Revisión (rol: revisor)
- [ ] Contrastar AC1–AC5 con el diff de producción (`git diff -- app.py`) y la evidencia de T1/T3. Sin editar código.

## T5. Registro (rol: coordinador)
- [ ] Escribir `specs/001-fechas-nacimiento/resultado.md` con comandos ejecutados, estado real, hallazgos y correcciones. Sin commit ni PR.
