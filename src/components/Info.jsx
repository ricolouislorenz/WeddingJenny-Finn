import { faqs, infos, venue } from '../content.js'
import { Icon } from './Icons.jsx'
import PanelHead from './PanelHead.jsx'

export default function Info() {
  return (
    <section className="panel" aria-labelledby="infos-title">
      <PanelHead id="infos-title" kicker="Damit nichts fehlt" title="Gut zu wissen">
        <p className="sub">Alles, was ihr für den Tag wissen solltet</p>
      </PanelHead>

      <div className="details">
        {infos.map((info) => (
          <article className="detail" key={info.label}>
            <span className="detail-icon">
              <Icon name={info.icon} />
            </span>
            <p className="kicker">{info.label}</p>
            <h3 className="title">{info.title}</h3>
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
        <h3 className="title">{venue.fullName}</h3>
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
        <div className="faq-head">
          <p className="kicker">Fragen &amp; Antworten</p>
          <h3 className="title">Häufige Fragen</h3>
        </div>
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
