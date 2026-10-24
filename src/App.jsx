import { useEffect, useRef, useState } from 'react'
import Invitation from './components/Invitation.jsx'
import Rsvp from './components/Rsvp.jsx'
import Schedule from './components/Schedule.jsx'
import Info from './components/Info.jsx'
import Facts from './components/Facts.jsx'
import { Backdrop } from './components/Botanical.jsx'

const TABS = [
  { id: 'rsvp', label: 'Rückmeldung', Panel: Rsvp },
  { id: 'ablauf', label: 'Ablauf', Panel: Schedule },
  { id: 'infos', label: 'Weitere Infos', Panel: Info },
]

const tabFromHash = () => TABS.find((t) => `#${t.id}` === window.location.hash)?.id ?? TABS[0].id

export default function App() {
  const [active, setActive] = useState(tabFromHash)
  const anchorRef = useRef(null)
  const tabRefs = useRef({})

  // Steht das Menüband oben fest, zum Anfang des neuen Inhalts springen
  const scrollToContent = (force = false) => {
    const top = anchorRef.current.getBoundingClientRect().top + window.scrollY
    if (force || window.scrollY > top) window.scrollTo({ top, behavior: force ? 'smooth' : 'instant' })
  }

  // Vor/Zurück im Browser und geteilte Links wie "#ablauf"
  useEffect(() => {
    const onHash = () => {
      setActive(tabFromHash())
      requestAnimationFrame(() => scrollToContent(true))
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const select = (id, force = false) => {
    setActive(id)
    history.replaceState(null, '', `#${id}`)
    scrollToContent(force)
  }

  const onKeyDown = (e) => {
    const i = TABS.findIndex((t) => t.id === active)
    const next = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: TABS.length - 1 }[e.key]
    if (next === undefined) return
    e.preventDefault()
    const id = TABS[(next + TABS.length) % TABS.length].id
    select(id)
    tabRefs.current[id].focus()
  }

  return (
    <div className="page">
      <Backdrop />

      <Invitation />
      <Facts onRsvp={() => select('rsvp', true)} />

      <div ref={anchorRef} />
      <nav className="tabs" aria-label="Inhalte">
        <div className="tabs-inner" role="tablist" onKeyDown={onKeyDown}>
          {TABS.map((t) => (
            <button
              key={t.id}
              ref={(el) => (tabRefs.current[t.id] = el)}
              type="button"
              role="tab"
              id={`tab-${t.id}`}
              aria-controls={t.id}
              aria-selected={active === t.id}
              tabIndex={active === t.id ? 0 : -1}
              className="tab"
              onClick={() => select(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </nav>

      <main className="panels">
        {/* Alle Panels bleiben gemountet, damit Formulareingaben beim Wechseln erhalten bleiben */}
        {TABS.map(({ id, Panel }) => (
          <div key={id} id={id} role="tabpanel" aria-labelledby={`tab-${id}`} hidden={active !== id} className="panel-view">
            <Panel />
          </div>
        ))}
      </main>

      <footer className="footer">
        <p className="footer-names">Jenny &amp; Finn</p>
        <p>Wir freuen uns auf euch · 29.05.2027</p>
      </footer>
    </div>
  )
}
