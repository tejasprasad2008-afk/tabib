# Tabib (طبيب) — Clinic-Connected Health Triage PWA

## Architecture Change

**OLD**: Standalone app with Gemma 4 running locally on patient device  
**NEW**: Patient-facing PWA connecting to clinic servers running Gemma 4 locally

This approach enables:
- ✅ No AI model on patient device (lighter app, any browser)
- ✅ Clinic owns & controls patient data (privacy by design)
- ✅ Clinic can update AI model independently
- ✅ Simple scaling (add clinics, not patient capacity)
- ✅ No cloud dependency (clinic server is local)

## What Was Built

Complete patient-facing React PWA with full onboarding, chat, and clinic notification flows.

### Project Structure

```
/Users/tejasprasad/GEMMA 4 HACKATHON/
├── README.md                # Complete user guide
├── SETUP.md                 # Development & deployment setup
├── ARCHITECTURE.md          # System architecture diagram
├── PROJECT_SUMMARY.md       # This file
├── .gitignore               # Git ignore rules
├── assets/
│   └── screenshots/         # (placeholder for demos)
└── frontend/
    ├── .env                 # Local dev config
    ├── .env.example         # Template for clinics
    ├── index.html           # HTML entry point (RTL)
    ├── package.json         # Node dependencies
    ├── vite.config.js       # Vite + PWA config
    ├── tailwind.config.js   # Tailwind CSS config
    ├── postcss.config.js    # PostCSS config
    └── src/
        ├── pages/
        │   ├── Onboarding.jsx      # Language → Clinic → OTP flow
        │   └── Chat.jsx            # Main chat interface
        ├── components/
        │   ├── ClinicSelector.jsx  # Geolocation clinic search
        │   ├── OTPInput.jsx        # Phone + OTP verification
        │   ├── ChatMessage.jsx     # Message bubble + urgency badge
        │   ├── NotifyClinicModal.jsx # Consent + notify clinic
        │   └── WaitingQueue.jsx    # Queue status polling UI
        ├── hooks/
        │   ├── useClinicAPI.js     # All API calls to clinic server
        │   └── useGeoLocation.js   # Geolocation wrapper
        ├── utils/
        │   └── storage.js          # localStorage persistence
        ├── App.jsx                 # Main orchestrator
        ├── main.jsx                # React entry point
        └── index.css               # RTL + Arabic font + Tailwind
```

## Key Features Implemented

### Onboarding (First Time Only)
- ✅ Language auto-detection (device language)
- ✅ Manual language toggle (Arabic ↔ English)
- ✅ Geolocation clinic search (up to 20km radius)
- ✅ Clinic selection from filtered list
- ✅ OTP authentication (phone + code)
- ✅ Token storage in localStorage

### Chat Interface
- ✅ Text symptom input (Arabic keyboard friendly)
- ✅ Image upload with preview
- ✅ Full message history persistence
- ✅ Clinic response with urgency badge (🔴🟡🟢)
- ✅ "Notify clinic" button (for 🔴 and 🟡)
- ✅ Timestamp on messages

### Clinic Notification
- ✅ Consent modal (Arabic + English)
- ✅ Explicit checkbox confirmation
- ✅ Send conversation to clinic server
- ✅ Confirmation message to patient

### Queue Management
- ✅ Queue position display when clinic is busy
- ✅ Automatic polling every 5 seconds
- ✅ Graceful display of wait time
- ✅ Automatic display when response ready

### Design & Accessibility
- ✅ Full RTL layout for Arabic (dir="rtl")
- ✅ Large text (16px+ for inputs/buttons)
- ✅ Large tap targets (44px+)
- ✅ High contrast colors
- ✅ Noto Sans Arabic font from Google Fonts
- ✅ Mobile-first responsive design
- ✅ Simple language, no jargon
- ✅ ARIA labels where needed

### Progressive Web App
- ✅ Service Worker caches UI shell
- ✅ Offline app shell loads without connection
- ✅ localStorage for chat history & auth
- ✅ Installable on home screen
- ✅ Vite + Tailwind CSS for fast builds

### Configuration
- ✅ Environment variables for clinic deployment
- ✅ No hardcoded clinic URLs
- ✅ Per-clinic customizable
- ✅ .env.example template

## Files Created

### Pages (2)
- `src/pages/Onboarding.jsx` — Clinic discovery & auth
- `src/pages/Chat.jsx` — Main chat interface

### Components (5)
- `src/components/ClinicSelector.jsx` — Geolocation search
- `src/components/OTPInput.jsx` — Phone + code verification
- `src/components/ChatMessage.jsx` — Message bubble with badges
- `src/components/NotifyClinicModal.jsx` — Consent + submission
- `src/components/WaitingQueue.jsx` — Queue status modal

