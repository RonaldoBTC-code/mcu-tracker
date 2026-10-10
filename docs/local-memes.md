# Fotos aleatorias de disfraces por país

El usuario requiere fotografías reales de personas disfrazadas y situaciones curiosas, seleccionadas al azar. Incluye cine, videojuegos, anime y carnavales. No se añaden textos a las fotos ni se generan tarjetas. La imagen adjunta es una referencia de estilo, sin atribuirle un país.

## Cobertura actual

Hay 69 fotos inspeccionadas en 35 de los 51 países. Sudáfrica tiene una foto; los otros 34 países con contenido tienen dos. Inventario completo: docs/photo-inventory.json. Fuentes editoriales: scripts/photo-sources.json.

Siguen vacíos AE, BO, CR, CU, DO, GT, HN, IL, NI, PA, PR, PY, SV, TR, UY y VE. La página muestra esa ausencia. No se mezclan países ni se inventa procedencia para completar la cobertura. El objetivo sigue activo y el despliegue final espera contenido verificado de todos los países.

Las parejas de GB, CL, TH y PT muestran el mismo disfraz/grupo o sesión desde distintos ángulos. La selección aleatoria evita repetir el mismo archivo inmediatamente, aunque dos fotos puedan mostrar el mismo personaje.

## Carga y rendimiento

Se resuelve el país antes de solicitar data/memes/<PAIS>.json. La selección manual persiste y tiene prioridad. La detección usa preferencias locales, zona horaria o región del idioma; si falla, se solicita elegir. No usa GPS.

Se muestra una sola foto. «Otra foto aleatoria» recorre las opciones del país sin repetir inmediatamente y sin solicitar nuevamente el catálogo. Con una foto, el botón queda desactivado. No se descarga un catálogo global ni se precargan imágenes de otros países.

IntersectionObserver activa la foto visible, con loading=lazy y decoding=async. Sin observer se ofrece «Cargar imagen». Cambiar o cerrar aborta la petición, desconecta el observer y retira la fuente anterior. Una generación descarta respuestas tardías; una transferencia ya iniciada puede terminar.

Cada WebP ocupa menos de 100.000 bytes. Las 69 fotos suman 3.747.250 bytes y ese conjunto no se descarga al entrar. Se mantienen proporciones, sin recortar personas. El importador reduce calidad y, cuando hace falta, dimensiones hasta 512 px para respetar el límite. Reutiliza las fotos existentes y respeta Retry-After en HTTP 429/503.

## Procedencia y atribución

Cada foto guarda título, texto alternativo, dimensiones, autor, fuente, licencia, URL de licencia, cambios de formato y evidencia geográfica. Las fotos CC conservan su licencia, incluidas condiciones ShareAlike. La foto noruega del stormtrooper fue liberada por su autor al dominio público (PD-self); su enlace de licencia apunta a la declaración original de Commons. No se etiqueta como CC0 ni se aplica a las imágenes la licencia general del código.

Las rutas admitidas son locales, de la carpeta del país y con nombre plano. Se rechazan rutas codificadas, subcarpetas y URL externas. Los pies usan textContent y los enlaces se restringen a Wikimedia Commons y Creative Commons.

scripts/import-photos.cjs se ejecuta solo al preparar el repositorio; requiere Node.js y sharp 0.35.5. La página no consulta Commons ni añade esa dependencia de producción.

## Validación y pendientes

npm test comprueba arranque, guía, aislamiento de cuentas, rutas, selección manual, cancelación, aleatoriedad e integridad de las fotos. tests/browser-memes.cjs recorre los 51 países en Chrome de escritorio y móvil emulado, decodifica las fotos, registra solicitudes, comprueba foto única y guía 7→8→fin. Evidencia: docs/entry-fixes-results.json y docs/browser-memes-results.json.

Faltan fotos verificadas de los 16 países indicados, auditoría final del conjunto y despliegue autorizado. Las pruebas no cubren OTP/Supabase real, dispositivos físicos ni concurrencia entre dispositivos. La detección geográfica y el SVG son aproximados.
