import { useId } from 'react'
import { menus } from '../content.js'

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
