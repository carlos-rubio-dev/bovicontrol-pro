# Exportación CSV de la lista de vacas

## Problema
El encargado necesita llevar a una hoja de cálculo los registros visibles de vacas sin copiar la tabla a mano ni incluir registros excluidos por los filtros.

## Criterios de aceptación
- AC1. VacasScreen ofrece Exportar CSV. La descarga vacas.csv contiene encabezados Código, Nombre, Raza, Nacimiento, Peso (kg), Estado, Último parto, Próximo parto y Partos, en ese orden.
- AC2. Se exportan únicamente las vacas visibles después de búsqueda y filtro, conservando el mismo orden. Sin filas visibles el botón está deshabilitado.
- AC3. El CSV usa UTF-8 con BOM y CRLF, campos entre comillas y comillas internas duplicadas. Conserva acentos, comas y saltos de línea dentro de los campos.
- AC4. Valores que empiecen por =, +, -, @, tabulación o retorno, incluso con espacios antes del indicador de fórmula, se prefijan con apóstrofo para impedir su evaluación al abrir la hoja de cálculo.
- AC5. La descarga se genera localmente con Blob; no envía datos a servicios externos ni produce nuevos PUT /api/state.
- AC6. El botón es accesible por teclado y tiene texto visible. La exportación no modifica el estado de la aplicación.

## Alcance y validación
VacasScreen y una función pura en src/csv.ts. Sin dependencias nuevas. Las pruebas tests/ui/csv.spec.ts verifican la función CSV y una descarga real de la lista filtrada, con ausencia de escrituras. Utilizar la skill bovicontrol-csv tanto en implementación como en revisión.
