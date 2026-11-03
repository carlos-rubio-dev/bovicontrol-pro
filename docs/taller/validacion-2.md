# Validación de la solicitud 2

Pruebas reales realizadas con Playwright y Brave, contra el build servido por Flask en 127.0.0.1:5017, con SQLite temporal. Se usaron las seis vacas sintéticas especificadas en el plan final.

- Seis búsquedas por nombre/código, con espacios y mayúsculas, produjeron los conteos esperados.
- Los cinco estados devolvieron solo sus vacas; Preñada devolvió Estrella y Paloma.
- Tres cruces AND: Lactando + Canela = 1; Lactando + Rosa = 0; Preñada + Luna = 0.
- Limpiar filtros restableció ambos controles y seis registros.
- Teclado: foco de input a select y botón, flechas en select y activación con Enter. Indicador de foco visible comprobado.
- A 700 px los controles no se superponen. La tabla tiene un contenedor de 430 px y contenido de 720 px, con desplazamiento horizontal comprobado.
- Cero PUT /api/state producidos por los filtros; estado persistido idéntico antes/después y tras recargar; cero errores JavaScript de página.
- npm.cmd run build pasa. Conserva el aviso ya existente sobre el tamaño del bundle.
- tests/test_reproduction.py pasa.

Las capturas y el registro JSON de esta ejecución se entregan en el paquete de evidencias. No se hicieron pruebas contra producción ni contra MySQL.
