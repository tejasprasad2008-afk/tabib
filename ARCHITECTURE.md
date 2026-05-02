# Tabib Architecture Diagram

## System Overview

```
┌────────────────────────────────────────────────────────┐
│                    PATIENT BROWSER                      │
│  (Mobile Safari, Chrome, Firefox - Any Device)         │
│                                                         │
│  ┌──────────────────────────────────────────────┐    │
│  │  React PWA (Vite + Tailwind + RTL)            │    │
│  │  • Onboarding (Language → Clinic → OTP)      │    │
│  │  • Chat Interface (Text + Image)             │    │
│  │  • Urgency Badges (🔴🟡🟢)                  │    │
│  │  • Notify Clinic Flow                        │    │
│  │  • Queue Status Polling                      │    │
│  │  • Noto Sans Arabic Font                     │    │
│  │  • Service Worker (UI Shell Cache)           │    │
│  └──────────────────────────────────────────────┘    │
└────────┬──────────────────────────────────────────────┘
         │ HTTPS REST API
         │ (All endpoints at VITE_CLINIC_API_URL)
         │
┌────────▼──────────────────────────────────────────────┐
│               CLINIC SERVER (Local)                    │
│  (Each clinic runs independently)                      │
│                                                        │
│  ┌──────────────────────────────────────────────┐   │
│  │  FastAPI Application (Python)                │   │
│  │                                               │   │
│  │  GET  /api/clinics                           │   │
│  │        → Geolocation registry search         │   │
│  │                                               │   │
│  │  POST /api/auth/request-otp                  │   │
│  │        → Send OTP to patient phone           │   │
│  │                                               │   │
│  │  POST /api/auth/verify-otp                   │   │
│  │        → Return patient auth token           │   │
│  │                                               │   │
│  │  POST /api/chat                              │   │
│  │        → Process symptom, delegate to Gemma  │   │
│  │        → Return urgency + response           │   │
│  │        → OR return 202 + queue position      │   │
│  │                                               │   │
│  │  GET  /api/queue-status                      │   │
│  │        → Return current queue position       │   │
│  │        → OR return ready + response          │   │
│  │                                               │   │
│  │  POST /api/notify-clinic                     │   │
│  │        → Store conversation for nurses       │   │
│  │        → Flag nurse dashboard                │   │
│  │                                               │   │
│  └──────────────────────────────────────────────┘   │
│                                                        │
│  ┌──────────────────────────────────────────────┐   │
│  │  Ollama (Local Inference)                    │   │
│  │  • Gemma 4 E4B Model (4B parameters)        │   │
│  │  • Multilingual (Arabic + English)           │   │
│  │  • Multimodal (Text + Images)               │   │
│  │  • REST API at localhost:11434              │   │
│  └──────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────┘
         ↑
         │ Local inference
         │ (No internet required for clinic)
         │
┌────────▼──────────────────────────────────────────────┐
│           CLINIC'S LOCAL HARDWARE                      │
│  • GPU/CPU with 8GB+ RAM                             │
│  • Running 24/7 (or on-demand)                       │
└──────────────────────────────────────────────────────┘
```

## Data Flow: Chat Example

