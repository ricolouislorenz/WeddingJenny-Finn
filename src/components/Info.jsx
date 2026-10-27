import { faqs, infos, venue } from '../content.js'
import { Icon } from './Icons.jsx'

export default function Info() {
  return (
    <section className="panel" aria-labelledby="infos-title">
      <div className="panel-head">
        <h2 id="infos-title">Weitere Infos</h2>
        <p className="sub">Alles, was ihr für den Tag wissen solltet</p>
      </div>

      <div className="details">
        {infos.map((info) => (
          <article className="detail" key={info.label}>
            <span className="detail-icon">
              <Icon name={info.icon} />
            </span>
            <p className="kicker">{info.label}</p>
            <h3>{info.title}</h3>
            <p>{info.text}</p>
          </article>
        ))}
      </div>

      {/* Location als eigene kleine Karte – wie die Anfahrtskarte einer gedruckten Einladung */}
      <article className="venue">
        <span className="detail-icon">
          <Icon name="pin" />
        </span>
        <p className="kicker">Location</p>
        <h3>{venue.fullName}</h3>
        <address>
          {venue.street}
          <br />
          {venue.city}
        </address>
        <p className="venue-note">{venue.description}</p>
        <a className="button" href={venue.mapsUrl} target="_blank" rel="noopener noreferrer">
          <Icon name="pin" /> Route planen
        </a>
      </article>

      <div className="faq">
        <p className="kicker">Gut zu wissen</p>
        <h3 className="faq-title">Häufige Fragen</h3>
        {faqs.map((f) => (
          <details key={f.q}>
            <summary>
              {f.q}
              <Icon name="plus" className="faq-toggle" />
            </summary>
            <p>{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  )
}
