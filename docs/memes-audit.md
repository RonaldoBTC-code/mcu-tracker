# Auditoría de fotos por país — revisión del formato

## Corrección de alcance

La colección anterior de 102 tarjetas de texto fue rechazada por el usuario. Sus pruebas solo demostraban funcionamiento técnico, no que el contenido satisficiera el formato solicitado. No constituye una entrega terminada. Las tarjetas y el generador se retiran del PR sin publicarlos en main.

## Estado real

- Dieciséis fotos de personas en cosplay, con autor, licencia, evento y país documentados; Canadá, Reino Unido, Estados Unidos, Brasil, Bélgica, Australia, Japón y España.
- Selección aleatoria de una foto por vez, sin repetición inmediata; ninguna descarga global.
- Cuarenta y tres países sin fotos verificadas. Estado vacío explícito; contenido completo y despliegue pendientes.
- Proporción original reservada en el DOM; adaptación WebP, sin añadir textos o recortar personas.

## Controles revisados

País validado antes de fetch. Archivo de país incorrecto rechazado. Nombres de imagen planos y locales; sin rutas codificadas o de otros países. Textos mediante textContent. Enlaces de atribución restringidos a Commons y Creative Commons. AbortController y generación para cambio/cierre; observer anterior desconectado. Botón aleatorio conserva la lista del país en memoria y no solicita otro catálogo.

El mapa dibuja solo la región visible. No se añade dependencia de frontend. Las medidas anteriores de las tarjetas de texto no describen las fotos actuales; consultar photo-inventory.json y los resultados reales actualizados. Ninguna cifra local promete tiempos de Internet.

## Evidencia y requisitos abiertos

photo-inventory.json recoge dieciséis fuentes, autoría, licencia, cambios de formato y tamaños. Las imágenes se inspeccionaron en una hoja de contacto: cosplay mash-up de Pikachu/Iron Man, versión steampunk, Buzz Lightyear/Iron Man, Deadpool/Iron Man y una interpretación literal de Iron Man. Son fotos de eventos, no fotografías generadas.

Los resultados DOM y Chrome están en entry-fixes-results.json y browser-memes-results.json. La prueba de Chrome registra EC.json sin ninguna imagen al faltar contenido ecuatoriano; los países con fotos descargan solo su archivo y la imagen elegida.

La auditoría final exige cobertura real de los 51 países, revisión de cada procedencia, inspección visual, solicitudes por país y despliegue de Pages. No marcar el objetivo completo con una colección de ocho países. Los pendientes históricos de OTP, Supabase y concurrencia siguen en entry-fixes.md.

## Ampliación y rendimiento

Se inspeccionaron las diez fotos añadidas: carnavales brasileños, Deadpool en el Trono de Hierro, Duffman y Deadpool, disfraces en Australia, Halloween y Spider-Man en Shibuya y cosplayers de Madrid. Cada WebP ocupa menos de 100.000 bytes; el conjunto de dieciséis fotos ocupa 874.852 bytes y no se descarga completo al entrar. El importador reutiliza archivos verificados existentes y reintenta HTTP 429/503 respetando Retry-After. Estas funciones operan solo al preparar contenido.
