// Einheitlicher Kopf jeder Karte: Kicker, Überschrift, Goldornament, Einleitung
export default function PanelHead({ id, kicker, title, children }) {
  return (
    <div className="panel-head">
      {kicker && <p className="kicker">{kicker}</p>}
      <h2 id={id} className="title">
        {title}
      </h2>
      <div className="ornament" aria-hidden="true">
        <span />
      </div>
      {children}
    </div>
  )
}