```
1. PATIENT OPENS APP
   ├─ Browser loads PWA from clinic's domain
   ├─ Service Worker caches UI shell (HTML, JS, CSS)
   └─ App detects language

2. ONBOARDING (First Time)
   ├─ Language Selection
   │  └─ Auto-detect or manual toggle (AR/EN)
   ├─ Clinic Search
   │  ├─ Request device geolocation
   │  ├─ POST to /api/clinics?lat=X&lon=Y&radius=20km
   │  ├─ Clinic server returns nearby clinics
   │  └─ Show list for patient selection
   ├─ Select Clinic
   │  ├─ Store clinic URL in localStorage
   │  └─ Move to OTP
   ├─ OTP Verification
   │  ├─ Enter phone number
   │  ├─ POST /api/auth/request-otp → server sends SMS
   │  ├─ Enter 6-digit code
   │  ├─ POST /api/auth/verify-otp → server returns token
   │  ├─ Store token in localStorage
   │  └─ → Chat screen

3. PATIENT SENDS SYMPTOM
   ├─ Type or paste symptom text
   ├─ Optionally attach image
   ├─ Click Send
   ├─ Add to chat history (optimistic UI)
   └─ POST /api/chat
      {
        "patient_id": "...",
        "message": "I have chest pain",
        "image": "base64-or-null"
      }

4a. CLINIC RESPONDS IMMEDIATELY (< 30s)
    ├─ Clinic server receives request
    ├─ Sends to Ollama + Gemma 4
    ├─ Gemma generates response
    ├─ Clinic server returns 200 + response
    ├─ Browser displays in chat with urgency badge
    └─ Show "Notify clinic" button if 🔴 or 🟡

4b. CLINIC IS BUSY (Queue)
    ├─ Clinic server returns 202 Accepted
    ├─ Response: { "queue_position": 5, "request_id": "req-123" }
    ├─ Browser shows modal: "You are #5 in queue"
    ├─ Every 5s, poll GET /api/queue-status?request_id=...
    ├─ When response ready, clinic returns it
    └─ → Same as 4a (display with badge)

5. PATIENT CLICKS "NOTIFY CLINIC"
   ├─ Modal appears: Consent text in Arabic + English
   ├─ Show message + clinic name
   ├─ Require checkbox confirmation
   ├─ On confirm: POST /api/notify-clinic
      {
        "patient_id": "...",
        "conversation": [
          { "role": "patient", "content": "I have chest pain" },
          { "role": "assistant", "content": "🟡 SEE A DOCTOR\n..." }
        ]
      }
   ├─ Clinic server stores conversation + flags nurse dashboard
   ├─ Show confirmation: "Your clinic has been notified"
   └─ Nurse receives alert to call patient
```

## Environment Variables

### Frontend (.env)
```
# Clinic server URL (set per clinic deployment)
VITE_CLINIC_API_URL=http://localhost:8000

# Queue polling interval (ms)
VITE_CHAT_POLL_INTERVAL=1000

# Geolocation search radius (km)
VITE_GEOLOCATION_RADIUS=20

# Default language
VITE_DEFAULT_LANGUAGE=ar
```

## Component Structure (Frontend)

```
src/
├── pages/
│   ├── Onboarding.jsx
│   │   ├─ Language selector
│   │   ├─ ClinicSelector component
│   │   └─ OTPInput component
│   │
│   └── Chat.jsx
│       ├─ ChatMessage list
│       ├─ Message input (text + image)
│       ├─ NotifyClinicModal
│       ├─ WaitingQueue modal
│       └─ Queue polling logic
│
├── components/
│   ├── ClinicSelector.jsx
│   ├── OTPInput.jsx
│   ├── ChatMessage.jsx
│   ├── NotifyClinicModal.jsx
│   └── WaitingQueue.jsx
│
├── hooks/
│   ├── useClinicAPI.js
│   └── useGeoLocation.js
│
├── utils/
│   └── storage.js
│
├── App.jsx (Orchestrator)
└── index.css (RTL + Fonts)
```

## RTL Implementation

- All UI components support `dir="rtl"` and `dir="ltr"`
- Flex layouts use `flex-row-reverse` for RTL
- Text alignment changes based on language
- Noto Sans Arabic loaded from Google Fonts
- Dynamic language toggle in Onboarding

## Service Worker (PWA)

- Caches UI shell (HTML, JS, CSS, fonts)
- No API responses cached
- Chat history in localStorage
- Offline UI loads, but chat requires connection

## Security Model

- No server-side state in frontend
- Clinic URL via environment variable
- Auth token in localStorage (issued by clinic)
- OTP verified server-side
- Explicit patient consent before clinic notification

## Testing Checklist

- ✅ Language detection & toggle
- ✅ Geolocation permissions
- ✅ Clinic selection
- ✅ OTP flow
- ✅ Chat messages (text + image)
- ✅ Urgency badges
- ✅ Queue polling
- ✅ Notify clinic
- ✅ RTL layout
- ✅ Mobile responsiveness
- ✅ Service Worker caching
