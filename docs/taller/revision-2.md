# Revisión técnica del plan 2, antes de implementar

OpenCode 1.19.5 / Plan / opencode/glm-5.3-flash-free generó un primer plan. Codex solicitó dos correcciones, conservadas literalmente en prompt-2-revision-inicial.txt y prompt-2-revision.txt: etiqueta visible de búsqueda, scroll propio de tabla, navegación por controles y expectativas coherentes con los datos sintéticos.

Se acepta el plan final original: seis estados del selector incluyendo Todos, búsqueda normalizada, combinación AND, restablecimiento, mensajes vacíos y conteo. El filtro permanece en VacasScreen, sin tocar el estado persistido. Se comprobará la red antes y después, teclado, viewport de 700 px y compilación.

Los cambios de la aplicación se limitan a src/App.tsx y static/dist. Se incluirán instrucciones reproducibles de prueba y estos archivos del taller. El servidor de evidencia usa el puerto local 5017 para no interferir con otras instalaciones; es la misma aplicación Flask con SQLite temporal. No se atribuye una revisión humana que no se haya registrado.
