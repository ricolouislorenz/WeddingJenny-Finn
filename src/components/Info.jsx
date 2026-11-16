import { faqs, infos, venue } from '../content.js'
import PanelHead from './PanelHead.jsx'

export default function Info() {
  return (
    <section className="panel" aria-labelledby="infos-title">
      <PanelHead id="infos-title" title="Gut zu wissen">
        <p className="sub">Alles, was ihr für den Tag wissen solltet</p>
      </PanelHead>

      <div className="details">
        {infos.map((info) => (
          <article className="detail" key={info.label}>
            <h3 className="title">{info.label}</h3>
            <p className="detail-lead">{info.title}</p>
            <p>{info.text}</p>
          </article>
        ))}
      </div>

      <article className="venue">
        <h3 className="title">{venue.fullName}</h3>
        <address>
          {venue.street}
          <br />
          {venue.city}
        </address>
        <p className="venue-note">{venue.description}</p>
        <a className="button" href={venue.mapsUrl} target="_blank" rel="noopener noreferrer">
          Route planen
        </a>
      </article>

      <div className="faq">
        <div className="faq-head">
          <h3 className="title">Häufige Fragen</h3>
        </div>
        {faqs.map((f) => (
          <details key={f.q}>
            <summary>
              {f.q}
              <span className="faq-toggle" aria-hidden="true" />
            </summary>
            <p>{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  )
}
