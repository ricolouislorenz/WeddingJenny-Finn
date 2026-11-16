-- Beispieldaten: 35 Gäste (22 Rückmeldungen, 31 Personen kommen, 4 Absagen)
-- Zum Testen des Admin-Bereichs. Im Supabase-Dashboard unter "SQL Editor" ausführen.
-- Wieder entfernen: den Block "Aufräumen" ganz unten ausführen.

insert into public.rsvps (name, attending, menu, allergies, wish, companions, message, created_at, updated_at)
select name, attending, menu, allergies, wish, companions::jsonb, message, now() - age, now() - age
from (values
  ('Anna Becker', true, 'vegetarisch', '', '',
   '[{"name":"Lukas Becker","menu":"carnivor","allergies":"","wish":""}]',
   'Wir freuen uns riesig auf euren Tag!', interval '41 days'),
  ('Thomas Wagner', true, 'carnivor', '', '',
   '[{"name":"Sabine Wagner","menu":"pescetarisch","allergies":"Haselnüsse, Walnüsse","wish":""},{"name":"Mia Wagner","menu":"vegetarisch","allergies":"","wish":"Kinderportion (7 Jahre)"}]',
   'Mia übt schon fleißig Blumen streuen 🌸', interval '39 days'),
  ('Lea Hoffmann', true, 'vegan', '', '', '[]', '', interval '37 days'),
  ('Jonas Schulz', true, 'carnivor', '', '',
   '[{"name":"Marie Klein","menu":"vegetarisch","allergies":"Laktose","wish":""}]',
   'Können wir irgendwo beim Aufbau helfen? Meldet euch gern!', interval '35 days'),
  ('Peter Fischer', true, 'carnivor', '', '',
   '[{"name":"Monika Fischer","menu":"pescetarisch","allergies":"","wish":""}]',
   '', interval '33 days'),
  ('Julia Weber', true, 'pescetarisch', 'Gluten (Zöliakie)', '', '[]',
   'Danke für die Einladung – ich bin so gerührt!', interval '30 days'),
  ('Max Meyer', true, 'carnivor', '', '',
   '[{"name":"Sophie Meyer","menu":"carnivor","allergies":"","wish":""},{"name":"Paul Meyer","menu":"vegetarisch","allergies":"","wish":"Kinderteller, gern ohne Soße"}]',
   '', interval '28 days'),
  ('Laura Schneider', true, 'vegetarisch', '', '', '[]', 'Ich bringe gute Laune und Taschentücher mit.', interval '27 days'),
  ('Felix Wolf', true, 'vegan', '', '',
   '[{"name":"Hannah Wolf","menu":"vegan","allergies":"","wish":""}]',
   '', interval '25 days'),
  ('Katharina Neumann', true, 'carnivor', '', '',
   '[{"name":"Daniel Krüger","menu":"carnivor","allergies":"Sellerie","wish":""}]',
   'Wir sind dabei und tanzen bis zum Schluss!', interval '22 days'),
  ('Ingrid Lorenz', true, 'pescetarisch', '', 'Bitte ohne Knoblauch',
   '[{"name":"Werner Lorenz","menu":"carnivor","allergies":"","wish":""}]',
   'Wir freuen uns sehr, euch beide so glücklich zu sehen.', interval '20 days'),
  ('Tim Braun', true, 'carnivor', '', '', '[]', '', interval '18 days'),
  ('Nina Zimmermann', true, 'vegetarisch', '', '',
   '[{"name":"Jan Hartmann","menu":"carnivor","allergies":"","wish":""}]',
   'Gibt es einen Shuttle vom Bahnhof?', interval '16 days'),
  ('Christina Schmitt', true, 'vegetarisch', 'Erdnüsse (stark allergisch!)', '', '[]', '', interval '14 days'),
  ('Moritz Lange', true, 'carnivor', '', '',
   '[{"name":"Emma Lange","menu":"vegetarisch","allergies":"","wish":""}]',
   '', interval '11 days'),
  ('Sarah König', true, 'pescetarisch', '', '', '[]', 'Endlich! 🥂', interval '9 days'),
  ('Gisela Huber', true, 'carnivor', '', 'Möglichst leicht verdaulich', '[]',
   'Ich komme sehr gern, brauche aber einen Platz nicht zu nah an den Lautsprechern.', interval '7 days'),
  ('Niklas Koch', true, 'carnivor', '', '',
   '[{"name":"Lisa Richter","menu":"vegan","allergies":"Soja","wish":""}]',
   '', interval '4 days'),
  ('Michael Schäfer', false, null, '', '', '[]',
   'Leider sind wir an dem Wochenende im Ausland – wir feiern in Gedanken mit!', interval '36 days'),
  ('Andrea Bauer', false, null, '', '', '[]', '', interval '24 days'),
  ('Stefan Vogel', false, null, '', '', '[]', 'Alles Liebe für euch beide!', interval '12 days'),
  ('Claudia Frank', false, null, '', '', '[]', 'Ich bin leider beruflich verhindert. Feiert schön!', interval '2 days')
) as t(name, attending, menu, allergies, wish, companions, message, age)
on conflict (name_key) do nothing;

-- ---------- Aufräumen: Beispieldaten wieder löschen ----------
-- delete from public.rsvps where name in (
--   'Anna Becker', 'Thomas Wagner', 'Lea Hoffmann', 'Jonas Schulz', 'Peter Fischer', 'Julia Weber',
--   'Max Meyer', 'Laura Schneider', 'Felix Wolf', 'Katharina Neumann', 'Ingrid Lorenz', 'Tim Braun',
--   'Nina Zimmermann', 'Christina Schmitt', 'Moritz Lange', 'Sarah König', 'Gisela Huber', 'Niklas Koch',
--   'Michael Schäfer', 'Andrea Bauer', 'Stefan Vogel', 'Claudia Frank'
-- );
