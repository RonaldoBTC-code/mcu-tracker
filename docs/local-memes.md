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

Los archivos incluidos están vacíos: faltan memes reales autorizados y sus imágenes. No se simulan memes publicados ni se ofrecen ejemplos como contenido. Agregar contenido curado por país al archivo correspondiente y subir sus imágenes a su carpeta. Los archivos vacíos o inexistentes muestran «Todavía no hay memes disponibles para este país». Fallos de red/formato muestran un error recuperable al volver a seleccionar el país.

## Descargas y concurrencia

Las imágenes comienzan sin src. IntersectionObserver activa solo imágenes próximas al área visible del diálogo; además llevan loading=lazy y decoding=async. Sin observer se exige clic en «Cargar imagen», sin precargar toda la colección. Al cambiar de país, pestaña o cerrar se aborta la petición de datos, se desconecta el observer y se retiran fuentes anteriores. Una generación impide que una respuesta antigua reemplace el país actual, incluso si el transporte no respeta AbortSignal. Las peticiones de datos expiran a los 10 segundos.

Una imagen que ya empezó a transferirse antes del cambio puede terminar en el navegador; no es posible recuperar bytes transferidos. Nunca se programan imágenes de países distintos al archivo solicitado ni se precarga un catálogo global. No hay caché de memes en memoria ni prefetch entre países. La caché HTTP del navegador puede reutilizar un archivo de un país previamente visitado.

## Validación y límites

`npm test` incluye solicitudes registradas para Ecuador, imágenes diferidas y rechazo de imágenes MX/externas, persistencia manual, detección fallida sin descarga, entrada con zona horaria de Guayaquil, cancelación al cerrar, respuestas tardías, archivo con país incorrecto y fallback sin observer. Son pruebas DOM con fetch y activación de imágenes simulados; los memes de prueba no se publican. No se enviaron correos ni se escribió en Supabase.

Pendientes: aportar memes e imágenes reales; comprobar visualmente en navegador móvil/escritorio el centrado, la visibilidad y las transferencias reales. Las etiquetas nuevas están en español; falta integrarlas en los demás idiomas. No se incorporó un servicio de detección IP: la estimación local documentada es el mecanismo disponible. Esta implementación no autoriza un despliegue en main.
