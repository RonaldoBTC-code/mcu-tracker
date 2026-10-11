# Corrección de ubicación del mapa

Instrucción del usuario, 11 de octubre de 2026: «el mapa no debe mostrarse en el principal, ese mapa nuevo borrarlo y debes dejar solo el que estaba en su lado». Sustituye el requisito anterior de mapa visible en la portada.

Se eliminan #feedMap, #feedMapCaption, su panel, estilos, generador WorldMap.discoveryMap y eventos exclusivos. El mapa original, accesible desde #mapOpen y contenido en #mapwrap, conserva su código, pestañas, controles y mapa #memeMap. La sección de memes mantiene selector de los 51 países, múltiples tarjetas, scroll progresivo, imágenes diferidas, likes y vistas. No agregar otro mapa al principal.

Estado preparado localmente. Integración y publicación se acreditarán con commit, ejecución de Pages y pruebas sobre la URL pública; los informes históricos del PR #8 no acreditan esta corrección.

Cobertura editorial sin cambios: 54 fotos en 22 países; CA/US tienen diez. Faltan 456 en 49 países; 29 vacíos. complete:false. Persisten 18 licencias no acreditadas y la validación de escrituras/persistencia autenticada en producción.
