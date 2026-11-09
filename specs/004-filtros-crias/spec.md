# Filtros de crías por sexo y salud

## Problema
La lista de crías solo permite buscar por texto. El encargado necesita separar machos y hembras y revisar los animales en observación o enfermos.

## Criterios de aceptación
- AC1. La pantalla Crías incluye etiquetas visibles Buscar cría, Sexo y Estado de salud. Los selectores ofrecen Todos y los valores ya definidos en la aplicación: Macho/Hembra y Saludable/En observación/Enfermo.
- AC2. Los tres controles se combinan con AND. La búsqueda por nombre o código ignora mayúsculas y espacios sobrantes.
- AC3. Limpiar filtros restablece los tres controles y todos los registros. El contador accesible indica visibles frente al total.
- AC4. Un resultado vacío por filtros tiene un mensaje específico. La lista inicialmente vacía mantiene un mensaje de ausencia de registros.
- AC5. Los controles tienen foco y uso por teclado. A 700 px no se solapan y las tarjetas se adaptan sin desbordar horizontalmente.
- AC6. Filtrar y limpiar no generan nuevos PUT /api/state ni alteran los registros persistidos.

## Alcance y validación
Solo CriasScreen de src/App.tsx y build generado. Pruebas independientes en tests/ui/calves.spec.ts con las tres crías sintéticas del servidor de pruebas. No modifica datos, otras pantallas ni reglas reproductivas.
