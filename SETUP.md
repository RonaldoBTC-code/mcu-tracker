# Cómo levantarlo desde cero

Necesitas una cuenta de Supabase (gratis) y una clave de TMDB (gratis).
Nada más: no hay que instalar ni compilar.

---

## 1. Supabase

1. Crea un proyecto en [supabase.com](https://supabase.com).
2. **SQL Editor → New query**: pega los archivos de
   `supabase/migrations/` **en orden alfabético** y ejecuta cada uno.
3. **Project Settings → API Keys**: copia la clave *publishable*
   (empieza por `sb_publishable_`). Es pública por diseño; la RLS es
   la que protege los datos.
4. **Authentication → URL Configuration → Redirect URLs**: añade la URL
   donde vas a publicarlo y `http://localhost:8000`. Sin esto el enlace
   por correo no funciona.

> Nunca pongas la clave *secret* en el HTML. Si se filtra alguna vez,
> rótala desde Project Settings → API Keys.

## 2. TMDB

1. Crea una cuenta en [themoviedb.org](https://www.themoviedb.org).
2. **Settings → API** y solicita una clave. Es inmediata y gratuita.
3. Copia el **API Read Access Token** (el largo, no la API key corta).

## 3. Configurar

En `index.html`, al principio del `<script>`, rellena:

```js
const CFG = {
  SUPABASE_URL: 'https://TU-PROYECTO.supabase.co',
  SUPABASE_ANON_KEY: 'sb_publishable_...',
  TMDB_TOKEN: 'eyJ...',
  MAPTILER_KEY: 'TU_MAPTILER_KEY_OPCIONAL',
  LANG: 'es-ES'
};
```

`MAPTILER_KEY` es opcional. Sin ella el mapa usa OpenFreeMap, que no
pide clave ni tarjeta.

## 4. Publicar

Sube el repositorio a GitHub y activa **Settings → Pages → Deploy from
branch → main**. En un minuto está en línea.

## 5. Comprobar

Con Node instalado:

```bash
npm install jsdom --no-save
node _boot.js     # arranca la página y cuenta filas, fases y selectores
node _audit.js    # seguridad, datos, módulos, idiomas y accesibilidad
```

`_audit.js` acepta una ruta como argumento, así que también puedes
auditar la versión publicada tras descargarla.

## Despliegue automático de la base de datos

Si conectas el repositorio en **Supabase → Settings → Integrations →
GitHub** con el directorio de trabajo `.`, cada push a `main` aplica
las migraciones nuevas de `supabase/migrations/`.

Reglas de esa carpeta:

- Nunca edites una migración ya aplicada. Para cambiar algo, crea otra.
- El nombre debe empezar por marca de tiempo `AAAAMMDDHHMMSS_`.
- Se aplican en orden alfabético.
