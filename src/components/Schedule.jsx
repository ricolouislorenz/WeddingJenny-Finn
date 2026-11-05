import { schedule, WEDDING_DATE_LABEL } from '../content.js'
import { Icon } from './Icons.jsx'
import PanelHead from './PanelHead.jsx'

export default function Schedule() {
  return (
    <section className="panel" aria-labelledby="ablauf-title">
      <PanelHead id="ablauf-title" kicker={WEDDING_DATE_LABEL} title="Ablauf">
        <p className="sub">So haben wir uns den Tag gedacht</p>
      </PanelHead>
      <ol className="timeline">
        {schedule.map((item) => (
          <li key={item.time}>
            <time>{item.time}</time>
            <span className="timeline-icon">
              <Icon name={item.icon} />
            </span>
            <div>
              <h3 className="title">{item.title}</h3>
              <p>{item.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}
