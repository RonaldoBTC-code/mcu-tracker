# Rumbo a Doomsday — MCU Watch Tracker

Rastreador para ver el Universo Marvel en orden cronológico antes de
**Avengers: Doomsday** (18 de diciembre de 2026).

**En vivo:** https://ronaldobtc-code.github.io/mcu-tracker/

Proyecto de fan, sin relación con Marvel Studios ni The Walt Disney Company.

---

## Qué hace

- **89 títulos** en orden cronológico: las 6 fases del MCU, el universo
  extendido y una sección X-Men para maratón.
- **Tres niveles de importancia** según lo que hace falta para entender
  Doomsday: Esencial (30), Importante (16), Complementaria (43).
  La clasificación se basa en el reparto confirmado de la película,
  no en opinión.
- **Dónde ver cada título** en tu país, vía TMDB/JustWatch, con modo
  Global para ver la disponibilidad en todo el mundo.
- **Progreso en la nube** con enlace por correo, sin contraseña.
- **Puntuaciones** de 1 a 5 con media de la comunidad.
- **Mapa mundial** con la actividad por países y un mapa con zoom
  a nivel de calle con 29 escenarios de rodaje y de la historia.
- **Seis idiomas**: español, inglés, portugués, ruso, francés y alemán.
  Los títulos de las películas también se traducen.
- **Ambiente por película**: al seleccionar una, la página adopta sus
  colores y su imagen de fondo.
- **Guía de uso** integrada, que se abre en la primera visita.

## Cómo está hecho

Un solo archivo `index.html` sin framework ni proceso de compilación.

| Pieza | Para qué |
|---|---|
| HTML, CSS y JS a mano | Toda la interfaz |
| [Supabase](https://supabase.com) | Sesión, progreso, reseñas y analítica |
| [TMDB](https://www.themoviedb.org) | Plataformas, imágenes y títulos localizados |
| [MapLibre](https://maplibre.org) + [OpenFreeMap](https://openfreemap.org) | Mapa con zoom |
| [Wikimedia](https://commons.wikimedia.org) | Fotos de los escenarios |
| GitHub Pages | Alojamiento |

La identidad de cada título es un **id numérico estable**, no su nombre.
Por eso se puede cambiar de idioma sin perder el progreso.

## Estructura

```
index.html              Rastreador, autenticación y mapa
scripts/meme-feed.js     Feed vertical e interacciones compartidas
supabase/migrations/    Esquema versionado: tablas, RLS y funciones
SETUP.md                Cómo levantarlo desde cero
```

## Base de datos

Seis migraciones en `supabase/migrations/`, aplicadas en orden
alfabético. Se despliegan solas al hacer push a `main` mediante la
integración de GitHub de Supabase.

| Tabla | Contenido | Acceso |
|---|---|---|
| `mcu_progress` | Qué vio cada usuario | Privado, por RLS |
| `reviews` | Puntuaciones | Privado, por RLS |
| `site_visits` | Visitas por día y país | Lectura pública |
| `meme_data.catalogue / likes / views` | Fotos aprobadas e interacciones | Privado; RPCs con autenticación para escribir |

Los agregados públicos salen de funciones (`get_review_stats`,
`get_country_activity`) que solo devuelven promedios y conteos, nunca
filas individuales.

**La analítica no guarda IP ni identifica a nadie:** una visita por
persona y día, agrupada por país.

## Legal

- No aloja ni reproduce películas, y solo enlaza a plataformas oficiales.
- Los datos de disponibilidad provienen de TMDB. Este producto usa la API
  de TMDB, pero no está avalado ni certificado por TMDB.
- Las fotos de los escenarios son de Wikimedia Commons, con atribución.
- Títulos, fechas y lugares de rodaje son información factual de dominio
  público.

## Licencia

MIT — ver [LICENSE](LICENSE).

## Correcciones de entrada y pruebas

La revisión del 2 de octubre de 2026 corrige el arranque con almacenamiento corrupto o bloqueado, las estrellas de la primera carga, las secciones colapsables, el foco y Escape de la guía, el enlace de acceso y errores de sincronización al cambiar de cuenta. El catálogo sigue disponible si falla la nube.

Consultar [correcciones y límites](docs/entry-fixes.md), [resultados de regresión](docs/entry-fixes-results.json) y [AGENTS.md](AGENTS.md). Con Node.js 24 o posterior: `npm ci --ignore-scripts` y `npm test`. Estas pruebas no envían correos ni escriben datos reales. La validación de OTP real y navegador móvil/WebGL sigue pendiente.

## Descubrimiento Marvel

La portada incluye un feed vertical con país detectado/selector, imágenes progresivas y fin real. Hay 54 fotos geográficas únicas en 22 países; CA/US alcanzan el mínimo explícito de diez. Faltan 456 fotos en los otros 49 países. [Cobertura](docs/country-coverage.md) y [auditoría](docs/memes-audit.md).

[Me gusta y vistas compartidas](docs/meme-feed.md) tienen frontend, migración aditiva y pruebas SQL/DOM. La lectura real posterior al despliegue comprobó los 54 IDs, incluidos los 14 nuevos. Las escrituras autenticadas y su persistencia real siguen pendientes de validación. Las vistas de memes identifican cuentas autenticadas para deduplicar: una cuenta/foto de por vida; esto es distinto de site_visits. Sin backend no se muestran cifras inventadas.

Requisito de memes: sección propia con mapa visible y múltiples tarjetas por país, mínimo diez fotos distintas por cada uno de los 51 países. El feed no tiene un límite de cuatro: ese valor es el lote de carga progresiva. Estado actual: 54 fotos, CA/US con diez, 49 países y 456 fotos por completar. [Conteos y faltantes](docs/country-coverage.md).
