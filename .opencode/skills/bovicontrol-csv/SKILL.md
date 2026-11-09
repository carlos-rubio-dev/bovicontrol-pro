---
name: bovicontrol-csv
description: Exportar registros visibles de BoviControl a CSV conservando caracteres y evitando fórmulas de hoja de cálculo.
---

# Exportación de registros

La exportación usa solo la lista visible de la cuenta y respeta los filtros aplicados.
El archivo contiene encabezados estables, UTF-8, filas separadas por CRLF y campos entre comillas.
Las comillas internas se duplican. Los campos que comienzan con =, +, -, @, tabulación o retorno se neutralizan antes de exportar para evitar fórmulas al abrir el archivo.
La descarga se genera en el navegador; no envía datos a un servicio externo ni modifica /api/state.
Las pruebas verifican filas filtradas, acentos, comas, comillas, saltos de línea, valores de fórmula y ausencia de escrituras.

