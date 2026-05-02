# Tabib (طبيب) — AGENTS.md

## Quick Start Commands

```bash
# Frontend (marketing + patient app)
cd frontend && npm run dev  # → http://localhost:5173

# Clinic Server (API + nurse dashboard)
cd tabib-clinic-server
pip install -r requirements.txt
python main.py  # → http://localhost:8000
# Dashboard: http://localhost:8000/dashboard (localhost only)
```

## What This Repo Contains

| Component | Location | Runs At |
|-----------|----------|--------|
| **Marketing landing page** | `frontend/src/components/` | `/` |
| **Patient app (PWA)** | `frontend/src/pages/` | `/app/*` |
| **Clinic API server** | `tabib-clinic-server/` | `localhost:8000` |
| **Nurse dashboard** | `tabib-clinic-server/dashboard/` | `/dashboard` (server) |

## System Architecture

```
Patient (browser)
    │
    ├─► http://localhost:5173/      → Marketing landing
    ├─► http://localhost:5173/app    → Patient app (onboarding, chat)
    │
    └─► http://localhost:8000      → Clinic API
         ├─ /api/chat             → AI triage
         ├─ /api/notify-clinic    → Alert nurses
         └─ /dashboard           → Nurse dashboard (LOCALHOST ONLY)
```

## Patient App Routes (`/app/*`)

| Route | Description |
|------|-------------|
| `/app` | Splash screen |
| `/app/onboarding` | Arabic onboarding (3 slides) |
| `/app/phone` | Phone number input |
| `/app/otp` | OTP verification (demo: 123456) |
| `/app/chat` | Main chat (protected) |
| `/app/queue` | Queue status (protected) |
| `/app/profile` | Profile + logout (protected) |
| `/app/success` | Success after notifying clinic (protected) |

## Nurse Dashboard

- **URL**: `http://localhost:8000/dashboard`
- **Access**: Localhost only by default (see `ALLOW_REMOTE_DASHBOARD` env)
- **PIN**: `123456` (set via `DASHBOARD_PIN` env)
- **Features**: Real-time notifications, queue management, patient callbacks

## Environment Variables

### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:8000
```

### Clinic Server (`tabib-clinic-server/.env`)
```env
DASHBOARD_PIN=123456
ALLOW_REMOTE_DASHBOARD=false  # Set to true for remote dashboard access
FORCE_HTTPS=false
```

## Testing with Real Backend

1. Start clinic server first:
   ```bash
   cd tabib-clinic-server && pip install slowapi pydantic python-dotenv && python main.py
   ```

2. In another terminal, start frontend:
   ```bash
   cd frontend && npm run dev
   ```

3. Open http://localhost:5173 → patient app at `/app`

4. Demo OTP: `123456`

## Key Files

- `frontend/src/App.tsx` — Router (marketing + patient app)
- `frontend/src/pages/ChatScreen.tsx` — Main patient chat
- `tabib-clinic-server/main.py` — FastAPI server with all endpoints
- `tabib-clinic-server/dashboard/index.html` — Nurse dashboard (static HTML)

## Gotchas

- Nurse dashboard is served by clinic server, NOT by frontend
- Ollama must be running for AI chat to work (`ollama serve`)
- Frontend makes API calls to clinic server URL in `VITE_API_URL`
- OTP demo code is hardcoded as `123456` in OTPVerify.tsx