# BoviControl Pro: memoria del proyecto

## Alcance y arquitectura
Aplicación de gestión bovina. Este repositorio contiene ambos componentes: backend en `app.py` (Python, Flask, Flask-SQLAlchemy) y frontend en `src/` (React 18, TypeScript, Vite y Tailwind). SQLite es el almacenamiento local; MySQL/TiDB se configura con `DATABASE_URL`.

La interfaz usa `/api/session`, `/api/login`, `/api/logout`, `/api/setup`, `/api/users` y `/api/state`. El estado ganadero se guarda como JSON en `AppState`, asociado al usuario autenticado. Las rutas antiguas de animales/reproducción están deshabilitadas en `csrf()`; no las reactives al implementar una función de la interfaz.

El backend es responsable de autenticación, autorización, CSRF, validación y persistencia. El frontend depende del contrato HTTP, nunca de SQL ni de secretos. No introduzcas una separación física de repositorios ni una migración de arquitectura para cambios pequeños.

## PowerShell: instalación, ejecución y comprobación
Desde la raíz:
```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
npm.cmd ci
npm.cmd run build
.\.venv\Scripts\python.exe app.py
```
La aplicación está en `http://127.0.0.1:5000`. Para desarrollar la interfaz, ejecuta `npm.cmd run dev` en otra terminal; Vite redirige `/api` al servidor Flask. `npm.cmd run build` genera `static/dist`, que Flask sirve y que este repositorio versiona; incluye el resultado si cambia la interfaz.

Comprobaciones del proyecto:
```powershell
.\.venv\Scripts\python.exe scripts/check_backend.py
npm.cmd run build
npm.cmd run test:ui
```
Ejecuta cada archivo de pruebas como script separado: el actual importa la aplicación y ejecuta unittest al cargarse. Los nuevos tests deben usar SQLite temporal y establecer `DATABASE_URL` y `SECRET_KEY` antes de importar `app`; nunca usar la base de la finca.

## Reglas que deben preservarse
- El administrador gestiona cuentas, pero no puede leer el ganado de otros usuarios. Resuelve siempre el propietario desde la sesión; no aceptes un `user_id` del cliente para escoger datos.
- Las escrituras requieren el token `X-CSRF-Token`. Un rechazo debe dejar intacto el estado persistido.
- No cambies los intervalos reproductivos ni las reglas de monta como efecto secundario de otro cambio.
- Conserva los nombres de claves JSON en español y las respuestas de error comprensibles para el usuario.
- No publiques `.env`, `instance`, bases, contraseñas ni logs con sesiones. Los cambios de despliegue y las migraciones requieren un alcance explícito.

## Convenciones de desarrollo
Usa `snake_case` en Python y `camelCase`/`PascalCase` en TypeScript. Conserva el estilo del archivo modificado. Documenta la validación en cada PR. Las ramas parten de `main` y los commits describen el cambio. Los cambios funcionales se planifican antes de implementar.

Los cinco perfiles están en `.opencode/agents/` y las cinco skills en `.opencode/skills/`. El coordinador sigue bovicontrol-sdd; cada funcionalidad registra criterios, plan, tareas y resultado en specs/. El contexto adicional de frontend está en src/AGENTS.md. La configuración usa la sintaxis permission de OpenCode 1.19.5.
