// Alle Texte der Seite an einem Ort – hier anpassen.

// Beginn (Ankommen) – steuert Countdown und Kalendereintrag
export const WEDDING_DATE = new Date('2027-05-29T15:00:00+02:00')
// Ende für den Kalendereintrag
export const WEDDING_END = new Date('2027-05-30T02:00:00+02:00')

// Rückmeldefrist, z. B. new Date('2027-03-31') – null blendet den Hinweis aus
export const RSVP_DEADLINE = null

export const welcome =
  'Wir sagen Ja – und möchten diesen Tag mit den Menschen feiern, die uns am meisten bedeuten. Hier findet ihr alles Wichtige rund um unsere Hochzeit.'

export const venue = {
  name: 'Mein Forsthaus',
  place: 'Lübeck-Travemünde',
  street: 'Waldhusener Weg 30',
  city: '23569 Lübeck',
  fullName: 'Mein Forsthaus Waldhusen',
  description: 'Idyllisch im Wald zwischen Lübeck und Travemünde gelegen.',
  // öffnet direkt die Routenplanung in Google Maps (App oder Browser)
  mapsUrl:
    'https://www.google.com/maps/dir/?api=1&destination=Mein+Forsthaus+Waldhusen%2C+Waldhusener+Weg+30%2C+23569+L%C3%BCbeck',
}

export const menus = [
  { value: 'carnivor', label: 'Fleisch' },
  { value: 'pescetarisch', label: 'Pescetarisch' },
  { value: 'vegetarisch', label: 'Vegetarisch' },
  { value: 'vegan', label: 'Vegan' },
]

// Ablauf des Tages – Zeiten & Texte nach Bedarf anpassen
// icon: rings | glass | cake | camera | dinner | music
export const schedule = [
  { time: '15:00', icon: 'glass', title: 'Ankommen', text: 'Wir freuen uns, euch im Forsthaus zu begrüßen.' },
  { time: '15:30', icon: 'rings', title: 'Trauung', text: 'Wir sagen Ja.' },
  { time: '16:30', icon: 'cake', title: 'Kaffee & Kuchen', text: 'Zeit für Glückwünsche, Torte und Gespräche.' },
  { time: '19:00', icon: 'dinner', title: 'Buffet', text: 'Gemeinsames Essen – danach wird gefeiert.' },
]

// Häufige Fragen – BEISPIELE, bitte durch eure echten Antworten ersetzen
export const faqs = [
  {
    q: 'Dürfen wir unsere Kinder mitbringen?',
    a: 'Eure Kinder sind herzlich willkommen! Tragt sie bei der Rückmeldung einfach als weitere Person ein, damit wir mit ihnen planen können.',
  },
  {
    q: 'Gibt es Parkplätze vor Ort?',
    a: 'Ja, direkt am Forsthaus gibt es Parkplätze. Wer feiern möchte, kann das Auto auch gern stehen lassen und mit dem Taxi nach Hause fahren. Wichtig: Alle Autos müssen am nächsten Tag bis 12 Uhr abgeholt sein.',
  },
  {
    q: 'Wo können wir übernachten?',
    a: 'In Travemünde und Lübeck gibt es viele Hotels und Ferienwohnungen. Bucht am besten frühzeitig – Ende Mai ist an der Ostsee Saison.',
  },
  {
    q: 'Was wünscht ihr euch zur Hochzeit?',
    a: 'Das größte Geschenk ist, dass ihr mit uns feiert. Wer uns darüber hinaus etwas schenken möchte, kann gern zu unserer Hochzeitsreise beitragen.',
  },
  {
    q: 'Dürfen wir während der Trauung fotografieren?',
    a: 'Wir wünschen uns eine „unplugged“ Trauung: Lasst die Handys in der Tasche und genießt den Moment mit uns. Unser Fotograf hält alles fest – danach dürft ihr natürlich so viele Fotos machen, wie ihr möchtet.',
  },
]

// Themenblöcke unter "Weitere Infos" (Location kommt aus venue)
export const infos = [
  {
    icon: 'dress',
    label: 'Dresscode',
    title: 'Festlich-sommerlich',
    text: 'Gerne kreativ – aber bitte keine Jeans und keine T-Shirts.',
  },
  {
    icon: 'shoe',
    label: 'Schuhwerk',
    title: 'Bequem im Grünen',
    text: 'Die Trauung findet im Grünen statt. Pfennigabsätze versinken im Rasen – Blockabsätze oder flache Schuhe sind die bessere Wahl. Für die Tanzfläche gerne ein zweites Paar einpacken.',
  },
]
