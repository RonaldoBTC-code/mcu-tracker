-- Visitas agregadas por dia y pais (sin IP, sin identificar a nadie)
create table if not exists public.site_visits (
  day        date not null,
  country    text not null,
  hits       integer not null default 0,
  primary key (day, country)
);

alter table public.site_visits enable row level security;

drop policy if exists "lectura publica de visitas" on public.site_visits;
create policy "lectura publica de visitas"
  on public.site_visits for select
  using (true);

-- Incremento atomico via funcion, no insert directo
create or replace function public.track_visit(p_country text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_country is null or length(p_country) <> 2 then
    return;
  end if;
  insert into public.site_visits (day, country, hits)
  values (current_date, upper(p_country), 1)
  on conflict (day, country)
  do update set hits = public.site_visits.hits + 1;
end;
$$;

grant execute on function public.track_visit(text) to anon, authenticated;

-- Resenas por titulo
create table if not exists public.reviews (
  user_id    uuid not null references auth.users(id) on delete cascade,
  title      text not null,
  rating     smallint not null check (rating between 1 and 5),
  country    text,
  updated_at timestamptz not null default now(),
  primary key (user_id, title)
);

alter table public.reviews enable row level security;

drop policy if exists "leer resenas propias"       on public.reviews;
drop policy if exists "insertar resenas propias"   on public.reviews;
drop policy if exists "actualizar resenas propias" on public.reviews;
drop policy if exists "borrar resenas propias"     on public.reviews;

create policy "leer resenas propias"
  on public.reviews for select using (auth.uid() = user_id);
create policy "insertar resenas propias"
  on public.reviews for insert with check (auth.uid() = user_id);
create policy "actualizar resenas propias"
  on public.reviews for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "borrar resenas propias"
  on public.reviews for delete using (auth.uid() = user_id);
