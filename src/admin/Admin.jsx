import { useEffect, useMemo, useState } from 'react'
import { Icon } from '../components/Icons.jsx'
import { Choice, MealFields } from '../components/Choices.jsx'
import { createGuest, deleteGuest, listGuests, logout, updateGuest } from './adminApi.js'
import { downloadCsv, menuLabel, personsOf, stats } from './guests.js'
import './admin.css'

const FILTERS = [
  { id: 'all', label: 'Alle' },
  { id: 'yes', label: 'Zusagen' },
  { id: 'no', label: 'Absagen' },
]

export default function Admin() {
  const [guests, setGuests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [editing, setEditing] = useState(null) // id | 'new' | null
  const [notice, setNotice] = useState('')

  useEffect(() => {
    document.title = 'Gästeliste · Jenny & Finn'
    listGuests()
      .then(setGuests)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!notice) return
    const id = setTimeout(() => setNotice(''), 3000)
    return () => clearTimeout(id)
  }, [notice])

  const summary = useMemo(() => stats(guests), [guests])

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return guests.filter((g) => {
      if (filter === 'yes' && !g.attending) return false
      if (filter === 'no' && g.attending) return false
      if (!q) return true
      return [g.name, g.message, g.allergies, g.wish, ...(g.companions || []).flatMap((c) => [c.name, c.allergies, c.wish])].some((v) =>
        v?.toLowerCase().includes(q),
      )
    })
  }, [guests, query, filter])

  async function save(guest) {
    const saved = guest.id ? await updateGuest(guest.id, guest) : await createGuest(guest)
    setGuests((list) => [saved, ...list.filter((g) => g.id !== saved.id)])
    setEditing(null)
    setNotice(`${saved.name} wurde gespeichert.`)
  }

  async function remove(guest) {
    if (!window.confirm(`Rückmeldung von „${guest.name}“ wirklich löschen?`)) return
    await deleteGuest(guest.id)
    setGuests((list) => list.filter((g) => g.id !== guest.id))
    setEditing(null)
    setNotice(`${guest.name} wurde gelöscht.`)
  }

  async function signOut() {
    await logout().catch(() => {})
    window.location.replace('/')
  }

  return (
    <div className="admin">
      <header className="admin-header">
        <div>
          <h1>Gästeliste</h1>
          <p className="sub">Jenny &amp; Finn · 29. Mai 2027</p>
        </div>
        <div className="admin-actions">
          <button type="button" className="button" onClick={() => setEditing('new')} disabled={editing === 'new'}>
            <Icon name="plus" /> Gast hinzufügen
          </button>
          <button type="button" className="button button-ghost" onClick={() => downloadCsv(guests)} disabled={!guests.length}>
            CSV exportieren
          </button>
          <a className="button button-ghost" href="/">
            Zur Einladung
          </a>
          <button type="button" className="text-button" onClick={signOut}>
            Abmelden
          </button>
        </div>
      </header>

      <section className="stats" aria-label="Übersicht">
        <Stat value={summary.persons} label="Personen kommen" strong />
        <Stat value={summary.yes} label="Zusagen" />
        <Stat value={summary.no} label="Absagen" />
        <Stat value={summary.allergies} label="mit Allergien" />
        <div className="stat stat-menus">
          {summary.menus.map((m) => (
            <span key={m.value}>
              <strong>{m.count}</strong> {m.label}
            </span>
          ))}
        </div>
      </section>

      <div className="toolbar">
        <input
          type="search"
          className="search"
          placeholder="Suchen nach Name, Essenswunsch, Allergie …"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Gästeliste durchsuchen"
        />
        <div className="filter" role="group" aria-label="Filter">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              className="filter-chip"
              aria-pressed={filter === f.id}
              onClick={() => setFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}

      <div className="guest-list">
        {editing === 'new' && <GuestEditor onSave={save} onCancel={() => setEditing(null)} />}

        {loading && <p className="empty">Gästeliste wird geladen …</p>}
        {!loading && !error && !visible.length && (
          <p className="empty">{guests.length ? 'Keine Treffer.' : 'Noch keine Rückmeldungen.'}</p>
        )}

        {visible.map((g) =>
          editing === g.id ? (
            <GuestEditor key={g.id} guest={g} onSave={save} onCancel={() => setEditing(null)} onDelete={() => remove(g)} />
          ) : (
            <GuestRow key={g.id} guest={g} onEdit={() => setEditing(g.id)} />
          ),
        )}
      </div>

      {notice && (
        <p className="toast" role="status">
          {notice}
        </p>
      )}
    </div>
  )
}

function Stat({ value, label, strong }) {
  return (
    <div className={`stat${strong ? ' stat-strong' : ''}`}>
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  )
}

