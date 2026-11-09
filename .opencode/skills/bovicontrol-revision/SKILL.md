---
name: bovicontrol-revision
description: Revisar una spec de BoviControl contra criterios, diff y evidencia antes de su pull request.
---

# Revisión por criterios

Lee la spec, el plan y el diff. Relaciona cada criterio con una prueba y su resultado observado.
Revisa que las pruebas puedan fallar cuando el comportamiento es incorrecto; no basta con repetir lo preparado o afirmar que no hubo excepciones.
En la API, comprueba sesión, CSRF, propietario desde current_user y persistencia sin cambios tras un rechazo.
En React, comprueba etiquetas, teclado, filtros locales y que el build corresponda al fuente.
Los hallazgos indican severidad, archivo, criterio afectado y rol responsable. Si falta evidencia, queda pendiente.
La revisión no edita archivos ni sustituye la aprobación de la persona que integra el PR.

