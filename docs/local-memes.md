# Fotos aleatorias de cosplay por país

El formato requerido es fotografía real de personas disfrazadas o situaciones curiosas de Marvel, sin tarjetas de texto generadas y sin texto superpuesto añadido. La referencia adjunta del usuario define el estilo; no se utiliza como una foto de Ecuador ni se inventa su procedencia.

Se decide el país antes de solicitar data/memes/<PAIS>.json. La selección manual persiste; después se considera la elección general guardada, zona horaria reconocida o región del idioma. Si no se puede detectar, se pide elegir sin descargar datos. No se solicita GPS. No existe catálogo global descargado por el navegador.

## Contenido actual y pendiente

Hay seis fotos verificadas: dos de Canadá, dos del Reino Unido y dos de Estados Unidos. Se revisaron autor, licencia y evidencia de evento/país en Wikimedia Commons. Las dos fotos británicas muestran el mismo cosplay desde distintos ángulos. El inventario y atribuciones están en photo-inventory.json; las fuentes editoriales están en scripts/photo-sources.json.

Los otros 48 países siguen sin fotos verificadas, incluido Ecuador. Sus archivos están vacíos y la página muestra esa ausencia. No se asignan fotos extranjeras a otro país para aparentar cobertura. Las 102 tarjetas anteriores y su generador se retiraron porque no correspondían al formato pedido. El objetivo de contenido para todos los países sigue incompleto; esta colección parcial no está lista para el despliegue final.

## Aleatoriedad y descargas

Después de descargar únicamente el manifiesto del país, se elige una sola foto al azar. «Otra foto aleatoria» recorre las opciones locales sin repetición inmediata y sin volver a descargar el manifiesto. Nunca se crea una galería con todas las imágenes ni se precarga otro país. Si solo hay una foto, el botón queda desactivado. Si no hay fotos, se muestra el estado vacío.

IntersectionObserver activa únicamente la foto visible; se usa loading=lazy y decoding=async. Sin observer se ofrece «Cargar imagen». Al cambiar de país/pestaña o cerrar se aborta la petición, se desconecta el observer y se retira la fuente anterior. Una generación descarta respuestas tardías. Una transferencia ya iniciada puede terminar en el navegador.

## Archivos y atribución

Cada entrada contiene title, alt, image, width, height, creator, source, license, licenseUrl, changes y countryEvidence. La imagen debe ser WebP/JPEG/PNG/GIF, de origen local y de la carpeta del país, con nombre de archivo plano. Se rechazan rutas codificadas, subcarpetas, URL externas y archivos de otro país.

Se conservan las proporciones originales, sin recortar la escena. El pie muestra autor, fuente, licencia y que se redimensionó/convirtió a WebP. Solo se crean enlaces de fuente a commons.wikimedia.org y de licencia a creativecommons.org. Se insertan textos con textContent; no se acepta HTML. Las versiones convertidas conservan la licencia de la foto original, incluidas condiciones ShareAlike cuando corresponda; los archivos de imagen no se declaran bajo la licencia general del código.

scripts/import-photos.cjs descarga las fuentes únicamente al preparar el repositorio; requiere Node.js y sharp 0.35.5. La página no consulta Commons, no descarga un índice mundial ni añade dependencia de producción.

## Validación y límites

npm test comprueba aislamiento EC/MX, detección fallida, selección manual, cancelación, rutas malformadas, imagen única aleatoria sin repetir, existencia/procedencia de las seis fotos y ausencia de tarjetas de texto en manifiestos. Las fixtures simuladas no son contenido publicado.

tests/browser-memes.cjs usa Chrome y registra solicitudes reales de archivos locales; recorre 51 países, verifica los estados vacíos y las fotos disponibles, el botón aleatorio, persistencia manual y guía 7→8→fin en escritorio y móvil emulado. Evidencia en browser-memes-results.json y entry-fixes-results.json.

Pendientes: fotos adecuadas verificadas para los otros 48 países, traducciones, auditoría final del conjunto completo y despliegue autorizado. La prueba no cubre Supabase/OTP real ni dispositivos físicos. La detección local y el SVG son aproximados.
