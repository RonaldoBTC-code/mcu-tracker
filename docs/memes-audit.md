# Auditoría de procedencia y duplicados de memes Marvel

## Alcance y estado

El PR #5 publicó 14 fotos compartidas en 51 combinaciones. Esa organización no cumplía la precisión posterior: varias fotos propias y diferentes por país. Esta corrección elimina la biblioteca compartida de los manifiestos y exige que el país sea la ubicación acreditada de la escena. Las dos referencias de Pinterest no se asignan a ningún país porque su procedencia no está demostrada.

La colección actual sigue incompleta: 40 fotos únicas en 22 países; siete alcanzan tres fotos y 44 siguen por debajo del mínimo. Los otros 29 catálogos están vacíos. Mínimo cubierto en BE, BR, CA, FR, GB, TH y US. El mínimo operativo de tres interpreta varias fotos; no fue un número exigido por el usuario. complete permanece false. Un PASS de software o despliegue no completa el contenido.

## Corrección técnica

Cada manifiesto identifica scope: geographic y catalogueRole: scene-location. Las fotos tienen country igual al código del archivo, ubicación, fuente y una explicación comprobable de la ubicación. La interfaz rechaza archivos de la biblioteca internacional, fotos de otro país y entradas sin evidencia. El importador deriva los catálogos de las fuentes, evitando mantener 51 listas independientes a mano. Conserva los manifiestos vacíos y no aplica un reemplazo global.

El importador calcula SHA-256 del archivo de entrada, píxeles decodificados y WebP final. Añade pHash de 64 posiciones mediante DCT, para imagen completa y recortes centrales al 90% y 80%. Compara pares entre todos los países. Coincidencias exactas abortan; distancia perceptual <=8 exige revisar el par completo y registrar por qué son fotografías distintas. El conjunto actual no tiene coincidencias ni pares cercanos. Estos controles no prueban que cualquier recorte arbitrario sea detectable ni que una fotografía sea auténtica: la revisión visual sigue siendo necesaria.

La validación ocurre antes de escribir archivos públicos. Un catálogo incompleto se exporta con estado partial o pending para no fingir cobertura. npm run check:coverage exige tres por cada uno de los 51 países y falla en la revisión actual. La aplicación carga únicamente el JSON elegido y una imagen local diferida. Conserva cancelación, timeout, atribución con textContent, enlaces con host validado, ciclos completos y selección manual persistente.

## Procedencia editorial

- Brasil: Gshow identifica São Paulo, Belo Horizonte y Santarém en los pies de tres fotografías distintas de la preestrena de 2021. Se inspeccionaron las fotografías completas, separándolas del dibujo animado y los carteles de la película del mismo artículo.
- Ecuador: EXTRA identifica al artista en un bus de Guayaquil, avenida del Periodista. Su nacionalidad peruana no convierte la fotografía en una escena de Perú. Se conserva el crédito Álex Lima / EXTRA.
- México: El Comercio identifica al alumno disfrazado que interrumpe su clase en México. La sede peruana del medio no determina el origen. La ciudad queda sin acreditar.
- Perú: El Comercio documenta el baile de Spider-Man dentro de un colectivo de la avenida Salaverry, Lima. Se conserva el crédito del medio a Cristhian Rojas Rosas.
- Tailandia: Sanook/PPTV identifica al alumno que llega disfrazado a su universidad de Bangkok; The Nation identifica al vendedor de yogur en Sukhothai; Daily News identifica al vendedor de verduras en Sanam Chai, Suphan Buri. Son situaciones distintas, no tres ángulos de la misma actuación.
- Filipinas: Philnews documenta el pasajero disfrazado en un jeepney; no se inventa una ciudad. Commons describe a Spider-Man dirigiendo la danza del dragón en Binondo, Manila, con licencia CC BY-SA 4.0.
- Estados Unidos: se revalidaron individualmente Iron Man como tabla de planchar en ConNooga 2009 y Deadpool con traje de Iron Man en NYCC 2015. El cartel del segundo es físico, no texto digital superpuesto. Captain Dorito está identificado por su cosplayer como Tora-Con 2018; la cobertura de RIT acredita la sede en Rochester. El cosplayer no se identifica automáticamente como fotógrafo.

Fuentes individuales, URLs de imágenes, evidencia geográfica, créditos y licencias: scripts/photo-sources.json. Huellas de los archivos de entrada y archivos publicados: docs/photo-inventory.json. Hay 22 fotografías con licencia o declaración de dominio público documentada y 18 sin licencia acreditada. Registrar una fuente accesible no concede derechos de redistribución; esas licencias permanecen null y su autorización sigue sin acreditar.

## Descartes y pistas pendientes

