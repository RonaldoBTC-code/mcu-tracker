-- PREPARED, NOT DEPLOYED: confirm get_meme_stats for both IDs before publication.
-- Add identities only; preserve existing likes, views, policies and grants.
begin;
insert into meme_data.catalogue(id) values
('ec-spider-bin'),
('mx-spider-errands')
on conflict(id) do nothing;
notify pgrst,'reload schema';
commit;
