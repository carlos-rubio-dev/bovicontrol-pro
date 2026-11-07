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
