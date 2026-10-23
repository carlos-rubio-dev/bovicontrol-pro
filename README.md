# BoviControl Pro

Aplicación local para registrar vacas, toros, crías, montas, partos y destetes. La interfaz procede del `src.zip` proporcionado. Los datos se guardan en una base de datos mediante Flask. Usa SQLite por defecto y permite MySQL.

## Iniciar en Windows

Abre PowerShell en esta carpeta y ejecuta:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
npm install
npm run build
python app.py
```

Abre <http://127.0.0.1:5000>. En la primera visita, crea la cuenta administradora con tu correo y una contraseña de al menos ocho caracteres. Esa cuenta puede entrar en **Usuarios** para crear cuentas adicionales, cambiar sus contraseñas y activar o desactivar su acceso. Las pantallas de ganado parten vacías, listas para registrar animales reales. Para modificar la interfaz, ejecuta `npm run build` de nuevo antes de abrir Flask.

## MySQL

1. Crea la base: `CREATE DATABASE bovicontrol CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
2. Copia `.env.example` a `.env` y configura `DATABASE_URL` con tu usuario y contraseña.
3. Inicia Flask. Las tablas se crean al arrancar.

Las fechas estimadas usan 283 días de gestación y 210 para destete. Al registrar un parto real, el sistema calcula cuándo empezar a vigilar celo (día 50) y desde cuándo considerar otra monta (día 60); muestra una cuenta regresiva en el perfil y los eventos en el calendario. El ciclo de celo de ~21 días es solo una referencia después de observar un celo real. Registrar una monta marca la vaca como preñada de forma provisional; la gestación y la aptitud para una nueva monta deben confirmarse con un veterinario. Cada cuenta tiene sus propios registros de ganado, reproducción y calendario. El administrador gestiona las cuentas, pero ve únicamente sus propios registros; los datos guardados antes de esta separación se asignan a la cuenta administradora.

Referencias para estos intervalos orientativos: [Oklahoma State University, detección de celo e inseminación](https://extension.okstate.edu/fact-sheets/artificial-insemination-for-beef-cattle) y [preparación posparto para una nueva monta](https://extension.okstate.edu/programs/beef-extension/cow-calf-corner-the-newsletter-archives/2025/july-14-2025).

## Despliegue en Render y TiDB Cloud

El archivo `render.yaml` define un servicio web gratuito de Render. Su `DATABASE_URL` debe apuntar a TiDB Cloud Starter mediante `mysql+pymysql://` y TLS; Render genera `SECRET_KEY`. El repositorio Git puede ser privado. `instance/`, `.env` y las bases locales están excluidas por `.gitignore`; revisa siempre los archivos antes de subirlos.

Antes de dar el enlace público a otras personas, crea la base remota y ejecuta desde esta carpeta `python migrate_to_cloud.py` para revisar cantidades. Después configura `DATABASE_URL` con la conexión remota y ejecuta `python migrate_to_cloud.py --apply` desde tu equipo. El script solo escribe si la base remota no tiene usuarios ni registros, conserva los hashes de contraseña y comprueba las cantidades al terminar. Mientras no haya usuarios migrados, la versión en la nube muestra una pantalla de preparación y no permite crear una cuenta administradora nueva.

Una vez en línea, comprueba el inicio de sesión y los datos de cada usuario antes de compartir la URL. Conserva una copia de la base local como respaldo. Los planes gratuitos tienen límites de uso y disponibilidad.
