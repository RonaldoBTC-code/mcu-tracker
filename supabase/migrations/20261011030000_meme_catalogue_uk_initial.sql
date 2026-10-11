-- Add eleven reviewed, licensed photos without changing previous IDs or interactions.
insert into meme_data.catalogue(id) values
('gb-deadpool-captain'),
('gb-deadpool-sombrero'),
('gb-deadpool-wedding'),
('gb-deadpool-kimono'),
('gb-deadpool-maid'),
('gb-pikachu-thor'),
('gb-thor-bike'),
('be-deadpool-hood'),
('be-captain-wolverine'),
('be-captain-fett'),
('fr-pikachu-captain')
on conflict (id) do nothing;
