# Catálogos Marvel por país

Las dos fotos del PR #4 son referencias, no un límite ni una colección suficiente. Hay ocho fotos por cada uno de los 51 países y 51 conjuntos diferentes. La base contiene 14 fotos únicas con fuentes registradas; algunas se comparten. La selección está destinada a una audiencia, no acredita procedencia geográfica.

Fuentes: scripts/photo-sources.json. Catálogos: scripts/country-memes.json (listas de IDs explícitas). Originales: scripts/reference-images/. Importador sin red: scripts/import-photos.cjs con Node.js y sharp 0.35.5. Exige al menos ocho IDs únicos y conocidos por país; se pueden ampliar las listas, sin límite de dos fotos. Mantener metadatos desconocidos como null y conservar licencias documentadas.

El navegador recibe únicamente el manifiesto elegido y una imagen diferida. El botón recorre un ciclo completo y evita repeticiones inmediatas incluso entre ciclos. La interfaz indica Vistas: X de N. No duplicar los archivos por país ni descargar toda la base al entrar.

Ejecutar npm test y tests/browser-memes.cjs; revisar 51 catálogos, dos ciclos completos y guía 7→8→fin en dos tamaños. Tras publicar, scripts/verify-pages.cjs contrasta HTML, 51 manifiestos y fotos del inventario; tests/browser-pages.cjs prueba el sitio real con servicios externos bloqueados. No usar evidencia del PR #4 para afirmar que esta ampliación está publicada.
