import { useEffect, useRef, useState } from 'react'
import { getRsvp, saveRsvp } from '../lib/api.js'
import { menus, RSVP_DEADLINE } from '../content.js'
import PanelHead from './PanelHead.jsx'
import { Choice, PersonCard } from './Choices.jsx'

// Ablauf: Liegt für den Namen schon eine Rückmeldung vor, zeigt der Reiter eine Übersicht.
// Über "Rückmeldung bearbeiten" geht es ins Formular – Ansicht und Eingabe sind getrennt.

const NAME_KEY = 'jf-rsvp-name'

const storage = {
  get() {
    try { return localStorage.getItem(NAME_KEY) || '' } catch { return '' }
  },
  set(v) {
    try { localStorage.setItem(NAME_KEY, v) } catch { /* privater Modus */ }
  },
  clear() {
    try { localStorage.removeItem(NAME_KEY) } catch { /* privater Modus */ }
  },
}

const cleanName = (s) => s.trim().replace(/\s+/g, ' ')
const nameKey = (s) => cleanName(s).toLowerCase()
const menuLabel = (value) => menus.find((m) => m.value === value)?.label ?? '–'

let companionSeq = 0
const newCompanion = (c = {}) => ({
  key: ++companionSeq,
  name: c.name || '',
  menu: c.menu || '',
  allergies: c.allergies || '',
  wish: c.wish || '',
})

const emptyForm = (name = '') => ({
  name,
  attending: null,
  menu: '',
  allergies: '',
  wish: '',
  companions: [],
  message: '',
})

// Datensatz aus der Datenbank → bearbeitbares Formular
const toForm = (r) => ({
  name: r.name,
  attending: r.attending,
  menu: r.menu || '',
  allergies: r.allergies || '',
  wish: r.wish || '',
  companions: (r.companions || []).map(newCompanion),
  message: r.message || '',
})

