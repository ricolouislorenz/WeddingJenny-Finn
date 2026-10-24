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
