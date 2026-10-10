# Auditoría de memes y carga del mapa — 2026-10-10

## Alcance y resultado

Revisión de detección/selección de país, solicitudes de datos e imágenes, representación de texto, cancelación, coste del mapa y contenido publicado. Incluye regresiones de arranque, progreso, reseñas y guía para comprobar que la integración no rompe las rutas existentes. No es una declaración de que todos los pendientes históricos de Supabase/OTP están corregidos; se conservan en `entry-fixes.md`.

## Hallazgos corregidos

| Hallazgo | Corrección | Evidencia |
|---|---|---|
| Colección sin contenido | 102 tarjetas originales, dos por cada país del selector; no se copian memes ni imágenes oficiales | Validación de 51 manifiestos, 102 WebP y decodificación real |
| Riesgo de descargar un catálogo mundial para filtrar | Se decide el país antes de construir la URL; solo `data/memes/<PAIS>.json` | Registro real: entrada EC solicita EC.json y dos imágenes EC; comprobación de todos los países |
| Imagen ajena al país o ruta codificada | Origen único, prefijo de país y nombre de archivo plano con extensión permitida; rechazo de URL externas, % y subcarpetas | Regresión EC/MX, URL externa y rutas codificadas |
| Respuestas de país anterior | AbortController, generación, desconexión de observer y retirada de fuentes al cambiar/cerrar | Regresiones de respuesta tardía incluso con transporte que ignora cancelación |
| País por defecto incorrecto cuando falla detección | Resolver del mapa sin fallback arbitrario US; selector sin solicitudes hasta elegir | Prueba UTC e idioma sin región, cero descargas |
| Muchos nodos SVG fuera de pantalla | Generar solo puntos dentro de la región visible | Máximo 619 círculos en los 51 países, frente al mapa mundial completo |
| Saltos por imágenes sin dimensiones | Dimensiones 768×512 y aspect-ratio 3/2 | Comprobación y capturas de escritorio/móvil |
| Cerrar desaparece al desplazar lista | Cabecera sticky dentro del diálogo | Comprobación real de bounding box de Cerrar tras scroll |
| Texto repetido en imagen y pie | Pie corto de autoría; texto completo en alt | Inspección de capturas y atributos |

## Rendimiento medido

- 1.538.654 bytes de imágenes para toda la colección; **no se descargan todos al entrar**.
- WebP más grande: 16.554 bytes. Dos imágenes por país; cada manifiesto inferior a 4 KB.
- Sin librería nueva en producción, sin API IP/GPS ni tiles para este mapa. Generación de imágenes y Playwright son herramientas de desarrollo.
- Prueba real final con validación de rutas reforzada: Chrome local, escritorio 1280×900 y móvil emulado 390×844; máximo de apertura/cambio de país 105 ms y 44 ms respectivamente. Son mediciones locales sin red externa; no constituyen una promesa de tiempos de Internet.
- Carga diferida con IntersectionObserver y loading=lazy; sin observer, botón de carga explícita. Sin prefetch, sin índice global, sin caché global propia.

## Seguridad y datos

Los textos se insertan con textContent y alt; no se interpreta HTML del manifiesto. Solo se muestran 50 entradas como límite defensivo. Código de país validado contra lista existente. Las imágenes se sirven del mismo sitio; no se acepta SVG ejecutable ni origen de terceros. La elección manual se guarda localmente por país, sin ubicación precisa. SafeStorage tolera restricciones del navegador; si no permite persistir, la selección dura la sesión.

Las imágenes son composiciones originales de fans, con referencias textuales a personajes Marvel y referencias locales; no son fotografías oficiales, capturas de películas ni memes virales recopilados. La marca Marvel conserva sus titulares; la página declara contenido no oficial. No se añadieron secretos ni dependencias de frontend, no se enviaron correos ni se escribió en Supabase.

## Comprobaciones y límites

Resultados DOM: `entry-fixes-results.json`. Resultados de navegador: `browser-memes-results.json`. `tests/browser-memes.cjs` ejecuta un servidor temporal, aísla orígenes externos y termina su navegador/servidor al finalizar. La verificación real recorre los 51 países en ambas pantallas, comprueba las imágenes y las solicitudes por país, conserva la selección tras recargar y recorre la guía 7→8→fin. Capturas locales inspeccionadas; no se agregan al frontend.

Límites abiertos: detección aproximada puede equivocarse; usuario puede corregirla. Nuevos textos en español, traducciones pendientes. Mapa aproximado sin fronteras. Un archivo ya iniciado puede terminar su transferencia tras cambiar país. Prueba de móvil emulado, no dispositivo físico. CDN/Supabase/OTP reales y conflictos de escrituras concurrentes históricos requieren sus verificaciones independientes. La publicación se verifica aparte mediante commit fusionado y despliegue de Pages; no basta con crear un PR.
