import { useEffect, useRef, useState } from 'react'
import { getRsvp, saveRsvp } from '../lib/api.js'
import { RSVP_DEADLINE } from '../content.js'
import { Icon } from './Icons.jsx'
import { Choice, MenuPicker } from './Choices.jsx'

const NAME_KEY = 'jf-rsvp-name'

const storage = {
  get() {
    try { return localStorage.getItem(NAME_KEY) || '' } catch { return '' }
  },
  set(v) {
    try { localStorage.setItem(NAME_KEY, v) } catch { /* privater Modus */ }
  },
}

const cleanName = (s) => s.trim().replace(/\s+/g, ' ')
const nameKey = (s) => cleanName(s).toLowerCase()

let companionSeq = 0
const newCompanion = (c = {}) => ({
  key: ++companionSeq,
  name: c.name || '',
  menu: c.menu || '',
  allergies: c.allergies || '',
})

const emptyForm = () => ({
  name: storage.get(),
  attending: null,
  menu: '',
  allergies: '',
  companions: [],
  message: '',
})

export default function Rsvp() {
  const [form, setForm] = useState(emptyForm)
  const [lookup, setLookup] = useState('idle') // idle | loading | found | new
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const lastLookup = useRef('')

  // Bekannter Name? Dann gespeicherte Angaben laden, sonst neu anlegen.
  async function checkName(raw) {
    const key = nameKey(raw)
    if (key.length < 2 || key === lastLookup.current) return
    lastLookup.current = key
    setLookup('loading')
    try {
      const existing = await getRsvp(cleanName(raw))
      if (lastLookup.current !== key) return // inzwischen anderer Name eingegeben
      if (existing) {
        setForm({
          name: existing.name,
          attending: existing.attending,
          menu: existing.menu || '',
          allergies: existing.allergies || '',
          companions: (existing.companions || []).map(newCompanion),
          message: existing.message || '',
        })
        setLookup('found')
      } else {
        setLookup('new')
      }
      setError('')
    } catch (err) {
      lastLookup.current = ''
      setLookup('idle')
      setError(err.message)
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
    if (name.length < 2) return setError('Bitte gib deinen Vor- und Nachnamen ein.')
    if (form.attending === null) return setError('Bitte sag uns, ob du dabei bist.')
    if (form.attending) {
      if (!form.menu) return setError('Bitte wähle dein Menü aus.')
      if (form.companions.some((c) => cleanName(c.name).length < 2 || !c.menu))
        return setError('Bitte gib für jede Person Name und Menü an.')
    }

    setBusy(true)
    setError('')
    try {
      await saveRsvp({
        ...form,
        name,
        companions: form.companions.map(({ name, menu, allergies }) => ({ name: cleanName(name), menu, allergies })),
      })
      storage.set(name)
      lastLookup.current = nameKey(name)
      setLookup('found')
      setDone(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const update = (patch) => setForm((f) => ({ ...f, ...patch }))
  const updateCompanion = (key, patch) =>
    setForm((f) => ({ ...f, companions: f.companions.map((c) => (c.key === key ? { ...c, ...patch } : c)) }))
  const removeCompanion = (key) => setForm((f) => ({ ...f, companions: f.companions.filter((c) => c.key !== key) }))
  const addCompanion = () => setForm((f) => ({ ...f, companions: [...f.companions, newCompanion()] }))

  if (done) {
    const persons = form.companions.length + 1
    return (
      <section className="panel done" role="status">
        <span className="done-icon"><Icon name="check" /></span>
        <h2>{form.attending ? 'Wir freuen uns auf euch!' : 'Schade – danke dir!'}</h2>
        <p>
          {form.attending
            ? `Deine Rückmeldung${persons > 1 ? ` für ${persons} Personen` : ''} ist gespeichert.`
            : 'Deine Absage ist gespeichert. Wir werden an dich denken.'}{' '}
          Mit deinem Namen kannst du sie jederzeit ändern.
        </p>
        <button type="button" className="button button-ghost" onClick={() => setDone(false)}>
          Angaben bearbeiten
        </button>
      </section>
    )
  }

  return (
    <section className="panel" aria-labelledby="rsvp-title">
      <div className="panel-head">
        <h2 id="rsvp-title">Rückmeldung</h2>
        {RSVP_DEADLINE && (
          <p className="deadline">
            Bitte bis zum {RSVP_DEADLINE.toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        )}
        <p className="sub">Schon geantwortet? Gib einfach deinen Namen ein, um deine Angaben zu ändern.</p>
      </div>

      <form className="form" onSubmit={submit} noValidate>
        <label className="field">
          <span className="label">Dein Name</span>
          <input
            type="text"
            name="name"
            autoComplete="name"
            autoCapitalize="words"
            maxLength={80}
            value={form.name}
            onChange={(e) => update({ name: e.target.value })}
            onBlur={(e) => checkName(e.target.value)}
            placeholder="Vor- und Nachname"
            required
          />
          <LookupHint state={lookup} />
        </label>

        <fieldset className="choice-row">
          <legend className="label">Bist du dabei?</legend>
          <Choice name="attending" checked={form.attending === true} onChange={() => update({ attending: true })}>
            Ja, gerne
          </Choice>
          <Choice name="attending" checked={form.attending === false} onChange={() => update({ attending: false })}>
            Leider nicht
          </Choice>
        </fieldset>

        {form.attending && (
          <div className="persons">
            <div>
              <span className="label">Personen & Menüwahl</span>
              <p className="hint">Trage jede Person einzeln ein – Name und Menü sind für alle nötig.</p>
            </div>

            <div className="person">
              <h3 className="person-title">{cleanName(form.name) || '1. Person'}</h3>
              <MenuPicker value={form.menu} onChange={(menu) => update({ menu })} />
              <input
                type="text"
                aria-label="Allergien & Unverträglichkeiten (1. Person)"
                maxLength={500}
                value={form.allergies}
                onChange={(e) => update({ allergies: e.target.value })}
                placeholder="Allergien / Unverträglichkeiten"
              />
            </div>

            {form.companions.map((c, i) => (
              <div className="person" key={c.key}>
                <div className="person-head">
                  <h3 className="person-title">{cleanName(c.name) || `${i + 2}. Person`}</h3>
                  <button
                    type="button"
                    className="icon-button"
                    aria-label={`${i + 2}. Person entfernen`}
                    onClick={() => removeCompanion(c.key)}
                  >
                    <Icon name="close" />
                  </button>
                </div>
                <input
                  type="text"
                  aria-label={`Name ${i + 2}. Person`}
                  autoCapitalize="words"
                  maxLength={80}
                  value={c.name}
                  onChange={(e) => updateCompanion(c.key, { name: e.target.value })}
                  placeholder="Vor- und Nachname"
                />
                <MenuPicker value={c.menu} onChange={(menu) => updateCompanion(c.key, { menu })} />
                <input
                  type="text"
                  aria-label={`Allergien & Unverträglichkeiten (${i + 2}. Person)`}
                  maxLength={500}
                  value={c.allergies}
                  onChange={(e) => updateCompanion(c.key, { allergies: e.target.value })}
                  placeholder="Allergien / Unverträglichkeiten"
                />
              </div>
            ))}

            {form.companions.length < 10 && (
              <button type="button" className="add-person" onClick={addCompanion}>
                <Icon name="plus" /> Weitere Person hinzufügen
              </button>
            )}
          </div>
        )}

        <label className="field">
          <span className="label">Nachricht an Jenny & Finn</span>
          <textarea
            rows={3}
            maxLength={2000}
            value={form.message}
            onChange={(e) => update({ message: e.target.value })}
            placeholder="Optional – ein paar liebe Worte, ein Musikwunsch …"
          />
        </label>

        {error && <p className="error" role="alert">{error}</p>}

        <button className="button button-block" disabled={busy || lookup === 'loading'}>
          {busy ? 'Wird gespeichert …' : lookup === 'found' ? 'Änderungen speichern' : 'Rückmeldung senden'}
        </button>
      </form>
    </section>
  )
}

function LookupHint({ state }) {
  if (state === 'loading') return <span className="lookup">Einen Moment …</span>
  if (state === 'found')
    return <span className="lookup lookup-found">Willkommen zurück! Deine Angaben wurden geladen – du kannst sie jetzt ändern.</span>
  return null
}
