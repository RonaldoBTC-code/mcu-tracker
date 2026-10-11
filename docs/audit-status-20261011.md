# MCU Tracker — publicación verificada, 11 de octubre de 2026

Sitio: https://ronaldobtc-code.github.io/mcu-tracker/

PR #13 fusionado y publicado: commit 759ee9df69c6e8aa78527cb9356d5b592b6b1bff; Pages 38163719214 success. Los 224 archivos públicos (HTML, feed, 51 manifiestos y 171 variantes) coinciden byte por byte. Chrome público pasó 51 colecciones/61 fotos en escritorio y móvil, tracker como entrada/recarga, progreso, mapa original y guía 7→8→fin; cero errores no manejados. Calidad: las 61 fotos medidas en cuatro configuraciones de pantalla/DPR, con píxeles suficientes en ambos ejes.

Revisadas las 65 fotos anteriores: 61 activas y cuatro capturas de vídeo retiradas. Recuperados los 46 originales Commons con dimensiones exactas y tres archivos editoriales mayores. Variantes proporcionales 640/1280/1920 calidad90, sin ampliación ni enfoque generado; carga diferida y nombres con hash. Misma foto conserva ID/interacciones. La auditoría detallada y la comparación por ID están en docs/photo-quality-audit.md.

Pruebas: 35 entrada/guía, ocho importador, nueve PostgreSQL/PGlite y diez feed, PASS. Supabase real: 61 IDs exactos en lotes 50/11 HTTP200. Chrome comparó 48 tarjetas de contadores reales incluida recarga, con todas las escrituras bloqueadas. OTP y persistencia autenticada real siguen sin probar.

Cobertura: 61 fotos en 19 países; CA/GB/US tienen diez. Faltan 449 fotos en 48 países, 32 vacíos; Ecuador tiene una activa y faltan nueve. ec-spider-bin y mx-spider-errands cuentan con ficha/referencia/SQL preparado, pero aún HTTP400 Unknown meme; no están activas ni heredan interacciones.

Pendientes: cobertura, 14 licencias activas sin acreditar, SQL de candidatas, OTP real, escrituras/persistencia autenticada, dispositivos físicos y sincronización entre dispositivos. Los informes de Store, TraderPath y Pine conservan su alcance y evidencia; no se reauditaron ni se cierran sus hallazgos por este despliegue. CREA excluido. Vanta Bot sigue sin informe identificable según la carpeta separada.

PR #11/#12 conservan sus pruebas históricas de navegación/guía y scroll; publicación actual en docs/publication-results.json. AGENTS.md contiene reglas para los siguientes agentes.
