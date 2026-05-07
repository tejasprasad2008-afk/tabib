# Tabib (طبيب) - Project Overview & Instructions

Tabib is a decentralized, AI-powered medical triage assistant designed for clinics in Arabic-speaking regions. It leverages **Gemma 4** running locally via **Ollama** to provide 24/7 symptom assessment without sending sensitive medical data to the cloud.

## Project Architecture

The project is structured as a full-stack application with a standalone clinic server and a patient-facing Progressive Web App (PWA).

### 1. Backend: Clinic Server (`tabib-clinic-server/`)
- **Framework:** FastAPI (Python 3.11+)
- **Database:** SQLite (via `aiosqlite`) for storing patient sessions, notifications, and request queues.
- **AI Inference:** Integrates with a local **Ollama** instance running `gemma4:26b`.
- **Key Components:**
  - `main.py`: Entry point, API routes, and WebSocket management for the Nurse Dashboard.
  - `queue_manager.py`: Asynchronous task queue to manage LLM inference requests, preventing server overload.
  - `database.py`: Async database schema and operations.
  - `gemma_client.py`: Wrapper for Ollama's API.
  - `prompts.py`: Optimized system prompts for medical triage (Arabic/English) and clinical summarization.
  - `dashboard/`: Static HTML/JS nurse dashboard served at `/dashboard`.

### 2. Frontend: Patient PWA (`frontend/`)
- **Framework:** React 19 + Vite
- **Styling:** Tailwind CSS v4 + Framer Motion for cinematic UI/UX.
- **State Management:** TanStack React Query.
- **Routing:** `wouter`.
- **Key Features:** Multilingual support (Arabic/English), OTP-based authentication, image upload for visual symptom assessment, and offline-first PWA capabilities.

## Technical Setup & Commands

### Prerequisites
- **Python 3.11+**
- **Node.js 18+**
- **Ollama** (installed and running locally)
- **Gemma 4 model**: `ollama pull gemma4:26b`

### Backend Setup
```bash
cd tabib-clinic-server
pip install -r requirements.txt
# Copy .env.example to .env and configure
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## Development Conventions

### AI Safety & Triage Logic
- Triage logic is strictly governed by `TRIAGE_SYSTEM_PROMPT` in `prompts.py`.
- **Absolute Safety Rules:** High-urgency symptoms (chest pain, breathing issues) must trigger an `EMERGENCY` status immediately.
- **No Diagnosis:** The system must never provide a formal diagnosis, only guidance (Home Care, See a Doctor, Emergency).

### Database Management
- Data retention is enforced: old sessions are cleaned up after 30 days (`cleanup_old_sessions` in `database.py`).
- All patient identifiers (phone numbers) are hashed before storage to ensure privacy.

### API & Authentication
- Authentication is handled via 6-digit OTP sent to the patient's phone.
- JWT tokens are used for session persistence.
- CORS is enabled for frontend communication.

## Key Files Summary
- `README.md`: Comprehensive user and setup guide.
- `tabib-clinic-server/main.py`: Primary API logic.
- `tabib-clinic-server/queue_manager.py`: Critical for managing LLM performance.
- `frontend/src/App.tsx`: Main frontend entry point and routing.
- `TABIB_AUDIT_REPORT.md`: Security and architecture audit documentation.
