import { menus } from '../content.js'

export const menuLabel = (value) => menus.find((m) => m.value === value)?.label ?? '–'

// Alle Personen einer Rückmeldung (Hauptperson + Begleitung)
export const personsOf = (g) =>
  g.attending ? [{ name: g.name, menu: g.menu, allergies: g.allergies }, ...(g.companions || [])] : []

export function stats(guests) {
  const persons = guests.flatMap(personsOf)
  return {
    responses: guests.length,
    yes: guests.filter((g) => g.attending).length,
    no: guests.filter((g) => !g.attending).length,
    persons: persons.length,
    menus: menus.map((m) => ({ ...m, count: persons.filter((p) => p.menu === m.value).length })),
    allergies: persons.filter((p) => p.allergies?.trim()).length,
  }
}

// Eine Zeile pro Person – direkt in Excel/Numbers nutzbar (Semikolon + BOM für deutsches Excel)
export function downloadCsv(guests) {
  const cell = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const header = ['Rückmeldung von', 'Person', 'Status', 'Menü', 'Allergien & Unverträglichkeiten', 'Nachricht', 'Aktualisiert']
  const rows = guests.flatMap((g) => {
    const updated = new Date(g.updated_at).toLocaleString('de-DE')
    if (!g.attending) return [[g.name, g.name, 'Absage', '', '', g.message, updated]]
    return personsOf(g).map((p, i) => [
      g.name,
      p.name,
      'Zusage',
      menuLabel(p.menu),
      p.allergies,
      i === 0 ? g.message : '',
      updated,
    ])
  })
  const csv = '﻿' + [header, ...rows].map((r) => r.map(cell).join(';')).join('\r\n')
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
  const date = new Date().toISOString().slice(0, 10)
  Object.assign(document.createElement('a'), { href: url, download: `gaesteliste-${date}.csv` }).click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
