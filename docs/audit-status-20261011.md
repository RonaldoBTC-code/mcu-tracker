# MCU Tracker: publicación y auditoría, 11 de octubre de 2026

Sitio: https://ronaldobtc-code.github.io/mcu-tracker/

## Publicación verificada

PR #15 fusionado: commit 0cd764643433257010cd386fccc54674c9b9ae6a, Pages 38178189021 success. Los 229 archivos públicos (HTML, feed, 51 colecciones y 176 variantes) coinciden byte por byte con la versión auditada. Chrome pasó 51 colecciones/63 fotos en escritorio y móvil, tracker como entrada y recarga, progreso conservado, scroll por lotes y guía 7→8→fin, sin errores no manejados. Las 63 fotos pasaron cuatro configuraciones móvil/escritorio DPR1/2: 252 mediciones, proporción y píxeles suficientes en ambos ejes.

PR #14 corregido y publicado previamente: commit ae2576206811d6c57b8f0fb069c3658fb4536eba, Pages 38176918332 success. MapLibre 4.7.1 vulnerable fue reemplazado por módulos/CSS 6.4.1; las ventanas construyen DOM seguro y restringen enlaces externos. La versión pública final pasó dos tamaños con cuatro módulos oficiales verificados por hash, teselas reales, 29 marcadores, zoom, ventanas y reapertura. WebGL por software y fotos Wikipedia simuladas; no se acredita GPU ni móvil físico.

## Fotos y datos

Se activaron ec-spider-bin (Guayaquil; Joan Briones; CC BY-ND 2.0; sin recorte) y mx-spider-errands (Ciudad de México; Eneas De Troya; CC BY 2.0), con títulos, autores, fuentes y licencias visibles. Son fotos reales distintas y reciben IDs propios. Las 61 fotos previas conservan sus IDs, rutas y bytes; las cuatro capturas retiradas conservan identidad e interacciones en servidor. El importador descartó duplicados de archivo/píxeles/pHash; las nuevas no inventan una mejora contra una versión inexistente.

Antes de activarlas Supabase respondió HTTP200 con los dos IDs exactos. Esta sesión no ejecutó la migración en producción ni atribuye el cambio remoto a una acción no observada. La lectura actual verificó los 63 IDs en lotes 50/13. Chrome público comparó 50 tarjetas con contadores reales, incluidas las candidatas y una recarga; likes de invitados deshabilitados y todas las escrituras bloqueadas.

## Pruebas y reproducción

68 comprobaciones PASS: 35 entrada/guía, ocho importador, once PostgreSQL/PGlite, diez feed y cuatro comprobador remoto. Identidad y transporte de esa suite se simulan. La migración aditiva se aplicó dos veces en PGlite y preservó IDs, likes, vistas y fechas. La lectura real y el navegador se registran por separado: docs/publication-results.json, browser-pages-results.json, browser-quality-results.json, browser-shared-stats-results.json y candidate-backend-readiness.json. Historial PR13/14 y pruebas locales PR15 conservados en docs/history.

## Pendientes abiertos y condición de cierre

- Cobertura: 63/510 fotos en 20 países. Faltan 447 fotos en 48 países; 31 están vacíos. Ecuador tiene dos y faltan ocho; México una y faltan nueve. Obtener escenas distintas con país y humor visual documentados, sin duplicados ni imágenes generadas.
- Permisos: 14 fotos activas sin autorización acreditada. Consultar docs/unverified-photo-permissions.md; acreditar permiso o sustituir por otra foto licenciada con un nuevo ID y sus propios contadores.
- OTP, sesión real y persistencia autenticada: no verificados; no se enviaron correos ni se escribieron pruebas sobre cuentas reales.
- H03: sincronización concurrente de arrays completos sigue parcialmente abierta; requiere conflictos por título/versiones y prueba entre dispositivos.
- H05 queda corregido para la dependencia MapLibre; H06 se corrigió en la ventana Wikipedia, pero el hallazgo completo y las demás vías de la auditoría original siguen abiertos. No se cierran en bloque los 25 hallazgos iniciales.
- Dispositivos móviles físicos y GPU real: pendientes. No confundir dos tamaños de Chrome con una prueba física.
- Store, TraderPath y Pine: informes históricos sin nueva reauditoría ni cierre automático de sus hallazgos. CREA excluido. Vanta Bot sin informe identificable; la carpeta separada conserva esa limitación.

AGENTS.md indica las reglas y pendientes para las siguientes IAs. No afirmar que la auditoría general está completa por el despliegue exitoso. La simplificación de carga de fotos y módulo/CSS comparte configuración y promesas; no se atribuye un ahorro de líneas que no se haya medido.