Los collages de Spidergaucho y del votante argentino no entran como fotos completas independientes. Tampoco el collage con titular de Daily News, las capturas de publicaciones con texto de Facebook, dibujos/IA, poses genéricas, productos o logos que un servidor devuelve con HTTP 200. El resizer de El Comercio devolvió un logo en lugar de una foto antigua; se inspeccionó por separado el archivo público original enlazado en el artículo.

La actuación de Avenida Italia y Bolonia en Montevideo fue difundida erróneamente como argentina; El Observador documenta Uruguay. La pista queda pendiente porque no se recuperó una foto completa adecuada. El artículo de Ecuavisa acredita Durán, pero su descarga devolvió 403; no se fabricó una URL o foto de sustitución. Las fuentes Cuartoscuro requieren licencia; no se importaron sus imágenes.

La búsqueda se amplió a medios de virales locales, Commons, Reddit, sitios de creadores y páginas de memes que se habían consultado para el PR #5. No se afirma haber revisado todas las páginas de Internet ni haber encontrado colecciones válidas para los países todavía pendientes. Las pistas de otros países requieren fotografía completa, evidencia de ubicación, revisión editorial y comparación de duplicados antes de entrar.

## Verificación

34 regresiones PASS: entrada, aislamiento de cuentas, guía 7→8→fin, rechazo del pool compartido, ruta local, origen ausente/distinto, XSS/atribución, cancelación y aleatoriedad. Chrome comprueba los 51 selectores, los 22 países con fotos y los 29 vacíos, en escritorio y móvil emulado. El informe vigente distingue el feed de la portada y el modal; ambos deben recorrer sus imágenes reales sin descargar otros países. La guía conserva el resaltado y el avance en 7 y 8. Las pruebas adversariales comprueban duplicados exactos, versiones recomprimidas/redimensionadas, evidencia ausente y cobertura incompleta; cada rechazo precede la escritura pública.

Las pruebas de OTP/Supabase real, dispositivos físicos y sincronización entre dispositivos siguen pendientes. No se enviaron correos ni se escribieron datos reales. Los resultados de publicación del PR #5 están preservados bajo docs/history/pr5 y no acreditan esta revisión.


## Ampliación y publicación

Se incorporaron 26 fotos distintas: Canadá (Iron Pikachu, Iron Man de gala y Deadpool gigante con unicornio), Bélgica (trono, portabebé con Grogu y mezcla Deadpool/Spider-Man), Reino Unido (Buzz/Iron Man, trono doble y entrevista en el metro), Francia (hospital, Sailor Moon y hula), Japón (Deadpool conejo y equilibrio sobre bicicleta), Chile (cueca), Colombia (parada de manos), Cuba (juguete Nerf), Honduras (graduación), Indonesia (venta de verduras), Austria (baile en metro), India (foto de tránsito), Israel (Purim), El Salvador (homenaje a Stan Lee), España (máscara desplazada y descanso), Perú (venta de yoyós). Fotos completas, créditos y evidencia individual: scripts/photo-sources.json.

Japan Expo se fotografió en Francia, no Japón. Comic Market 96 se sitúa en Tokio por la categoría de la foto y la [sede publicada por el organizador](https://www.comiket.co.jp/info-a/TAFO/C96TAFO/cmkfor_eng.html). La base de Guantánamo está físicamente en Cuba; se conserva el crédito actual de DVIDS, sin inventar una fecha para resolver la discrepancia de las fuentes. Su [política de uso](https://www.dvidshub.net/about/copyright) se enlaza y se conserva la declaración de ausencia de aval. El dominio público estadounidense no demuestra la ausencia de otros derechos.

Los nuevos collages de Uruguay y Bolivia, composiciones de Trome con personaje digital, poses genéricas de Australia/Italia y fotos cuyo país no estaba demostrado quedaron fuera. TimesLIVE difundió el baile llamado Sipho-Man, pero no acreditó el lugar exacto de la escena: no se importó como Sudáfrica solo por la música o la sede del medio. La noticia sobre un paraguayo fotografiado en España no acredita una foto en Paraguay; la de un cubano en Miami no acredita Cuba.

El feed de la portada usa las mismas colecciones y atribución segura, con lotes y fin real. Me gusta y vistas tienen frontend, SQL privado y pruebas ejecutables; Supabase devolvió 404 en la consulta inicial del agregado. Persistencia real pendiente. Detalles: docs/meme-feed.md.

La evidencia del PR #6 está preservada en docs/history/pr6. No usar sus 66 archivos y 14 fotos como prueba de esta ampliación. La evidencia de la nueva publicación se guarda en docs/publication-results.json, docs/pages-verification-results.json y docs/browser-pages-results.json después del despliegue.
