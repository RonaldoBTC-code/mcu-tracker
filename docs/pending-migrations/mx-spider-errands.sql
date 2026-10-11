begin;
insert into meme_data.catalogue(id) values ('mx-spider-errands') on conflict(id) do nothing;
notify pgrst,'reload schema';
commit;
