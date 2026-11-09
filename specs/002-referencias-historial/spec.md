# Conservación de relaciones del historial

## Problema
Una cuenta puede eliminar una vaca, toro o cría dejando reproducciones o partos que todavía apuntan al animal eliminado. La aplicación muestra identificadores sin sus registros y el historial pierde sentido.

## Alcance
Validar las referencias de reprod y partos dentro del estado enviado a PUT /api/state, y prevenir desde la interfaz la eliminación de animales con historial vinculado. No cambia parentescos en texto libre ni las reglas reproductivas.

## Criterios de aceptación
- AC1. Cada reprod debe apuntar a una vaca y un toro existentes en las listas del mismo payload, incluso si el registro reproductivo ya estaba guardado.
- AC2. Cada parto debe apuntar a una vaca existente. Si criaId es texto no vacío, esa cría también debe existir. Omitir criaId o enviarlo vacío continúa permitido.
- AC3. Una referencia inexistente devuelve HTTP 400 con colección, posición y campo. El estado persistido queda intacto.
- AC4. Desde la pantalla, intentar eliminar una vaca o toro con reproducción, una vaca con parto o una cría vinculada a parto muestra un mensaje en español y mantiene el animal visible. No envía una escritura que quite el animal.
- AC5. Eliminar un animal sin historial vinculado continúa permitido. Un payload que elimina primero los eventos vinculados y el animal es válido si no deja referencias huérfanas.
- AC6. La comprobación solo consulta datos del usuario autenticado y no expone los de otra cuenta.

## Validación
Pruebas Flask nuevas en tests/test_state_references.py con SQLite temporal y CSRF. Pruebas UI en tests/ui/references.spec.ts con eventos sintéticos y comprobación de red y persistencia. Ejecutar suite backend, build y pruebas de navegador.
