import { venue, WEDDING_DATE_LABEL } from '../content.js'
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
        alt={`Jenny und Finn – Einladung zur Hochzeit am ${WEDDING_DATE_LABEL}, ${venue.name} · ${venue.place}, ${venue.street}, ${venue.city}`}
        fetchpriority="high"
      />
      <h1 className="visually-hidden">Jenny und Finn</h1>
      <a
        className="address"
        href={venue.mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        title="Route planen"
        aria-label={`Route zu ${venue.street}, ${venue.city} planen (öffnet Google Maps)`}
      />
    </header>
  )
}