function GuestRow({ guest: g, onEdit }) {
  const persons = personsOf(g)
  return (
    <article className="guest">
      <div className="guest-main">
        <h2>{g.name}</h2>
        <span className={`pill ${g.attending ? 'pill-yes' : 'pill-no'}`}>{g.attending ? 'Zusage' : 'Absage'}</span>
        {g.attending && <span className="guest-count">{persons.length} {persons.length === 1 ? 'Person' : 'Personen'}</span>}
      </div>

      {g.attending && (
        <ul className="guest-persons">
          {persons.map((p, i) => (
            <li key={i}>
              <span>{p.name}</span>
              <span className="muted">{menuLabel(p.menu)}</span>
              <span className="notes">
                {p.wish?.trim() && <span className="wish">{p.wish}</span>}
                {p.allergies?.trim() && <span className="allergy">{p.allergies}</span>}
              </span>
            </li>
          ))}
        </ul>
      )}

      {g.message && <p className="guest-message">„{g.message}“</p>}

      <div className="guest-foot">
        <span className="muted">Aktualisiert {new Date(g.updated_at).toLocaleString('de-DE', { dateStyle: 'medium', timeStyle: 'short' })}</span>
        <button type="button" className="button button-ghost button-small" onClick={onEdit}>
          Bearbeiten
        </button>
      </div>
    </article>
  )
}

let seq = 0
const withKey = (c) => ({ key: ++seq, name: c.name || '', menu: c.menu || '', allergies: c.allergies || '', wish: c.wish || '' })

function GuestEditor({ guest, onSave, onCancel, onDelete }) {
  const [form, setForm] = useState(() => ({
    id: guest?.id,
    name: guest?.name || '',
    attending: guest?.attending ?? true,
    menu: guest?.menu || '',
    allergies: guest?.allergies || '',
    wish: guest?.wish || '',
    companions: (guest?.companions || []).map(withKey),
    message: guest?.message || '',
  }))
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const update = (patch) => setForm((f) => ({ ...f, ...patch }))
  const updateCompanion = (key, patch) =>
    setForm((f) => ({ ...f, companions: f.companions.map((c) => (c.key === key ? { ...c, ...patch } : c)) }))

  async function submit(e) {
    e.preventDefault()
    if (form.name.trim().length < 2) return setError('Bitte einen Namen eingeben.')
    if (form.attending && !form.menu) return setError('Bitte ein Menü auswählen.')
    if (form.attending && form.companions.some((c) => c.name.trim().length < 2 || !c.menu))
      return setError('Bitte für jede Begleitperson Name und Menü angeben.')

    setBusy(true)
    setError('')
    try {
      await onSave({
        ...form,
        name: form.name.trim(),
        menu: form.attending ? form.menu : null,
        companions: form.attending
          ? form.companions.map(({ name, menu, allergies, wish }) => ({ name: name.trim(), menu, allergies, wish }))
          : [],
      })
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  async function handleDelete() {
    setBusy(true)
    try {
      await onDelete()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="guest guest-editing form" onSubmit={submit} noValidate>
      <h2 className="editor-title">{guest ? 'Rückmeldung bearbeiten' : 'Neuer Gast'}</h2>

      <label className="field">
        <span className="label">Name</span>
        <input type="text" value={form.name} maxLength={80} onChange={(e) => update({ name: e.target.value })} autoFocus={!guest} />
      </label>

      <fieldset className="choice-row">
        <legend className="label">Status</legend>
        <Choice name={`att-${form.id || 'new'}`} checked={form.attending} onChange={() => update({ attending: true })}>
          Zusage
        </Choice>
        <Choice name={`att-${form.id || 'new'}`} checked={!form.attending} onChange={() => update({ attending: false })}>
          Absage
        </Choice>
      </fieldset>

      {form.attending && (
        <div className="persons">
          <div className="person">
            <h3 className="person-title">{form.name.trim() || '1. Person'}</h3>
            <MealFields person={form} onChange={update} who="1. Person" />
          </div>

          {form.companions.map((c, i) => (
            <div className="person" key={c.key}>
              <div className="person-head">
                <h3 className="person-title">{c.name.trim() || `${i + 2}. Person`}</h3>
                <button
                  type="button"
                  className="icon-button"
                  aria-label={`${i + 2}. Person entfernen`}
                  onClick={() => update({ companions: form.companions.filter((x) => x.key !== c.key) })}
                >
                  <Icon name="close" />
                </button>
              </div>
              <input
                type="text"
                aria-label={`Name ${i + 2}. Person`}
                placeholder="Vor- und Nachname"
                maxLength={80}
                value={c.name}
                onChange={(e) => updateCompanion(c.key, { name: e.target.value })}
              />
              <MealFields person={c} onChange={(patch) => updateCompanion(c.key, patch)} who={`${i + 2}. Person`} />
            </div>
          ))}

          <button
            type="button"
            className="add-person"
            onClick={() => update({ companions: [...form.companions, withKey({})] })}
          >
            <Icon name="plus" /> Weitere Person hinzufügen
          </button>
        </div>
      )}

      <label className="field">
        <span className="label">Nachricht</span>
        <textarea rows={2} maxLength={2000} value={form.message} onChange={(e) => update({ message: e.target.value })} />
      </label>

      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}

      <div className="editor-actions">
        <button className="button" disabled={busy}>
          {busy ? 'Speichert …' : 'Speichern'}
        </button>
        <button type="button" className="button button-ghost" onClick={onCancel} disabled={busy}>
          Abbrechen
        </button>
        {onDelete && (
          <button type="button" className="text-button danger" onClick={handleDelete} disabled={busy}>
            Löschen
          </button>
        )}
      </div>
    </form>
  )
}
