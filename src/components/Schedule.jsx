import { schedule } from '../content.js'
import { Icon } from './Icons.jsx'

export default function Schedule() {
  return (
    <section className="panel" aria-labelledby="ablauf-title">
      <div className="panel-head">
        <h2 id="ablauf-title">Ablauf</h2>
        <p className="sub">So sieht unser Tag aus</p>
      </div>
      <ol className="timeline">
        {schedule.map((item) => (
          <li key={item.time}>
            <time>{item.time}</time>
            <span className="timeline-icon">
              <Icon name={item.icon} />
            </span>
            <div>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}
