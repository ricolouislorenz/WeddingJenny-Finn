// Admin-Schnittstelle des Workers (/api/admin/*) – nur mit Admin-Login nutzbar

async function request(path, init = {}) {
  let res
  try {
    res = await fetch(path, { ...init, headers: { 'Content-Type': 'application/json', ...init.headers } })
  } catch {
    throw new Error('Keine Verbindung. Bitte prüfe deine Internetverbindung.')
  }

  // Admin-Login abgelaufen → Anmeldeseite
  if (res.status === 401) {
    window.location.reload()
    throw new Error('Bitte melde dich erneut an.')
  }

  const data = res.status === 204 ? null : await res.json().catch(() => null)
  if (!res.ok) throw new Error(data?.message || 'Da ist etwas schiefgelaufen.')
  return data
}

export const listGuests = () => request('/api/admin/rsvps')

export const createGuest = (guest) =>
  request('/api/admin/rsvps', { method: 'POST', body: JSON.stringify(guest) }).then((rows) => rows[0])

export const updateGuest = (id, guest) =>
  request(`/api/admin/rsvps/${id}`, { method: 'PATCH', body: JSON.stringify(guest) }).then((rows) => rows[0])

export const deleteGuest = (id) => request(`/api/admin/rsvps/${id}`, { method: 'DELETE' })

export const logout = () => request('/api/logout', { method: 'POST' })
