# Estado de auditoría — MCU Tracker

11 de octubre de 2026. Corrección de calidad preparada y validada localmente; publicación nueva pendiente de verificar en docs/publication-results.json. La prueba publicada del PR #12 se conserva en docs/history/pr12.

Revisadas las 65 fotos anteriores: 61 activas, cuatro capturas de vídeo retiradas, 46 originales Commons y tres archivos editoriales mayores recuperados. 171 variantes proporcionales, srcset/sizes, límites nativos DPR2 y nombres con hash. No se transfieren IDs ni interacciones a fotos distintas. Auditoría detallada: docs/photo-quality-audit.md.

Pruebas finales locales PASS: 35 entrada/guía, ocho importación, nueve PostgreSQL, diez feed. Chrome: 51 colecciones/61 fotos en escritorio y móvil; calidad en cuatro configuraciones DPR1/2, cero errores no manejados y guía 7→8→fin. Agregado real Supabase: 61 IDs exactos, lotes 50/11 HTTP200, solo lectura. Las escrituras reales no están acreditadas.

Cobertura: 61 fotos en 19 países; CA/GB/US tienen diez. Faltan 449 fotos en 48 países; 32 vacíos. Ecuador tiene una activa y faltan nueve. Las candidatas distintas ec-spider-bin y mx-spider-errands tienen referencia/ficha/SQL preparado, pero Unknown meme en producción; no están activas.

Pendientes: cobertura, 14 licencias activas sin acreditar, SQL de candidatas, OTP real, escritura/persistencia autenticada, dispositivos físicos y sincronización entre dispositivos. Los informes de los otros repositorios conservan su alcance y evidencia propios; CREA excluido.
