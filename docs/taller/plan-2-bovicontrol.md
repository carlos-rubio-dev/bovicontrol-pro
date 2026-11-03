# Plan 2 (final) — Filtro por estado reproductivo + búsqueda en Vacas

## Objetivo

Como encargado de la finca, filtrar la lista de vacas por estado reproductivo y combinarlo (AND) con la búsqueda por nombre o código, para encontrar animales a revisar. Cambio puramente de presentación: no modifica registros ni envía `PUT /api/state`.

## Contexto y archivo afectado

- **`src/App.tsx`**, función `VacasScreen` (src/App.tsx:799–867):
  - Estado local `search` (src/App.tsx:802) y filtro en `filtered` (src/App.tsx:807): compara contra `v.nombre` / `v.id`, insensible a mayúsculas, pero sin `trim()` (espacios sobrantes rompen la coincidencia).
  - La barra de búsqueda (src/App.tsx:818–828) no tiene etiqueta visible; el placeholder "Buscar por nombre o código..." no la reemplaza.
  - No existe selector de estado; el tipo `Vaca.estado` (src/App.tsx:21) ya limita los valores a `'Preñada' | 'Vacía' | 'En celo' | 'Lactando' | 'Seca'`, idénticos a las opciones del `VacaForm` (src/App.tsx:218) y a los colores de `estadoBadge` (src/App.tsx:129).
- **Reglas respetadas**: React + TypeScript + Tailwind sin dependencias nuevas; claves del contrato (`vacas`) intactas; cálculos e intervalos reproductivos sin cambios; ninguna otra pantalla.

## Cambios propuestos (solo `VacasScreen`)

1. **Nuevos estados locales**:
   - `estadoFiltro` (cadena vacía = "Todos los estados").
   - Normalización de búsqueda: `const consulta = search.trim().toLowerCase()`.
2. **Etiquetas visibles para ambos controles**:
   - Búsqueda: `<label htmlFor="buscar-vaca">Buscar</label>` + `<input id="buscar-vaca">` nativo, estilos actuales (borde `#d4ddd0`, `rounded-xl`, foco `ring-[#2d5a27]/30`); se conserva el icono `Search`, pero la etiqueta es la vía accesible, no el placeholder.
   - Selector: `<label htmlFor="filtro-estado">Estado</label>` + `<select id="filtro-estado">` nativo.
3. **Selector de estado** con opciones: `Todos los estados` (value `''`), `Preñada`, `Vacía`, `En celo`, `Lactando`, `Seca`.
4. **Filtro combinado con AND**: `filtered = vacas.filter(v => coincideBusqueda && (estadoFiltro === '' || v.estado === estadoFiltro))`, donde `coincideBusqueda` compara `consulta` contra `v.nombre.toLowerCase()` y `v.id.toLowerCase()`; `consulta === ''` no filtra nada.
5. **Botón "Limpiar filtros"**: `<button type="button">` con `<X>` de lucide-react (ya presente) + texto; reinicia `search` y `estadoFiltro`; visible solo con filtros activos.
6. **Contador actualizado**: la banda inferior (src/App.tsx:862) "Mostrando X de Y registros" se conserva y refleja el cruce AND automáticamente.
7. **Estado vacío** (src/App.tsx:858): si `vacas.length > 0` y `filtered.length === 0`, mensaje "No hay vacas que coincidan con los filtros. Ajusta la búsqueda o el estado."; si `vacas.length === 0`, se mantiene "No se encontraron vacas".
8. **Layout responsivo**:
   - Contenedor de controles (src/App.tsx:818): `flex flex-wrap gap-3 items-end` con etiquetas encima de sus controles.
   - **Tabla con scroll horizontal propio**: envolver el `<table>` (src/App.tsx:831) en `<div className="overflow-x-auto">` dentro del card (src/App.tsx:830); `<table>` conserva `w-full` y añade `min-w-[720px]` para no recortar columnas a 700 px.

Sin cambios en modal, `ConfirmDialog`, `VacaForm`, `VacaProfile`, `TorosScreen`, sincronización ni `render.yaml`.

## Pruebas (procedimiento reproducible, datos sintéticos)

**Datos sintéticos** en base temporal de Flask (`DATABASE_URL` apuntando a una base de prueba; la muestra de `App.tsx` no se usa como datos reales). Crear usuario vía `/api/setup` + `/api/login` y registrar **6 vacas** con estado fijado:

| Vaca | Estado |
|---|---|
| Luna | Vacía |
| Estrella | Preñada |
| Canela | Lactando |
| Paloma | Preñada |
| Rosa | En celo |
| Niebla | Seca |

