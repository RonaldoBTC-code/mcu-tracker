-- PREPARED ONLY: apply to production before adding this ID to public collections.
begin;
insert into meme_data.catalogue(id) values ('ec-spider-bin') on conflict(id) do nothing;
notify pgrst,'reload schema';
commit;
