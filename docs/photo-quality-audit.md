# Auditoría y corrección de calidad fotográfica

> Registro histórico del PR #13 y sus 61 fotos. Después se confirmaron dos IDs reales y se incorporaron fotos licenciadas de EC/MX: total actual 63, 176 variantes, 447 faltantes. Leer candidate-activation.md y country-coverage.md para el estado posterior; no interpretar los bloqueos o métricas históricos de abajo como actuales.

Fecha: 11 de octubre de 2026. Base publicada: PR #12, commit `d5e299738fea20f5fe46b2f811e881fe427b502b`. Corrección publicada mediante PR #13, commit `759ee9df69c6e8aa78527cb9356d5b592b6b1bff`; Pages 38163719214 success. Verificación pública: 224 archivos idénticos, Chrome PASS en dos tamaños y cuatro configuraciones DPR1/2. Evidencia: `publication-results.json`.

Se revisaron las 65 fotos anteriores. Se conservan 61 fotos distintas en 19 países y se retiran cuatro capturas de vídeo con detalle deficiente. Se recuperaron los 46 originales de Commons y tres archivos editoriales mayores (dos marcados como originales y una reproducción editorial mayor) desde las fuentes acreditadas. No se generó nitidez, se inventaron píxeles ni se sustituyeron fotos bajo identificadores históricos.

## Problemas y correcciones

| Problema | Corrección | Evidencia |
|---|---|---|
| Límite de 100 KB y reducción a 640/768 px degradaban el detalle | WebP calidad 90, versiones proporcionales de hasta 640/1280/1920 px; presupuestos de 250/650/1300 KB por resolución | `scripts/responsive-photos.cjs`, `photo-inventory.json` |
| Miniaturas usadas como referencias | Recuperación de archivos completos; Filipinas pasa de 375×500 a 750×1000 y Commons usa sus 46 originales | `scripts/photo-sources.json`, revisión por ID |
| Una sola resolución para todos los dispositivos | `srcset` y `sizes`, medidos en Chrome móvil/escritorio con DPR 1 y 2 | `browser-quality-results.json` |
| Fotos pequeñas estiradas, especialmente retratos | Ancho real limitado por píxeles nativos/2, proporción y altura visible; se comprueban ambos ejes | Mediciones de las 61 fotos |
| Fotos de vídeo borrosas tratadas como arreglables mediante compresión | Retirada del catálogo activo de cuatro fotos; se conservan IDs y datos históricos | `scripts/withdrawn-photo-sources.json` |
| Caché podía mantener las imágenes anteriores | Nombre de cada variante incluye resolución y SHA-256 del contenido | Manifiestos y prueba pública de bytes |
| Duplicación de carga y presentación entre feed y visor | Funciones compartidas `configureImage` y `activateImage`; mismo validador de URL y país | `index.html`, `scripts/meme-feed.js` |

La configuración antigua de 768/calidad 72 con degradación hasta 640/calidad 56 y máximo 100 KB queda obsoleta. El importador rechaza cualquier exceso antes de escribir; no baja la calidad silenciosamente. Mantiene detección de duplicados por archivo/píxeles/pHash y revisión manual de similitudes.

## Retiradas e identidad

| ID histórico | País | Motivo |
|---|---|---|
| mx-spider-class | MX | Captura de vídeo borrosa, sin detalle suficiente del personaje |
| pe-spider-dance-bus | PE | Captura pequeña y borrosa del baile en un colectivo |
| cl-spider-cueca | CL | Captura previamente ampliada, con detalle aparente superior al real |
| at-spider-dance | AT | Captura con desenfoque de movimiento y poco detalle del traje |

No se borran sus filas ni se copian likes/vistas a otra foto. Mejorar el archivo de la misma fotografía conserva el ID. Una fotografía distinta necesita ID nuevo, inserción aditiva y confirmación RPC antes de activarse.

Las candidatas nuevas `mx-spider-errands` (Ciudad de México, Eneas De Troya, CC BY 2.0) y `ec-spider-bin` (Guayaquil, Joan Briones, CC BY-ND 2.0) tienen ficha, referencia y SQL preparado en `docs/pending-migrations`. Aún devuelven HTTP 400 `Unknown meme`; no están activas ni cuentan para cobertura. Para la candidata ND se conserva el encuadre completo y solo se permite el cambio técnico de formato, sin edición artística.

