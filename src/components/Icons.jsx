// Inline-SVGs: keine zusätzlichen Requests, färben sich über currentColor.

const paths = {
  dress: 'M9 3h6l-1 4 4 14H6l4-14-1-4Zm1 4h4',
  shoe: 'M3 17h18v-2c0-1.5-1-2.5-3-3l-5-1.5L10 6H6l-1 5H3v6Zm2 0v2m14-2v2',
  pin: 'M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21Zm0-9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z',
  calendar: 'M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7Zm0 3h16M8 3v4m8-4v4',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-13v4.5l3 2',
  rings: 'M14 14.5a5 5 0 1 1-10 0 5 5 0 0 1 10 0Zm6 0a5 5 0 1 1-10 0 5 5 0 0 1 10 0ZM7.5 7 9 4.5l1.5 2.5',
  glass: 'M8 3h8l-.8 6.5a3.2 3.2 0 0 1-6.4 0L8 3Zm4 9.7V20m-3 0h6',
  cake: 'M4 20h16M5 20v-6h14v6M7 14v-3h10v3m-5-3V8m0-4c-.8 1-.8 2 0 2.5.8-.5.8-1.5 0-2.5Z',
  camera: 'M4 8h3l2-2.5h6L17 8h3v11H4V8Zm8 8.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z',
  dinner: 'M7 3v8m-2.5-8v5a2.5 2.5 0 0 0 5 0V3M7 11v10M17 21V3c-2.5 1.5-3 5-3 8h3',
  music: 'M9 18V5.5L20 3.5V16M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm11-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z',
  plus: 'M12 5v14M5 12h14',
  close: 'M6 6l12 12M18 6 6 18',
  check: 'M5 12.5l4.5 4.5L19 7',
}

export function Icon({ name, className = 'icon' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path d={paths[name]} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
