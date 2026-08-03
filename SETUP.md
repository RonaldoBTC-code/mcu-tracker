# Configuración

Tres credenciales, todas gratuitas.

## 1. TMDB

1. Cuenta en `themoviedb.org`
2. Settings → API → solicitar clave (uso personal, aprobación inmediata)
3. Copiar el **API Read Access Token** — el largo que empieza con `eyJ`, no la API Key corta

## 2. Supabase

1. Proyecto gratuito en `supabase.com`
2. SQL Editor → New query → pegar `supabase-schema.sql` → Run
3. Authentication → Providers → Email: activar
4. Authentication → URL Configuration → agregar en *Redirect URLs*:
   - `http://localhost:8000`
   - `https://ronaldobtc-code.github.io/mcu-tracker/`
5. Project Settings → API → copiar `Project URL` y la llave `anon public`

## 3. Pegar en el código

En `index.html`, buscar `const CFG`:

```js
const CFG = {
  SUPABASE_URL: 'https://xxxxx.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGci...',
  TMDB_TOKEN: 'eyJhbGci...',
  REGION: 'EC',
  LANG: 'es-ES'
};
```

## 4. Probar

```bash
python -m http.server 8000
```

Verificar:

- [ ] Aparecen los chips de plataforma bajo cada título
- [ ] "Guardar en la nube" pide correo y llega el enlace
- [ ] Al entrar, el progreso previo **no se pierde**
- [ ] Marcar algo, recargar, y sigue marcado

## Sobre las credenciales en un repo público

- **Llave anon de Supabase:** pública por diseño. Lo que protege los datos es RLS.
- **Token de TMDB:** queda visible. Es de solo lectura y para un proyecto personal es aceptable. Si el tráfico crece, moverlo a una Edge Function de Supabase.
