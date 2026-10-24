# Jenny & Finn – Hochzeitswebsite

One-Pager für die Hochzeit am **29. Mai 2027** im Mein Forsthaus, Lübeck-Travemünde.
Vite + React, gehostet auf Cloudflare, Rückmeldungen in Supabase.

## Inhalte anpassen

Alle Texte (Ablauf, Dresscode, Schuhwerk, Location, Menüs) stehen in [src/content.js](src/content.js).

## Schriften

- **Roboto Condensed** wird über `@fontsource-variable/roboto-condensed` selbst gehostet (kein Google-Fonts-Request).
- **August Roma Script** ist eine kommerzielle Schrift und liegt nicht im Repo. Die lizenzierte Datei als
  `public/fonts/augustromascript.woff2` ablegen (ersatzweise `augustromascript.otf`).
  OTF → WOFF2 z. B. mit `npx ttf2woff2` oder einem Webfont-Generator konvertieren.

## Passwortschutz

Die ganze Seite liegt hinter einer Anmeldeseite mit einem gemeinsamen Passwort
([public/login/index.html](public/login/index.html)). Geprüft wird serverseitig im Cloudflare Worker
([worker/index.js](worker/index.js)): Ohne gültiges Login-Cookie werden weder Inhalte noch JavaScript
ausgeliefert. Wird das Passwort geändert, müssen sich alle neu anmelden.

## Supabase einrichten

1. Projekt anlegen, dann im **SQL Editor** den Inhalt von [supabase/schema.sql](supabase/schema.sql) ausführen.
2. Rückmeldungen ansehen: Table Editor → `rsvps` oder per SQL `select * from rsvp_overview;`

Der Browser spricht nie direkt mit Supabase – alle Anfragen laufen über den Worker (`/api/rsvp/*`),
und nur nach erfolgreichem Login. Die Tabelle selbst ist zusätzlich für den öffentlichen Key gesperrt;
erlaubt sind nur `get_rsvp` / `upsert_rsvp` für genau den Eintrag zum eigenen Namen.

## Secrets

| Name | Inhalt |
| --- | --- |
| `SITE_PASSWORD` | Passwort für alle Gäste |
| `AUTH_SECRET` | lange Zufallszeichenkette (z. B. `openssl rand -hex 32`) |
| `SUPABASE_URL` | Project Settings → API → URL |
| `SUPABASE_ANON_KEY` | Project Settings → API → anon public key |

Lokal: `.dev.vars.example` nach `.dev.vars` kopieren und ausfüllen.
Auf Cloudflare: `npx wrangler secret put SITE_PASSWORD` (usw.) oder im Dashboard unter Worker → Settings → Variables and Secrets.

## Entwicklung

```bash
npm install
npm run dev
```

`npm run dev` startet Vite inklusive Worker – Passwortschutz und API verhalten sich wie live.

## Deployment (Cloudflare)

`npx wrangler login`, dann `npm run deploy`. Alternativ das Repo in Cloudflare (Workers & Pages)
verbinden: Build-Befehl `npm run build`, Deploy-Befehl `npx wrangler deploy`.

**Empfehlung:** Im Cloudflare-Dashboard unter Security → WAF eine Rate-Limiting-Regel für
`/api/login` anlegen (z. B. 10 Versuche pro Minute und IP), um das Durchprobieren von Passwörtern zu bremsen.
