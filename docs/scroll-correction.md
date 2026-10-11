# Corrección de carga progresiva

El Chrome de lectura con get_meme_stats real detectó que CA no completaba sus diez tarjetas dentro de veinte segundos. La colección JSON sí contiene diez; el observador del sentinel solo recibe transiciones de intersección. El anclaje del scroll puede mantenerlo intersectando al añadir un lote, sin generar la transición necesaria para el siguiente.

append desobserva el sentinel antes de insertar el lote y lo vuelve a observar en requestAnimationFrame si todavía quedan fotos y la vista/generación siguen activas. Mantiene lotes de cuatro, carga diferida y cancelación; no descarga otros países. Cerrar o cambiar de país invalida el frame pendiente.

Regresión DOM: comprobar rearmado después del lote, fin real, cierre y cambio de país. Chrome local con backend real completó EC1, BR3, US10, CA10, GB10, BE6, FR4 y recarga FR4; 48 contadores coinciden y todas las escrituras están bloqueadas. El harness tiene límite de veinte segundos para convertir un bloqueo en FAIL explícito.

Estado: corrección local probada; publicación pública pendiente. No modifica la cantidad de fotos de Ecuador: EC tiene una, faltan nueve.
