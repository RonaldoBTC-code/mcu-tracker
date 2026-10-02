# Correcciones de entrada y navegación — MCU Tracker

Fecha: 2 de octubre de 2026. Base: `eef4e630e022e003d000370c1d33009b0221ac2e`.

## Cambios

- La aplicación abre aunque el almacenamiento esté bloqueado, corrupto, contenga un tipo JSON inválido o haya agotado la cuota. Un adaptador conserva cambios en memoria y muestra un aviso cuando no puede persistirlos. Los datos inválidos no se borran automáticamente; su formato se ignora al cargar.
- El primer render completo inicializa estrellas y observación de proveedores después de definir los módulos. El catálogo y sus filtros funcionan sin Supabase o TMDB. Un navegador sin IntersectionObserver recibe un texto de disponibilidad en lugar de abortar el arranque.
- Las secciones pueden cerrarse y expandirse con ratón, Enter y espacio. Exponen estado expandido y ocultan los controles de filas colapsadas.
- Marcar un título conserva el foco en el control reconstruido y muestra su nombre, en lugar de `id`, en el aviso.
- Escape, el botón de cierre y las API `Guide.close`/`Guide.never` cierran la guía sin invocar `window.close`. La guía recibe foco, tiene nombre accesible y devuelve el foco al botón de apertura.
- El enlace mágico vuelve al origen y ruta del despliegue actual. Se recorta el correo, se bloquea el doble envío y se manejan errores de red y de cierre de sesión sin perder el estado local. El administrador debe permitir esta URL en Supabase Auth.
- Progreso y puntuaciones se guardan por usuario, con espacio independiente de invitado. Una cuenta nueva no hereda automáticamente datos del usuario anterior. El invitado conserva sus datos y puede importar **progreso** a una cuenta mediante un clic explícito; las estrellas del invitado permanecen locales.
- Una lectura fallida de progreso no se trata como cuenta vacía ni provoca upsert. La cuenta conserva su caché y muestra un botón de reintento. Los cambios pendientes se conservan por cuenta. Al iniciar sesión sin cambios pendientes, el estado remoto sustituye la caché; no se unen conjuntos que resuciten desmarcaciones.
- Debounce y respuestas se asocian a una identidad/generación. Las escrituras se serializan y se cancelan al cambiar de cuenta cuando todavía no empezaron. Una petición que ya salió mantiene su usuario original; sus respuestas no se aplican a la cuenta siguiente.
- Las puntuaciones pendientes se conservan por título y cuenta y se reintentan después de una lectura válida. Respuestas tardías de reseñas no reemplazan una cuenta distinta ni una modificación local posterior.
- Los estados de sincronización no se sobrescriben al cambiar idioma. Títulos externos y correos se muestran como texto, evitando interpretación HTML en estas vías.
- El mapa de comunidad tolera errores de red y descarta respuestas si se cambia a escenarios o se cierra el diálogo. El diálogo tiene nombre y devuelve foco al cerrar.

## Validación

`npm ci --ignore-scripts` y `npm test`, con Node.js 24 o posterior. Las dependencias de prueba están fijadas en package-lock.json. El frontend publicado sigue siendo HTML/JS nativo y no requiere build.

[Resultados de regresión](entry-fixes-results.json). Las pruebas usan jsdom y servicios simulados; no envían correos, no crean cuentas ni escriben en Supabase real. Incluyen arranque sin red, JSON inválido, almacenamiento bloqueado/lleno, estrellas, búsqueda, controles de teclado, foco, OTP, cambio de cuentas, lecturas fallidas, desmarcaciones, operaciones pendientes, idioma, títulos externos y mapa.

La comprobación visual en navegador no se completó: el navegador integrado agotó el tiempo de espera en dos intentos de abrir la vista previa local. No se declara aprobada la matriz móvil/WebGL ni la recepción real de correo y callback OTP.

## Pendientes para agentes

1. Probar el enlace real y la URL autorizada en el panel Supabase, además de límites de correo y errores de callback. No se cambió la configuración remota ni se enviaron OTP de prueba.
2. La tabla mcu_progress sigue almacenando un array completo. Los cambios pendientes locales tienen prioridad después de leer correctamente; dos dispositivos con escrituras simultáneas aún pueden sobrescribirse. Completar H03 con estado por título y versión/conflictos en servidor; esta corrección solo elimina la unión automática y evita escribir tras SELECT fallido.
3. Confirmar en navegador móvil y escritorio layout, foco, lector de pantalla, mapas WebGL y fallos reales de CDN. Las pruebas DOM no validan contraste, tamaños ni comportamiento visual.
4. Revisar los demás hallazgos de la auditoría original: actualización de MapLibre y saneamiento de atribuciones, validación SQL del catálogo/países, duplicados históricos de reseñas, contadores de visitas, tipo de búsqueda TMDB, expiración/errores de caché y compra frente a alquiler. No se afirma que la auditoría completa haya quedado resuelta.
5. Los datos antiguos mcu_v4/mcu_reviews se conservan como datos de invitado porque no contienen propietario. No asignarlos automáticamente a la cuenta que inicie sesión. Añadir importación explícita de estrellas si se desea; este cambio ofrece importación de progreso únicamente.
6. Comprobar la publicación efectiva de GitHub Pages después del commit. La presencia del commit en main no demuestra por sí sola que Pages ya sirva la nueva versión.

No ejecutar migraciones en producción ni importar datos de una cuenta a otra sin autorización específica. Mantener evidencia y limitaciones junto a cada corrección posterior.
