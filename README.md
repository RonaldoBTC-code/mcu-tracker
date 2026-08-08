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
index.html              Toda la aplicación
supabase/migrations/    Esquema versionado: tablas, RLS y funciones
SETUP.md                Cómo levantarlo desde cero
```

## Base de datos

Cuatro migraciones en `supabase/migrations/`, aplicadas en orden
alfabético. Se despliegan solas al hacer push a `main` mediante la
integración de GitHub de Supabase.

| Tabla | Contenido | Acceso |
|---|---|---|
| `mcu_progress` | Qué vio cada usuario | Privado, por RLS |
| `reviews` | Puntuaciones | Privado, por RLS |
| `site_visits` | Visitas por día y país | Lectura pública |

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
