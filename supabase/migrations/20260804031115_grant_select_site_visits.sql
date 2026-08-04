-- Crear una tabla por SQL activa la RLS pero NO concede el permiso base.
-- Sin estos grants la API devuelve 401 aunque la politica diga "todos pueden leer".
grant select on table public.site_visits to anon, authenticated;
grant select, insert, update, delete on table public.reviews to authenticated;
grant select, insert, update on table public.mcu_progress to authenticated;
