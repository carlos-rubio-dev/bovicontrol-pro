---
name: bovicontrol-api-tests
description: Diseñar y ejecutar pruebas de la API Flask de BoviControl Pro cuando cambian la validación de /api/state, CSRF o el aislamiento entre usuarios.
---

# Pruebas de la API de BoviControl

Lee `AGENTS.md`, `app.py` y el test existente antes de proponer casos. La interfaz usa `AppState.payload`, no las rutas antiguas de animales, que están deshabilitadas.

Configura una base SQLite temporal con `DATABASE_URL` y una `SECRET_KEY` exclusiva de pruebas antes de importar `app`. Evita `.env` y bases reales. Cierra la sesión SQLAlchemy y dispone el motor antes de eliminar el directorio temporal en Windows.

Usa el cliente de pruebas Flask. Obtén CSRF en `/api/session`, crea la cuenta de prueba con `/api/setup` y usa el token nuevo de esa respuesta. Para comprobar aislamiento, crea una segunda cuenta mediante `/api/users` e inicia otra sesión con un cliente independiente.

Comprueba comportamiento: estados HTTP, JSON de error y que un PUT rechazado no cambie el GET posterior. Incluye una escritura válida, entrada malformada, ausencia de sesión, CSRF incorrecto y datos separados entre cuentas cuando sean relevantes al cambio. No desactives autenticación ni CSRF para facilitar las pruebas.

Ejecuta los scripts de tests por separado, incluida la regresión reproductiva. Informa comando, resultado real y límites de cobertura; no afirmes haber probado MySQL si solo se usó SQLite. Esta skill no requiere descargas, credenciales, llamadas externas ni scripts adicionales.
