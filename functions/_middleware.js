// Cloudflare Pages: Diese Middleware läuft vor JEDER Anfrage (Seiten, JS, CSS, Bilder, API).
// Die eigentliche Logik steckt in server/app.js.
import { handle } from '../server/app.js'

export const onRequest = ({ request, env, next }) => handle(request, env, next)
