# Jenny & Finn – Hochzeitswebsite

One-Pager für die Hochzeit am **29. Mai 2027** im Mein Forsthaus, Lübeck-Travemünde.
Vite + React, gehostet auf **Cloudflare Pages**, Rückmeldungen in Supabase.

## Projektaufbau

| Ordner / Datei | Inhalt |
| --- | --- |
| [src/](src/) | Frontend (React) |
| [src/content.js](src/content.js) | **alle Texte**: Begrüßung, Ablauf, Dresscode, Location, Menüs, FAQ |
| [src/index.css](src/index.css) | Gestaltung – Farben & Schriften als Variablen ganz oben |
| [public/login/index.html](public/login/index.html) | Anmeldeseite (eigenständig, ohne App-Code) |
| [functions/_middleware.js](functions/_middleware.js) | Pages Function – läuft vor jeder Anfrage |
| [server/app.js](server/app.js) | Server-Logik: Passwortschutz, Admin-API, Proxy zu Supabase |
| [supabase/schema.sql](supabase/schema.sql) | Datenbank-Schema |

## Gestaltung

- **Farben:** Salbeigrün (`--ink`) für Text und Buttons, Gold (`--gold`) nur für feine Linien und Ornamente,
  Papierton als Hintergrund – abgeleitet aus Einladungskarte und Aquarell.
- **Schriften** (selbst gehostet in `public/fonts`, SIL Open Font License, kein Google-Request):
  - *Cormorant Garamond* – Überschriften, Namen (kursiv), Uhrzeiten, Countdown
  - *Jost* – Fließtext, Beschriftungen und Buttons
- **Ansprache:** durchgehend „ihr/euch“.

## Passwortschutz

Die ganze Seite liegt hinter einer Anmeldeseite mit einem gemeinsamen Passwort. Geprüft wird serverseitig
in der Pages Function: Ohne gültiges Login-Cookie werden weder Inhalte noch JavaScript ausgeliefert –
nur die Anmeldeseite, Schriften und das Favicon sind öffentlich. Wird das Passwort geändert,
müssen sich alle neu anmelden. Mit `ADMIN_PASSWORD` gelangt man zur Gästeliste unter `/admin`.

## Supabase einrichten

1. Projekt anlegen, dann im **SQL Editor** den Inhalt von [supabase/schema.sql](supabase/schema.sql) ausführen
   (auch nach Änderungen erneut ausführen – das Skript ist wiederholbar).
2. Rückmeldungen ansehen: unter `/admin` oder im Table Editor → `rsvps`.

Der Browser spricht nie direkt mit Supabase – alle Anfragen laufen über `/api/*` und nur nach erfolgreichem Login.

## Secrets

| Name | Inhalt |
| --- | --- |
| `SITE_PASSWORD` | Passwort für alle Gäste |
| `ADMIN_PASSWORD` | Passwort für die Gästeliste (`/admin`) |
| `AUTH_SECRET` | lange Zufallszeichenkette (z. B. `openssl rand -hex 32`) |
| `SUPABASE_URL` | Project Settings → API → URL |
| `SUPABASE_ANON_KEY` | Project Settings → API → anon public key |
| `SUPABASE_SERVICE_KEY` | Project Settings → API → service_role key (nur für `/admin`) |

Lokal: `.dev.vars.example` nach `.dev.vars` kopieren und ausfüllen.

## Entwicklung

```bash
npm install
npm run dev      # nur Frontend mit Hot Reload – ohne Passwortschutz, Rückmeldungen funktionieren hier nicht
npm run preview  # Build + lokale Cloudflare-Pages-Umgebung (Passwort, API) unter http://127.0.0.1:8788
```

## Deployment auf Cloudflare Pages

### Variante A: Git-Integration (empfohlen)

1. Cloudflare-Dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**,
   Repository `WeddingJenny-Finn` auswählen.
2. Build-Einstellungen:
   - Framework preset: **None** (oder *Vite*)
   - Build command: `npm run build`
   - Build output directory: `dist`
3. **Settings → Variables and Secrets**: alle Secrets aus der Tabelle oben eintragen
   (für *Production*, bei Bedarf auch für *Preview*), danach einmal neu deployen.

Jeder Push auf `main` wird automatisch veröffentlicht. Der Ordner `functions/` wird von Cloudflare
automatisch erkannt und als Pages Function mit ausgeliefert.

### Variante B: per Kommandozeile

```bash
npx wrangler login
npm run deploy                               # baut und lädt dist/ + functions/ hoch
npx wrangler pages secret put SITE_PASSWORD  # usw. für jedes Secret
```

**Empfehlung:** Unter Security → WAF eine Rate-Limiting-Regel für `/api/login` anlegen
(z. B. 10 Versuche pro Minute und IP), um das Durchprobieren von Passwörtern zu bremsen.
