// Login abgelaufen (401) → Seite neu laden, damit der Server die Anmeldeseite zeigt.
// Schutz gegen Endlosschleifen: höchstens ein automatisches Neuladen pro Minute.
const KEY = 'jf-reauth-at'

export function reloadForLogin() {
  let last = 0
  try {
    last = Number(sessionStorage.getItem(KEY)) || 0
  } catch {
    /* privater Modus */
  }
  if (Date.now() - last < 60_000) return false
  try {
    sessionStorage.setItem(KEY, String(Date.now()))
  } catch {
    /* privater Modus */
  }
  window.location.reload()
  return true
}
