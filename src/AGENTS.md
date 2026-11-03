# Memoria del frontend

Complementa el `AGENTS.md` de la raíz. `main.tsx` monta la aplicación; `App.tsx` contiene pantallas, formularios, tipos y sincronización; `index.css` contiene estilos globales.

- Conserva las claves del contrato de `/api/state`: `vacas`, `toros`, `crias`, `reprod`, `partos`.
- Una búsqueda o filtro es estado local de presentación; no debe modificar registros ni provocar guardados.
- Usa controles nativos con nombre accesible. El placeholder no reemplaza una etiqueta. Verifica teclado, estado vacío y el contador tras combinar filtros.
- Las fechas de negocio se expresan como `YYYY-MM-DD`; no cambies los cálculos reproductivos al editar tablas o filtros.
- Mantén el estilo visual y textos en español. Las nuevas dependencias necesitan una razón concreta; filtros simples no las necesitan.
- Desde la raíz ejecuta `npm.cmd ci` y `npm.cmd run build`. Comprueba el resultado servido por Flask y versiona `static/dist` junto al código fuente cuando haya cambios.
- Nunca uses los datos de muestra del archivo como datos reales persistidos. Las pruebas visuales deben trabajar con una base temporal.
