# Activación de las dos fotografías revisadas

> Actualización posterior: ambos IDs ya respondieron HTTP 200 y se incorporaron al lote de 63 fotos. Leer candidate-activation.md y candidate-backend-readiness.json. El procedimiento y bloqueo inicial conservados abajo son históricos. No se ejecutó SQL desde esta sesión.

Estado: preparada y probada localmente; **no ejecutada en producción**. La comprobación real `candidate-backend-readiness.json` confirma 61 IDs activos HTTP 200 y `Unknown meme` HTTP 400 para `ec-spider-bin` y `mx-spider-errands`.

El panel del proyecto `apxgkmllektcmrstuirw` redirige a inicio de sesión en esta sesión de trabajo. No hay conexión administrativa ni CLI Supabase disponible. La clave pública del navegador solo permite consultar agregados; no sirve para aplicar SQL. No se intentó ampliar sus permisos.

## Migración lista

Archivo: `supabase/migrations/20261011040000_meme_catalogue_reviewed_candidates.sql`. Es la versión conjunta de los dos SQL preparados en `docs/pending-migrations`; no ejecutar ambas rutas como si fueran tres cambios distintos. La operación es idempotente, aditiva y no toca likes, vistas, grants, RLS ni filas históricas.

Las pruebas PostgreSQL/PGlite la aplican dos veces sobre un catálogo con interacciones existentes. Conserva las filas y sus fechas, añade exactamente los dos IDs y mantiene el rechazo de escrituras de invitados. Los nuevos IDs empiezan con sus propios contadores en cero. Esto no acredita su despliegue remoto.

## Secuencia de despliegue

1. Un administrador autenticado del proyecto aplica únicamente la migración indicada mediante el flujo habitual de migraciones o el editor SQL. Conservar el resultado de ejecución, proyecto y fecha, sin credenciales.
2. Ejecutar `npm run check:backend`. Solo consulta `get_meme_stats` con `p_ids`; no envía OTP ni escribe analítica, likes o vistas. Código 0: todas las identidades comprobadas responden correctamente. Código 2: activos válidos, candidatas todavía bloqueadas. Código 1: fallo de configuración, transporte o validación.
3. Exigir respuesta HTTP 200 con exactamente los IDs pedidos, contadores enteros no negativos y flags anónimos falsos. No usar un HTTP 200 con filas equivocadas como autorización de activación.
4. Solo después del paso anterior, incorporar las dos fichas de `docs/ecuador-pending-photo.json` y `docs/mx-quality-replacement-pending.json` a `scripts/photo-sources.json`. Conservar IDs nuevos y encuadres completos. CC BY-ND de Ecuador permite aquí únicamente las conversiones técnicas descritas en su ficha; no añadir texto ni recortar.
5. Ejecutar el importador transaccional, revisión de duplicados y calidad, pruebas de Chrome y publicación. Confirmar los bytes públicos y lecturas reales después de Pages. La migración por sí sola no añade fotos al frontend.

Las dos candidatas continúan fuera de las colecciones y del cómputo de cobertura. Incluso activándolas quedarían 447 fotografías pendientes de las 510 requeridas. No declarar la auditoría completa por desplegar estos dos IDs. Autenticación real, conflictos entre dispositivos y permisos de las 14 fotos editoriales permanecen abiertos.
