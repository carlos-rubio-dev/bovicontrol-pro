# Plan 2. Encontrar vacas por estado y por nombre

La pantalla de vacas ya permite buscar por nombre o código, pero no por estado reproductivo. Si hay muchos registros, cuesta encontrar, por ejemplo, las vacas preñadas que se quieren revisar. La idea es añadir ese filtro y permitir que funcione junto con la búsqueda actual.

## Qué se va a cambiar

El cambio estará en la pantalla de vacas de `src/App.tsx`. Añadiré un selector con las opciones **Todos los estados**, **Preñada**, **Vacía**, **En celo**, **Lactando** y **Seca**. La búsqueda seguirá aceptando nombres y códigos, sin importar las mayúsculas ni los espacios sobrantes.

Los dos controles trabajarán juntos. Si se escribe “Estrella” y se selecciona “Preñada”, aparecerá Estrella solo si cumple ambas condiciones. Un botón **Limpiar filtros** devolverá la lista completa. El contador mostrará cuántas vacas se ven frente al total, y habrá un mensaje claro cuando ningún registro coincida.

La búsqueda y el selector tendrán etiquetas visibles para que se entiendan y se puedan usar con teclado. En una pantalla estrecha, los controles podrán acomodarse en varias líneas y la tabla tendrá desplazamiento horizontal. Filtrar solo cambiará lo que se ve en pantalla: no guardará ni modificará registros.

## Cómo se comprobará

Usaré seis vacas de prueba con estados diferentes. Revisaré búsquedas por nombre y código, cada opción del selector y combinaciones de ambos filtros. También comprobaré que **Limpiar filtros** restablezca la lista, que el contador sea correcto y que el mensaje aparezca cuando no haya coincidencias.

Haré una revisión con teclado y otra a 700 píxeles de ancho. En la red del navegador comprobaré que usar los filtros no genere nuevas solicitudes `PUT /api/state`. Por último, ejecutaré la compilación y la prueba de reproducción existente.

Este es un resumen editado del plan preparado en OpenCode. La salida original se conserva en las evidencias del proyecto.