## Límites reales de las fuentes

- Gshow: dos archivos de 984 px proceden de recortes nativos de 680 px. Se descartan esos píxeles ampliados, se limita la variante a 680 px y el dibujo a 340 px. La descarga directa del original publicado expiró; no se declara recuperado.
- `gb-spider-tube`: archivo nativo de 610×800 y enfoque suave; máximo 305 px de ancho para DPR2.
- `ph-spider-commute`: archivo editorial de 750×1000; sigue siendo una foto de teléfono con luz desigual y enfoque modesto. La recuperación mejora la reproducción, no el enfoque de la toma.
- `us-iron-board` y `gb-iron-buzz`: escenarios oscuros; se conserva la exposición del fotógrafo. Se revisó que el personaje y el gag sigan visibles, sin afirmar calidad perfecta.
- La descarga de Commons respondió varias veces HTTP 429. Se respetó `Retry-After`, se espaciaron solicitudes y finalmente se recuperaron sus 46 originales. No se utilizaron URLs inventadas ni ampliaciones para cubrir el bloqueo.

Las licencias acreditadas corresponden a 47 fotos activas; 14 siguen sin licencia de reutilización acreditada. Fuente pública y crédito no equivalen a permiso. Las licencias, autores y países desconocidos no se inventan.

## Verificación y comparación

`npm test -- --record` ejecuta 35 regresiones de entrada/guía, ocho comprobaciones de importación, nueve de PostgreSQL y diez del feed. Incluye denegación de escrituras de invitado, RLS, identidad de cuentas, fallos de red, respuestas antiguas, scroll y cargas diferidas.

`tests/browser-quality.cjs` recorre las 61 fotos en 1280×900 y 390×844, con DPR 1 y 2. Mide tamaño dibujado y recurso seleccionado, conserva proporción y verifica píxeles suficientes en ambos ejes, opacidad, ausencia de cargas iniciales y activación solo del país elegido. `tests/browser-memes.cjs` y `tests/browser-pages.cjs` verifican las 51 colecciones, el mapa original, recarga/progreso y guía 7→8→fin.

Las seis láminas de `quality-review` documentan revisión del encuadre completo. Los seis archivos de `quality-comparisons` comparan, de izquierda a derecha, fuente, WebP publicado anterior y variante nueva seleccionada, al tamaño real de escritorio DPR2. `photo-quality-comparison.json` registra los 61 casos. PSNR mide error de reproducción por resolución/compresión; no demuestra mejor enfoque o exposición de la fotografía original. Una toma deficiente no se aprueba solo por subir ese número.

Para repetir: importar fuentes, ejecutar las pruebas y `tests/browser-quality.cjs`, luego `node scripts/compare-photo-quality.cjs`. Tras desplegar, `scripts/verify-pages.cjs` compara HTML, feed, 51 manifiestos y todas las variantes públicas contra bytes locales; repetir Chrome contra la URL pública. Toda prueba con servicios reales bloquea escrituras.

## Pendientes que esta corrección no cierra

Faltan 449 fotos para diez por cada uno de los 51 países; 48 países están por debajo del mínimo y 32 vacíos. Ecuador conserva una activa y necesita nueve más. `complete:false`. No se rellena cobertura con duplicados, otro país, dibujos, IA o licencias inventadas.

Siguen pendientes las 14 licencias, la activación SQL de las dos candidatas, OTP real, escritura/persistencia autenticada de likes/vistas, dispositivos físicos y sincronización entre dispositivos. Las pruebas PostgreSQL usan PGlite con autenticación simulada; los agregados públicos reales no acreditan escrituras autenticadas.

## Inventario de las 61 fotos conservadas

Resoluciones en píxeles. Las medidas de dibujo son CSS; el recurso DPR2 debe cubrir dos píxeles físicos por píxel CSS en ambos ejes. En Gshow, origen efectivo excluye la ampliación editorial previa. Fuentes/licencias individuales y comparación por ID: photo-inventory.json y photo-quality-comparison.json.

