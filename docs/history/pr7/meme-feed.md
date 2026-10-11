# Feed de descubrimiento e interacciones compartidas

## Estado

Implementado en la portada: tarjetas verticales, selector de país, descubrimiento mediante scroll y acceso al rastreador. La colección tiene 40 fotos únicas, integradas en 22 países; siete alcanzan tres fotos. Faltan 44 países para el mínimo operativo y 29 siguen vacíos. No es una colección completa de los 51 países.

El frontend y la migración de Me gusta/vistas están publicados. Tras fusionar el PR #7, Supabase respondió HTTP 200 a `get_meme_stats` con los 40 IDs aprobados y contadores válidos; consultar `meme-backend-readiness.json`. La consulta anterior al despliegue devolvía 404/PGRST202. El SQL y los cambios de cuenta se probaron con PostgreSQL embebido y red simulada. La escritura y persistencia con una sesión autenticada real siguen sin verificar. La interfaz no inventa cifras cuando falla el backend.

## Descubrimiento

`scripts/meme-feed.js` solicita únicamente el manifiesto del país detectado o elegido manualmente. Comparte `mcu_map_country` con el selector del mapa. Añade dos tarjetas por lote; el siguiente lote aparece al acercar el scroll al final y también se puede pedir con un botón. Las imágenes reservan dimensiones, conservan el encuadre y se cargan cerca del viewport. Se conserva el fin real de colección, sin repetir fotos para simular scroll infinito. Los países vacíos muestran su estado. No se solicita una biblioteca internacional.

Cambiar de país cancela la petición anterior, observadores, temporizadores y operaciones pendientes. Una generación descarta respuestas tardías. Las fuentes y créditos usan el mismo formateador seguro del mapa, con texto y enlaces de hosts permitidos. DVIDS incluye su declaración de ausencia de aval; no se atribuye una licencia a una fuente que no la documenta.

## Qué mide una vista

Una vista registrada representa una cuenta autenticada distinta que ha visto una foto, una sola vez durante la vida de esa cuenta, en el feed. El navegador exige una imagen decodificada, al menos 50% de intersección y un segundo continuo. Al confirmar, verifica que la pestaña esté visible, la guía y el modal estén cerrados y que el centro visible de la imagen no esté tapado. Los invitados exploran y consultan agregados, pero no escriben vistas ni likes. Los contadores indican explícitamente «vistas de cuentas únicas»; no son impresiones de todos los visitantes.

Un índice único `(user_id, meme_id)` impide incrementar por recargas, volver a pasar, múltiples pestañas o reintentos. Los eventos se agrupan por hasta diez IDs. El backend no puede demostrar que un navegador modificado esperó ese segundo: valida identidad, catálogo y deduplicación. No se presenta este sistema como prueba de atención, protección contra cuentas múltiples ni métrica de publicidad. El borrado de una cuenta elimina sus interacciones.

## Likes, aislamiento y acceso

El botón envía un estado deseado —poner o retirar— y espera el resultado real. No incrementa un contador local como si fuera compartido. El bloqueo mientras se envía evita duplicados por doble clic; el backend admite reintentos idempotentes. Al cambiar de cuenta se descartan estados y respuestas anteriores. Cada petición captura el JWT de su cuenta antes de escribir; nunca reasigna un like de A a B. Si el resultado es incierto, se exige reconsultar el estado antes de otra modificación.

La migración `supabase/migrations/20261011010000_meme_interactions.sql` crea catálogo aprobado, likes y vistas dentro de `meme_data`, con RLS activada y sin permisos de lectura/escritura directa para visitantes. Solo los wrappers invoker `get_meme_stats`, `set_meme_like` y `record_meme_views` quedan expuestos en `public`. Sus implementaciones definer privadas fijan un `search_path` vacío, comprueban `auth.uid()` y no aceptan IDs de usuario ni totales del cliente. Los agregados devuelven conteos y el estado de quien consulta; nunca listas de cuentas.

El catálogo SQL contiene exactamente los 40 IDs estables revisados. Para ampliar después, añadir otra migración con los nuevos IDs; no reescribir migraciones aplicadas ni renombrar fotos que ya tengan interacciones. Mantener `meme_data` fuera de los esquemas expuestos. Los permisos y el `search_path` siguen las [reglas oficiales para funciones de Supabase](https://supabase.com/docs/guides/database/functions).

## Despliegue y pruebas

El check de Supabase del commit ac108c0935b433ed4bcfab86d7121c4d298276be terminó con éxito y la consulta pública del agregado devolvió 40 filas válidas después del despliegue. Esto acredita la disponibilidad de esa RPC, no una inspección administrativa de todos los permisos en producción. El acceso disponible no incluye conexión administrativa ni cuenta de prueba autenticada. Queda validar persistencia con cuentas de prueba autorizadas, doble petición, retirada de likes y lectura desde otra cuenta. Publicar GitHub Pages por sí solo no acredita una migración de base de datos. Seguir el [flujo oficial de migraciones](https://supabase.com/docs/guides/deployment/database-migrations).

`npm test` incluye 34 regresiones del tracker, controles adversariales del importador, nueve comprobaciones ejecutables del SQL en PGlite/PostgreSQL y siete escenarios del feed con red simulada. `tests/browser-memes.cjs` comprueba el feed y el mapa con los 51 selectores, imágenes reales locales y guía 7→8→fin, en escritorio y móvil emulado. Tras publicar, `scripts/verify-pages.cjs` compara los bytes del HTML, JavaScript, 51 manifiestos y 40 WebP; `tests/browser-pages.cjs` repite la interfaz sobre Pages bloqueando peticiones externas para evitar escrituras reales. Los informes de pruebas locales no prueban OTP, persistencia real ni dispositivos físicos.

Se corrigió además la dependencia transitiva `source-map-js` a una versión reparada; la auditoría npm actual no reporta vulnerabilidades conocidas. Esto no equivale a una garantía general de seguridad.

Consulta real desde Chrome: `tests/browser-shared-stats.cjs` permitió únicamente Pages y la RPC de lectura `get_meme_stats`, bloqueando OTP, likes, vistas y visitas del sitio. Verificó siete tarjetas entre Ecuador, Brasil y la recarga de Brasil: contadores iguales a los agregados recibidos y Me gusta deshabilitado para invitado. Resultado PASS en `browser-shared-stats-results.json`. La prueba necesitó acceso de red fuera de la restricción del entorno; los primeros intentos restringidos terminaron en timeout. Esto verifica lectura y representación de datos reales, no persistencia de escrituras autenticadas.
