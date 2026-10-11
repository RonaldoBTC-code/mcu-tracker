# Corrección de ubicación del mapa

Instrucción del usuario, 11 de octubre de 2026: «el mapa no debe mostrarse en el principal, ese mapa nuevo borrarlo y debes dejar solo el que estaba en su lado». Sustituye el requisito anterior de mapa visible en la portada.

Se eliminan #feedMap, #feedMapCaption, su panel, estilos, generador WorldMap.discoveryMap y eventos exclusivos. El mapa original, accesible desde #mapOpen y contenido en #mapwrap, conserva su código, pestañas, controles y mapa #memeMap. La sección de memes mantiene selector de los 51 países, múltiples tarjetas, scroll progresivo, imágenes diferidas, likes y vistas. No agregar otro mapa al principal.

Preparado, integrado y publicado: PR #9, commit c776829e1adc04fb4ae973a32c91c36763c90f45. Pages workflow 38150741122 terminó con éxito. La comprobación de bytes acreditó 107 archivos públicos idénticos. Chrome sobre Pages pasó en 1280×900 y 390×844: ausencia de mapa en el feed, mapa original, 51 países, 54 fotos y guía 7→8→fin. Evidencias de esta publicación en docs/history/pr9-*.json.

Cobertura editorial sin cambios: 54 fotos en 22 países; CA/US tienen diez. Faltan 456 en 49 países; 29 vacíos. complete:false. Persisten 18 licencias no acreditadas y la validación de escrituras/persistencia autenticada en producción.
