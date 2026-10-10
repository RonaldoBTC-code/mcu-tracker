# Memes Marvel

Leer memes-audit.md antes de cambiar contenido. Solo fotos reales Marvel con gag visual claro y sin texto superpuesto. La selección actual contiene dos referencias aceptadas, compartidas por los 51 países, con scope international. No representan procedencia local; país, autor y licencia no acreditados se conservan como null.

Metadatos originales y revisión: scripts/photo-sources.json. Originales: scripts/reference-images/. Importador reproducible sin red: scripts/import-photos.cjs (Node.js y sharp 0.35.5). Genera WebP y los 51 manifiestos. La página no incorpora sharp ni consulta Pinterest; solo enlaza fuentes.

No añadir contenido de otro universo ni cosplay que solo posa para aumentar cobertura. Antes de introducir una nueva foto, revisar su imagen completa, registrar personajes, gag, fuente, texto superpuesto y los datos realmente acreditados. Una selección internacional compartida no equivale a una colección local por país.

Ejecutar npm test y tests/browser-memes.cjs; revisar la guía 7→8→fin y dos tamaños de pantalla. Tras publicar, scripts/verify-pages.cjs comprueba HTML, 51 manifiestos y dos WebP; tests/browser-pages.cjs prueba el sitio real bloqueando servicios externos. No confundir resultados históricos del PR #3 con esta colección.
