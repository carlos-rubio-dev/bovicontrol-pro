# Entrega del taller de BoviControl Pro

Para Q10 se entregan tres archivos: `Taller_BoviControl_OpenCode.pdf`, `plan-1-bovicontrol.md` y `plan-2-bovicontrol.md`. Se usó el nombre del proyecto porque no se indicó un número de grupo.

Backend y frontend viven en este repositorio. La memoria raíz explica Flask y las reglas comunes; `src/AGENTS.md` contiene las particularidades de React. Las dos skills están en `.opencode/skills/`.

## Pull requests

- [PR #1: memoria y skills](https://github.com/carlos-rubio-dev/bovicontrol-pro/pull/1).
- [PR #2: validación de registros](https://github.com/carlos-rubio-dev/bovicontrol-pro/pull/2).
- [PR #3: filtro por estado reproductivo](https://github.com/carlos-rubio-dev/bovicontrol-pro/pull/3).

## Planes y pruebas

Los planes se generaron con OpenCode 1.19.5, agente Plan y GLM-5.3-Flash Free. Se guardó la respuesta final de cada sesión. Los datos de las sesiones y las skills utilizadas están en `evidencias/generacion-opencode.json`.

Los prompts están guardados junto a los planes. El segundo plan necesitó dos correcciones: una para las etiquetas y la tabla, y otra para los pasos de teclado y los datos de prueba. La revisión del código y la implementación se hicieron con apoyo de Codex.

En `evidencias/` están las imágenes del uso de las skills, la respuesta de la API y el filtro de vacas. También se incluye la vista de la aplicación a 700 píxeles de ancho. Los resultados del backend y de la interfaz se guardaron en `api-result.json` y `ui-results.json`.

Las pruebas usaron una base temporal de SQLite con datos de ejemplo. La compilación pasa y conserva el aviso de tamaño del archivo JavaScript que ya tenía el proyecto.

## Comprobación del backend (PowerShell)

```powershell
.\.venv\Scripts\python.exe tests/test_state_validation.py
.\.venv\Scripts\python.exe tests/test_reproduction.py
npm.cmd run build
```

La validación de interfaz está descrita en `validacion-2.md` y sus resultados medidos se guardan en `evidencias/ui-results.json`.
