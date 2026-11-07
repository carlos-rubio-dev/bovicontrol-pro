---
name: bovicontrol-react-ui
description: Implementar y revisar búsquedas, filtros y controles accesibles en las pantallas React de BoviControl Pro sin alterar la persistencia ni las reglas reproductivas.
---

# Interfaz de BoviControl

Lee `AGENTS.md`, `src/AGENTS.md` y el componente afectado en `src/App.tsx`. Conserva React, TypeScript, Tailwind y el contrato actual; no agregues librerías para una búsqueda o filtro sencillo.

Mantén los filtros como estado de presentación y deriva los registros visibles sin mutar los datos. Si hay búsqueda y selector, combina ambos con AND. Conserva el conteo total y muestra un mensaje útil cuando no hay coincidencias. Restablecer filtros debe limpiar todos los controles relacionados.

Asigna etiquetas accesibles a input/select, usa botones con texto claro y verifica foco visible, teclado y distribución en pantalla estrecha. Evita depender solo del color para comunicar el estado del animal.

Prueba con datos sintéticos en una base temporal: búsqueda por código y nombre, combinación de filtros, cero coincidencias, restablecimiento y actualización de la lista. Verifica que filtrar no produzca una escritura a `/api/state`.
