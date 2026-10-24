// Alle Texte der Seite an einem Ort – hier anpassen.

// Beginn (Uhrzeit bitte prüfen) – steuert Countdown, "Beginn" und Kalendereintrag
export const WEDDING_DATE = new Date('2027-05-29T14:00:00+02:00')
// Ende für den Kalendereintrag
export const WEDDING_END = new Date('2027-05-30T02:00:00+02:00')

// Rückmeldefrist, z. B. new Date('2027-03-31') – null blendet den Hinweis aus
export const RSVP_DEADLINE = null

export const welcome =
  'Wir sagen Ja – und möchten diesen Tag mit den Menschen feiern, die uns am meisten bedeuten. Hier findet ihr alles Wichtige rund um unsere Hochzeit.'

export const venue = {
  name: 'Mein Forsthaus',
  place: 'Lübeck-Travemünde',
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Mein+Forsthaus+Waldhusen+L%C3%BCbeck',
}

export const menus = [
  { value: 'carnivor', label: 'Carnivor' },
  { value: 'pescetarisch', label: 'Pescetarisch' },
  { value: 'vegetarisch', label: 'Vegetarisch' },
  { value: 'vegan', label: 'Vegan' },
]

// Ablauf des Tages – Zeiten & Texte nach Bedarf anpassen
// icon: rings | glass | cake | camera | dinner | music
export const schedule = [
  { time: '14:00', icon: 'glass', title: 'Ankommen', text: 'Empfang mit einem Glas Sekt im Garten des Forsthauses.' },
  { time: '14:30', icon: 'rings', title: 'Freie Trauung', text: 'Wir sagen Ja – unter freiem Himmel.' },
  { time: '15:30', icon: 'cake', title: 'Kaffee & Kuchen', text: 'Gratulationen, Torte und Zeit zum Ankommen.' },
  { time: '17:00', icon: 'camera', title: 'Fotos & Sektempfang', text: 'Gruppenfotos und Zeit für Gespräche.' },
  { time: '18:30', icon: 'dinner', title: 'Abendessen', text: 'Gemeinsames Dinner im Forsthaus.' },
  { time: '21:00', icon: 'music', title: 'Party', text: 'Eröffnungstanz – danach gehört die Tanzfläche euch.' },
]

// Häufige Fragen – BEISPIELE, bitte durch eure echten Antworten ersetzen
export const faqs = [
  {
    q: 'Dürfen wir unsere Kinder mitbringen?',
    a: 'Eure Kinder sind herzlich willkommen! Tragt sie bei der Rückmeldung einfach als weitere Person ein, damit wir mit ihnen planen können.',
  },
  {
    q: 'Gibt es Parkplätze vor Ort?',
    a: 'Ja, direkt am Forsthaus gibt es Parkplätze. Wer feiern möchte, kann das Auto auch gern stehen lassen und mit dem Taxi nach Hause fahren.',
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

export const infos = [
  {
    icon: 'dress',
    title: 'Dresscode',
    text: 'Festlich-sommerlich. Gerne in sanften Grün-, Salbei- und Naturtönen – bitte kein Weiß, das ist der Braut vorbehalten.',
  },
  {
    icon: 'shoe',
    title: 'Schuhwerk',
    text: 'Die Trauung findet im Grünen statt. Pfennigabsätze versinken im Rasen – Blockabsätze oder flache Schuhe sind die bessere Wahl. Für die Tanzfläche gerne ein zweites Paar einpacken.',
  },
  {
    icon: 'pin',
    title: 'Location',
    text: 'Mein Forsthaus liegt idyllisch im Wald zwischen Lübeck und Travemünde – nur wenige Minuten von der Ostsee entfernt.',
    link: { href: venue.mapsUrl, label: 'Route planen' },
  },
]
