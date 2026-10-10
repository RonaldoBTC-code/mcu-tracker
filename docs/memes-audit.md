# Auditoría de fotos por país

## Estado real

La colección anterior de 102 tarjetas de texto no cumplía el formato requerido y fue retirada junto con su generador. La colección actual tiene 69 fotos reales inspeccionadas en 35 países. Quedan 16 países vacíos: AE, BO, CR, CU, DO, GT, HN, IL, NI, PA, PR, PY, SV, TR, UY y VE. Cobertura y despliegue final incompletos.

La revisión incluye cosplay, disfraces de carnavales y escenas curiosas. Se descartaron panorámicas de Argentina, Nueva Zelanda, Suecia y Austria donde los disfraces apenas se distinguían. La selección conserva proporciones y no añade texto. GB, CL, TH y PT contienen parejas de la misma sesión/grupo desde distintos ángulos; ZA tiene una sola foto.

## Seguridad y procedencia

País validado antes de fetch; manifiestos de otro país rechazados. Rutas locales, nombres planos y carpeta del país; rutas codificadas y externas rechazadas. Pies mediante textContent y enlaces restringidos a Commons/Creative Commons. AbortController, generación y limpieza del observer evitan que respuestas anteriores cambien la vista actual.

Fuentes, autores, licencias, evidencia geográfica y tamaños están en photo-inventory.json. No se deduce el país de la nacionalidad del fotógrafo. Se contrastan descripción, evento, categorías o ubicación explícita. La fotografía del stormtrooper noruego tiene declaración PD-self de su autor; se preserva el enlace de esa declaración sin inventar una licencia CC0. Las fotografías CC mantienen las condiciones indicadas en su fuente.

## Rendimiento y código

Una foto aleatoria por vez. Cambiarla reutiliza el manifiesto en memoria; no descarga un índice global. Foto única desactiva el botón. Países vacíos muestran estado explícito. Mapa limitado a la región visible, sin nueva dependencia de frontend.

Cada WebP pesa menos de 100.000 bytes; las 69 fotos suman 3.747.250 bytes. Ninguna entrada descarga el conjunto completo. El importador se ejecuta solo al preparar contenido, reutiliza archivos existentes, respeta Retry-After en 429/503 y reduce dimensiones cuando la compresión no basta. Estos límites no prometen tiempos de Internet.

## Evidencia y cierre pendiente

Resultados de pruebas en entry-fixes-results.json y browser-memes-results.json. La comprobación de Chrome recorre los 51 países y registra solicitudes, imágenes decodificadas, estado vacío, persistencia y guía 7→8→fin en escritorio y móvil emulado. Ecuador solicita solamente EC.json y una imagen de su propia carpeta al entrar. No se prueban escrituras reales ni envíos OTP.

El cierre exige contenido inspeccionado de los 51 países, revisión final de procedencia y licencias, auditoría del código y solicitudes del conjunto completo, despliegue de Pages y comprobación de la versión publicada. No marcar completo con cobertura parcial. Pendientes históricos de OTP, Supabase y concurrencia: entry-fixes.md.
