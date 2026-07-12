# KSP Intelligence AI — Frontend

React + Vite + Tailwind investigation-workspace UI for the KSP Crime Intelligence backend.

## Setup
```bash
cp .env.example .env   # point VITE_API_BASE_URL at your FastAPI backend
npm install
npm run dev
```

Login with one of the seeded backend users (see `backend/seed_users.py`), e.g. `investigator` / `Inv@1234`.

## Notes
- No Leaflet / force-graph dependency: the hotspot map and criminal network graph are custom SVG components driven by real `/analytics/hotspots` and `/analytics/network` data, to keep the bundle light and avoid extra API keys/tile servers.
- Voice input uses the browser's native `SpeechRecognition` API (Chrome/Edge support it; falls back to hiding the mic icon where unsupported).
- All API calls live in `src/lib/api.js` — one file, matches the real backend contract exactly.
