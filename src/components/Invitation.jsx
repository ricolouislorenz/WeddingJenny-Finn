import { venue } from '../content.js'
import { Branches } from './Botanical.jsx'
import { sprig } from '../lib/sprig.js'

// ---------- Herz & Zweige (angelehnt an die gedruckte Einladungskarte) ----------

// Drei leicht versetzte Herzlinien ergeben den facettierten Goldfolien-Look
const HEARTS = [
  'M120 186 L22 80 L30 34 L76 12 L120 50 L164 12 L210 34 L218 80 Z',
  'M120 180 L28 74 L26 42 L64 20 L120 58 L176 20 L214 42 L212 74 Z',
  'M120 184 L34 86 L38 30 L90 18 L120 54 L150 18 L202 30 L206 86 Z',
]

// Links definiert; rechts gespiegelt mit etwas anderem Verlauf, damit es natürlich wirkt
const LEFT = [
  sprig([[80, 10], [36, 2], [4, 50], [30, 118]], 17, 1.3, 0),
  sprig([[56, 22], [40, 40], [34, 66], [46, 100]], 10, 0.9, 1),
  sprig([[34, 26], [22, 20], [10, 22], [0, 32]], 3, 0.8, 2),
]
const RIGHT = [
  sprig([[72, 8], [26, 10], [-2, 66], [40, 132]], 18, 1.25, 3),
  sprig([[44, 34], [30, 54], [32, 84], [48, 110]], 9, 0.9, 2),
]

function HeartWreath() {
  return (
    <svg className="wreath-art" viewBox="0 0 240 200" aria-hidden="true">
      <defs>
        <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#d9c08a" />
          <stop offset="0.45" stopColor="#b8965a" />
          <stop offset="0.7" stopColor="#e2cc98" />
          <stop offset="1" stopColor="#a8854c" />
        </linearGradient>
      </defs>
      <g fill="none" stroke="url(#gold)" strokeWidth="1.1" strokeLinejoin="round">
        {HEARTS.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
      <g className="leaves">
        <Branches data={LEFT} />
        <g transform="translate(240 0) scale(-1 1)">
          <Branches data={RIGHT} />
        </g>
      </g>
    </svg>
  )
}

// Filigrane Goldecke (oben links; 1 Einheit = 1/56 der Eckgröße).
// Die Linien bei x/y = 6 und 11 treffen exakt auf den CSS-Doppelrahmen.
function Flourish({ className }) {
  const tendril = (
    <>
      <path d="M26 11 C31 11 33 6.5 38 7 C42 7.5 43 11 40.5 12.5 C38.5 13.5 37 11.5 38.5 10.5" />
      <path d="M30 15 C34 18.5 40 18.5 45 15.5" />
      <path d="M45 15.5 C47 14.2 49 14.5 50 15.5" strokeWidth="0.6" />
      <circle cx="50" cy="9" r="0.9" fill="currentColor" stroke="none" />
    </>
  )
  return (
    <svg className={className} viewBox="0 0 56 56" aria-hidden="true">
      <rect width="27" height="27" fill="var(--card)" />
      <g fill="none" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round">
        <path d="M6 27 V22 C12 22 22 12 22 6 H27" />
        <path d="M11 27 C18 27 27 18 27 11" strokeWidth="0.6" />
        <path d="M8 3 L13 8 L8 13 L3 8 Z" />
        <circle cx="8" cy="8" r="1.2" fill="currentColor" stroke="none" />
        {tendril}
        <g transform="matrix(0 1 1 0 0 0)">{tendril}</g>
      </g>
    </svg>
  )
}

export default function Invitation() {
  return (
    <header className="invitation">
      <span className="frame frame-outer" aria-hidden="true" />
      <span className="frame frame-inner" aria-hidden="true" />
      <span className="gem gem-top" aria-hidden="true" />
      <span className="gem gem-bottom" aria-hidden="true" />
      <Flourish className="flourish flourish-tl" />
      <Flourish className="flourish flourish-tr" />
      <Flourish className="flourish flourish-bl" />
      <Flourish className="flourish flourish-br" />

      <div className="invitation-content">
        <div className="wreath">
          <HeartWreath />
          <h1 className="couple">
            <span className="couple-a">Jenny</span>
            <span className="couple-und">und</span>
            <span className="couple-b">Finn</span>
          </h1>
        </div>
        <p className="eyebrow">Einladung zur Hochzeit</p>
        <span className="divider" aria-hidden="true" />
        <p className="when">
          <span>29. Mai 2027</span>
          {venue.name} · {venue.place}
        </p>
      </div>
    </header>
  )
}