| ID / fuente | País | WebP anterior | Origen efectivo | Dibujo escritorio | Recurso escritorio DPR2 | Recurso móvil DPR2 |
|---|---|---|---|---|---|---|
| [br-spider-circle-sp](https://gshow.globo.com/cultura-pop/viralizou/noticia/homem-aranha-sem-volta-para-casa-fas-se-fantasiam-como-o-super-heroi-para-assistir-a-estreia-do-filme.ghtml) | BR | 768×404 | 680×357 | 340×179 | 680×357 | 680×357 |
| [br-spider-circle-bh](https://gshow.globo.com/cultura-pop/viralizou/noticia/homem-aranha-sem-volta-para-casa-fas-se-fantasiam-como-o-super-heroi-para-assistir-a-estreia-do-filme.ghtml) | BR | 768×693 | 984×888 | 492×444 | 984×888 | 984×888 |
| [br-spider-embrace](https://gshow.globo.com/cultura-pop/viralizou/noticia/homem-aranha-sem-volta-para-casa-fas-se-fantasiam-como-o-super-heroi-para-assistir-a-estreia-do-filme.ghtml) | BR | 768×768 | 680×680 | 340×340 | 680×680 | 680×680 |
| [ec-spider-bus](https://www.extra.ec/noticia/buena-vida/spiderman-personajes-curiosidades-marvel-guayaquil-2758846-7330.html) | EC | 768×512 | 2000×1333 | 708×472 | 1920×1280 | 1280×853 |
| [th-spider-student](https://www.sanook.com/men/13421/) | TH | 576×768 | 720×960 | 360×480 | 720×960 | 720×960 |
| [th-spider-yogurt](https://www.nationthailand.com/in-focus/40006400) | TH | 768×433 | 2000×1127 | 708×399 | 1920×1082 | 1280×721 |
| [th-spider-vegetables](https://www.dailynews.co.th/news/180414/) | TH | 768×662 | 1253×1080 | 626×540 | 1253×1080 | 1253×1080 |
| [ph-spider-commute](https://philnews.ph/2017/03/17/viral-photo-spiderman-inside-philippine-jeepney/) | PH | 375×500 | 750×1000 | 375×500 | 750×1000 | 750×1000 |
| [ph-spider-dragon](https://commons.wikimedia.org/wiki/File:Superhero_in_action.jpg) | PH | 768×508 | 4625×3057 | 708×468 | 1920×1269 | 1280×846 |
| [us-iron-board](https://commons.wikimedia.org/wiki/File:Original_%27Iron_Man%27_Cosplayer_@_ConNooga_%2709_Masquerade.jpg) | US | 527×768 | 1987×2896 | 432×630 | 878×1280 | 878×1280 |
| [us-captain-dorito](https://zmyaro.com/cosplay/captaindorito/) | US | 512×768 | 1854×2782 | 420×630 | 853×1280 | 853×1280 |
| [us-deadpool-iron](https://commons.wikimedia.org/wiki/File:Day_4_at_NYCC_2015_Cosplay_of_Iron_Man_Deadpool.jpg) | US | 587×768 | 1186×1553 | 481×630 | 978×1280 | 978×1280 |
| [ca-iron-pikachu](https://commons.wikimedia.org/wiki/File:Iron_Pikachu.jpg) | CA | 768×548 | 2873×2051 | 708×506 | 1920×1371 | 1280×914 |
| [gb-iron-buzz](https://commons.wikimedia.org/wiki/File:MCM_2013_-_Buzz_Lightyear_Iron_Man_(8978219177).jpg) | GB | 510×768 | 1424×2144 | 418×630 | 850×1280 | 850×1280 |
| [be-deadpool-throne](https://commons.wikimedia.org/wiki/File:Comic_Con_Brussels_2016_-_Deadpool_on_the_Iron_Throne_(26675225495).jpg) | BE | 432×768 | 3376×6000 | 354×630 | 720×1280 | 720×1280 |
| [be-deadpool-duff](https://commons.wikimedia.org/wiki/File:Cosplay_of_Duffman_and_Deadpool_at_Brussels_Comic_Con_2022_(51979055573).jpg) | BE | 457×768 | 3072×5158 | 375×630 | 762×1280 | 762×1280 |
| [be-deadpool-spider](https://commons.wikimedia.org/wiki/File:Cosplay_mash-up_of_Deadpool_and_Spider-Man_at_Made_in_Asia_2022_(52159179688).jpg) | BE | 768×432 | 6001×3376 | 708×398 | 1920×1080 | 1280×720 |
| [ca-iron-fanexpo](https://commons.wikimedia.org/wiki/File:Fan_Expo_Canada_2016_Iron_Man.jpg) | CA | 576×768 | 2448×3264 | 473×630 | 960×1280 | 960×1280 |
| [gb-deadpools-throne](https://commons.wikimedia.org/wiki/File:LSCC_2016_-_Deadpools_on_the_Iron_Throne_(25057706012).jpg) | GB | 512×768 | 3312×4968 | 420×630 | 853×1280 | 853×1280 |
| [gb-spider-tube](https://commons.wikimedia.org/wiki/File:Gloucester_Road_-_Spider-Man_(2539882747).jpg) | GB | 586×768 | 610×800 | 305×400 | 610×800 | 610×800 |
| [fr-spider-hospital](https://commons.wikimedia.org/wiki/File:Rope_Access_SpiderMan_on_a_child_hospital_in_Northern_France.jpg) | FR | 768×576 | 4032×3024 | 708×531 | 1920×1440 | 1280×960 |
| [ca-deadpool-maid](https://commons.wikimedia.org/wiki/File:Montreal_Comiccon_2016_-_Maid_Deadpool_and_his_new_unicorn_buddy_(27633930493).jpg) | CA | 452×768 | 2513×4272 | 371×630 | 753×1280 | 753×1280 |
| [id-spider-vegetables](https://suaraindonesia.co.id/news/news/67ad8c369d7ba/Kenakan-Kostum-Spider-Man-Cara-Unik-Penjual-Sayur-Keliling-di-Banyuwangi-Gaet-Pelanggan) | ID | 750×440 | 750×440 | 375×220 | 750×440 | 750×440 |
| [hn-spider-graduate](https://www.tunota.com/honduras-hoy/spiderman-graduado-unah-psicologia-2023-11-28) | HN | 768×432 | 1280×720 | 640×360 | 1280×720 | 1280×720 |
| [co-spider-handstand](https://www.publimetro.co/entretenimiento/2022/10/05/la-policia-capturo-al-hombre-arana-en-el-metro-medellin-y-revelo-su-identidad/) | CO | 768×432 | 1200×675 | 600×338 | 1200×675 | 1200×675 |
| [cu-spider-nerf](https://www.dvidshub.net/image/2433478/residents-embrace) | CU | 768×510 | 1999×1328 | 708×471 | 1920×1276 | 1280×850 |
| [fr-deadpool-sailor](https://commons.wikimedia.org/wiki/File:Cosplay_of_female_Deadpool_at_Japan_Expo_2016_(29105603664).jpg) | FR | 432×768 | 3376×6001 | 354×630 | 720×1280 | 720×1280 |
| [fr-deadpool-2019](https://commons.wikimedia.org/wiki/File:Cosplay_of_Deadpool_at_Japan_Expo_2019_(48381081197).jpg) | FR | 459×768 | 3269×5472 | 376×630 | 764×1280 | 764×1280 |
| [jp-deadpool-market](https://commons.wikimedia.org/wiki/File:Comic_Market_96_Day_2_Cosplayers_(48600288981).jpg) | JP | 512×768 | 4000×6000 | 420×630 | 853×1280 | 853×1280 |
| [jp-spider-crossing](https://commons.wikimedia.org/wiki/File:Shibuya_Crossing_(53083700164).jpg) | JP | 512×768 | 4000×6000 | 420×630 | 853×1280 | 853×1280 |
| [sv-stan-spider](https://commons.wikimedia.org/wiki/File:Cosplay_Stan_Lee.jpg) | SV | 432×768 | 2592×4608 | 354×630 | 720×1280 | 720×1280 |
| [il-spider-purim](https://commons.wikimedia.org/wiki/File:Purim_2018_(25749998627).jpg) | IL | 512×768 | 2146×3219 | 420×630 | 853×1280 | 853×1280 |
| [es-spider-plaza](https://commons.wikimedia.org/wiki/File:Cosplayer_de_Spider-Man_en_la_Plaza_Mayor_de_Madrid.jpg) | ES | 539×768 | 2418×3446 | 442×630 | 898×1280 | 898×1280 |
| [es-spider-smoking](https://commons.wikimedia.org/wiki/File:Fat_Spider-Man.jpg) | ES | 502×768 | 2258×3454 | 412×630 | 837×1280 | 837×1280 |
| [in-spider-hood](https://www.hindustantimes.com/trending/spider-man-rides-on-car-bonnet-in-delhi-police-book-him-for-violating-traffic-101721815820089.html) | IN | 768×432 | 1600×900 | 708×398 | 1600×900 | 1280×720 |
| [pe-spider-yoyo](https://trome.com/actualidad/spiderman-mi-superheroe-me-ayuda-a-llevar-dinero-a-casa-y-pagar-estudios-de-mis-hijos-dice-hombre-arana-peruano-spiderman-en-lima-alegria-a-ninos-y-lanza-yo-yo-foto-video-noticia/) | PE | 768×510 | 1153×765 | 576×382 | 1153×765 | 1153×765 |
| [ca-spider-hawaiian](https://commons.wikimedia.org/wiki/File:Montreal_Comiccon_2015_-_Hawaiian_Spider-Man_(18855860674).jpg) | CA | 512×768 | 2848×4272 | 420×630 | 853×1280 | 853×1280 |
| [ca-miku-maid](https://commons.wikimedia.org/wiki/File:Montreal_Comiccon_2016_-_Daredevil_as_Hatsune_Miku_and_Maid_Spider-Man_(28181536851).jpg) | CA | 512×768 | 2848×4272 | 420×630 | 853×1280 | 853×1280 |
| [ca-deadpool-redhood](https://commons.wikimedia.org/wiki/File:Montreal_Comiccon_2015_-_Little_Red_Riding_Deadpool_and_Spider-Man_(19292146559).jpg) | CA | 512×768 | 2848×4272 | 420×630 | 853×1280 | 853×1280 |
| [ca-deadpool-brainslug](https://commons.wikimedia.org/wiki/File:Montreal_Comiccon_2015_-_Brainslugged_Deadpool_(19432425756).jpg) | CA | 512×768 | 2848×4272 | 420×630 | 853×1280 | 853×1280 |
| [ca-deadpool-chicken](https://commons.wikimedia.org/wiki/File:Montreal_Comiccon_2016_-_Deadpool_and_his_chicken_buddy_(27633865783).jpg) | CA | 512×768 | 2848×4272 | 420×630 | 853×1280 | 853×1280 |
| [ca-photobomb-pileup](https://commons.wikimedia.org/wiki/File:Montreal_Comiccon_2015-_Photobomb_pileup,_part_5_(18835967574).jpg) | CA | 768×512 | 4272×2848 | 708×472 | 1920×1280 | 1280×853 |
| [us-deadpool-pope](https://commons.wikimedia.org/wiki/File:NYCC_2016_Cosplay_of_Pope_Deadpool.jpg) | US | 576×768 | 2448×3264 | 473×630 | 960×1280 | 960×1280 |
| [us-deadpool-lego](https://commons.wikimedia.org/wiki/File:Big_Apple_Comic_Con_2016_-_Lego_Deadpool.jpg) | US | 768×595 | 934×724 | 467×362 | 934×724 | 934×724 |
| [us-spider-frog](https://commons.wikimedia.org/wiki/File:SDCC_15_-_Spider-Frog_(19652841226).jpg) | US | 768×512 | 5184×3456 | 708×472 | 1920×1280 | 1280×853 |
| [ca-deadpool-lantern](https://commons.wikimedia.org/wiki/File:Green_Lantern_Deadpool_Cosplay_Fan_Expo_Canada_2012.jpg) | CA | 768×512 | 2048×1365 | 708×472 | 1920×1280 | 1280×853 |
| [us-spider-thor](https://commons.wikimedia.org/wiki/File:Captain_America_and_Spider_Thor%3F_C2E2_2014_(14254757313).jpg) | US | 614×768 | 2454×3068 | 504×630 | 1024×1280 | 1024×1280 |
| [us-deadtrooper](https://commons.wikimedia.org/wiki/File:SWCA_-_Deadtrooper_(16580465874).jpg) | US | 768×512 | 5184×3456 | 708×472 | 1920×1280 | 1280×853 |
| [us-captain-spider](https://commons.wikimedia.org/wiki/File:C2E2_2015_-_Captain_Spider-Man_(17118870150).jpg) | US | 594×768 | 2441×3158 | 487×630 | 989×1280 | 989×1280 |
| [us-deadpool-elsa](https://commons.wikimedia.org/wiki/File:C2E2_(Day_2)_2014,_Superior_Spider-Man_and_Deadpool_as_Elsa.jpg) | US | 576×768 | 3000×4000 | 473×630 | 960×1280 | 960×1280 |
| [gb-deadpool-captain](https://commons.wikimedia.org/wiki/File:London_Comic_Con_2015_-_Deadpool_(17435591233).jpg) | GB | 511×768 | 2077×3121 | 419×630 | 852×1280 | 852×1280 |
| [gb-deadpool-sombrero](https://commons.wikimedia.org/wiki/File:MCM_London_May_15_-_Sombrero_Deadpool_(18241070682).jpg) | GB | 768×549 | 4147×2962 | 708×506 | 1920×1371 | 1280×914 |
| [gb-deadpool-wedding](https://commons.wikimedia.org/wiki/File:MCM_London_May_15_-_Deadpools_(18218154216).jpg) | GB | 768×512 | 5184×3456 | 708×472 | 1920×1280 | 1280×853 |
| [gb-deadpool-kimono](https://commons.wikimedia.org/wiki/File:MCM_London_May_2015_-_Deadpool_(17417809783).jpg) | GB | 509×768 | 1356×2047 | 417×630 | 848×1280 | 848×1280 |
| [gb-deadpool-maid](https://commons.wikimedia.org/wiki/File:At_your_service_(34671100260).jpg) | GB | 768×512 | 5388×3592 | 708×472 | 1920×1280 | 1280×853 |
| [gb-pikachu-thor](https://commons.wikimedia.org/wiki/File:MCM_London_May_2015_-_Pikachu_Thor_(18011811396).jpg) | GB | 768×509 | 2047×1356 | 708×469 | 1920×1272 | 1280×848 |
| [gb-thor-bike](https://commons.wikimedia.org/wiki/File:London_Comic_Con_2015_-_Thor_on_a_bike_(17868517180).jpg) | GB | 640×426 | 4274×2845 | 708×471 | 1920×1278 | 1280×852 |
| [be-deadpool-hood](https://commons.wikimedia.org/wiki/File:Cosplay_of_Deadpool_at_Brussels_Comic_Con_2022_(51968415859).jpg) | BE | 327×768 | 2265×5314 | 269×630 | 545×1280 | 545×1280 |
| [be-captain-wolverine](https://commons.wikimedia.org/wiki/File:Cosplay_mash-up_of_Captain_America_and_Wolverine_at_Made_in_Asia_2022_(52117205294).jpg) | BE | 423×768 | 2730×4958 | 347×630 | 705×1280 | 705×1280 |
| [be-captain-fett](https://commons.wikimedia.org/wiki/File:Captain_Fett_aka_Captain_America_and_Mandalorian_Cosplay_mash-up_at_Comiccon_Brussels_2023.jpg) | BE | 502×768 | 3782×5791 | 411×630 | 836×1280 | 836×1280 |
| [fr-pikachu-captain](https://commons.wikimedia.org/wiki/File:2022-07-16_10-21-36_ILCE-7C_DSCCR0302_DxO_(52413392884).jpg) | FR | 401×768 | 2934×5616 | 329×630 | 669×1280 | 669×1280 |

Las cuatro revisiones recorren todas las fotos: escritorio DPR1 5.972.922 bytes; escritorio DPR2 13.809.298; móvil DPR1 3.923.558; móvil DPR2 10.921.734. Son sumas de recorrer el catálogo completo, no carga inicial. La entrada del tracker tiene cero solicitudes de fotos/catálogos.

## Resultado público

Verificación del 11 de octubre: todas las 171 variantes públicas coinciden con los bytes locales; las 61 fotos pasan medición de píxeles en las cuatro configuraciones. Chrome verifica guía 7→8→fin, tracker inicial/recarga, navegación explícita, progreso y mapa original. Supabase devuelve 61 agregados exactos y Chrome compara 48 tarjetas reales incluida recarga, con escrituras bloqueadas. Las capturas del ensayo de calidad bloquean servicios externos para medir de forma reproducible; mensajes de estadísticas no disponibles en esas capturas pertenecen al ensayo, mientras la prueba separada de Supabase real pasó.
