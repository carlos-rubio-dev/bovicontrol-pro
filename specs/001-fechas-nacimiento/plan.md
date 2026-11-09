# Plan: 001-fechas-nacimiento

## Problema
PUT /api/state valida el formato de las fechas pero permite fechaNacimiento futura en vacas, toros y crías; el servidor acepta animales que todavía no han nacido.

## Decisión de diseño
- Validación de API antes de persistir: la comprobación vive en `validate_state_fields` (app.py), dentro del ciclo de campos de fecha, solo cuando el campo es `fechaNacimiento` (colecciones vacas, toros y crías). Así la regla aplica al añadir y al editar registros, porque PUT siempre revalida el estado completo (AC4).
- Reutilizar `invalid_state_field` para que el error conserve el formato existente `"<colección>, registro <n>: el campo "fechaNacimiento" ..."` (AC1, AC2) en español comprensible para el usuario.
- La comparación es `parsed > date.today()` usando la fecha del servidor; hoy y anteriores pasan (AC3). El formato ya está validado por el ciclo existente (AAAA-MM-DD estricto, incluyendo bisiesto vía `date.fromisoformat`).
- No se toca ningún otro campo de fecha: `proximoParto`, `fechaDestete`, `fecha`, `fechaParto`, `ultimoParto` y `fechaReinicio` pueden seguir siendo futuros; no cambian intervalos ni reglas de monta (AC5).
- El error se lanza antes de `db.session.commit()`; el handler ValueError ya hace rollback, por lo que un rechazo deja el estado persistido intacto (AC2).

## Rutas de cambio
- `app.py`: solo el bloque de validación de fechas dentro de `validate_state_fields`. Cambio mínimo, sin tocar rutas, contrato JSON ni reglas reproductivas.
- `tests/test_birth_dates.py`: nuevo script del arnés (verificador), con SQLite temporal, sesión y CSRF reales.

## Fuera de alcance
- Los endpoints antiguos de animales/reproducción (440–553) siguen deshabilitados en `csrf()`.
- No hay cambios de interfaz: la spec es backend; no se requiere build ni navegador.

## Ejecución (roles)
1. Verificador escribe `tests/test_birth_dates.py` desde AC1–AC5 ANTES del cambio de producción y ejecuta `python scripts/check_backend.py` para registrar el fallo esperado (TDD).
2. API implementa el cambio mínimo en `app.py`.
3. Verificador repite `python scripts/check_backend.py` (regresión + nueva suite en verde).
4. Revisor contrasta criterios AC1–AC5 contra diff y evidencia.
