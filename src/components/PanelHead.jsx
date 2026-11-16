import { Sprig } from './Ornaments.jsx'

// Einheitlicher Kopf jeder Karte: Überschrift, Eukalyptuszweig, Einleitung
export default function PanelHead({ id, title, children }) {
  return (
    <div className="panel-head">
      <h2 id={id} className="title">
        {title}
      </h2>
      <Sprig />
      {children}
    </div>
  )
}
