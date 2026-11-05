# Plan 1. Evitar errores al guardar registros

En BoviControl encontré un problema al guardar los datos: si un registro trae un identificador incorrecto, el servidor puede responder con un error 500. Para quien usa la aplicación, eso no explica qué pasó. Además, hay que asegurarse de que un intento fallido no cambie los datos que ya estaban guardados.

## Qué se va a cambiar

La validación irá en `app.py`, dentro de `PUT /api/state`, antes de que la aplicación prepare y guarde el nuevo estado. Revisará las cinco listas que recibe esa ruta: vacas, toros, crías, reproducción y partos.

Cada elemento debe ser un registro con un `id` de texto. Se rechazará si el `id` falta, está vacío, tiene espacios al principio o al final, o se repite dentro de la misma lista. Un mismo código puede aparecer en listas diferentes; eso no se tratará como duplicado. Si hay un problema, la respuesta será 400 con un mensaje en español, y se conservará el estado anterior.

El cambio se limita a esa validación. Las reglas de reproducción y la forma de identificar al usuario que guarda los datos seguirán funcionando como hasta ahora.

## Cómo se comprobará

Agregaré pruebas en `tests/test_state_validation.py` con una base SQLite temporal. Primero guardaré un estado válido. Después enviaré registros nulos, valores que no sean objetos, identificadores numéricos, vacíos, con espacios y duplicados. En cada caso comprobaré la respuesta 400 y consultaré de nuevo los datos para confirmar que no cambiaron.

También probaré dos cuentas con registros distintos para verificar que un error en una no afecta a la otra. Al final ejecutaré la prueba que ya existe para las reglas de reproducción.

Este es un resumen editado del plan preparado en OpenCode. La salida original se conserva en las evidencias del proyecto.
