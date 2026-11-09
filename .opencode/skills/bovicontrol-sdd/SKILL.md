---
name: bovicontrol-sdd
description: Conducir una funcionalidad de BoviControl desde criterios de aceptación hasta pruebas, revisión y pull request.
---
# Desarrollo por especificación

Cada funcionalidad vive en specs/<id>/ con spec.md, plan.md, tasks.md y resultado.md.
spec.md define problema, alcance y criterios numerados. El plan identifica decisiones y rutas; tasks divide el trabajo por rol.
El coordinador lee las instrucciones y encarga pruebas al verificador antes de producción.
La API y la interfaz implementan en sus rutas. El verificador ejecuta pruebas independientes y el build.
El revisor contrasta cada criterio con pruebas y diff. El coordinador registra correcciones y límites.
El resultado incluye comandos ejecutados, estado y hallazgos. Una tarea solo se marca completa con evidencia.
Cada spec usa una rama y un PR propio. La integración requiere CI y decisión humana.
No se completan retrospectivamente tareas ni se fabrican fallos, revisiones o resultados.
