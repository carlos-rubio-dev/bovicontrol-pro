# Plan — Filtro de toros por estado (003)

## Problema
TorosScreen permite buscar por nombre o código pero no separar toros activos, en cuarentena e inactivos.

## Decisiones
1. Solo frontend: estado local de presentación en `TorosScreen` (`estadoFilter`). Ninguna escritura: filtrar/limpiar no toca el estado global ni dispara PUT /api/state (AC6).
2. Selector nativo `<select>` con `<label>` "Estado del toro" y opciones: Todos los estados (valor ''), Activo, En cuarentena, Inactivo. Los valores de filtro coinciden con `t.estado` (AC1).
3. Búsqueda etiquetada "Buscar toro" (label asociado al input actual; placeholder se mantiene). La combinación es filtro AND: coincide nombre o código (trim + case-insensitive, igual que ahora pero con `trim()` en ambos lados) y estado igual al del selector (AC2).
4. Botón "Limpiar filtros" que restablece búsqueda y selector (AC3). Contador accesible existente se amplía: `Mostrando {visibles} de {total} registros` dentro de un contenedor con `aria-live="polite"` (AC3) si el formato actual no cambia visualmente.
5. Estado vacío por filtros: mensaje específico cuando hay toros totales pero ninguno pasa el filtro ("Ningún toro coincide con los filtros aplicados..."), distinto del caso de lista realmente vacía ("No hay toros registrados"). Mensaje con `role="status"` para comprobarlo por accesibilidad (AC4).
6. Teclado: controles nativos; botón limpiar enfocable; `label htmlFor`. A 700 px: contenedor de controles con `flex flex-wrap gap-*` y la tabla envuelta en un `overflow-x-auto` con `min-w-*` interno para desplazamiento horizontal propio (AC5).
7. Sin nuevas dependencias. Sin cambios en backend, `csrf()` ni otras pantallas.

## Rutas
- Interfaz: `src/App.tsx` · `function TorosScreen` (líneas ~1024–1091).
- Pruebas UI: `tests/ui/bulls.spec.ts` con `tests/ui/helpers.ts` y `tests/ui_fixture.py` (ya siembra Fuerte/Activo, Titán/En cuarentena, Zeus/Inactivo).
- Build versionado: `static/dist` vía `npm.cmd run build`.

## Riesgos
- Cambiar el bloque de búsqueda puede afectar selectores de `baseline.spec.ts` si espera el placeholder o el texto del contador; se conserva el texto "Buscar toro..." y el formato del contador.
- El mensaje vacío actual ("No se encontraron toros") debe diferenciarse según haya o no filtros activos.
