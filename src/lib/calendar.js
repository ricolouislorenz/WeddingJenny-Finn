import { WEDDING_DATE, WEDDING_END, venue } from '../content.js'

// 2027-05-29T12:00:00.000Z -> 20270529T120000Z
const ics = (d) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')

// Erzeugt eine .ics-Datei (funktioniert mit Apple, Google & Outlook) und lädt sie herunter
export function downloadCalendarEvent() {
  const body = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Jenny & Finn//Hochzeit//DE',
    'BEGIN:VEVENT',
    'UID:hochzeit-jenny-finn-20270529',
    `DTSTAMP:${ics(new Date())}`,
    `DTSTART:${ics(WEDDING_DATE)}`,
    `DTEND:${ics(WEDDING_END)}`,
    'SUMMARY:Hochzeit Jenny & Finn',
    `LOCATION:${venue.name}\\, ${venue.place}`,
    `DESCRIPTION:Alle Infos: ${window.location.origin}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')

  const url = URL.createObjectURL(new Blob([body], { type: 'text/calendar;charset=utf-8' }))
  const a = Object.assign(document.createElement('a'), { href: url, download: 'hochzeit-jenny-finn.ics' })
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
