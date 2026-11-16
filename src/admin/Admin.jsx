import { useEffect, useMemo, useState } from 'react'
import { Icon } from '../components/Icons.jsx'
import { Choice, PersonCard } from '../components/Choices.jsx'
import { Backdrop } from '../components/Botanical.jsx'
import { Monogram, Sprig } from '../components/Ornaments.jsx'
import { WEDDING_DATE_LABEL } from '../content.js'
import { AuthError, createGuest, deleteGuest, listGuests, logout, updateGuest } from './adminApi.js'
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
  const [error, setError] = useState(null) // Error | null
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [editing, setEditing] = useState(null) // id | 'new' | null
  const [notice, setNotice] = useState('')

  useEffect(() => {
    document.title = 'Gästeliste · Jenny & Finn'
    listGuests()
      .then(setGuests)
      .catch(setError)
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
      <Backdrop />

      <nav className="admin-bar" aria-label="Navigation">
        <a href="/" className="bar-link">
          <span aria-hidden="true">←</span> Zur Einladung
        </a>
        <button type="button" className="bar-link" onClick={signOut}>
          Abmelden
        </button>
      </nav>

      <header className="admin-header">
        <Monogram />
        <p className="kicker">Jenny &amp; Finn · {WEDDING_DATE_LABEL}</p>
        <h1 className="title">Gästeliste</h1>
        <Sprig />
      </header>

      <section className="stats" aria-label="Übersicht">
        <Stat value={summary.persons} label={summary.persons === 1 ? 'Person kommt' : 'Personen kommen'} strong />
        <Stat value={summary.yes} label={summary.yes === 1 ? 'Zusage' : 'Zusagen'} />
        <Stat value={summary.no} label={summary.no === 1 ? 'Absage' : 'Absagen'} />
        <Stat value={summary.allergies} label="mit Allergien" />
        <div className="stat stat-menus">
          <span className="stat-label">Menüs</span>
          <ul>
            {summary.menus.map((m) => (
              <li key={m.value}>
                <strong>{m.count}</strong> {m.label}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <div className="toolbar">
        <div className="search-field">
          <Icon name="search" />
          <input
            type="search"
            placeholder="Name, Allergie, Nachricht …"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Gästeliste durchsuchen"
          />
        </div>
        <div className="filter" role="group" aria-label="Filter">
          {FILTERS.map((f) => (
            <button key={f.id} type="button" className="filter-chip" aria-pressed={filter === f.id} onClick={() => setFilter(f.id)}>
              {f.label}
            </button>
          ))}
        </div>
        <div className="toolbar-actions">
          <button type="button" className="button" onClick={() => setEditing('new')} disabled={editing === 'new'}>
            Gast hinzufügen
          </button>
          <button type="button" className="button button-ghost" onClick={() => downloadCsv(guests)} disabled={!guests.length}>
            CSV exportieren
          </button>
        </div>
      </div>

      {error && (
        <div className="error" role="alert">
          <p>{error.message}</p>
          {error instanceof AuthError && (
            <a className="button button-ghost button-small" href="/admin">
              Erneut anmelden
            </a>
          )}
        </div>
      )}

      <div className="guest-list">
        {editing === 'new' && <GuestEditor onSave={save} onCancel={() => setEditing(null)} />}

        {loading && <p className="empty">Gästeliste wird geladen …</p>}
        {!loading && !error && !visible.length && (
          <p className="empty">{guests.length ? 'Keine Treffer für diese Suche.' : 'Noch keine Rückmeldungen – sobald jemand antwortet, erscheint es hier.'}</p>
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
      <span className="stat-label">{label}</span>
    </div>
  )
}

function GuestRow({ guest: g, onEdit }) {
  const persons = personsOf(g)
  return (
    <article className="guest">
      <div className="guest-main">
        <h2 className="names">{g.name}</h2>
        <span className={`pill ${g.attending ? 'pill-yes' : 'pill-no'}`}>{g.attending ? 'Zusage' : 'Absage'}</span>
        {g.attending && (
          <span className="guest-count">
            {persons.length} {persons.length === 1 ? 'Person' : 'Personen'}
          </span>
        )}
      </div>

      {g.attending && (
        <ul className="guest-persons">
          {persons.map((p, i) => (
            <li key={i}>
              <span className="person-name">{p.name}</span>
              <span className="menu-tag">{menuLabel(p.menu)}</span>
              <span className="notes">
                {p.allergies?.trim() && (
                  <span className="note note-allergy">
                    <b>Allergie</b> {p.allergies}
                  </span>
                )}
                {p.wish?.trim() && (
                  <span className="note">
                    <b>Hinweis</b> {p.wish}
                  </span>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}

      {g.message && <blockquote className="guest-message">„{g.message}“</blockquote>}

      <div className="guest-foot">
        <span>Geändert am {new Date(g.updated_at).toLocaleString('de-DE', { dateStyle: 'medium', timeStyle: 'short' })} Uhr</span>
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
    if (form.attending && !form.menu) return setError(`Bitte ein Menü für ${form.name.trim()} auswählen.`)
    const missing = form.attending ? form.companions.findIndex((c) => c.name.trim().length < 2 || !c.menu) : -1
    if (missing >= 0) return setError(`Bitte Name und Menü für Person ${missing + 2} angeben.`)

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
      <h2 className="editor-title title">{guest ? 'Rückmeldung bearbeiten' : 'Neuen Gast eintragen'}</h2>

      <div className="editor-grid">
        <label className="field">
          <span className="label">Vor- und Nachname</span>
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
      </div>

      {form.attending && (
        <div className="persons">
          <PersonCard person={form} onChange={update} label="Person 1" />

          {form.companions.map((c, i) => (
            <PersonCard
              key={c.key}
              person={c}
              onChange={(patch) => updateCompanion(c.key, patch)}
              label={`Person ${i + 2}`}
              withName
              onRemove={() => update({ companions: form.companions.filter((x) => x.key !== c.key) })}
            />
          ))}

          <button type="button" className="add-person" onClick={() => update({ companions: [...form.companions, withKey({})] })}>
            Weitere Person hinzufügen
          </button>
        </div>
      )}

      <label className="field">
        <span className="label">
          Nachricht <span className="optional">(optional)</span>
        </span>
        <textarea rows={2} maxLength={2000} value={form.message} onChange={(e) => update({ message: e.target.value })} />
      </label>

      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}

      <div className="editor-actions">
        <button className="button" disabled={busy}>
          {busy ? 'Wird gespeichert …' : 'Speichern'}
        </button>
        <button type="button" className="button button-ghost" onClick={onCancel} disabled={busy}>
          Abbrechen
        </button>
        {onDelete && (
          <button type="button" className="text-button danger" onClick={handleDelete} disabled={busy}>
            Rückmeldung löschen
          </button>
        )}
      </div>
    </form>
  )
}
