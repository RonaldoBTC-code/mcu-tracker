-- Progreso del tracker: que titulos vio cada usuario.
create table if not exists public.mcu_progress (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  watched    text[] not null default '{}',
  updated_at timestamptz not null default now()
);

alter table public.mcu_progress enable row level security;

drop policy if exists "leer lo propio"       on public.mcu_progress;
drop policy if exists "insertar lo propio"   on public.mcu_progress;
drop policy if exists "actualizar lo propio" on public.mcu_progress;

create policy "leer lo propio"
  on public.mcu_progress for select
  using (auth.uid() = user_id);

create policy "insertar lo propio"
  on public.mcu_progress for insert
  with check (auth.uid() = user_id);

create policy "actualizar lo propio"
  on public.mcu_progress for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
