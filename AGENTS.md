# Instrucciones para agentes — MCU Tracker

Leer [correcciones de entrada y pendientes](docs/entry-fixes.md) antes de modificar arranque, autenticación, progreso o reseñas. Ejecutar `npm ci --ignore-scripts` y `npm test` con Node.js 24 o posterior.

Mantener almacenamiento independiente por usuario e invitado. No importar datos de invitado automáticamente ni restaurar la unión indiscriminada del progreso local y remoto. Una lectura fallida no autoriza una escritura basada en una fila supuestamente vacía. Capturar identidad/generación por petición y conservar operaciones pendientes de la cuenta que las originó.

Guía: mantener `tourCard` como hijo directo de `body` y encima de los ancestros resaltados. Cancelar scroll/posicionamiento al cambiar o cerrar un paso. Las filas se regeneran: resolver el destino desde el DOM actual. Validar siempre pasos 7→8→fin y filtros sin resultados; falta comprobación de clics y tamaños en navegador real.

Las pruebas publicadas son DOM/red simulados. Quedan pendientes OTP real, layout móvil, WebGL, sincronización concurrente entre dispositivos y otros hallazgos de la auditoría. No informar que estas validaciones están terminadas. No enviar correos ni escribir datos reales de prueba sin autorización explícita.
