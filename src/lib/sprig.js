// Berechnet Eukalyptuszweige entlang einer Bézierkurve – einmal beim Laden.

const COLORS = ['var(--sage)', 'var(--moss)', 'var(--fern)', 'var(--stone)']

const bezier = ([p0, p1, p2, p3], t) => {
  const u = 1 - t
  const at = (i) => u * u * u * p0[i] + 3 * u * u * t * p1[i] + 3 * u * t * t * p2[i] + t * t * t * p3[i]
  const d = (i) => 3 * u * u * (p1[i] - p0[i]) + 6 * u * t * (p2[i] - p1[i]) + 3 * t * t * (p3[i] - p2[i])
  return { x: at(0), y: at(1), angle: (Math.atan2(d(1), d(0)) * 180) / Math.PI }
}

// Ein Zweig: Stiel plus abwechselnd links/rechts angesetzte Blätter
export function sprig(curve, count, size, seed = 0) {
  const [p0, p1, p2, p3] = curve
  const leaves = Array.from({ length: count }, (_, i) => {
    const t = 0.06 + (i / (count - 1)) * 0.9
    const { x, y, angle } = bezier(curve, t)
    const side = i % 2 ? 1 : -1
    const s = size * (0.75 + 0.35 * Math.sin(i * 2.3 + seed) ** 2) * (1 - t * 0.35)
    return {
      transform: `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${(angle + side * (48 + ((i * 17 + seed) % 20))).toFixed(1)}) scale(${s.toFixed(2)})`,
      fill: COLORS[(i + seed) % COLORS.length],
      opacity: (0.62 + 0.33 * Math.abs(Math.sin(i * 1.7 + seed))).toFixed(2),
    }
  })
  return { stem: `M${p0} C${p1} ${p2} ${p3}`, leaves }
}
