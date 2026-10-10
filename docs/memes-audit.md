# Auditoría de variedad de memes Marvel por país

## Corrección del alcance

Los dos pines aceptados eran referencias del estilo, no una colección completa. El PR #4 publicó solo dos fotos compartidas y no resolvió la variedad pedida. Esta revisión prepara 51 catálogos diferentes, con ocho fotos diferentes en cada uno. Son 408 entradas que utilizan 14 fotografías únicas; no se presentan como 408 fotos distintas ni como 51 colecciones de procedencia local comprobada.

Los catálogos se dirigen al país seleccionado (catalogueRole: audience). Comparten imágenes cuando corresponde. La procedencia de la foto se registra aparte: una está documentada en Estados Unidos y las otras trece tienen country null. No se deduce el origen de un dominio, del idioma de un artículo, del fotógrafo o de un pin.

## Revisión editorial

Se revisaron visualmente completas las 14 fotos: las dos referencias originales, Avengers frente a urinarios, selfie de Spider-Man y Deadpool, burrito gigante, Avengers con cajas, pintura corporal o papel aluminio, Capitán Dorito, Deadpool con vestido de novia, uniformes domésticos y un Iron Man convertido en tabla de planchar. Se mantiene solo fotografía real Marvel con un gag visible, sin texto de meme superpuesto. Marcas de agua, etiquetas de productos y carteles presentes físicamente en la escena no se eliminan ni se añaden.

Se descartaron productos, ilustraciones/IA, plantillas, collages, fotos que solo mostraban poses y descargas que resultaron ser placeholders del medio. Una foto del conjunto antiguo se volvió a evaluar individualmente: el Iron Man con forma de tabla de planchar cumple el gag literal y conserva su fuente Commons, autor Michael Miller y licencia CC BY 2.0. No se restaura el conjunto anterior de 96 imágenes.

Fuentes y descripción concreta del gag: scripts/photo-sources.json. Selecciones explícitas por país: scripts/country-memes.json. Atribución del archivo final: docs/photo-inventory.json. Pinterest, Imgur y artículos identifican fuentes/publicadores; no acreditan automáticamente al fotógrafo o una licencia. Los trece casos sin licencia documentada siguen con license null. Captain Dorito identifica al cosplayer, no necesariamente al autor de la fotografía. El crédito Mandora se conserva como aparece en la imagen; no se inventa una licencia.

## Aleatoriedad y carga

Cada ciclo recorre todas las fotos del catálogo antes de repetir. Al comenzar otro ciclo se evita que la primera coincida con la última anterior, sin excluir esa imagen del ciclo completo. El algoritmo previo excluía la última foto de todo el ciclo siguiente; ese comportamiento fue corregido. La interfaz muestra cuántas fotos se han visto del catálogo.

Solo se pide el JSON del país elegido y una foto local diferida. Los siguientes clics reutilizan el JSON. No se descargan los otros 50 catálogos, un inventario global ni imágenes de Pinterest. Las 14 WebP suman 425.710 bytes; la mayor pesa 48.710 bytes. La biblioteca completa no se descarga al entrar.

Se mantienen país validado, rutas locales planas, cancelación, generación y timeout. Enlaces de fuente con host permitido expresamente, Pinterest limitado a /pin/ID/ y noopener noreferrer. Título y atribución siguen con textContent. El nombre del catálogo no se usa como país de origen.

## Verificación y estado

33 pruebas de regresión PASS: ocho entradas distintas por país, 51 conjuntos distintos, metadatos conservados, XSS/rutas, un elemento a la vez, ciclos completos sin repetición inmediata y sin nuevos fetch por botón, además de entrada, cuentas y guía. Chrome recorre dos ciclos completos por país en 1280×900 y 390×844. Resultados en entry-fixes-results.json y browser-memes-results.json.

Esta ampliación está preparada para revisión; no hay evidencia nueva de publicación todavía. Los resultados publicados del PR #4 solo acreditan la selección anterior de dos fotos. Supabase/OTP reales y dispositivos físicos siguen fuera de las pruebas.
