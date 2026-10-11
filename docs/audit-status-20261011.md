# MCU Tracker — correcciones y publicación, 11 de octubre de 2026

Sitio: https://ronaldobtc-code.github.io/mcu-tracker/

PR #11: entrada y recarga siempre muestran el tracker; Memes se abre desde su botón. Mantiene preferencias de país y progreso. La guía vuelve al tracker y sus pasos 7 y 8 conservan el resaltado. El mapa original sigue en su ubicación; se retiró el mapa nuevo del principal.

PR #12: corrige la interrupción del scroll mediante rearmado del observador por lote, con cancelación al cerrar o cambiar de país. Commit d5e299738fea20f5fe46b2f811e881fe427b502b; GitHub Pages 38155490931 success. Los 118 archivos públicos coinciden byte por byte. Chrome público de solo lectura comparó 48 tarjetas con contadores reales, incluidos US/CA/GB de diez y recarga; no escribió datos.

Pruebas locales: 34 regresiones del tracker, validación adversarial de importación, nueve comprobaciones de PostgreSQL y diez escenarios del feed. Chrome público pasó las 51 colecciones y las 65 fotos en 1280×900 y 390×844, navegación/recarga, mapa original y guía 7→8→fin; cero errores no manejados. Evidencia en docs/browser-pages-results.json del repositorio.

Estado del contenido: 65 fotos distintas en 22 países; CA/GB/US tienen diez. Ecuador tiene una publicada, faltan nueve. Faltan 445 fotos en 48 países; 29 países están vacíos. La nueva foto ec-spider-bin de Guayaquil está aprobada visualmente y tiene CC BY-ND 2.0 verificada, pero está preparada fuera del catálogo activo: su ID aún devuelve Unknown meme en producción. Migración/ficha/referencia disponibles en Git.

Las imágenes anteriores: doce se retiraron de las colecciones geográficas por falta de ubicación individual acreditada; dos se conservaron en Estados Unidos. No eran nueve fotos ecuatorianas escondidas. Detalle por ID/fuente: docs/image-disposition.md.

Pendientes sin dar por cerrados: cobertura diez por país, 18 licencias anteriores sin acreditar, escritura y persistencia autenticada real, OTP real, dispositivos físicos y sincronización entre dispositivos. No declarar toda la auditoría resuelta por publicar estas correcciones. Los informes de los otros repositorios conservan su alcance y evidencia propios.
