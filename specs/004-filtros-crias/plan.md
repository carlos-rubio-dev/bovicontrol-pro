# Plan — Filtros de crías por sexo y salud (004)

## Problema
CriasScreen solo permite buscar por texto; el encargado necesita separar machos/hembras y revisar animales en observación o enfermos.

## Decisiones
1. Solo frontend: estado local de presentación en `CriasScreen` (`sexoFilter`, `saludFilter` junto al `search` existente). Ninguna escritura: filtrar/limpiar no toca el estado global ni dispara PUT /api/state (AC6).
2. Tres controles con etiqueta visible asociada (`htmlFor`): "Buscar cría" (input actual), "Sexo" y "Estado de salud" (`<select>` nativos). Opciones de Sexo: Todos (valor ''), Macho, Hembra; Estado de salud: Todos (valor ''), Saludable, En observación, Enfermo. Los valores coinciden con `c.sexo` y `c.estado` del fixture (AC1).
3. Combinación AND de los tres filtros: coincide nombre o código con `trim()` + insensibilidad a mayúsculas en ambos lados, y sexo y estado iguales a los selectores (AC2).
4. Botón "Limpiar filtros" que restablece búsqueda y ambos selectores (AC3). Contador accesible `role="status"`: `Mostrando {visibles} de {total} registros` (AC3), mismo formato que TorosScreen.
5. Estado vacío: si `crias.length > 0` pero `filtered.length === 0`, mensaje específico de filtros ("Ninguna cría coincide con los filtros aplicados"); si la lista está vacía, mensaje de ausencia de registros ("No hay crías registradas"). Ambos distinguibles y verificables por texto (AC4).
6. Teclado: controles nativos enfocables y operables; botón limpiar con Enter/Espacio. A 700 px: barra de controles con `flex flex-wrap gap-*` (sin solape) y la grilla de tarjetas responsive (p. ej. `grid-cols-1 sm:grid-cols-2 xl:grid-cols-3`) para que las tarjetas se adapten sin desbordar horizontalmente (AC5).
7. Sin nuevas dependencias. Sin cambios en backend, `csrf()` ni otras pantallas.

## Rutas
- Interfaz: `src/App.tsx` · `function CriasScreen` (líneas ~1121–1188).
- Pruebas UI: `tests/ui/calves.spec.ts` con `tests/ui/helpers.ts` y `tests/ui_fixture.py` (ya siembra Lucero/C-001/Hembra/Saludable, Trueno/C-002/Macho/En observación, Nube/C-003/Hembra/Enfermo).
- Build versionado: `static/dist` vía `npm.cmd run build`.

## Riesgos
- `references.spec.ts` crea y elimina la cría "Luz" localizando tarjetas por `div.bg-white.rounded-xl`; los nuevos controles no deben introducir contenedores que confundan ese selector ni quitar el buscador actual.
- El mensaje vacío actual ("No se encontraron crías registradas") debe diferenciarse según haya o no filtros activos; se conserva un texto de ausencia para lista vacía.
- Añadir labels puede afectar a pruebas que usan el placeholder; se mantiene el placeholder "Buscar cría..." y se añade la etiqueta.

## Fuera de alcance
Backend, CSV, otras pantallas, reglas reproductivas e intervalos.
