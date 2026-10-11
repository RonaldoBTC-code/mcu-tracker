-- Additive migration. Browser clients never receive table privileges or editable totals.
begin;
create schema meme_data;
revoke all on schema meme_data from public;
grant usage on schema meme_data to anon, authenticated;
create type meme_data.totals as (meme_id text,likes_count bigint,views_count bigint,liked boolean,seen boolean);
create table meme_data.catalogue (id text primary key check(id ~ '^[a-z0-9-]+$'), active boolean not null default true);
create table meme_data.likes (
  user_id uuid not null references auth.users(id) on delete cascade,
  meme_id text not null references meme_data.catalogue(id),
  created_at timestamptz not null default now(), primary key(user_id,meme_id)
);
create table meme_data.views (
  user_id uuid not null references auth.users(id) on delete cascade,
  meme_id text not null references meme_data.catalogue(id),
  created_at timestamptz not null default now(), primary key(user_id,meme_id)
);
create index likes_by_meme on meme_data.likes(meme_id);
create index views_by_meme on meme_data.views(meme_id);
alter table meme_data.catalogue enable row level security;
alter table meme_data.likes enable row level security;
alter table meme_data.views enable row level security;
revoke all on all tables in schema meme_data from public,anon,authenticated;
-- CATALOGUE_IDS: maintained from the reviewed, published collection.
insert into meme_data.catalogue(id) values
('br-spider-circle-sp'),
('br-spider-circle-bh'),
('br-spider-embrace'),
('ec-spider-bus'),
('mx-spider-class'),
('pe-spider-dance-bus'),
('th-spider-student'),
('th-spider-yogurt'),
('th-spider-vegetables'),
('ph-spider-commute'),
('ph-spider-dragon'),
('us-iron-board'),
('us-captain-dorito'),
('us-deadpool-iron'),
('ca-iron-pikachu'),
('gb-iron-buzz'),
('be-deadpool-throne'),
('be-deadpool-duff'),
('be-deadpool-spider'),
('ca-iron-fanexpo'),
('gb-deadpools-throne'),
('gb-spider-tube'),
('fr-spider-hospital'),
('ca-deadpool-maid'),
('id-spider-vegetables'),
('hn-spider-graduate'),
('co-spider-handstand'),
('cl-spider-cueca'),
('cu-spider-nerf'),
('fr-deadpool-sailor'),
('fr-deadpool-2019'),
('jp-deadpool-market'),
('jp-spider-crossing'),
('sv-stan-spider'),
('il-spider-purim'),
('es-spider-plaza'),
('es-spider-smoking'),
('at-spider-dance'),
('in-spider-hood'),
('pe-spider-yoyo');
create function meme_data.stats(p_ids text[]) returns setof meme_data.totals
language plpgsql security definer set search_path='' as $$
begin
  if p_ids is null or cardinality(p_ids)>50 or array_position(p_ids,null) is not null then raise exception 'Invalid meme list' using errcode='22023';end if;
  if exists(select 1 from unnest(p_ids) as i(id) where not exists(select 1 from meme_data.catalogue c where c.id=i.id and c.active)) then raise exception 'Unknown meme' using errcode='22023';end if;
  return query select c.id,
    (select count(*) from meme_data.likes l where l.meme_id=c.id),
    (select count(*) from meme_data.views v where v.meme_id=c.id),
    exists(select 1 from meme_data.likes l where l.meme_id=c.id and l.user_id=auth.uid()),
    exists(select 1 from meme_data.views v where v.meme_id=c.id and v.user_id=auth.uid())
    from meme_data.catalogue c where c.active and c.id=any(p_ids);
end $$;
create function meme_data.set_like(p_id text,p_liked boolean) returns setof meme_data.totals
language plpgsql security definer set search_path='' as $$
declare owner_id uuid:=auth.uid();
begin
  if owner_id is null then raise exception 'Authentication required' using errcode='42501';end if;
  if p_liked is null or not exists(select 1 from meme_data.catalogue where id=p_id and active) then raise exception 'Unknown meme' using errcode='22023';end if;
  -- Desired state, not a toggle: retries and concurrent duplicate requests are idempotent.
  if p_liked then insert into meme_data.likes(user_id,meme_id) values(owner_id,p_id) on conflict do nothing;
  else delete from meme_data.likes where user_id=owner_id and meme_id=p_id;end if;
  return query select * from meme_data.stats(array[p_id]);
end $$;
create function meme_data.record_views(p_ids text[]) returns setof meme_data.totals
language plpgsql security definer set search_path='' as $$
declare owner_id uuid:=auth.uid();
begin
  if owner_id is null then raise exception 'Authentication required' using errcode='42501';end if;
  if p_ids is null or cardinality(p_ids)>10 or array_position(p_ids,null) is not null then raise exception 'Invalid view batch' using errcode='22023';end if;
  if exists(select 1 from unnest(p_ids) as i(id) where not exists(select 1 from meme_data.catalogue c where c.id=i.id and c.active)) then raise exception 'Unknown meme' using errcode='22023';end if;
  insert into meme_data.views(user_id,meme_id) select owner_id,id from unnest(p_ids) as i(id) on conflict do nothing;
  return query select * from meme_data.stats(p_ids);
end $$;
-- Expose invoker wrappers only. The definer implementations stay outside exposed schemas.
create function public.get_meme_stats(p_ids text[]) returns setof meme_data.totals
language sql security invoker set search_path='' as $$ select * from meme_data.stats(p_ids) $$;
create function public.set_meme_like(p_id text,p_liked boolean) returns setof meme_data.totals
language sql security invoker set search_path='' as $$ select * from meme_data.set_like(p_id,p_liked) $$;
create function public.record_meme_views(p_ids text[]) returns setof meme_data.totals
language sql security invoker set search_path='' as $$ select * from meme_data.record_views(p_ids) $$;
revoke all on function meme_data.stats(text[]),meme_data.set_like(text,boolean),meme_data.record_views(text[]) from public,anon,authenticated;
grant execute on function meme_data.stats(text[]) to anon,authenticated;
grant execute on function meme_data.set_like(text,boolean),meme_data.record_views(text[]) to authenticated;
revoke all on function public.get_meme_stats(text[]),public.set_meme_like(text,boolean),public.record_meme_views(text[]) from public,anon,authenticated;
grant execute on function public.get_meme_stats(text[]) to anon,authenticated;
grant execute on function public.set_meme_like(text,boolean),public.record_meme_views(text[]) to authenticated;
notify pgrst,'reload schema';
commit;
