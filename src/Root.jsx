import { Suspense, lazy } from 'react'
import App from './App.jsx'

// Admin-Bereich als eigenes Bundle – Gäste laden diesen Code nie
const Admin = lazy(() => import('./admin/Admin.jsx'))

export default function Root() {
  if (!/^\/admin\/?$/.test(window.location.pathname)) return <App />
  return (
    <Suspense fallback={null}>
      <Admin />
    </Suspense>
  )
}
