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
  const units = [
    { value: Math.floor(diff / 86_400_000), label: 'Tage' },
    { value: Math.floor(diff / 3_600_000) % 24, label: 'Stunden' },
    { value: Math.floor(diff / 60_000) % 60, label: 'Minuten' },
  ]

  return (
    <section className="facts" aria-label="Willkommen">
      <p className="welcome">{welcome}</p>

      {diff > 0 ? (
        <div className="countdown" role="timer" aria-label={`Noch ${units[0].value} Tage bis zur Hochzeit`}>
          {units.map((u) => (
            <div className="countdown-unit" key={u.label}>
              <strong>{u.value}</strong>
              <span>{u.label}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="countdown-done">Wir haben Ja gesagt!</p>
      )}

      <div className="actions">
        <button type="button" className="button" onClick={onRsvp}>
          Jetzt zusagen
        </button>
        <button type="button" className="button button-ghost" onClick={downloadCalendarEvent}>
          <Icon name="calendar" /> Im Kalender speichern
        </button>
      </div>
    </section>
  )
}
