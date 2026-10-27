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

// Menü, Essenswunsch und Allergien einer Person
export function MealFields({ person, onChange, who }) {
  return (
    <>
      <MenuPicker value={person.menu} onChange={(menu) => onChange({ menu })} />
      <label className="mini-field">
        <span>Essenswunsch</span>
        <input
          type="text"
          aria-label={`Essenswunsch (${who})`}
          maxLength={500}
          value={person.wish}
          onChange={(e) => onChange({ wish: e.target.value })}
          placeholder="optional, z. B. kleine Portion"
        />
      </label>
      <label className="mini-field">
        <span>Allergien & Unverträglichkeiten</span>
        <input
          type="text"
          aria-label={`Allergien & Unverträglichkeiten (${who})`}
          maxLength={500}
          value={person.allergies}
          onChange={(e) => onChange({ allergies: e.target.value })}
          placeholder="optional, z. B. Nüsse"
        />
      </label>
    </>
  )
}

export function MenuPicker({ value, onChange }) {
  const name = useId()
  return (
    <fieldset className="menu-list">
      <legend className="visually-hidden">Menü</legend>
      {menus.map((m) => (
        <Choice key={m.value} name={name} checked={value === m.value} onChange={() => onChange(m.value)}>
          {m.label}
        </Choice>
      ))}
    </fieldset>
  )
}
