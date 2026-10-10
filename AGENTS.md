# Instrucciones para agentes — MCU Tracker

Memes: leer docs/local-memes.md y docs/memes-audit.md. Resolver país antes de fetch; usar un archivo data/memes/<PAIS>.json, nunca catálogo global. No precargar imágenes de otros países. Conservar selección manual, cancelación y generaciones al cambiar/cerrar. Hay dos memes originales de fans por cada uno de los 51 países del selector; no son memes virales recopilados ni imágenes oficiales. Ejecutar npm test y la prueba opcional tests/browser-memes.cjs antes de cambiar esta ruta. El objetivo vigente autoriza desplegar cuando la auditoría y las comprobaciones estén completas.

Resaltado de guía: conservar `tour-path` en todos los ancestros del destino para que el oscurecimiento no atenúe la película/casilla. Mantener `tourSpotlight` en `body`, por encima de las filas y debajo de `tourCard`, con pointer-events none. Limpiar la ruta al cerrar o cambiar de paso. Comprobar opacidad de todos los ancestros en pasos 7 y 8.

Leer [correcciones de entrada y pendientes](docs/entry-fixes.md) antes de modificar arranque, autenticación, progreso o reseñas. Ejecutar `npm ci --ignore-scripts` y `npm test` con Node.js 24 o posterior.

Mantener almacenamiento independiente por usuario e invitado. No importar datos de invitado automáticamente ni restaurar la unión indiscriminada del progreso local y remoto. Una lectura fallida no autoriza una escritura basada en una fila supuestamente vacía. Capturar identidad/generación por petición y conservar operaciones pendientes de la cuenta que las originó.

Guía: mantener `tourCard` como hijo directo de `body` y encima de los ancestros resaltados. Cancelar scroll/posicionamiento al cambiar o cerrar un paso. Las filas se regeneran: resolver el destino desde el DOM actual. Validar siempre pasos 7→8→fin y filtros sin resultados; falta comprobación de clics y tamaños en navegador real.

Las pruebas publicadas son DOM/red simulados. Quedan pendientes OTP real, layout móvil, WebGL, sincronización concurrente entre dispositivos y otros hallazgos de la auditoría. No informar que estas validaciones están terminadas. No enviar correos ni escribir datos reales de prueba sin autorización explícita.
