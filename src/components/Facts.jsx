import { useEffect, useState } from 'react'
import { WEDDING_DATE, welcome } from '../content.js'
import { downloadCalendarEvent } from '../lib/calendar.js'
import { Icon } from './Icons.jsx'

function useNow(interval) {
  const [now, setNow] = useState(Date.now)
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), interval)
    return () => clearInterval(id)
  }, [interval])
  return now
}

// Begrüßung, Countdown und die zwei wichtigsten Aktionen direkt unter der Einladung
export default function Facts({ onRsvp }) {
  const diff = Math.max(0, WEDDING_DATE.getTime() - useNow(30_000))
  const days = Math.floor(diff / 86_400_000)
  const hours = Math.floor(diff / 3_600_000) % 24
  const minutes = Math.floor(diff / 60_000) % 60
  const units = [
    { value: days, label: days === 1 ? 'Tag' : 'Tage' },
    { value: hours, label: hours === 1 ? 'Stunde' : 'Stunden' },
    { value: minutes, label: minutes === 1 ? 'Minute' : 'Minuten' },
  ]

  return (
    <section className="facts" aria-label="Willkommen">
      <p className="welcome">{welcome}</p>

      {diff > 0 ? (
        <div className="countdown" role="timer" aria-label={`Noch ${days} ${units[0].label} bis zur Hochzeit`}>
          {units.map((u) => (
            <div className="countdown-unit" key={u.label}>
              <strong>{u.value}</strong>
              <span>{u.label}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="countdown-done names">Wir haben Ja gesagt!</p>
      )}

      <div className="actions">
        <button type="button" className="button" onClick={onRsvp}>
          Zur Rückmeldung
        </button>
        <button type="button" className="button button-ghost" onClick={downloadCalendarEvent}>
          <Icon name="calendar" /> In den Kalender
        </button>
      </div>
    </section>
  )
}
