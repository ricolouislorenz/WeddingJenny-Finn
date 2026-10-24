import react from '@vitejs/plugin-react'
import { cloudflare } from '@cloudflare/vite-plugin'
import { defineConfig } from 'vite'

// https://vite.dev/config/
// Das Cloudflare-Plugin führt den Worker (Passwortschutz, API) auch bei `npm run dev` aus.
export default defineConfig({
  plugins: [react(), cloudflare()],
})
