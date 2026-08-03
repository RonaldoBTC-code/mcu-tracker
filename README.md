# MCU Tracker — Rumbo a Doomsday

Rastreador del Universo Cinematográfico de Marvel en orden cronológico, con progreso sincronizado y disponibilidad por plataforma en Ecuador.

Proyecto de fan, no oficial. Sin relación con Marvel Studios ni con The Walt Disney Company.

## Qué hace

- **53 títulos** organizados en 6 fases, más el universo extendido
- **Marca lo que ya viste** y calcula tu progreso hacia *Avengers: Doomsday*
- **Progreso en la nube** — inicia sesión con tu correo y no lo pierdes al cambiar de dispositivo
- **Dónde ver cada título** — si está incluido en tu suscripción o si toca alquilarlo, con enlace oficial
- **Funciona sin cuenta** — sin sesión guarda en el navegador, como siempre

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | HTML, CSS y JavaScript sin framework |
| Base de datos | Supabase (PostgreSQL + Row Level Security) |
| Autenticación | Supabase Auth, enlace mágico por correo |
| Disponibilidad | API de TMDB (datos de JustWatch) |

Sin proceso de build. Un solo archivo, desplegable en cualquier hosting estático.

## Decisiones técnicas

**Local primero.** El tracker funciona completo sin cuenta. La sesión es opcional y solo agrega sincronización — nadie queda fuera por no registrarse.

**Unión al iniciar sesión.** Si marcaste títulos antes de registrarte, se conservan: al entrar se hace la unión entre lo local y lo de la nube. Es el fallo clásico de las apps con sincronización, y aquí está resuelto.

**Carga perezosa de proveedores.** 53 títulos de golpe serían 106 peticiones a TMDB. En su lugar: `IntersectionObserver`, máximo 4 peticiones concurrentes y caché de 7 días en el navegador. Solo se consulta lo que el usuario ve.

**Escritura con retardo.** Los cambios se agrupan con 700 ms de espera antes de escribir en la base, para no generar una petición por clic.

**RLS activo.** La llave pública de Supabase está expuesta por diseño; lo que protege los datos son las políticas de fila. Cada usuario solo lee y escribe la suya.

## Ejecutar en local

```bash
git clone https://github.com/RonaldoBTC-code/mcu-tracker.git
cd mcu-tracker
python -m http.server 8000
```

Las credenciales van en la constante `CFG` al inicio del bloque `<script>`. Ver `SETUP.md`.

## Créditos

Datos de disponibilidad por [TMDB](https://www.themoviedb.org/) y [JustWatch](https://www.justwatch.com/). Este producto usa la API de TMDB, pero no está avalado ni certificado por TMDB.

Este sitio no aloja ni reproduce contenido audiovisual. Enlaza únicamente a plataformas oficiales.

## Licencia

MIT
