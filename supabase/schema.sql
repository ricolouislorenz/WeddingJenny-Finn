-- Hochzeit Jenny & Finn – RSVP-Schema
-- Im Supabase-Dashboard unter "SQL Editor" einmal komplett ausführen.
--
-- Sicherheitskonzept: Die Tabelle ist für den öffentlichen (anon) Key komplett
-- gesperrt. Gäste kommen nur über die beiden RPC-Funktionen an genau EINEN
-- Datensatz – den zu ihrem Namen. Eine Gästeliste lässt sich so nicht abrufen.

create table if not exists public.rsvps (
  id          uuid primary key default gen_random_uuid(),
  name        text not null check (char_length(name) between 2 and 80),
  name_key    text not null unique,
  attending   boolean not null,
  menu        text check (menu in ('carnivor', 'pescetarisch', 'vegetarisch', 'vegan')),
  allergies   text not null default '' check (char_length(allergies) <= 500),
  wish        text not null default '' check (char_length(wish) <= 500),
  companions  jsonb not null default '[]'::jsonb check (jsonb_typeof(companions) = 'array'),
  message     text not null default '' check (char_length(message) <= 2000),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- für bestehende Datenbanken: Spalte "Essenswunsch" nachrüsten
alter table public.rsvps add column if not exists wish text not null default '' check (char_length(wish) <= 500);

alter table public.rsvps enable row level security;
-- Keine Policies => anon/authenticated haben keinen direkten Tabellenzugriff.
revoke all on public.rsvps from anon, authenticated;

-- "  Jenny   MÜLLER " -> "jenny müller"
create or replace function public.normalize_name(p text)
returns text
language sql
immutable
as $$
  select lower(regexp_replace(trim(coalesce(p, '')), '\s+', ' ', 'g'));
$$;

-- name_key immer aus dem Namen ableiten – auch wenn der Admin-Bereich einen Namen ändert
create or replace function public.rsvps_set_name_key()
returns trigger
language plpgsql
as $$
begin
  new.name_key := public.normalize_name(new.name);
  return new;
end;
$$;

drop trigger if exists rsvps_name_key on public.rsvps;
create trigger rsvps_name_key
  before insert or update of name on public.rsvps
  for each row execute function public.rsvps_set_name_key();

-- Rückmeldung zu einem Namen laden (null, falls noch keine existiert)
create or replace function public.get_rsvp(p_name text)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'name', r.name,
    'attending', r.attending,
    'menu', r.menu,
    'allergies', r.allergies,
    'wish', r.wish,
    'companions', r.companions,
    'message', r.message,
    'updated_at', r.updated_at
  )
  from public.rsvps r
  where r.name_key = public.normalize_name(p_name);
$$;

-- Rückmeldung anlegen oder (bei bekanntem Namen) aktualisieren
drop function if exists public.upsert_rsvp(text, boolean, text, text, jsonb, text);
create or replace function public.upsert_rsvp(
  p_name        text,
  p_attending   boolean,
  p_menu        text,
  p_allergies   text,
  p_wish        text,
  p_companions  jsonb,
  p_message     text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_key   text := public.normalize_name(p_name);
  v_comp  jsonb := '[]'::jsonb;
  v_item  jsonb;
  v_new   boolean;
begin
  if char_length(v_key) < 2 then
    raise exception 'Bitte gib deinen vollständigen Namen an.';
  end if;

  if p_attending then
    if p_menu is null then
      raise exception 'Bitte wähle ein Menü aus.';
    end if;

    if jsonb_typeof(coalesce(p_companions, '[]'::jsonb)) <> 'array'
       or jsonb_array_length(coalesce(p_companions, '[]'::jsonb)) > 10 then
      raise exception 'Ungültige Begleitpersonen.';
    end if;

    -- Begleitpersonen auf erlaubte Felder reduzieren und prüfen
    for v_item in select * from jsonb_array_elements(coalesce(p_companions, '[]'::jsonb)) loop
      if char_length(trim(coalesce(v_item->>'name', ''))) < 2 then
        raise exception 'Bitte gib für jede Begleitperson einen Namen an.';
      end if;
      if coalesce(v_item->>'menu', '') not in ('carnivor', 'pescetarisch', 'vegetarisch', 'vegan') then
        raise exception 'Bitte wähle für jede Begleitperson ein Menü aus.';
      end if;
      v_comp := v_comp || jsonb_build_array(jsonb_build_object(
        'name', left(trim(v_item->>'name'), 80),
        'menu', v_item->>'menu',
        'allergies', left(coalesce(v_item->>'allergies', ''), 500),
        'wish', left(coalesce(v_item->>'wish', ''), 500)
      ));
    end loop;
  end if;

  insert into public.rsvps as r (name, name_key, attending, menu, allergies, wish, companions, message)
  values (
    left(trim(p_name), 80),
    v_key,
    p_attending,
    case when p_attending then p_menu end,
    case when p_attending then left(coalesce(p_allergies, ''), 500) else '' end,
    case when p_attending then left(coalesce(p_wish, ''), 500) else '' end,
    v_comp,
    left(coalesce(p_message, ''), 2000)
  )
  on conflict (name_key) do update set
    name       = excluded.name,
    attending  = excluded.attending,
    menu       = excluded.menu,
    allergies  = excluded.allergies,
    wish       = excluded.wish,
    companions = excluded.companions,
    message    = excluded.message,
    updated_at = now()
  returning (r.xmax = 0) into v_new;

  return jsonb_build_object('created', v_new);
end;
$$;

revoke all on function public.get_rsvp(text) from public;
revoke all on function public.upsert_rsvp(text, boolean, text, text, text, jsonb, text) from public;
grant execute on function public.get_rsvp(text) to anon, authenticated;
grant execute on function public.upsert_rsvp(text, boolean, text, text, text, jsonb, text) to anon, authenticated;

-- Praktische Übersicht für euch (nur im Dashboard / mit service_role sichtbar)
drop view if exists public.rsvp_overview;
create view public.rsvp_overview
with (security_invoker = true) as
select
  r.name,
  r.attending,
  r.menu,
  r.allergies,
  r.wish,
  case when r.attending then 1 + jsonb_array_length(r.companions) else 0 end as persons,
  r.companions,
  r.message,
  r.updated_at
from public.rsvps r
order by r.updated_at desc;

revoke all on public.rsvp_overview from anon, authenticated;
