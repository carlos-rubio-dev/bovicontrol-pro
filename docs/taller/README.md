# Entrega del taller de BoviControl Pro

Para Q10 se entregan tres archivos: `Taller_BoviControl_OpenCode.pdf`, `plan-1-bovicontrol.md` y `plan-2-bovicontrol.md`. Se usó el nombre del proyecto porque no se indicó un número de grupo.

Backend y frontend viven en este repositorio. La memoria raíz explica Flask y las reglas comunes; `src/AGENTS.md` contiene las particularidades de React. Las dos skills están en `.opencode/skills/`.

## Pull requests

- [PR #1: memoria y skills](https://github.com/carlos-rubio-dev/bovicontrol-pro/pull/1).
- [PR #2: validación de registros](https://github.com/carlos-rubio-dev/bovicontrol-pro/pull/2).
- [PR #3: filtro por estado reproductivo](https://github.com/carlos-rubio-dev/bovicontrol-pro/pull/3).

## Procedencia verificable

Los planes se generaron con OpenCode 1.19.5, agente Plan y GLM-5.3-Flash Free. Se exportaron las sesiones y se comprobó que cada archivo de plan coincide exactamente con la última respuesta del agente. El archivo `evidencias/generacion-opencode.json` conserva sesiones, modelo, llamadas a skills completadas y huellas SHA-256.

Los prompts se conservan tal como aparecen en las exportaciones, incluidas las comillas externas que recibió OpenCode. El segundo plan pasó por dos correcciones, guardadas por separado; los planes originales no se reescribieron manualmente. Codex realizó la revisión técnica y la implementación; no se atribuye una revisión humana no registrada.

Las capturas `evidence-skill-*` proceden de la interfaz web real de OpenCode. `evidence-result-2.png` y `evidence-mobile.png` muestran la aplicación con datos sintéticos. `evidence-result-1.png` es la captura de un visor de prueba que muestra una respuesta real de la API y una lectura posterior; su resultado está en `api-result.json`.

Las pruebas usaron SQLite temporal. No se probaron MySQL ni el despliegue en producción. El build conserva el aviso previo de tamaño del bundle.

## Comprobación del backend (PowerShell)

```powershell
.\.venv\Scripts\python.exe tests/test_state_validation.py
.\.venv\Scripts\python.exe tests/test_reproduction.py
npm.cmd run build
```

La validación de interfaz está descrita en `validacion-2.md` y sus resultados medidos se guardan en `evidencias/ui-results.json`.
