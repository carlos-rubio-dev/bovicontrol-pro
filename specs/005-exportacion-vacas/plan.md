# Plan — spec 005-exportacion-vacas

## Decisiones
- Solo frontend: `VacasScreen` (src/App.tsx, bloque desde function VacasScreen) y helper puro nuevo `src/csv.ts`. Sin rutas ni backend; no hay cambios en `app.py`.
- Contrato helper: `serializeCsv(rows: readonly (readonly unknown[])[]): string`. VacasScreen arma la primera fila de encabezados (Código, Nombre, Raza, Nacimiento, Peso (kg), Estado, Último parto, Próximo parto, Partos) y llama al helper. csv.ts no importa App.tsx.
- Serialización: UTF-8 con BOM + CRLF, campos entre comillas, comillas internas dobles, neutralización con apóstrofo de valores que empiezan por =, +, -, @, tab o retorno (incluso con espacios previos). Ceros y campos vacíos conservan su columna.
- Descarga con Blob + enlace local (`URL.createObjectURL`); no hay peticiones de red ni PUT /api/state. Botón deshabilitado si no hay vacas visibles; accesible por teclado.
- Columnas añadidas frente a la tabla: Nacimiento (fechaNacimiento), Peso (kg), Partos. La tabla visible no cambia.

## Prueba
- `tests/ui/csv.spec.ts` con las tres vacas del fixture: Luna/Vacía, Estrella/Preñada y Paloma/Preñada (V-001 a V-003). Restaura el estado en afterEach, siguiendo los helpers y las pruebas existentes.
- Prueba de serialización sin navegador: import directo de src/csv.ts y descarga de navegador separada.
- Documento descargado se lee vía evento de descarga de Playwright; se verifica bytes (BOM, CRLF, contenido) y ausencia de PUT.
- Se cubre lista inicialmente vacía (AC2 botón deshabilitado).