Códigos con prefijo común `V-001`…`V-006` para probar coincidencias parciales.

Referencias para las pruebas: Barra de búsqueda = src/App.tsx:818–828; Selector = bloque nuevo a insertar; Tabla = src/App.tsx:830–864 (estado vacío en 858, contador en 862).

1. **Búsqueda por nombre**: escribir "  Estrella  " (con espacios) → exactamente Estrella; "canel" → Canela; variantes de mayúsculas ("LUNA", "luna") → misma fila.
2. **Búsqueda por código**: "v-0" → las 6; "V-004" → exactamente la 4ª.
3. **Selector solo**: "Preñada" → Estrella y Paloma ("Mostrando 2 de 6"); "Vacía" → solo Luna; "En celo" → solo Rosa; "Seca" → solo Niebla; "Lactando" → solo Canela ("1 de 6").
4. **Combinación AND**: "Lactando" + "Canela" → 1 fila (Canela); "Lactando" + "Rosa" → 0 filas; "Preñada" + "Luna" → 0 filas. Con 0: mensaje "No hay vacas que coincidan..." (no el genérico).
5. **Limpiar filtros**: con Prueba 4 activo, pulsar el botón → contador "6 de 6", selector en "Todos los estados", input vacío; repetir con otra combinación para confirmar que ambos controles siempre se reinician.
6. **Teclado y foco** (las etiquetas **no** reciben Tab; el foco va directo a los controles):
   - Tab desde el header: input búsqueda → select → botones de la sección ("Limpiar filtros" si visible, luego "Nueva vaca"); **Tab no detiene el foco en las etiquetas ni en las celdas ordinarias de la tabla** (solo controles: input, select, botones de acciones de fila y encabezados accionables si existieran).
   - En cada control enfocado, indicador visual claro (ring verde visible, no solo color).
   - `<select>` con flechas: al cambiar opción, filas y contador se actualizan de inmediato sin recargar.
   - `<input>` y `<select>` operables y anunciados por sus etiquetas ("Buscar", "Estado"); el placeholder solo refuerza.
7. **Red (cero escrituras)**: abrir la página de Vacas en DevTools → Network con filtro `api/state`; **contar los `PUT /api/state` de esa misma página antes de filtrar** (referencia tras el último guardado real) y **comparar con el contador después de aplicar búsqueda, selector, combinaciones de Prueba 4 y "Limpiar filtros"**: el número tras filtrar debe ser idéntico al antes; ninguna petición nueva con carga de estado. Verificar también con recarga que los registros persistidos no cambiaron.
8. **Pantalla estrecha (700 px)**: controles (`Buscar`+input, `Estado`+select, botones) se apilan con `flex-wrap` sin solaparse; la tabla navega con la barra horizontal del nuevo `<div class="overflow-x-auto">`, sin columnas cortadas. Capturas reales (no simuladas).
9. **Compilación y despliegue**: `npm.cmd ci` (si procede) y `npm.cmd run build` → `static/dist` regenerado y versionado junto al fuente (según `src/AGENTS.md`); app servida por Flask en `http://127.0.0.1:5000`, revisión manual de la pantalla de Vacas con el build.
10. **Regresión backend**: `.\.venv\Scripts\python.exe tests/test_reproduction.py` sigue pasando (el cambio es de presentación, no debe tocar reglas reproductivas).

## Riesgos y mitigaciones

- **Ignorar `estadoFiltro` en el AND** → cobertura dedicada en la Prueba 4 (cruce con 1 y con 0 resultados).
- **Espacios sobrantes en la consulta** → `trim()` antes de `toLowerCase()`; cubierto en la Prueba 1.
- **Accesibilidad insuficiente** → etiquetas visibles en ambos controles, placeholder solo refuerzo; foco verificado en la Prueba 6, incluido que no aterriza en etiquetas ni celdas ordinarias.
- **Recorte de columnas a 700 px** → `overflow-x-auto` en contenedor propio + `min-w-[720px]`; validado en la Prueba 8.
- **Falsa alarma de escrituras** → el conteo de `PUT /api/state` antes/después (Prueba 7) separa el guardado real de eventos del filtrado; si se edita una vaca durante la prueba, repetir con nueva referencia.

## Entregable

- Plan guardado como **`plan-2-bovicontrol.md`** al aprobarse; implementación posterior desde `main` via `feat/solicitud-2`, commit `feat:`, capturas reales documentadas en el PR (según convención del repo).