# Auditoría de la selección Marvel corregida

La colección anterior de 96 fotos fue rechazada editorialmente: mezclaba Marvel con anime, animales, carnavales y disfraces sin gag visual. La prueba técnica anterior no acreditaba que cumpliera el gusto y el criterio del usuario. Se retiran sus 96 archivos y las fuentes del importador.

## Criterio aplicado a los 51 países

Solo fotografías de personajes Marvel con un gag visual concreto, sin texto de meme superpuesto. Dos referencias aceptadas: Avengers en reunión de oficina y dos Iron Man con presupuestos distintos. Ambas se inspeccionaron visualmente completas. No se completan países con fotos que solo posan, anime ni escenas ajenas a Marvel.

Pinterest no acredita fotógrafo, país ni licencia en estos pines. Esos campos son null, sin licencia CC inventada ni asignación geográfica. Los publicadores no se presentan como autores. La colección es internacional y compartida; el selector no acredita procedencia. Los 51 manifiestos apuntan a los mismos dos archivos, no a 102 copias ni a 51 colecciones locales verificadas.

## Fuentes

- Avengers en oficina: https://www.pinterest.com/pin/678636237574158906/
- Dos Iron Man: https://www.pinterest.com/pin/392516923774440652/

La búsqueda adicional de Pinterest devolvió manualidades, plantillas y productos; no se añadieron para rellenar la colección. No se afirma disponer de derechos de reutilización documentados: las fuentes no aportan licencia y este dato sigue sin acreditación.

## Rendimiento y controles

Dos WebP, 77.276 bytes en total; mayor archivo 40.528 bytes. Se conserva la proporción y no se añade texto. Al abrir se solicita únicamente el manifiesto del país seleccionado y una foto diferida. El botón aleatorio reutiliza los datos y evita repetición inmediata. No se descargan los otros 50 manifiestos ni se consulta Pinterest desde el navegador del usuario.

Se mantiene validación del país, carpeta local internacional permitida expresamente, rechazo de URL externas/rutas codificadas, cancelación y generación. Título y atribución usan textContent. Pinterest solo se admite como enlace de fuente HTTPS al host exacto www.pinterest.com y ruta /pin/ID/. Guía 7 y 8, aislamiento de cuentas y controles de acceso permanecen sujetos a las pruebas de regresión.

## Estado

Publicada y verificada el 10 de octubre de 2026. PR #4 fusionado como e9d8872056352fd78deb4ff469efd02fe28725c0. Workflow 38082727671 completado correctamente. Los 54 archivos publicados coinciden con la versión probada; Chrome comprobó los 51 países en 1280×900 y 390×844, con 102 comprobaciones de imagen por tamaño, dos fotos únicas y ningún error no capturado. Guía 7→8→fin, selección aleatoria y persistencia: PASS. Evidencia: docs/pages-verification-results.json y docs/browser-pages-results.json. Pruebas locales: entry-fixes-results.json y browser-memes-results.json. El móvil es emulado y Supabase/OTP reales quedan fuera de las pruebas.
