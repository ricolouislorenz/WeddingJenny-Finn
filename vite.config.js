import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
// `npm run dev`     → nur Frontend mit Hot Reload (ohne Passwortschutz, /api antwortet nicht)
// `npm run preview` → fertiger Build inkl. Pages Functions, verhält sich wie live
export default defineConfig({
  plugins: [react()],
})
