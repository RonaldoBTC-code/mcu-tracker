# Fotos aleatorias de disfraces y escenas curiosas por país

El usuario requiere fotografías reales de personas disfrazadas y situaciones curiosas, seleccionadas al azar. Incluye cine, videojuegos, anime, carnavales y escenas curiosas con animales. No se añaden textos a las fotos ni se generan tarjetas. La imagen adjunta es una referencia de estilo, sin atribuirle un país.

## Cobertura verificada

Hay 96 fotos inspeccionadas para los 51 países soportados. CU, GT, PR, SV, TR y ZA tienen una foto; los otros 45 países tienen dos. El botón aleatorio se desactiva cuando solo existe una foto. Inventario y atribuciones: docs/photo-inventory.json. Cobertura y tamaños: docs/photo-coverage.json. Fuentes editoriales: scripts/photo-sources.json.

Honduras aporta dos escenas curiosas de visitantes con tres guacamayos en Macaw Mountain Bird Park; son fotografías reales, sin cosplay ni composición generada. Se descartaron desfiles sin disfraces destacados, pinturas, documentos, máscaras de museo, collages y panorámicas que no mostraban bien a los participantes.

GB, CL, TH y PT incluyen parejas de la misma sesión/grupo o disfraz desde distintos ángulos. No repetir el archivo inmediatamente no garantiza que la siguiente foto muestre otro personaje. La asignación geográfica se basa en descripción, evento, categorías o ubicación explícita; no en la nacionalidad del fotógrafo.

## Carga y rendimiento

Se resuelve el país antes de pedir data/memes/<PAIS>.json. La elección manual persiste y tiene prioridad. La detección usa preferencias locales, zona horaria o región del idioma; si falla, se solicita elegir. No usa GPS.

Se muestra una sola foto. «Otra foto aleatoria» recorre las opciones del país sin repetición inmediata y sin volver a solicitar el manifiesto. No se descarga un índice global ni se precargan imágenes de otros países. Se mantiene el estado vacío para futuros catálogos sin contenido o respuestas 404.

IntersectionObserver activa la foto visible, con loading=lazy y decoding=async. Sin observer se ofrece «Cargar imagen». Cambiar o cerrar aborta la petición, desconecta el observer y retira la fuente anterior. Una generación descarta respuestas tardías; una transferencia ya iniciada puede terminar.

Cada WebP ocupa menos de 100.000 bytes; el mayor pesa 98.738 bytes. Las 96 fotos suman 5.567.802 bytes y ese conjunto no se descarga al entrar. Se mantienen proporciones, sin recortar personas. El importador reduce calidad y, si hace falta, dimensiones hasta 512 px. Reutiliza archivos existentes y respeta Retry-After en HTTP 429/503.

## Procedencia y atribución

Cada entrada contiene título, texto alternativo, dimensiones, autor, fuente, licencia, enlace de licencia, cambios de formato y evidencia geográfica. Las fotografías CC conservan su licencia, incluidas condiciones ShareAlike. La foto noruega del stormtrooper tiene declaración PD-self de su autor; su enlace de licencia apunta a esa declaración en Commons. No se la etiqueta como CC0 ni se aplica a las imágenes la licencia general del código.

Las rutas son locales, con nombre plano y carpeta del país. Se rechazan rutas codificadas, subcarpetas y URL externas. Los pies usan textContent. Las fuentes se restringen a Commons y las licencias a Creative Commons, con la única excepción del enlace PD-self que debe coincidir exactamente con la fuente Commons de esa foto.

scripts/import-photos.cjs opera solo al preparar el repositorio; requiere Node.js y sharp 0.35.5. La página no consulta Commons ni añade esa dependencia de producción.

## Validación y publicación

npm test comprueba arranque, guía, aislamiento de cuentas, rutas, selección manual, cancelación, aleatoriedad, atribución e integridad de los 51 catálogos. tests/browser-memes.cjs recorre los 51 países en Chrome de escritorio y móvil emulado, decodifica las fotos, registra solicitudes, verifica foto única, persistencia y guía 7→8→fin. Resultados: docs/entry-fixes-results.json y docs/browser-memes-results.json.

La cobertura está completa; publicación y comprobación de la versión desplegada pendientes. No marcar el objetivo completo antes de verificarlas. Las pruebas no cubren OTP/Supabase real, dispositivos físicos ni concurrencia entre dispositivos. La detección geográfica y el SVG son aproximados.
