# Catálogos geográficos de memes Marvel

Cada país contiene solo fotos tomadas en ese país con ubicación acreditada. No compartir fotos entre países ni deducir procedencia del dominio, idioma o nacionalidad del artista. Estado actual: 61 fotos, 19 países con contenido, CA/GB/US con diez y 48 países por completar hasta diez; faltan 449 fotos. Los países sin contenido muestran un mensaje de catálogo pendiente. El contador y el botón aleatorio funcionan con el contenido disponible, sin repetición inmediata para catálogos de dos o más fotos.

## Mantenimiento

1. Guardar el original completo en scripts/reference-images y registrar source, country, location, countryEvidence, crédito/licencia comprobados y gag en scripts/photo-sources.json. Los valores desconocidos permanecen null.
2. Revisar la foto completa: persona real, personaje Marvel, gag visible y sin texto digital de meme. No quitar marcas de agua ni completar huecos con imágenes de otro país.
3. Ejecutar npm ci --ignore-scripts, npm run import:photos y npm test. El importador genera country-memes.json y los manifiestos a partir de las fuentes.
4. Revisar las similitudes que detecte pHash. Una coincidencia exacta no se puede aprobar; un par parecido solo puede pasar con una explicación de su revisión en visual-distinctness.json.
5. Ejecutar npm run check:coverage antes de afirmar que las 51 colecciones están completas. Actualmente falla porque faltan fotos; no modificar el mínimo ni falsear la evidencia para convertir ese fallo en PASS.
6. Ejecutar tests/browser-memes.cjs con Playwright/Chrome. Tras publicar, scripts/verify-pages.cjs y tests/browser-pages.cjs verifican archivos e interfaz reales. Diferenciar éxito de despliegue, funcionamiento y cobertura editorial.

Las 171 variantes responsivas suman 32.854.616 bytes; los 61 archivos principales suman 10.921.734, el mayor 401.314. El navegador elige la resolución mediante srcset/sizes; la entrada del tracker descarga cero imágenes de memes. Feed y visor conservan carga diferida por país. La información completa está en docs/photo-inventory.json.

La sección diferenciada de memes contiene selector de país y un feed vertical; el único mapa permanece en su ubicación original, fuera de esa sección: añade cuatro tarjetas por lote al hacer scroll y permite recorrer toda la colección; el modal aleatorio sigue disponible como función adicional. Consultar docs/meme-feed.md para Me gusta/vistas, esquema y pruebas. El agregado real de Supabase está disponible; la persistencia de escrituras autenticadas todavía no se ha verificado. La evidencia anterior de publicación está en docs/history/pr7; docs/publication-results.json debe acreditar por separado el despliegue actual.

Compresión vigente: WebP calidad 90, encuadre completo y variantes proporcionales hasta 640/1280/1920 px sin ampliación. Presupuestos 250/650/1300 KB; cualquier exceso aborta antes de escribir. Los originales se conservan completos. El antiguo límite de 100 KB y la degradación a calidad56 quedan obsoletos. Leer docs/photo-quality-audit.md.

Revisión de calidad del 11 de octubre: cuatro capturas de vídeo retiradas del catálogo activo; sus identidades y datos históricos se conservan. La nueva foto mexicana usa mx-spider-errands y permanece preparada junto a ec-spider-bin hasta registrar ambos IDs. Leer [auditoría de calidad](photo-quality-audit.md); cualquier descripción de las fotos retiradas en este documento registra procedencia histórica, no publicación activa.
