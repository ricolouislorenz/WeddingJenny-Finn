// Rückmeldungen laufen über den eigenen Worker (/api/rsvp/*), der nach dem
// Passwort-Login an Supabase weiterleitet. Der Datenbank-Schlüssel bleibt so auf dem Server.

async function rpc(fn, body) {
  let res
  try {
    res = await fetch(`/api/rsvp/${fn}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  } catch {
    throw new Error('Keine Verbindung. Bitte prüfe deine Internetverbindung und versuche es erneut.')
  }

  // Login abgelaufen (z. B. Passwort geändert) → zurück zur Anmeldeseite
  if (res.status === 401) {
    window.location.reload()
    throw new Error('Bitte melde dich erneut an.')
  }

  const data = await res.json().catch(() => null)
  if (!res.ok) {
    // Fehlermeldungen aus den SQL-Funktionen ("raise exception") direkt anzeigen
    throw new Error(data?.message || 'Da ist etwas schiefgelaufen. Bitte versuche es später noch einmal.')
  }
  return data
}

export const getRsvp = (name) => rpc('get', { p_name: name })

export const saveRsvp = (r) =>
  rpc('save', {
    p_name: r.name,
    p_attending: r.attending,
    p_menu: r.attending ? r.menu : null,
    p_allergies: r.attending ? r.allergies : '',
    p_wish: r.attending ? r.wish : '',
    p_companions: r.attending ? r.companions : [],
    p_message: r.message,
  })
