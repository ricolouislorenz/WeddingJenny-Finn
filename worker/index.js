// Cloudflare Worker: Passwortschutz für die gesamte Seite, Admin-Bereich + Proxy zu Supabase.
//
// Secrets (Cloudflare Dashboard → Worker → Settings → Variables, lokal in .dev.vars):
//   SITE_PASSWORD         Passwort für alle Gäste
//   ADMIN_PASSWORD        Passwort für die Gästeverwaltung (/admin)
//   AUTH_SECRET           lange Zufallszeichenkette zum Signieren des Login-Cookies
//   SUPABASE_URL          https://xxxx.supabase.co
//   SUPABASE_ANON_KEY     anon/public key – für die Gäste-Funktionen
//   SUPABASE_SERVICE_KEY  service_role key – NUR für den Admin-Bereich, verlässt nie den Server

const COOKIE = 'jf_auth'
const MAX_AGE = 60 * 60 * 24 * 365 // ein Jahr – Gäste sollen sich nur einmal anmelden

// Ohne Login erreichbar: die Anmeldeseite und das, was sie zum Darstellen braucht
const PUBLIC_PATHS = [/^\/login(\/|\/index\.html)?$/, /^\/fonts\//, /^\/favicon\.svg$/]

// Erlaubte Datenbank-Funktionen für Gäste
const RPC = { get: 'get_rsvp', save: 'upsert_rsvp' }

// Felder, die der Admin-Bereich schreiben darf
const ADMIN_FIELDS = ['name', 'attending', 'menu', 'allergies', 'wish', 'companions', 'message']

const encoder = new TextEncoder()

async function sha256(text) {
  return new Uint8Array(await crypto.subtle.digest('SHA-256', encoder.encode(text)))
}

function equal(a, b) {
  if (a.byteLength !== b.byteLength) return false
  return crypto.subtle.timingSafeEqual(a, b)
}

const samePassword = async (input, expected) => !!expected && equal(await sha256(input), await sha256(expected))

// Token hängt an Rolle + Passwort: wird ein Passwort geändert, sind die alten Logins ungültig
async function token(env, role) {
  const password = role === 'admin' ? env.ADMIN_PASSWORD : env.SITE_PASSWORD
  const key = await crypto.subtle.importKey('raw', encoder.encode(env.AUTH_SECRET), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(`v1:${role}:${password}`))
  return btoa(String.fromCharCode(...new Uint8Array(sig))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

// Liefert 'admin', 'guest' oder null
async function roleOf(request, env) {
  const value = (request.headers.get('Cookie') || '').match(new RegExp(`(?:^|;\\s*)${COOKIE}=([^;]+)`))?.[1]
  if (!value || !env.AUTH_SECRET) return null
  if (env.ADMIN_PASSWORD && (await samePassword(value, await token(env, 'admin')))) return 'admin'
  if (env.SITE_PASSWORD && (await samePassword(value, await token(env, 'guest')))) return 'guest'
  return null
}

const json = (data, status = 200, headers = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...headers },
  })

const cookie = (request, value, maxAge) => {
  const secure = new URL(request.url).protocol === 'https:' ? '; Secure' : ''
  return `${COOKIE}=${value}; Path=/; Max-Age=${maxAge}; HttpOnly; SameSite=Lax${secure}`
}

async function login(request, env) {
  if (!env.SITE_PASSWORD || !env.AUTH_SECRET) return json({ message: 'Server ist nicht konfiguriert.' }, 500)

  const { password = '' } = await request.json().catch(() => ({}))
  const input = String(password).trim()

  const role = (await samePassword(input, env.ADMIN_PASSWORD))
    ? 'admin'
    : (await samePassword(input, env.SITE_PASSWORD))
      ? 'guest'
      : null

  if (!role) {
    // bremst automatisiertes Durchprobieren aus
    await new Promise((r) => setTimeout(r, 800))
    return json({ message: 'Das Passwort stimmt leider nicht.' }, 401)
  }

  return json({ ok: true, redirect: role === 'admin' ? '/admin' : null }, 200, {
    'Set-Cookie': cookie(request, await token(env, role), MAX_AGE),
  })
}

function supabase(env, path, init = {}, key = env.SUPABASE_ANON_KEY) {
  return fetch(`${env.SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      ...init.headers,
    },
  })
}

// Antwort von Supabase durchreichen, Fehler in verständliche Meldungen übersetzen
async function relay(res) {
  if (res.ok) {
    return new Response(res.status === 204 ? null : res.body, {
      status: res.status,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    })
  }
  const err = await res.json().catch(() => ({}))
  const message =
    err.code === '23505'
      ? 'Diesen Namen gibt es bereits.'
      : err.code === '23514'
        ? 'Ungültige Angaben (z. B. Menü oder Textlänge).'
        : err.message || 'Datenbankfehler.'
  return json({ message }, res.status)
}

function adminPayload(body) {
  const data = Object.fromEntries(ADMIN_FIELDS.filter((k) => k in body).map((k) => [k, body[k]]))
  if (data.attending === false) Object.assign(data, { menu: null, allergies: '', wish: '', companions: [] })
  return data
}

async function admin(request, env, pathname) {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_KEY)
    return json({ message: 'Die Datenbank ist noch nicht verbunden (SUPABASE_SERVICE_KEY fehlt).' }, 500)

  const key = env.SUPABASE_SERVICE_KEY
  const id = pathname.match(/^\/api\/admin\/rsvps\/([0-9a-f-]{36})$/)?.[1]
  const prefer = { Prefer: 'return=representation' }

  if (pathname === '/api/admin/rsvps' && request.method === 'GET')
    return relay(await supabase(env, 'rsvps?select=*&order=updated_at.desc', {}, key))

  if (pathname === '/api/admin/rsvps' && request.method === 'POST') {
    const data = adminPayload(await request.json())
    return relay(await supabase(env, 'rsvps', { method: 'POST', headers: prefer, body: JSON.stringify(data) }, key))
  }

  if (id && request.method === 'PATCH') {
    const data = { ...adminPayload(await request.json()), updated_at: new Date().toISOString() }
    return relay(await supabase(env, `rsvps?id=eq.${id}`, { method: 'PATCH', headers: prefer, body: JSON.stringify(data) }, key))
  }

  if (id && request.method === 'DELETE') return relay(await supabase(env, `rsvps?id=eq.${id}`, { method: 'DELETE' }, key))

  return json({ message: 'Nicht gefunden.' }, 404)
}

async function serveLogin(request, url, env) {
  const page = await env.ASSETS.fetch(new Request(new URL('/login/', url), request))
  return new Response(page.body, {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
  })
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    const { pathname } = url
    const isPage = request.method === 'GET' && (request.headers.get('Accept') || '').includes('text/html')

    if (pathname === '/api/login' && request.method === 'POST') return login(request, env)
    if (pathname === '/api/logout' && request.method === 'POST')
      return json({ ok: true }, 200, { 'Set-Cookie': cookie(request, '', 0) })

    const role = await roleOf(request, env)

    if (pathname.startsWith('/api/admin/')) {
      if (role !== 'admin') return json({ message: 'Bitte melde dich als Admin an.' }, 401)
      return admin(request, env, pathname)
    }

    if (pathname.startsWith('/api/rsvp/')) {
      const fn = RPC[pathname.slice('/api/rsvp/'.length)]
      if (!role) return json({ message: 'Bitte melde dich erneut an.' }, 401)
      if (!fn || request.method !== 'POST') return json({ message: 'Nicht gefunden.' }, 404)
      if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY)
        return json({ message: 'Die Datenbank ist noch nicht verbunden.' }, 500)
      return relay(await supabase(env, `rpc/${fn}`, { method: 'POST', body: await request.text() }))
    }

    // Admin-Seite nur mit Admin-Login – sonst Anmeldeseite (dort "Admin" eingeben)
    if (/^\/admin\/?$/.test(pathname) && role !== 'admin') return serveLogin(request, url, env)

    // Angemeldet auf der Login-Seite? Direkt weiter.
    if (role && /^\/login/.test(pathname)) return Response.redirect(new URL(role === 'admin' ? '/admin' : '/', url), 302)

    if (role || PUBLIC_PATHS.some((re) => re.test(pathname))) return env.ASSETS.fetch(request)

    // Nicht angemeldet: Seitenaufrufe bekommen die Anmeldeseite (URL & #Anker bleiben erhalten),
    // alles andere (JS, CSS, Daten) wird verweigert.
    if (isPage) return serveLogin(request, url, env)
    return new Response('Unauthorized', { status: 401, headers: { 'Cache-Control': 'no-store' } })
  },
}
