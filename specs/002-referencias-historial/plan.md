# Plan — Conservación de relaciones del historial (002)

## Problema
PUT /api/state acepta `reprod` y `partos` que apuntan a animales ausentes del mismo payload; la interfaz permite eliminar animales con historial y deja referencias huérfanas.

## Decisiones
1. Backend: tras `validate_state` y antes de persistir, comparar cada `vacaId`/`toroId` de `reprod` y cada `vacaId`/`criaId` de `partos` contra los `id` del propio payload. Las referencias se validan contra el payload entrante, no contra el estado anterior, así un payload que elimina eventos y animal del mismo tirón sigue siendo válido (AC5).
2. El mensaje de error usa el formato existente `{colección}, registro {n}: el campo "{campo}" ...` con la razón de referencia inexistente; se lanza como `ValueError` y el manejador responde 400 sin tocar la fila persistida (AC3).
3. `criaId` sigue siendo opcional: vacío u omitido pasa; texto no vacío debe existir en `crias` del payload (AC2).
4. Interfaz: antes de eliminar una vaca/toro/cría se comprueba en memoria si hay `reprod`/`partos` que la referencian; si hay, se muestra un mensaje en español y no se envía escritura (AC4). El eliminado sin historial no cambia (AC5).
5. La comprobación usa solo el estado ya cargado de la sesión autenticada; no se aceptan identificadores del cliente para escoger datos (AC6).
6. No se tocan intervalos reproductivos ni reglas de monta existentes en `put_state`.

## Rutas
- Backend: `app.py` · `validate_state` / `put_state`.
- Interfaz: `src/App.tsx` · manejadores de eliminación de vacas, toros y crías.
- Pruebas backend: `tests/test_state_references.py` (SQLite temporal, CSRF, estilo de `tests/test_state_validation.py`).
- Pruebas UI: `tests/ui/references.spec.ts` con `tests/ui/helpers.ts` y `tests/ui_fixture.py`.
- Build versionado si cambia la interfaz: `static/dist`.

## Riesgos
- El orden de validaciones en `put_state` ya lanza por montas nuevas; la comprobación de referencias debe cubrir también montas nuevas y no interferir con sus reglas.
- Los fixtures de UI no incluyen reprod/partos; la prueba de UI necesita su propio estado con historial vinculado.
