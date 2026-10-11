# Continuación de auditoría y correcciones — 11 de octubre de 2026

La auditoría general sigue abierta. Se corrige H05 de la auditoría original actualizando conjuntamente módulos y CSS de MapLibre de 4.7.1 a **6.4.1**, la primera versión corregida según el [aviso oficial](https://github.com/maplibre/maplibre-gl-js/security/advisories/GHSA-jrc7-96c5-q579). La [guía oficial de migración](https://github.com/maplibre/maplibre-gl-js/blob/v6.0.0/docs/guides/v5-to-v6-migration-guide.md) exige módulos ESM y un worker separado; cambiar solo el número de la URL `.js` habría producido un 404.

## Cambios implementados

- Carga compartida de módulo/CSS 6.4.1, worker ESM auto-detectado y versión exacta. La promesa compartida evita solicitudes simultáneas duplicadas. Un fallo elimina el CSS y permite reintentar. WebGL 2 es un requisito explícito de esta versión; el aviso no exige bajar protecciones del navegador.
- Las ventanas del mapa de escenarios construyen contenido mediante DOM y `textContent`. Las fotos solo admiten HTTPS de `upload.wikimedia.org`; sus créditos solo admiten HTTPS de `en.wikipedia.org`, sin credenciales ni puertos. Respuestas y cachés de fotos manipuladas no crean atributos HTML ni URLs JavaScript. Esto corrige esa vía concreta de H06; no cierra todas las vías del hallazgo original.
- Se descartan los marcadores de una respuesta antigua si cambia la generación durante la carga de fotos. Se conserva el mapa original dentro del diálogo; no se añade mapa al feed ni se cambia la entrada obligatoria al tracker.
- Migración aditiva probada para los dos IDs revisados y comprobador de registro remoto que solo consulta agregados. Las fotos siguen inactivas mientras la lectura real devuelva `Unknown meme`.
- Registro de permisos faltantes por cada una de las 14 fotos, con fuentes primarias y separación entre página consultada y recuperación fallida. No se inventaron autores, permisos ni licencias.

## Verificación

`npm test -- --record`: 35 comprobaciones de entrada/guía, ocho del importador, once PostgreSQL/PGlite, diez del feed y cuatro del comprobador remoto: **68 PASS**. Las pruebas de transporte/autenticación de esta suite son simuladas; PGlite utiliza una identidad local, no una sesión real de Supabase.

`tests/browser-maplibre.cjs`: Chrome 1280×900 y 390×844, WebGL por software, los cuatro archivos oficiales verificados por hash, 29 marcadores, zoom, ventanas, cierre/reapertura y ausencia de errores no manejados. La variante con fixture introduce atribuciones con atributos peligrosos consecutivos y fotos/URLs manipuladas: sin ejecución ni atributos inseguros. La variante `--live` descarga módulos/CSS/worker reales de unpkg y teselas reales de OpenFreeMap; las fotos de Wikipedia están simuladas y Supabase está bloqueado. No sustituye pruebas en móviles físicos ni GPU real.

Datos y hashes: `maplibre-assets.json`, `browser-maplibre-results.json`, `browser-maplibre-live-results.json`, `backend-readiness-tests.json`, `meme-database-results.json`. Las pruebas públicas del frontend tras publicar se registran por separado; los resultados de PR #13 acreditan la versión anterior, no este cambio.

## Pendientes verificables

| Pendiente | Estado y condición de cierre |
|---|---|
| Dos IDs Supabase | SQL listo, no desplegado. Panel sin sesión administrativa. Exigir lectura real antes de activar. Ver `candidate-deployment.md`. |
| Fotografías por país | 61 activas/19 países, 449 faltantes/48 países. Curación manual de escenas distintas con país documentado y humor visual. No se crean duplicados para cubrir el mínimo. |
| 14 permisos | No acreditados; ver `unverified-photo-permissions.md`. Documentar permiso o sustitución licenciada, sin heredar interacciones. |
| OTP y escrituras reales | No comprobados. No se enviaron correos ni se usaron cuentas de usuario para escribir pruebas. |
| Sincronización concurrente | H03 sigue parcialmente abierto: el servidor conserva un array completo y aún necesita resolución de conflictos por título/versiones. |
| Otros hallazgos originales | La auditoría inicial incluye 25; esta entrega no los cierra en bloque. H06 queda parcialmente corregido; validación SQL, visitas, TMDB, cachés y duplicados de reseñas requieren trabajo adicional. |
| Otros repositorios | Informes Store/TraderPath/Pine históricos; no reauditoría nueva. CREA excluido. Vanta Bot sin informe identificable en los materiales disponibles. |

## Reducción de código

Se reutiliza la comprobación de agregados en la verificación real y sus pruebas; se conserva el constructor de fotos compartido entre mapa y feed del PR #13. La seguridad del DOM requiere más líneas que concatenar HTML; no se elimina para reducir el tamaño. No se afirma un ahorro global de líneas ni una mejora de rendimiento sin medición. El frontend sigue sin build.
