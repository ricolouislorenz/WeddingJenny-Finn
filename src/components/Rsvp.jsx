import { useEffect, useRef, useState } from 'react'
import { getRsvp, saveRsvp } from '../lib/api.js'
import { RSVP_DEADLINE } from '../content.js'
import PanelHead from './PanelHead.jsx'
import { Icon } from './Icons.jsx'
import { Choice, MealFields } from './Choices.jsx'

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
  wish: c.wish || '',
})

const emptyForm = () => ({
  name: storage.get(),
  attending: null,
  menu: '',
  allergies: '',
  wish: '',
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
  const errorRef = useRef(null)

  // Fehlermeldung steht direkt über dem Button – auf kleinen Bildschirmen sichtbar machen
  useEffect(() => {
    if (error) errorRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [error])

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
          wish: existing.wish || '',
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
    if (name.length < 2) return setError('Bitte gebt euren Vor- und Nachnamen ein.')
    if (form.attending === null) return setError('Bitte sagt uns, ob ihr dabei seid.')
    if (form.attending) {
      if (!form.menu) return setError(`Bitte wählt ein Menü für ${cleanName(form.name)}.`)
      const missing = form.companions.findIndex((c) => cleanName(c.name).length < 2 || !c.menu)
      if (missing >= 0) return setError(`Bitte ergänzt Name und Menü für Person ${missing + 2}.`)
    }

    setBusy(true)
    setError('')
    try {
      await saveRsvp({
        ...form,
        name,
        companions: form.companions.map(({ name, menu, allergies, wish }) => ({ name: cleanName(name), menu, allergies, wish })),
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
        <span className="done-icon">
          <Icon name="check" />
        </span>
        <h2 className="title">{form.attending ? 'Wir freuen uns auf euch!' : 'Schade, dass ihr nicht dabei seid'}</h2>
        <p>
          {form.attending
            ? `Eure Zusage${persons > 1 ? ` für ${persons} Personen` : ''} ist bei uns angekommen. Danke!`
            : 'Danke für eure Rückmeldung – wir denken an euch.'}
        </p>
        <p className="hint">Falls sich etwas ändert: Mit demselben Namen könnt ihr eure Angaben jederzeit anpassen.</p>
        <button type="button" className="button button-ghost" onClick={() => setDone(false)}>
          Angaben ändern
        </button>
      </section>
    )
  }

  const firstName = cleanName(form.name)

  return (
    <section className="panel" aria-labelledby="rsvp-title">
      <PanelHead id="rsvp-title" kicker="Bitte gebt uns Bescheid" title="Rückmeldung">
        {RSVP_DEADLINE && (
          <p className="deadline">
            Bitte bis zum {RSVP_DEADLINE.toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        )}
        <p className="sub">Eine Rückmeldung pro Haushalt genügt – tragt einfach alle ein, die mitkommen.</p>
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
            onBlur={(e) => checkName(e.target.value)}
            placeholder="z. B. Anna Schmidt"
            aria-describedby="name-hint"
            required
          />
          <LookupHint state={lookup} />
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

            <div className="person">
              <h3 className="person-title names">{firstName || 'Person 1'}</h3>
              <MealFields person={form} onChange={update} who={firstName || 'Person 1'} />
            </div>

            {form.companions.map((c, i) => {
              const label = `Person ${i + 2}`
              return (
                <div className="person" key={c.key}>
                  <div className="person-head">
                    <h3 className="person-title names">{cleanName(c.name) || label}</h3>
                    <button
                      type="button"
                      className="icon-button"
                      aria-label={`${cleanName(c.name) || label} entfernen`}
                      title="Person entfernen"
                      onClick={() => removeCompanion(c.key)}
                    >
                      <Icon name="close" />
                    </button>
                  </div>
                  <label className="mini-field">
                    <span>Vor- und Nachname</span>
                    <input
                      type="text"
                      aria-label={`Vor- und Nachname (${label})`}
                      autoCapitalize="words"
                      maxLength={80}
                      value={c.name}
                      onChange={(e) => updateCompanion(c.key, { name: e.target.value })}
                      placeholder="z. B. Max Schmidt"
                    />
                  </label>
                  <MealFields person={c} onChange={(patch) => updateCompanion(c.key, patch)} who={label} />
                </div>
              )
            })}

            {form.companions.length < 10 && (
              <button type="button" className="add-person" onClick={addCompanion}>
                <Icon name="plus" /> Weitere Person hinzufügen
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

        <button className="button button-block" disabled={busy || lookup === 'loading'}>
          {busy ? 'Wird gesendet …' : lookup === 'found' ? 'Änderungen speichern' : 'Rückmeldung senden'}
        </button>
      </form>
    </section>
  )
}

function LookupHint({ state }) {
  if (state === 'loading')
    return (
      <span className="lookup" id="name-hint">
        Einen Moment, wir schauen nach …
      </span>
    )
  if (state === 'found')
    return (
      <span className="lookup lookup-found" id="name-hint">
        <Icon name="check" /> Willkommen zurück! Eure Angaben sind geladen – ändert einfach, was ihr möchtet.
      </span>
    )
  return (
    <span className="lookup" id="name-hint">
      Schon geantwortet? Mit demselben Namen ladet ihr eure Angaben und könnt sie ändern.
    </span>
  )
}
