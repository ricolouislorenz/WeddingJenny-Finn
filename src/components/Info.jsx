import { faqs, infos } from '../content.js'
import { Icon } from './Icons.jsx'

export default function Info() {
  return (
    <section className="panel" aria-labelledby="infos-title">
      <div className="panel-head">
        <h2 id="infos-title">Weitere Infos</h2>
        <p className="sub">Alles, was ihr für den Tag wissen solltet</p>
      </div>
      <div className="info-list">
        {infos.map((info) => (
          <article className="info" key={info.title}>
            <Icon name={info.icon} className="info-icon" />
            <div>
              <h3>{info.title}</h3>
              <p>{info.text}</p>
              {info.link && (
                <a className="link" href={info.link.href} target="_blank" rel="noopener noreferrer">
                  {info.link.label} →
                </a>
              )}
            </div>
          </article>
        ))}
      </div>

      <div className="faq">
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
