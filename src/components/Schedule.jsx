import { schedule, WEDDING_DATE_LABEL } from '../content.js'
import PanelHead from './PanelHead.jsx'

export default function Schedule() {
  return (
    <section className="panel" aria-labelledby="ablauf-title">
      <PanelHead id="ablauf-title" title="Ablauf">
        <p className="sub">So haben wir uns den {WEDDING_DATE_LABEL} gedacht</p>
      </PanelHead>
      <ol className="timeline">
        {schedule.map((item) => (
          <li key={item.time}>
            <time>
              {item.time}
              <small>Uhr</small>
            </time>
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