### Hooks (2)
- `src/hooks/useClinicAPI.js` — All API calls (6 methods)
- `src/hooks/useGeoLocation.js` — Geolocation permission handling

### Utils (1)
- `src/utils/storage.js` — localStorage wrapper

### App Entry (2)
- `src/App.jsx` — Main app orchestrator
- `src/main.jsx` — React entry point (unchanged)

### Styling (1)
- `src/index.css` — Tailwind + RTL + Arabic fonts

### Config (4)
- `.env` — Local dev config
- `.env.example` — Clinic deployment template
- `vite.config.js` — Vite + PWA setup
- `index.html` — HTML entry (dir="rtl")

### Documentation (3)
- `README.md` — Complete user & deployment guide
- `SETUP.md` — Development setup & testing
- `ARCHITECTURE.md` — System architecture diagram

## Deleted Files

### Backend (Entire folder removed)
- `backend/main.py` — No longer needed
- `backend/requirements.txt` — No longer needed
- `backend/.env` — No longer needed
- `backend/.env.example` — No longer needed

**Reason**: Clinics now run their own FastAPI + Ollama servers

### Old API Client
- `src/api.js` — Replaced with `useClinicAPI.js`

**Reason**: Old API called local FastAPI; new version calls clinic servers

## Environment Variables

### Development (.env)
```env
VITE_CLINIC_API_URL=http://localhost:8000
VITE_CHAT_POLL_INTERVAL=1000
VITE_GEOLOCATION_RADIUS=20
VITE_DEFAULT_LANGUAGE=ar
```

### Per-Clinic Deployment
Clinics set their own server URL:
```env
VITE_CLINIC_API_URL=https://clinic1.example.com
VITE_CLINIC_API_URL=https://clinic2.example.com
# etc.
```

## API Contract (Expected by Frontend)

Clinic servers must implement:

**GET /api/clinics?lat=X&lon=Y&radius=20**
- Returns: `[{ id, name, lat, lon, distance, api_url }]`

**POST /api/auth/request-otp**
- Input: `{ phone }`
- Returns: `{ success: true }`

**POST /api/auth/verify-otp**
- Input: `{ phone, otp }`
- Returns: `{ token, patient_id }`

**POST /api/chat**
- Input: `{ patient_id, message, image? }`
- Returns: `{ response, urgency, request_id }` OR 202 with queue

**GET /api/queue-status**
- Input: query params `request_id`, `patient_id`
- Returns: `{ queue_position }` OR `{ ready: true, response }`

**POST /api/notify-clinic**
- Input: `{ patient_id, conversation }`
- Returns: `{ success: true }`

## Next Steps

### For Testing
1. Create mock clinic server (example in SETUP.md)
2. Run `npm run dev` in frontend/
3. Test onboarding, chat, notify, queue flows
4. Verify RTL Arabic layout

### For Deployment
1. Clinics build their own FastAPI servers
2. Each clinic sets `VITE_CLINIC_API_URL` to their server
3. Deploy frontend to static host (Vercel, Netlify, etc.)
4. Patients access: `https://clinic.example.com/`

### For Production
- [ ] Security audit (OWASP, auth, CORS)
- [ ] Performance testing (load, latency)
- [ ] User testing (a/b with Arabic speakers)
- [ ] Demo video
- [ ] Kaggle competition submission

## Technology Stack

### Frontend
- React 18
- Vite 5
- Tailwind CSS 3
- Noto Sans Arabic (Google Fonts)
- Workbox PWA
- No external UI library (pure HTML/CSS)

### No Backend in This Project
- Clinics provide their own FastAPI + Ollama
- Frontend is 100% static (PWA)
- Deployable anywhere (Vercel, Netlify, S3, etc.)

## Status Summary

✅ **Phase 1**: Architecture refactor (backend removed)  
✅ **Phase 2**: Onboarding flow (language, clinic, OTP)  
✅ **Phase 3**: Chat interface (messages, images, urgency)  
✅ **Phase 4**: Clinic notification (consent, submission)  
✅ **Phase 5**: Queue polling (status, polling, display)  
✅ **Phase 6**: Styling & RTL (full RTL, accessibility, mobile)  
✅ **Phase 7**: Documentation (README, SETUP, ARCHITECTURE)  

**Ready for deployment & testing!**

## Quick Start

```bash
# Install
cd frontend && npm install

# Setup env
cp .env.example .env
# Edit .env with your clinic server URL

# Run dev server
npm run dev

# Open http://localhost:5173
```

## Notes

- All patient data stays with clinic (no cloud)
- No hardcoded clinic URLs (environment variable)
- Service Worker caches UI, not data
- localStorage handles persistence
- OTP is simple auth (clinics can enhance)
- Works on any modern browser (mobile first)

---

Built for Gemma 4 Good Hackathon | CC-BY 4.0 License
