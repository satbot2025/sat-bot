# SAT Bot (www.sat-bot.com)

A calm, study-friendly companion. Mobile-first UI, PWA install, and offline shell. This repo currently ships a static front-end you can host anywhere (Netlify, Vercel, S3, Nginx).

## What’s included
- Study-friendly design: readable typography, muted chrome, Focus mode
- Mobile-first layout and large tap targets
- PWA: manifest + service worker for install/offline
- Minimal chat shell (echo) for later backend wiring

## File map
- `/index.html` — main page
- `/static/styles.css` — styles
- `/static/app.js` — UI logic + PWA registration
- `/manifest.webmanifest` — app manifest
- `/sw.js` — service worker (cache shell + offline fallback)
- `/offline.html` — offline page
- `/static/icons/` — icons (add PNGs: 192, 512, and maskable)
- `/templates/index.html` — small redirect for environments expecting templates/

## TypeScript-only site (Next.js)
We added a full TypeScript app in `web/` using Next.js (App Router). No raw HTML files—pages are `.tsx`.

### Run locally
```powershell
cd web
npm install
npm run dev
```
Open http://localhost:3000

## Domain and HTTPS
- Set your domain A/AAAA records to your host.
- Ensure HTTPS (Let’s Encrypt/Auto TLS). PWA install requires HTTPS in production.
- Update links in any backend to absolute `https://www.sat-bot.com/` if needed.

## Adding real chat
This UI is a shell. To add a backend:
1. Add a `/api/chat` endpoint (Node, Python, etc.).
2. In `static/app.js`, replace the echo with a `fetch('/api/chat')` call.
3. Stream responses for best UX (Server-Sent Events or Fetch streaming).

## Icons
Add PNGs for widest device support:
- `static/icons/icon-192.png`
- `static/icons/icon-512.png`
- `static/icons/maskable-192.png`
- `static/icons/maskable-512.png`

You can export from the provided SVG.

## More ideas to enhance studying
- Streaks & gentle reminders (opt-in, low-pressure)
- Focus timers (Pomodoro) with auto-do-not-disturb
- Quick formula sheets and vocab drills
- Offline packs for practice questions
- Night mode tuning: amber accent after 10pm
- Haptics and subtle sounds (mobile) for progress
- Keyboard-first shortcuts on desktop

## Deploying (Next.js)
Deploy the `web/` app to any Next.js-capable host (Vercel, Render, Fly, your own Node server). Example Nginx snippet if you self-host:

```
location /sw.js { add_header Cache-Control "no-store"; }
location = /manifest.webmanifest { add_header Cache-Control "no-store"; }
```

This avoids sticky caches during updates.

## License
MIT
