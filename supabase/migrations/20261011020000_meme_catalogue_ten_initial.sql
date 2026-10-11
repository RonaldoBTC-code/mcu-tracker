-- Additional reviewed stable IDs; existing interactions and catalogue rows remain intact.
begin;
insert into meme_data.catalogue (id,active) values
  ('ca-spider-hawaiian',true),
  ('ca-miku-maid',true),
  ('ca-deadpool-redhood',true),
  ('ca-deadpool-brainslug',true),
  ('ca-deadpool-chicken',true),
  ('ca-photobomb-pileup',true),
  ('us-deadpool-pope',true),
  ('us-deadpool-lego',true),
  ('us-spider-frog',true),
  ('ca-deadpool-lantern',true),
  ('us-spider-thor',true),
  ('us-deadtrooper',true),
  ('us-captain-spider',true),
  ('us-deadpool-elsa',true)
on conflict (id) do nothing;
notify pgrst, 'reload schema';
commit;
