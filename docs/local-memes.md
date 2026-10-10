# Memes locales asociados al mapa

La entrada al mapa abre «Memes locales». Antes de solicitar datos se resuelve un único código de país: selección manual de este mapa guardada en `mcu_map_country`, selección previa del selector general guardada en `mcu_region`, zona horaria reconocida o región válida del idioma del navegador, en ese orden. No se solicita GPS, ubicación exacta ni servicio IP externo. Esta estimación puede ser incorrecta (viajes, VPN, idioma o configuración del equipo); el selector permite corregirla y conserva la elección manual. Si no se puede estimar, se pide seleccionar un país sin hacer solicitudes de memes. `GLOBAL` no es un país permitido.

El mapa SVG existente se centra en las coordenadas aproximadas del país. No necesita descargar tiles para esta vista. La pestaña Comunidad sigue ofreciendo sus estadísticas globales cuando se selecciona explícitamente; esas estadísticas no contienen memes.

## Contrato de datos

Cada país tiene su archivo independiente: `data/memes/EC.json`, `data/memes/MX.json`, etc. No existe endpoint ni índice global de memes. La petición se construye únicamente con un código validado contra la lista de países existente. Para Ecuador se solicita solo `data/memes/EC.json`.

Formato de ejemplo, solo para explicar el contrato; no es un meme disponible:

```json
{
  "country": "EC",
  "memes": [
    {
      "title": "Título del meme autorizado",
      "alt": "Descripción de la imagen",
      "image": "data/memes/EC/images/nombre.webp"
    }
  ]
}
```

Las imágenes deben alojarse en `data/memes/<PAIS>/images/`, en el mismo origen, con extensión png, jpg, jpeg, webp o gif. No se aceptan rutas de otro país, URL externa, parámetros o fragmentos. El campo `country` del archivo debe coincidir con el solicitado; un archivo de México servido como Ecuador se rechaza antes de crear imágenes. Textos se insertan mediante textContent; no admiten HTML. Se muestran como máximo 50 entradas por archivo.

Se incluyen 102 memes originales de fans: dos para cada uno de los 51 países del selector. Los textos usan referencias locales y personajes de Marvel; las ilustraciones y composición se crearon para MCU Tracker, sin copiar capturas de películas, memes de terceros ni imágenes oficiales. No se presentan como contenido viral encontrado en Internet. Los textos están en español. `scripts/meme-copy.json` contiene el material editorial para generación, no es un catálogo descargado por el frontend. `scripts/generate-memes.cjs` genera las tarjetas WebP y manifiestos; requiere Node.js y sharp 0.35.5 únicamente en desarrollo. Las imágenes pesan menos de 20 KB cada una y tienen tamaño 768×512 reservado en el DOM. Los archivos vacíos o inexistentes siguen mostrando «Todavía no hay memes disponibles para este país»; fallos de red/formato muestran un error recuperable al volver a seleccionar el país.

## Descargas y concurrencia

Las imágenes comienzan sin src. IntersectionObserver activa solo imágenes próximas al área visible del diálogo; además llevan loading=lazy y decoding=async. Sin observer se exige clic en «Cargar imagen», sin precargar toda la colección. Al cambiar de país, pestaña o cerrar se aborta la petición de datos, se desconecta el observer y se retiran fuentes anteriores. Una generación impide que una respuesta antigua reemplace el país actual, incluso si el transporte no respeta AbortSignal. Las peticiones de datos expiran a los 10 segundos.

Una imagen que ya empezó a transferirse antes del cambio puede terminar en el navegador; no es posible recuperar bytes transferidos. Nunca se programan imágenes de países distintos al archivo solicitado ni se precarga un catálogo global. No hay caché de memes en memoria ni prefetch entre países. La caché HTTP del navegador puede reutilizar un archivo de un país previamente visitado.

## Validación y límites

`npm test` ejecuta 30 regresiones, con solicitudes registradas para Ecuador, imágenes diferidas y rechazo de imágenes MX/externas, persistencia manual, detección fallida sin descarga, entrada con zona horaria de Guayaquil, cancelación al cerrar, respuestas tardías, archivo con país incorrecto, fallback sin observer y cobertura/tamaño de contenido para los 51 países. Los memes ficticios de estas pruebas no se publican. No se enviaron correos ni se escribió en Supabase.

La prueba real `node tests/browser-memes.cjs` requiere Playwright y Chromium (puede indicarse un ejecutable con `MCU_BROWSER_PATH`). Sirve localmente la página y datos reales, desactiva Supabase/TMDB y bloquea los orígenes externos. En Chrome, 1280×900 y 390×844: comprueba los 51 países, decodifica sus 102 imágenes por tamaño de pantalla, registra las solicitudes reales y verifica que todas pertenecen al país solicitado. Comprueba también persistencia manual, botón Cerrar visible al desplazar la lista y la guía 7→8→fin. Resultados en `browser-memes-results.json`; las capturas locales no forman parte del frontend.

Límites: las etiquetas y textos nuevos están en español; falta traducirlos. El SVG es aproximado y no dibuja fronteras políticas. No se incorporó un servicio de detección IP: la estimación local documentada es el mecanismo disponible. La prueba real usa Chrome con emulación de tamaño móvil, no un teléfono físico; no prueba OTP ni Supabase real. El objetivo vigente del usuario autoriza desplegar después de la auditoría y comprobaciones.
