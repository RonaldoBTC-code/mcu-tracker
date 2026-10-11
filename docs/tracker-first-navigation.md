# Tracker como inicio obligatorio

Instrucción del usuario: «no quiero eso en el inicio, en el inicio siempre será el tracker». Sustituye cualquier requisito anterior de poner el feed en la landing.

#trackerView contiene estadísticas, progreso, filtros, búsqueda y películas. Se renderiza visible desde el HTML. #memeFeed está después, con hidden, y se abre únicamente al pulsar Memes (#feedOpen). Volver al tracker (#feedClose) restaura foco y scroll. La guía vuelve al tracker antes de destacar destinos. Preferencias de país y progreso se conservan; ninguna preferencia, hash o recarga abre Memes. No se solicita su catálogo ni imágenes mientras no se abra. Cerrar cancela temporizadores y peticiones del feed; no registra una vista por contenido oculto.

El mapa original conserva código, ubicación y navegación; no existe mapa nuevo en el feed o principal. Las colecciones, likes y vistas no se borran por esta corrección. Inventario publicado previo: 65 fotos, EC una; faltan nueve en Ecuador y 445 en total.

Estado preparado localmente; integración y publicación requieren commit, workflow y pruebas públicas nuevas. Leer docs/image-disposition.md para los descartes concretos.
