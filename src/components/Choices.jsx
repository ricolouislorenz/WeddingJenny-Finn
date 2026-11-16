import { useId } from 'react'
import { menus } from '../content.js'
import { Icon } from './Icons.jsx'

const clean = (s) => (s || '').trim().replace(/\s+/g, ' ')

// Karte für eine Person (Gästeformular & Admin-Bereich):
// Begleitpersonen haben ein eigenes Namensfeld und lassen sich entfernen.
export function PersonCard({ person, onChange, label, withName = false, onRemove }) {
  const title = clean(person.name) || label
  return (
    <div className="person">
      <div className="person-head">
        <h3 className="person-title names">{title}</h3>
        {onRemove && (
          <button type="button" className="icon-button" aria-label={`${title} entfernen`} title="Person entfernen" onClick={onRemove}>
            <Icon name="close" />
          </button>
        )}
      </div>
      {withName && (
        <label className="mini-field">
          <span>Vor- und Nachname</span>
          <input
            type="text"
            aria-label={`Vor- und Nachname (${label})`}
            autoCapitalize="words"
            maxLength={80}
            value={person.name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="z. B. Max Schmidt"
          />
        </label>
      )}
      <MealFields person={person} onChange={onChange} who={title} />
    </div>
  )
}

// Auswahl-Kachel (Radio-Button) – genutzt im Gästeformular und in der Admin-Ansicht
export function Choice({ name, checked, onChange, children }) {
  return (
    <label className={`choice${checked ? ' is-checked' : ''}`}>
      <input type="radio" name={name} checked={checked} onChange={onChange} />
      {children}
    </label>
  )
}

// Menü, Essenshinweis und Allergien einer Person
export function MealFields({ person, onChange, who }) {
  return (
    <>
      <MenuPicker value={person.menu} onChange={(menu) => onChange({ menu })} who={who} />
      <label className="mini-field">
        <span>
          Allergien &amp; Unverträglichkeiten <em>(optional)</em>
        </span>
        <input
          type="text"
          aria-label={`Allergien & Unverträglichkeiten (${who})`}
          maxLength={500}
          value={person.allergies}
          onChange={(e) => onChange({ allergies: e.target.value })}
          placeholder="z. B. Nüsse, Laktose"
        />
      </label>
      <label className="mini-field">
        <span>
          Sonstiger Hinweis zum Essen <em>(optional)</em>
        </span>
        <input
          type="text"
          aria-label={`Sonstiger Hinweis zum Essen (${who})`}
          maxLength={500}
          value={person.wish}
          onChange={(e) => onChange({ wish: e.target.value })}
          placeholder="z. B. Kinderportion"
        />
      </label>
    </>
  )
}

export function MenuPicker({ value, onChange, who }) {
  const name = useId()
  return (
    <fieldset>
      <legend className="mini-legend">
        Menü<span className="visually-hidden">{who ? ` (${who})` : ''}</span>
      </legend>
      <div className="menu-list">
        {menus.map((m) => (
          <Choice key={m.value} name={name} checked={value === m.value} onChange={() => onChange(m.value)}>
            {m.label}
          </Choice>
        ))}
      </div>
    </fieldset>
  )
}
