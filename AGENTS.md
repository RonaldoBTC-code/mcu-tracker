# Instrucciones para agentes — MCU Tracker

Memes: el usuario requiere FOTOS reales de disfraces/cosplay y situaciones curiosas, elegidas al azar; no tarjetas de texto, ilustraciones generadas ni atribuir un país inventado. Leer docs/local-memes.md, docs/memes-audit.md y docs/photo-inventory.json. Resolver país antes de fetch; usar data/memes/<PAIS>.json, nunca catálogo global. No precargar fotos de otros países. Conservar selección manual, cancelación y generaciones. Mostrar una foto aleatoria por vez, sin repetir inmediatamente. Actualmente hay dieciséis fotos verificadas en ocho países; los otros 43 siguen pendientes. No marcar completo ni desplegar la colección parcial. Las tarjetas anteriores se retiraron del PR. Ejecutar npm test y tests/browser-memes.cjs.

Resaltado de guía: conservar `tour-path` en todos los ancestros del destino para que el oscurecimiento no atenúe la película/casilla. Mantener `tourSpotlight` en `body`, por encima de las filas y debajo de `tourCard`, con pointer-events none. Limpiar la ruta al cerrar o cambiar de paso. Comprobar opacidad de todos los ancestros en pasos 7 y 8.

Leer [correcciones de entrada y pendientes](docs/entry-fixes.md) antes de modificar arranque, autenticación, progreso o reseñas. Ejecutar `npm ci --ignore-scripts` y `npm test` con Node.js 24 o posterior.

Mantener almacenamiento independiente por usuario e invitado. No importar datos de invitado automáticamente ni restaurar la unión indiscriminada del progreso local y remoto. Una lectura fallida no autoriza una escritura basada en una fila supuestamente vacía. Capturar identidad/generación por petición y conservar operaciones pendientes de la cuenta que las originó.

Guía: mantener `tourCard` como hijo directo de `body` y encima de los ancestros resaltados. Cancelar scroll/posicionamiento al cambiar o cerrar un paso. Las filas se regeneran: resolver el destino desde el DOM actual. Validar siempre pasos 7→8→fin y filtros sin resultados; falta comprobación de clics y tamaños en navegador real.

Las pruebas publicadas son DOM/red simulados. Quedan pendientes OTP real, layout móvil, WebGL, sincronización concurrente entre dispositivos y otros hallazgos de la auditoría. No informar que estas validaciones están terminadas. No enviar correos ni escribir datos reales de prueba sin autorización explícita.
