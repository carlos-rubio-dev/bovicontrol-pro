# Plan 1 de BoviControl Pro: validación de identificadores en `PUT /api/state`

## Objetivo

Como encargado de la finca, quiero que `PUT /api/state` rechace registros malformados (identificadores no textuales, vacíos, duplicados o elementos no objeto) con HTTP 400 y un mensaje en español, antes de modificar el estado guardado, evitando errores 500 o datos corrompidos.

## Alcance y archivos

| Archivo | Cambio |
|---|---|
| `app.py` | Añadir validación de elementos/ids en `put_state` (líneas 287–332), tras la comprobación de formato actual (289–291) y **antes** de construir los diccionarios `previous_ids`, `old_cows`, `cows`, `bulls`, `known` (293–298). |
| `tests/test_state_validation.py` | Nuevo archivo de pruebas, siguiendo el patrón de `tests/test_reproduction.py`. |

No se modifican `render.yaml`, rutas antiguas, migraciones, reglas reproductivas ni configuración de producción.

## Ubicación de la validación (app.py)

1. La función `put_state` ya valida la forma exterior (objeto con exactamente las claves `vacas`, `toros`, `crias`, `reprod`, `partos`, cada una lista de máximo 10000 elementos) y lanza `ValueError('El formato de datos no es válido.')` → 400.
2. Inmediatamente después de ese bloque, antes de la consulta `AppState` y de construir los diccionarios, insertar una función auxiliar (por ejemplo `validate_identifiers(data)`) que recorra las cinco listas.
3. Se aprovecha el manejador existente `@app.errorhandler(ValueError)` (app.py:255–258), que hace `db.session.rollback()` y responde `400` con `{"error": ...}`. Así un rechazo no modifica el estado persistido y la fila `AppState` queda intacta.

## Reglas de validación (contrato actual, cinco listas)

Para cada lista `k` en `('vacas', 'toros', 'crias', 'reprod', 'partos')` y cada `índice, elemento`:

- **Nulo o escalar**: si el elemento no es `dict` → rechazar. Mensajes en español, por ejemplo:
  - nulo o escalar: `'El registro en vacas no es válido.'` (con el nombre de la lista).
- **Identificador**: si `'id'` no es `str`, o `id.strip()` queda vacío, o `id != id.strip()` (espacios en los extremos) → rechazar. Esto cubre id numérico, lista u objeto (no son `str`). Mensajes, por ejemplo:
  - tipo incorrecto: `'El identificador de un registro en reprod no es válido.'`
  - vacío o con espacios en los extremos: `'El identificador de un registro en partos no puede estar vacío ni empezar o terminar con espacios.'`

- **Unicidad**: los ids limpios (`str`) deben ser únicos dentro de cada lista; el mismo id sí puede repetirse en listas distintas. Mensaje, por ejemplo: `'El identificador X está repetido en la lista toros.'`

- Cada lista retiene su propia colección de ids (no global), lo que permite `V-001` en `vacas` y en `crias` simultáneamente.

Notas de diseño dentro del alcance:
- Solo se exigencia el identificador; no se amplía validación de fechas ni de otros campos (eso lo cubren las reglas existentes de monta).
- Continúa prohibido el `user_id` del cliente: el propietario sigue resolviéndose con `current_user()` (app.py:292).

## Pruebas (`tests/test_state_validation.py`)

Configuración (según `AGENTS.md` y la skill `bovicontrol-api-tests`):
- `DATABASE_URL` (SQLite temporal) y `SECRET_KEY` exclusivas antes de `from app import app, db`; directorio temporal limpio.
- CSRF: `GET /api/session` → token → `POST /api/setup` → token nuevo de la respuesta.
- Ejecutar junto a la regresión reproductiva, cada script por separado.

Casos:
1. **Válido**: estado completo con ids distintos en las cinco listas → PUT 200; `GET /api/state` devuelve lo guardado.
2. **Mismo id en listas distintas**: `V-001` como id en `vacas` y en `crias` → 200 (permitido).
3. **Elemento nulo**: `vacas` con `None` → 400, error en español, y el `GET` posterior devuelve el estado previo intacto.
4. **Elemento escalar**: elemento `42` o `'x'` en `toros` → 400 e integridad persistida.
5. **Id numérico**: `{ 'id': 7, ... }` en `reprod` → 400.
6. **Id lista/objeto**: `{ 'id': ['V-001'], ... }` y `{ 'id': {'x': 1}, ... }` en `crias` → 400.
7. **Id vacío o con espacios**: `''`, `'   '`, `' V-001 '` en `partos` → 400.
8. **Duplicado**: dos elementos con id `V-001` en la misma lista → 400; e igualmente `T-001` repetido en `toros` → 400.
9. **Integridad de persistencia**: tras cada rechazo, `GET /api/state` devuelve el estado válido guardado previamente, sin cambios parciales.
10. **Aislamiento entre dos usuarios**: con el admin, crear segunda cuenta vía `POST /api/users` e iniciar sesión con un segundo cliente; guardar estados distintos en cada cuenta y verificar que el PUT rechazado de una no toca los datos de la otra ni viceversa (propietario resuelto por sesión).
11. **Regresión reproductiva**: correr `tests/test_reproduction.py` por separado y confirmar que conserva su comportamiento (una vaca no puede tener dos montas pendientes; 200/400 según el caso).

## Comandos de verificación (PowerShell)

```powershell
.\.venv\Scripts\python.exe tests/test_state_validation.py
.\.venv\Scripts\python.exe tests/test_reproduction.py
npm.cmd run build   # solo si se cambia la interfaz; no previsto en este plan
```

## Fuera de alcance

- Reglas de fechas, intervalos reproductivos o reglas de monta.
- Reactivar rutas antiguas de animales/reproducción (siguen deshabilitadas en `csrf()`).
- Migraciones, MySQL/TiDB, `render.yaml`, claves JSON distintas de las actuales, ni cambios de interfaz React.