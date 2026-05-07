# AGENTS.md

## Key Commands

### Backend (FastAPI)
```bash
cd tabib-clinic-server
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev        # Development server
npm run build      # Production build
npm run typecheck  # Type checking only
```

## Critical Environment Variables

**Backend** (in `tabib-clinic-server/.env`):
- `MODEL_PROVIDER`: Set to `mock` for testing without AI; `ollama` for local Gemma 4
- `DEMO_MODE=true`: Enables fixed OTP `123456` for testing (do not use in production)
- `DASHBOARD_PIN`: PIN for nurse dashboard access (default: `123456`)

**Frontend** (in `frontend/.env`):
- `VITE_API_URL`: Backend API URL (e.g., `http://localhost:8000`)

## Important Architecture Notes

- **AI requests are async**: Submit via `POST /api/chat`, poll `GET /api/queue-status?request_id=...`
- **Queue processing**: `queue_manager.py` handles AI requests with background workers - don't block on AI calls
- **WebSocket**: Real-time nurse dashboard at `/ws/dashboard` (requires dashboard PIN)
- **Dashboard access**: `GET /dashboard` is localhost-only by default; set `ALLOW_REMOTE_DASHBOARD=true` to enable remote
- **Database**: SQLite with `aiosqlite` - use async queries throughout

## Testing Without AI

Set in `.env`:
```
MODEL_PROVIDER=mock
DEMO_MODE=true
```
Then use OTP `123456` for any phone number.

## Database Schema

Tables: `patients`, `sessions`, `notifications`, `queue`

Key relationship: `sessions.patient_id` → `patients.id`

## Files to Know

- `tabib-clinic-server/main.py` - All FastAPI endpoints
- `tabib-clinic-server/gemma_client.py` - AI provider abstraction (ollama/openrouter/groq/mock)
- `tabib-clinic-server/queue_manager.py` - Async queue for AI processing
- `tabib-clinic-server/auth.py` - OTP authentication with bcrypt phone hashing

## Common Issues

- **Ollama not running**: Run `ollama serve` before starting backend if using `MODEL_PROVIDER=ollama`
- **CORS errors**: CORS is open for development; restrict in production
- **WebSocket connection failed**: Check that dashboard PIN is correct at `/api/dashboard/config`