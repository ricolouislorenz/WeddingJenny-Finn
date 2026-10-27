import { venue } from '../content.js'
import card from '../assets/einladung.webp'

// Gedruckte Einladungskarte als Bild; die Adresse darauf ist ein Link zur Routenplanung
export default function Invitation() {
  return (
    <header className="invitation">
      <img
        className="invitation-card"
        src={card}
        width="1536"
        height="1024"
        alt={`Jenny und Finn – Einladung zur Hochzeit am 29. Mai 2027, ${venue.name} · ${venue.place}, ${venue.street}, ${venue.city}`}
        fetchpriority="high"
      />
      <h1 className="visually-hidden">Jenny und Finn</h1>
      <a className="address" href={venue.mapsUrl} target="_blank" rel="noopener noreferrer">
        <span className="visually-hidden">
          {venue.street}, {venue.city} –{' '}
        </span>
        <small>Route planen →</small>
      </a>
    </header>
  )
}
