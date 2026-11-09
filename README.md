# BoviControl Pro

Aplicación web para registrar vacas, toros, crías, montas, partos y destetes. La interfaz usa React y TypeScript; el backend usa Flask. Los datos se guardan en SQLite o MySQL.

## Iniciar en Windows

Comandos de instalación e inicio desde la raíz del repositorio:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
npm install
npm run build
python app.py
```

La aplicación se sirve en <http://127.0.0.1:5000>. En el primer inicio se registra la cuenta administradora con correo y contraseña de al menos ocho caracteres. La sección **Usuarios** permite crear cuentas, cambiar contraseñas y gestionar el acceso. Los registros de ganado son independientes para cada cuenta. Los cambios de interfaz requieren regenerar `static/dist` con `npm run build`.

## MySQL

La conexión se define mediante `DATABASE_URL` en `.env`, siguiendo `.env.example`. La base utiliza `utf8mb4`:

```sql
CREATE DATABASE bovicontrol CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Flask crea las tablas al arrancar.

Las fechas estimadas usan 283 días de gestación y 210 para destete. Al registrar un parto real, el sistema calcula cuándo empezar a vigilar celo (día 50) y desde cuándo considerar otra monta (día 60); muestra una cuenta regresiva en el perfil y los eventos en el calendario. El ciclo de celo de ~21 días es solo una referencia después de observar un celo real. Registrar una monta marca la vaca como preñada de forma provisional; la gestación y la aptitud para una nueva monta deben confirmarse con un veterinario. Cada cuenta tiene sus propios registros de ganado, reproducción y calendario. El administrador gestiona las cuentas, pero ve únicamente sus propios registros; los datos guardados antes de esta separación se asignan a la cuenta administradora.

Referencias para estos intervalos orientativos: [Oklahoma State University, detección de celo e inseminación](https://extension.okstate.edu/fact-sheets/artificial-insemination-for-beef-cattle) y [preparación posparto para una nueva monta](https://extension.okstate.edu/programs/beef-extension/cow-calf-corner-the-newsletter-archives/2025/july-14-2025).

## Despliegue en Render y TiDB Cloud

El archivo `render.yaml` define el servicio web. La conexión a TiDB usa `mysql+pymysql://` y TLS; Render genera `SECRET_KEY`. `instance/`, `.env` y las bases locales están excluidas por `.gitignore`.

La migración se revisa con `python migrate_to_cloud.py` y se aplica con `python migrate_to_cloud.py --apply`. El script solo escribe si la base remota está vacía, conserva los hashes de contraseña y comprueba las cantidades al finalizar. Mientras no haya usuarios migrados, la aplicación muestra una pantalla de preparación e impide crear otra cuenta administradora.


## Desarrollo con OpenCode

El arnés usa OpenCode 1.19.5 y un flujo SDD propio. Cada funcionalidad está en `specs/<id>/`: `spec.md` define los criterios, `plan.md` identifica los archivos y decisiones, `tasks.md` registra los pasos y `resultado.md` reúne pruebas, revisión y PR.

### Piezas

- `AGENTS.md` y `src/AGENTS.md`: arquitectura, comandos y reglas por área.
- `opencode.json` y `docs/desarrollo.md`: permisos globales e instrucciones del flujo.
- `.opencode/agents/`: coordinador, API, interfaz, verificador y revisor.
- `.opencode/skills/`: cinco procedimientos del proyecto.
- `.github/workflows/calidad.yml`: pruebas de API, build y pruebas de navegador en los PR.

### Skills

| Skill | Uso | Agente |
|---|---|---|
| `bovicontrol-api-tests` | Sesión, CSRF, SQLite temporal, datos separados y persistencia tras rechazos. | API y verificador |
| `bovicontrol-react-ui` | Controles, filtros locales, teclado y pantallas pequeñas. | Interfaz y verificador |
| `bovicontrol-sdd` | Spec, plan, tareas, delegaciones y evidencia de cada funcionalidad. | Coordinador |
| `bovicontrol-csv` | Escape CSV, caracteres y prevención de fórmulas en exportaciones. | Interfaz, verificador y revisor |
| `bovicontrol-revision` | Criterios frente a diff, pruebas y hallazgos. | Revisor |

### Flujo

```powershell
opencode --version
opencode run --agent coordinador "Trabaja la spec specs/<id>. Lee spec.md y sigue bovicontrol-sdd."
```

El coordinador prepara el plan y las tareas. El verificador escribe casos desde los criterios y registra el fallo esperado antes del código. API e interfaz modifican producción en sus rutas. El verificador ejecuta las comprobaciones y genera `static/dist`; el revisor inspecciona criterios, código y evidencia sin editarlos. Los hallazgos vuelven al rol responsable. El flujo se detiene después de dos rondas sin progreso y requiere decisión humana.

```powershell
.\.venv\Scripts\python.exe scripts/check_backend.py
npm.cmd run build
npx.cmd playwright install chromium
$env:BOVI_TEST_PYTHON = (Resolve-Path .\.venv\Scripts\python.exe).Path
npm.cmd run test:ui
```

Las pruebas de navegador usan `tests/serve_ui.py`, que crea una base temporal con datos sintéticos. El servidor termina al finalizar la ejecución. `test-results/` queda fuera de Git; CI publica el resultado como artefacto.

### Ajustes del diseño de agentes

OpenCode 1.19.5 usa `permission` con las claves `bash` y `task`, en lugar de la sintaxis `permissions/action/resource/effect` considerada en el diseño. La carga de los perfiles se comprobó con la propia herramienta. El verificador usa Playwright mediante shell para revisar el navegador y ejecutar build; API e interfaz no necesitan shell. La configuración, dependencias y permisos del arnés se mantienen fuera del alcance de los especialistas.

La revisión inicial detectó comodines demasiado amplios en los comandos permitidos. Se sustituyeron por comandos exactos y se retiraron entradas para scripts inexistentes. La primera ejecución de navegador pasó, pero el sandbox de Windows impedía cerrar los procesos; la ejecución con permisos de proceso completos terminó con código 0. En CI se usa Chromium de Playwright sobre Linux.

En la segunda spec, una instrucción indicaba ejecutar Python con la ruta completa del venv, aunque los permisos solo admitían el comando de la suite. La herramienta rechazó ese intento. Se unificaron las instrucciones con el comando permitido y el venv en PATH. Los especialistas entregan sus resultados al coordinador, que es el único que puede escribir los informes de specs.

El diseño inicial dejaba al coordinador sin edición. En la implementación puede escribir únicamente specs/** para mantener planes, tareas y resultados, sin tocar código ni pruebas. El revisor incorporó consultas exactas de git diff y git status --short para inspeccionar cambios pendientes, conservando la prohibición de editar y de ejecutar otros comandos. Se mantienen los cinco roles y el modelo del diseño original.

### Calidad

1. CI ejecuta los scripts backend en procesos separados, compila la interfaz y comprueba el navegador. Los resultados aparecen en cada PR y en la pestaña Actions.
2. El revisor de OpenCode contrasta cada criterio con el diff y los resultados del verificador. Los hallazgos y correcciones se registran en `resultado.md` de cada spec.

La evidencia por funcionalidad está enlazada en la sección de specs. SQLite temporal no demuestra rendimiento ni compatibilidad de MySQL/TiDB. La protección de `main` depende de la configuración del repositorio; un workflow por sí solo no impide un push directo.