export default function Rsvp() {
  const [saved, setSaved] = useState(null) // letzte gespeicherte Rückmeldung
  const [mode, setMode] = useState('edit') // view | edit
  const [justSent, setJustSent] = useState(false)
  const [form, setForm] = useState(() => emptyForm(storage.get()))
  const [lookup, setLookup] = useState('idle') // idle | loading
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const lastLookup = useRef('')
  const errorRef = useRef(null)
  const panelRef = useRef(null)

  // Fehlermeldung steht direkt über dem Button – auf kleinen Bildschirmen sichtbar machen
  useEffect(() => {
    if (error) errorRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [error])

  // Beim Wechsel zwischen Übersicht und Formular an den Anfang der Karte springen
  const show = (next) => {
    setMode(next)
    setError('')
    requestAnimationFrame(() => {
      const top = panelRef.current?.getBoundingClientRect().top
      if (top < 80) panelRef.current.scrollIntoView({ block: 'start', behavior: 'smooth' })
    })
  }

  // Bekannter Name? Dann gespeicherte Rückmeldung als Übersicht zeigen.
  async function checkName(raw) {
    const key = nameKey(raw)
    if (key.length < 2 || key === lastLookup.current) return
    lastLookup.current = key
    setLookup('loading')
    try {
      const existing = await getRsvp(cleanName(raw))
      if (lastLookup.current !== key) return // inzwischen anderer Name eingegeben
      if (existing) {
        setSaved(existing)
        setForm(toForm(existing))
        setJustSent(false)
        show('view')
      }
      setError('')
    } catch (err) {
      lastLookup.current = ''
      setError(err.message)
    } finally {
      setLookup('idle')
    }
  }

  // Wiederkehrende Gäste: gemerkten Namen direkt prüfen
  useEffect(() => {
    if (form.name) checkName(form.name)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function submit(e) {
    e.preventDefault()
    const name = cleanName(form.name)
    if (name.length < 2) return setError('Bitte gebt euren Vor- und Nachnamen ein.')
    if (form.attending === null) return setError('Bitte sagt uns, ob ihr dabei seid.')
    if (form.attending) {
      if (!form.menu) return setError(`Bitte wählt ein Menü für ${name}.`)
      const missing = form.companions.findIndex((c) => cleanName(c.name).length < 2 || !c.menu)
      if (missing >= 0) return setError(`Bitte ergänzt Name und Menü für Person ${missing + 2}.`)
    }

    const record = {
      ...form,
      name,
      companions: form.attending
        ? form.companions.map(({ name, menu, allergies, wish }) => ({ name: cleanName(name), menu, allergies, wish }))
        : [],
    }

    setBusy(true)
    setError('')
    try {
      await saveRsvp(record)
      storage.set(name)
      lastLookup.current = nameKey(name)
      setSaved({ ...record, updated_at: new Date().toISOString() })
      setForm(toForm(record))
      setJustSent(true)
      show('view')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  // "Nicht ihr?" – z. B. auf einem gemeinsam genutzten Gerät
  function startOver() {
    storage.clear()
    lastLookup.current = ''
    setSaved(null)
    setJustSent(false)
    setForm(emptyForm())
    show('edit')
  }

  const update = (patch) => setForm((f) => ({ ...f, ...patch }))
  const updateCompanion = (key, patch) =>
    setForm((f) => ({ ...f, companions: f.companions.map((c) => (c.key === key ? { ...c, ...patch } : c)) }))
  const removeCompanion = (key) => setForm((f) => ({ ...f, companions: f.companions.filter((c) => c.key !== key) }))
  const addCompanion = () => setForm((f) => ({ ...f, companions: [...f.companions, newCompanion()] }))

  if (saved && mode === 'view') {
    return <Summary ref={panelRef} rsvp={saved} justSent={justSent} onEdit={() => show('edit')} onStartOver={startOver} />
  }

  const editing = !!saved

  return (
    <section className="panel" aria-labelledby="rsvp-title" ref={panelRef}>
      <PanelHead id="rsvp-title" title={editing ? 'Rückmeldung bearbeiten' : 'Rückmeldung'}>
        {RSVP_DEADLINE && !editing && (
          <p className="deadline">
            Bitte bis zum {RSVP_DEADLINE.toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        )}
        <p className="sub">
          {editing
            ? 'Ändert, was ihr möchtet, und speichert am Ende.'
            : 'Eine Rückmeldung pro Haushalt genügt – tragt einfach alle ein, die mitkommen.'}
        </p>
      </PanelHead>

      <form className="form" onSubmit={submit} noValidate>
        <div className="field">
          <label className="label" htmlFor="rsvp-name">
            Vor- und Nachname
          </label>
          <input
            id="rsvp-name"
            type="text"
            name="name"
            autoComplete="name"
            autoCapitalize="words"
            maxLength={80}
            value={form.name}
            onChange={(e) => update({ name: e.target.value })}
            onBlur={(e) => !editing && checkName(e.target.value)}
            placeholder="z. B. Anna Schmidt"
            aria-describedby={editing ? undefined : 'name-hint'}
            required
          />
          {!editing && (
            <span className="lookup" id="name-hint">
              {lookup === 'loading'
                ? 'Einen Moment, wir schauen nach …'
                : 'Schon geantwortet? Mit demselben Namen seht ihr eure Rückmeldung und könnt sie ändern.'}
            </span>
          )}
        </div>

        <fieldset className="choice-row">
          <legend className="label">Seid ihr dabei?</legend>
          <Choice name="attending" checked={form.attending === true} onChange={() => update({ attending: true })}>
            Ja, gern!
          </Choice>
          <Choice name="attending" checked={form.attending === false} onChange={() => update({ attending: false })}>
            Leider nicht
          </Choice>
        </fieldset>

        {form.attending && (
          <div className="persons">
            <div className="persons-head">
              <span className="label">Gäste &amp; Menü</span>
              <p className="hint">Wählt für jede Person ein Menü. Kinder tragt ihr einfach als weitere Person ein.</p>
            </div>

            <PersonCard person={form} onChange={update} label="Person 1" />

            {form.companions.map((c, i) => (
              <PersonCard
                key={c.key}
                person={c}
                onChange={(patch) => updateCompanion(c.key, patch)}
                label={`Person ${i + 2}`}
                withName
                onRemove={() => removeCompanion(c.key)}
              />
            ))}

            {form.companions.length < 10 && (
              <button type="button" className="add-person" onClick={addCompanion}>
                Weitere Person hinzufügen
              </button>
            )}
          </div>
        )}

        <label className="field">
          <span className="label">
            Nachricht an uns <span className="optional">(optional)</span>
          </span>
          <textarea
            rows={3}
            maxLength={2000}
            value={form.message}
            onChange={(e) => update({ message: e.target.value })}
            placeholder="Ein paar liebe Worte oder ein Musikwunsch für die Tanzfläche …"
          />
        </label>

        {error && (
          <p className="error" role="alert" ref={errorRef}>
            {error}
          </p>
        )}

        <div className="form-actions">
          <button className="button button-block" disabled={busy || lookup === 'loading'}>
            {busy ? 'Wird gesendet …' : editing ? 'Änderungen speichern' : 'Rückmeldung senden'}
          </button>
          {editing && (
            <button
              type="button"
              className="button button-ghost button-block"
              disabled={busy}
              onClick={() => {
                setForm(toForm(saved))
                show('view')
              }}
            >
              Abbrechen
            </button>
          )}
        </div>
      </form>
    </section>
  )
}

// Übersicht einer gespeicherten Rückmeldung
function Summary({ ref, rsvp, justSent, onEdit, onStartOver }) {
  const persons = rsvp.attending
    ? [{ name: rsvp.name, menu: rsvp.menu, allergies: rsvp.allergies }, ...(rsvp.companions || [])]
    : []
  const updated = rsvp.updated_at
    ? new Date(rsvp.updated_at).toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' })
    : null

  return (
    <section className="panel summary" ref={ref} aria-labelledby="rsvp-title" role={justSent ? 'status' : undefined}>
      <PanelHead id="rsvp-title" title={rsvp.attending ? 'Wir freuen uns auf euch!' : 'Schade, dass ihr nicht dabei seid'}>
        <p className="sub">
          {justSent
            ? rsvp.attending
              ? 'Danke! Eure Zusage ist bei uns angekommen.'
              : 'Danke für eure Rückmeldung – wir denken an euch.'
            : 'Eure Rückmeldung liegt uns vor. Ändert sich etwas, könnt ihr sie jederzeit anpassen.'}
        </p>
      </PanelHead>

      <div className="summary-who">
        <p className="names">{rsvp.name}</p>
        <p className="summary-status">
          {rsvp.attending ? `Zusage für ${persons.length} ${persons.length === 1 ? 'Person' : 'Personen'}` : 'Absage'}
        </p>
      </div>

      {rsvp.attending && (
        <ul className="summary-persons">
          {persons.map((p, i) => (
            <li key={i}>
              <span className="names">{p.name}</span>
              <span className="summary-menu">{menuLabel(p.menu)}</span>
              {p.allergies?.trim() && <span className="summary-note">Allergien: {p.allergies}</span>}
            </li>
          ))}
        </ul>
      )}

      {rsvp.message?.trim() && <blockquote className="summary-message">„{rsvp.message.trim()}“</blockquote>}

      <div className="summary-actions">
        <button type="button" className="button button-block" onClick={onEdit}>
          Rückmeldung bearbeiten
        </button>
        <p className="hint">
          {updated && <>Zuletzt geändert am {updated}. </>}
          Nicht {rsvp.name}?{' '}
          <button type="button" className="inline-link" onClick={onStartOver}>
            Andere Rückmeldung eintragen
          </button>
        </p>
      </div>
    </section>
  )
}
