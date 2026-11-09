# Filtro de toros por estado

## Problema
La pantalla de toros permite buscar por nombre o código, pero no separar los activos, los que están en cuarentena y los inactivos.

## Criterios de aceptación
- AC1. La pantalla Toros incluye un selector con etiqueta visible Estado del toro y opciones Todos los estados, Activo, En cuarentena e Inactivo.
- AC2. El selector se combina con la búsqueda por nombre o código; se ignoran mayúsculas y espacios al inicio o final. La búsqueda tiene etiqueta Buscar toro.
- AC3. Limpiar filtros vacía búsqueda y selector. El contador accesible indica registros visibles frente al total.
- AC4. Sin coincidencias se muestra un mensaje específico de filtros, distinto de una lista inicialmente vacía.
- AC5. Búsqueda, selector y limpiar son operables con teclado. A 700 px los controles se acomodan y la tabla tiene su propio desplazamiento horizontal.
- AC6. Filtrar y limpiar no cambian los datos guardados ni generan nuevos PUT /api/state.

## Alcance y validación
Solo TorosScreen de src/App.tsx. No modifica backend, reproducción ni otras pantallas. Pruebas independientes en tests/ui/bulls.spec.ts sobre las tres categorías y combinaciones, contador, vacío, limpiar, teclado y red. Build de producción actualizado.
