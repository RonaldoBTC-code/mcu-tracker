-- Los agregados publicos pasan de vistas a funciones acotadas.
-- Motivo: una vista con security definer salta la RLS de quien consulta;
-- el linter de Supabase lo marca como error. Las funciones solo devuelven
-- promedios y conteos, nunca user_id ni filas individuales.
drop view if exists public.review_stats;
drop view if exists public.country_activity;

create or replace function public.get_review_stats()
returns table (title text, avg_rating numeric, votes int)
language sql
security definer
set search_path = public
stable
as $$
  select r.title, round(avg(r.rating)::numeric, 2), count(*)::int
  from public.reviews r
  group by r.title;
$$;

create or replace function public.get_country_activity()
returns table (country text, reviews int, avg_rating numeric)
language sql
security definer
set search_path = public
stable
as $$
  select r.country, count(*)::int, round(avg(r.rating)::numeric, 2)
  from public.reviews r
  where r.country is not null
  group by r.country;
$$;

revoke all on function public.get_review_stats() from public;
revoke all on function public.get_country_activity() from public;
grant execute on function public.get_review_stats() to anon, authenticated;
grant execute on function public.get_country_activity() to anon, authenticated;
