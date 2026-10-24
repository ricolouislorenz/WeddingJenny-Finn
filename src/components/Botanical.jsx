import { sprig } from '../lib/sprig.js'

// schmales Eukalyptusblatt, zeigt entlang +x
const LEAF = 'M0 0 C3 -3.6 10 -4.2 16 0 C10 4.2 3 3.6 0 0Z'

export function Branches({ data, stemWidth = 0.7 }) {
  return data.map((s, i) => (
    <g key={i}>
      <path d={s.stem} fill="none" stroke="var(--sage)" strokeWidth={stemWidth} strokeLinecap="round" />
      {s.leaves.map((l, j) => (
        <path key={j} d={LEAF} transform={l.transform} fill={l.fill} fillOpacity={l.opacity} />
      ))}
    </g>
  ))
}

// Große, sehr dezente Zweige im Seitenhintergrund (nur Tablet/Desktop)
const CLUSTER = [
  sprig([[0, 20], [90, 30], [160, 90], [230, 210]], 22, 2.6, 0),
  sprig([[10, 70], [60, 90], [90, 150], [100, 250]], 14, 2.1, 1),
  sprig([[30, 0], [80, 40], [150, 40], [250, 60]], 14, 2, 2),
]

export function Backdrop() {
  return (
    <div className="backdrop" aria-hidden="true">
      <svg className="backdrop-tl" viewBox="0 0 260 260">
        <Branches data={CLUSTER} stemWidth={1.2} />
      </svg>
      <svg className="backdrop-br" viewBox="0 0 260 260">
        <Branches data={CLUSTER} stemWidth={1.2} />
      </svg>
    </div>
  )
}
