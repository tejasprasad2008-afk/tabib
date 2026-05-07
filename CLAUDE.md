# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Tabib is a decentralized medical triage system for clinics in Arabic-speaking regions. It provides 24/7 AI-powered symptom assessment using local inference (no cloud API calls). The system consists of:

- **Frontend**: React + Vite + TypeScript + Tailwind CSS v4 (Progressive Web App)
- **Backend**: FastAPI (Python 3.11+) with SQLite database
- **AI Inference**: Gemma 4 via Ollama (local), OpenRouter, or Groq API
- **Real-time**: WebSocket for nurse dashboard notifications

## Project Structure

```
tabib/
├── frontend/                    # Patient PWA (React + Vite)
│   ├── src/
│   │   ├── pages/              # Route components (ChatScreen, OTPVerify, etc.)
│   │   ├── components/         # Reusable UI components
│   │   ├── hooks/              # Custom React hooks
│   │   └── lib/                # Utilities and API client
│   ├── .env                    # Frontend env vars (VITE_API_URL)
│   └── package.json
├── tabib-clinic-server/         # Backend server (FastAPI)
│   ├── main.py                 # FastAPI app with all endpoints
│   ├── database.py             # SQLite database operations (aiosqlite)
│   ├── auth.py                 # OTP-based authentication with bcrypt
│   ├── queue_manager.py        # Async queue for AI requests
│   ├── gemma_client.py         # AI client wrapper (Ollama/OpenRouter/Groq/Mock)
│   ├── prompts.py              # System prompts for triage
│   ├── registry.py             # Clinic registry for discovery
│   ├── dashboard/              # Nurse dashboard HTML
│   ├── .env.example            # Backend env template
│   └── requirements.txt
└── patient-frontend/           # Alternative patient frontend (unused)
```

## Common Commands

### Backend Development

```bash
cd tabib-clinic-server

# Install dependencies
pip install -r requirements.txt

# Run development server
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Run production server
uvicorn main:app --host 0.0.0.0 --port 8000

# Run setup script (downloads Ollama model)
./setup.sh  # Mac/Linux
setup.bat   # Windows
```

### Frontend Development

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run serve

# Type check
npm run typecheck
```

## Architecture Notes

### Backend Architecture

- **FastAPI** with async/await throughout
- **SQLite** with `aiosqlite` for async database operations
- **Queue Manager** (`queue_manager.py`) handles AI request processing with background workers
- **AI Client** (`gemma_client.py`) supports multiple providers via `MODEL_PROVIDER` env var:
  - `ollama` - Local Gemma 4 via Ollama (default for production)
  - `openrouter` - Cloud API via OpenRouter
  - `groq` - Cloud API via Groq
  - `mock` - Mock responses for testing
- **Authentication** (`auth.py`): OTP-based with bcrypt phone hashing, JWT-like tokens with 24h expiry
- **WebSocket** (`/ws/dashboard`) for real-time dashboard notifications

### Frontend Architecture

- **Wouter** for client-side routing (lightweight alternative to React Router)
- **TanStack Query** for API state management and caching
- **Radix UI** components with shadcn/ui styling
- **ProtectedRoute** component wraps authenticated routes
- **PWA** with service worker for offline capability

### Database Schema

Tables: `patients`, `sessions`, `notifications`, `queue`

Key relationships:
- `sessions.patient_id` → `patients.id`
- `notifications.patient_id` → `patients.id`
- `notifications.session_id` → `sessions.id`
- `queue.patient_id` → `patients.id`

### API Endpoints

**Authentication:**
- `POST /api/auth/request-otp` - Request 6-digit OTP
- `POST /api/auth/verify-otp` - Verify OTP and get token

**Triage:**
- `POST /api/chat` - Submit symptoms (requires Bearer token)
- `GET /api/queue-status?request_id=...` - Poll for AI completion

**Clinic:**
- `GET /api/clinics?lat=...&lon=...` - Search nearby clinics
- `POST /api/notify-clinic` - Share report with clinic staff
- `GET /api/notifications` - Nurse dashboard feed
- `GET /api/dashboard/config` - Get dashboard PIN

**Health:**
- `GET /health` - Health check with AI status
- `GET /dashboard` - Nurse dashboard (localhost only)

### Environment Variables

**Backend** (copy `.env.example` to `.env`):
- `MODEL_PROVIDER` - AI provider: `ollama`, `openrouter`, `groq`, or `mock`
- `OLLAMA_URL` - Ollama server URL (default: `http://localhost:11434`)
- `MODEL` - Ollama model name (default: `gemma4:26b`)
- `OPENROUTER_API_KEY` - OpenRouter API key
- `GROQ_API_KEY` - Groq API key
- `DEMO_MODE` - Enable demo mode with fixed OTP "123456"
- `DASHBOARD_PIN` - PIN for nurse dashboard (default: `123456`)
- `ALLOW_REMOTE_DASHBOARD` - Allow remote dashboard access
- `FORCE_HTTPS` - Force HTTPS redirects

**Frontend**:
- `VITE_API_URL` - Backend API URL

### Security Considerations

- Phone numbers are hashed with bcrypt before storage
- Tokens have 24-hour expiry
- IDOR protection on queue status endpoint
- Image uploads are validated and EXIF-stripped
- CORS is open for development (restrict in production)
- Dashboard is localhost-only by default

### Demo Mode

When `DEMO_MODE=true`, OTP verification always accepts "123456" regardless of phone number. This is for hackathon/demo purposes only.

### Session Retention

Old sessions are automatically cleaned up after 30 days (configurable in `cleanup_old_sessions`).
