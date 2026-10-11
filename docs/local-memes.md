# Catálogos geográficos de memes Marvel

Cada país contiene solo fotos tomadas en ese país con ubicación acreditada. No compartir fotos entre países ni deducir procedencia del dominio, idioma o nacionalidad del artista. Estado actual: 14 fotos, siete países con contenido, tres con al menos tres fotos y 48 por completar. Los países sin contenido muestran un mensaje de catálogo pendiente. El contador y el botón aleatorio funcionan con el contenido disponible, sin repetición inmediata para catálogos de dos o más fotos.

## Mantenimiento

1. Guardar el original completo en scripts/reference-images y registrar source, country, location, countryEvidence, crédito/licencia comprobados y gag en scripts/photo-sources.json. Los valores desconocidos permanecen null.
2. Revisar la foto completa: persona real, personaje Marvel, gag visible y sin texto digital de meme. No quitar marcas de agua ni completar huecos con imágenes de otro país.
3. Ejecutar npm ci --ignore-scripts, npm run import:photos y npm test. El importador genera country-memes.json y los manifiestos a partir de las fuentes.
4. Revisar las similitudes que detecte pHash. Una coincidencia exacta no se puede aprobar; un par parecido solo puede pasar con una explicación de su revisión en visual-distinctness.json.
5. Ejecutar npm run check:coverage antes de afirmar que las 51 colecciones están completas. Actualmente falla porque faltan fotos; no modificar el mínimo ni falsear la evidencia para convertir ese fallo en PASS.
6. Ejecutar tests/browser-memes.cjs con Playwright/Chrome. Tras publicar, scripts/verify-pages.cjs y tests/browser-pages.cjs verifican archivos e interfaz reales. Diferenciar éxito de despliegue, funcionamiento y cobertura editorial.

Los archivos WebP actuales suman 543.204 bytes; el mayor pesa 90.272. El navegador carga una imagen del país elegido por vez. La información completa de fuentes y huellas permanece en docs/photo-inventory.json. La evidencia del PR #5 es histórica y corresponde a un conjunto compartido que fue corregido.

