![Tabib Banner](tabibbanner.png)

# <div dir="rtl" align="center">طبيب</div>

<div align="center">

**Your AI-powered medical triage assistant | مساعدك الطبي الذكي للتقييم الأولي**

[![Built with Gemma 4](https://img.shields.io/badge/Built%20with-Gemma%204-4285F4?logo=google)](https://ai.google.dev/gemma)
[![Offline-First](https://img.shields.io/badge/Offline--First-green)](#)
[![Arabic-First](https://img.shields.io/badge/Arabic--First-orange)](#)
[![License: CC-BY 4.0](https://img.shields.io/badge/License-CC--BY%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by/4.0/)

</div>

---

## 🏥 What is Tabib? (For Clinic Administrators)

**Tabib** helps clinics provide 24/7 initial symptom assessment to their patients using AI that runs entirely on the clinic's own computer.

### The Problem We Solve

Imagine a patient at home at 11 PM with worrying symptoms. They don't know if it's serious enough for the emergency room or something they can treat at home. They call your clinic, but no one answers. This creates anxiety for patients and unnecessary visits for minor issues.

**Tabib solves this:** Patients open a website on their phone, describe their symptoms in Arabic (or English), and immediately receive guidance on what to do next.

### How It Works (Simple Version)

1.  Your clinic installs our software on your existing computer (takes ~30 minutes)
2.  Patients visit your clinic's web address on their phone
3.  They enter their phone number and get a verification code
4.  They type or speak their symptoms in Arabic
5.  Our AI (running on YOUR computer, not the cloud) analyzes the symptoms
6.  The patient gets clear guidance: 🟢 Home care / 🟡 See a doctor soon / 🔴 Emergency
7.  If needed, patients can tap "Notify Clinic" and your nurse dashboard alerts you to call them back

### What Tabib Does NOT Do

- ❌ **It does NOT diagnose** — It provides guidance only, not a medical diagnosis
- ❌ **It does NOT replace doctors** — It helps patients decide when to see a doctor
- ❌ **It does NOT store data in the cloud** — Everything stays on your clinic's computer
- ❌ **It does NOT prescribe medication** — It suggests general care steps only

### Who Is This For?

- Small to medium clinics in Arabic-speaking regions
- Community health centers and NGOs
- Rural clinics without 24/7 staffing
- Any healthcare provider wanting to reduce unnecessary visits while improving patient guidance

### System Flow

```
Patient Phone (anywhere in city)
        │
        ▼
    [Internet]
        │
        ▼
Clinic PC running Gemma 4 AI
        │
        ▼
Arabic triage response generated
        │
        ▼
🔴 Emergency / 🟡 See Doctor / 🟢 Home Care
        │
        ▼
Patient taps "Notify Clinic" if needed
        │
        ▼
    Nurse Dashboard
        │
        ▼
Nurse receives alert → Calls patient back
```

---

## 💻 System Requirements

### Clinic Server (The PC You Install On)

| Requirement | Minimum | Recommended |
|-------------|---------|-------------|
| **Operating System** | Windows 10 or Ubuntu 20.04+ | Windows 11 or Ubuntu 22.04+ |
| **RAM** | 12GB (slower) | 16GB or more |
| **Storage** | 50GB free space | 100GB SSD |
| **CPU** | Any modern processor from 2018+ | 6+ cores |
| **Internet** | Required for setup only | Stable connection |
| **GPU** | Not required (CPU works fine) | NVIDIA GPU optional for faster responses |
| **Cost** | Runs on hardware you likely already own | ~$300-500 if buying used |

**Note:** The AI model is about 18GB. The installer downloads this automatically.

### Patient Device (What Your Patients Use)

| Requirement | Details |
|-------------|---------|
| **Device** | Any smartphone or tablet from 2015 or newer |
| **Browser** | Chrome, Safari, Firefox (any modern browser) |
| **App Download** | None required — opens directly in browser |
| **Network** | Works on 3G, 4G, 5G, or WiFi |
| **Data Usage** | ~200KB to load the app, ~50KB per consultation |
| **Account** | Phone number only (no email, no password) |

---

## 🚀 Quick Start for Clinics

Follow these steps exactly. No technical knowledge required.

### Step 1: Download the Clinic Server

Download or clone this repository to your clinic computer:

```bash
# If you have Git installed:
git clone https://github.com/YOUR_ORG/tabib.git

# OR download as ZIP and extract to C:\tabib or ~/tabib
```

### Step 2: Run the Installer

The installer sets up everything automatically: Python, the AI model, and all dependencies.

**On Windows:**
```bash
cd tabib
cd tabib-clinic-server
setup.bat
```

**On Mac/Linux:**
```bash
cd tabib
cd tabib-clinic-server
chmod +x setup.sh
./setup.sh
```

**⚠️ IMPORTANT: Model Download Time**

The installer will download the Gemma 4 model (~18GB). Estimated times:

| Internet Speed | Download Time |
|----------------|---------------|
| 10 Mbps | ~4 hours |
| 50 Mbps | ~45 minutes |
| 100 Mbps | ~25 minutes |
| 200 Mbps | ~12 minutes |

**Do not interrupt this download.** If it fails, re-run the installer.

### Step 3: Answer the Setup Questions

The installer will ask you:

1.  **Clinic name** — Enter your clinic's official name (e.g., "Al-Noor Medical Center")
2.  **City** — Your city name (e.g., "Dubai", "Riyadh", "Cairo")
3.  **Contact phone** — Clinic phone number for patients
4.  **Auto-detect location?** — Type `y` to use your current location, or `n` to enter manually

The installer will also generate a **6-digit PIN** for your nurse dashboard. **Write this down!** You will need it to access the dashboard.

### Step 4: Confirm Your Server Is Running

After setup completes, the server should start automatically. To verify:

1.  Open your browser
2.  Go to: `http://localhost:8000/health`
3.  You should see a page showing `"status": "ok"`

If you see an error, check that:
- Port 8000 is not blocked by your firewall
- Ollama is running (search for "Ollama" in your system tray)

### Step 5: Share Your Clinic URL with Patients

Patients need a web address to access your clinic. You have three options:

**Option A: Use Your Public IP (Quick Test)**

Find your public IP by visiting: https://ifconfig.me

Your clinic URL will be: `http://YOUR_PUBLIC_IP:8000`

**⚠️ Warning:** Most home internet connections have a dynamic IP that changes periodically. For long-term use, see Option B or C.

**Option B: Get a Free Domain (Recommended for Small Clinics)**

Use DuckDNS (free) to get a permanent address:

1.  Visit https://www.duckdns.org
2.  Create a free account
3.  Choose a subdomain (e.g., `alnoor-clinic.duckdns.org`)
4.  Follow their instructions to keep it updated

Your clinic URL becomes: `http://alnoor-clinic.duckdns.org:8000`

**Option C: Use ngrok for Testing (5 Minutes)**

For immediate testing without network configuration:

1.  Download ngrok from https://ngrok.com
2.  Run: `ngrok http 8000`
3.  Copy the HTTPS URL it gives you (e.g., `https://abc123.ngrok.io`)
4.  Share this URL with patients

**⚠️ Note:** ngrok URLs change each time you restart. Use only for testing.

### Step 6: Open the Nurse Dashboard

The dashboard is where your nurses see patient notifications.

1.  Open your browser
2.  Go to: `http://localhost:8000/dashboard`
3.  Enter the 6-digit PIN from setup
4.  You will see a real-time list of patient notifications

**Bookmark this page** and keep it open during clinic hours. When a patient taps "Notify Clinic", you will see an alert here.

---

## 🌐 Network Setup Guide

This section explains how to make your clinic accessible to patients outside your building.

### 5a. FOR TESTING: ngrok (5 Minutes)

Use ngrok for quick testing without any network configuration.

```bash
# Download ngrok from https://ngrok.com/download
# Then run:
ngrok http 8000
```

Copy the HTTPS URL shown (e.g., `https://abc123.ngrok.io`) and share it with patients.

**Pros:** Instant, no configuration, HTTPS included
**Cons:** URL changes each restart, not suitable for production

### 5b. FOR SMALL CLINICS: Port Forwarding

**What is port forwarding?**

Your clinic computer has a private address inside your network (like `192.168.1.50`). Port forwarding tells your router: "When someone from outside tries to reach port 8000, send them to my clinic computer."

**Steps (generic — every router is different):**

1.  Find your clinic computer's local IP:
    - Windows: Open Command Prompt, type `ipconfig`, look for "IPv4 Address"
    - Mac/Linux: Open Terminal, type `hostname -I` or `ifconfig`

2.  Log into your router (usually `192.168.1.1` or `192.168.0.1`)

3.  Find "Port Forwarding" or "Virtual Server" settings

4.  Add a new rule:
    - **External Port:** 8000
    - **Internal Port:** 8000
    - **Internal IP:** Your clinic computer's IP (from step 1)
    - **Protocol:** TCP

5.  Save and restart your router

6.  Find your public IP: Visit https://ifconfig.me

7.  Your clinic URL: `http://YOUR_PUBLIC_IP:8000`

**⚠️ Dynamic IP Warning:** Most home internet has a changing public IP. Use DuckDNS (free) to keep a permanent address:

1.  Visit https://www.duckdns.org
2.  Create account, choose a subdomain
3.  Install their update tool on your clinic computer
4.  Your URL becomes: `http://yourname.duckdns.org:8000`

### 5c. FOR LARGER DEPLOYMENTS: VPS Option

For clinics that want reliability without managing their own network, rent a cloud server.

**Recommended Providers:**

| Provider | Specs | Price/Month | Notes |
|----------|-------|-------------|-------|
| Hetzner CX52 | 16GB RAM, 4 vCPU | ~€20 | Best value, EU locations |
| DigitalOcean Droplet | 8GB RAM, 4 vCPU | ~$48 | Easy setup, global |
| AWS EC2 t4g.large | 8GB RAM, 2 vCPU | ~$60 | Reliable, complex |

**⚠️ Important:** The full Gemma 4 26B model needs 16GB RAM minimum. If using a smaller VPS, you may need to use a smaller model variant.

**Setup Steps:**

```bash
# SSH into your VPS
ssh root@your.vps.ip.address

# Clone and run setup
git clone https://github.com/YOUR_ORG/tabib.git
cd tabib/tabib-clinic-server
chmod +x setup.sh
./setup.sh
```

Your VPS already has a public IP, so patients can connect immediately.

### 5d. HTTPS / TLS (Required for Production)

**Why HTTP is not acceptable:**

Medical data must be encrypted. Without HTTPS, anyone on the same network can see patient symptoms and phone numbers.

**Step-by-Step: Let's Encrypt (Free)**

1.  **Install Certbot:**

    ```bash
    # Ubuntu/Debian
    sudo apt install certbot python3-certbot-nginx

    # Or use standalone mode (no nginx required)
    sudo apt install certbot
    ```

2.  **Get your certificate:**

    ```bash
    sudo certbot certonly --standalone -d your-domain.com
    ```

    This creates certificate files at:
    - `/etc/letsencrypt/live/your-domain.com/fullchain.pem`
    - `/etc/letsencrypt/live/your-domain.com/privkey.pem`

3.  **Update your server to use HTTPS:**

    Edit `.env` in your `tabib-clinic-server` folder:

    ```
    FORCE_HTTPS=true
    SSL_CERT_PATH=/etc/letsencrypt/live/your-domain.com/fullchain.pem
    SSL_KEY_PATH=/etc/letsencrypt/live/your-domain.com/privkey.pem
    ```

4.  **Restart your server with HTTPS:**

    ```bash
    uvicorn main:app --host 0.0.0.0 --port 443 \
      --ssl-keyfile=/etc/letsencrypt/live/your-domain.com/privkey.pem \
      --ssl-certfile=/etc/letsencrypt/live/your-domain.com/fullchain.pem
    ```

5.  **Auto-renew certificates:**

    Let's Encrypt certificates expire after 90 days. Add this to your crontab:

    ```bash
    sudo crontab -e
    # Add this line:
    0 0 1 * * certbot renew --quiet
    ```

---

## 👨‍💻 For Developers (Technical Section)

### 6a. Architecture Overview

Tabib is a decentralized medical triage system built with:

- **Frontend:** React + Vite + TypeScript + Tailwind CSS v4 (Progressive Web App)
- **Backend:** FastAPI (Python 3.11+) with SQLite database
- **AI Inference:** Gemma 4 via Ollama (local, no cloud API calls)
- **Real-time:** WebSocket for nurse dashboard notifications

See [`ARCHITECTURE.md`](ARCHITECTURE.md) for detailed diagrams.

### 6b. Project Structure

```
tabib/
├── frontend/                    # Patient PWA (React + Vite)
│   ├── src/
│   │   ├── App.tsx             # Main app router
│   │   ├── pages/              # All screen components
│   │   │   ├── Onboarding.tsx  # First-time user flow
│   │   │   ├── PhoneInput.tsx  # Phone number entry
│   │   │   ├── OTPVerify.tsx   # OTP verification
│   │   │   ├── ChatScreen.tsx  # Symptom chat interface
│   │   │   └── QueueStatus.tsx # Waiting for AI response
│   │   ├── components/         # Reusable UI components
│   │   ├── lib/api.ts          # API client with auth
│   │   └── contexts/           # React contexts (language, auth)
│   ├── index.html              # Entry point
│   ├── package.json            # Dependencies
│   └── vite.config.ts          # Build configuration
│
├── tabib-clinic-server/         # Backend server
│   ├── main.py                 # FastAPI app, all endpoints
│   ├── auth.py                 # OTP & token authentication
│   ├── database.py             # SQLite setup & queries
│   ├── queue_manager.py        # Async request queue (2 workers)
│   ├── gemma_client.py         # Ollama API client
│   ├── prompts.py              # AI system prompts
│   ├── registry.py             # Clinic discovery
│   ├── dashboard/              # Nurse dashboard (HTML/JS)
│   ├── setup.sh                # Linux/Mac installer
│   ├── setup.bat               # Windows installer
│   ├── requirements.txt        # Python dependencies
│   └── .env                    # Environment variables (created by setup)
│
└── README.md                   # This file
```

### 6c. Local Development Setup

**Prerequisites:**

- Python 3.11+
- Node.js 18+
- Ollama installed (`curl -fsSL https://ollama.com/install.sh | sh`)

**Step 1: Set up the backend**

```bash
cd tabib-clinic-server
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Pull the model (or use mock mode)
ollama pull gemma4:e4b

# Start server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Mock Mode (No Ollama Required):**

For development without downloading the 18GB model:

```bash
export MOCK_MODE=true
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

In mock mode, the server returns hardcoded responses instantly.

**Step 2: Set up the frontend**

```bash
cd frontend
npm install

# Set API URL (optional, defaults to localhost:8000)
echo "VITE_API_URL=http://localhost:8000" > .env

# Start dev server
npm run dev
```

Open `http://localhost:5173` in your browser.

**Mock Clinic Registry:**

For local testing, the clinic registry is auto-populated with a demo clinic. Edit `frontend/public/clinics_registry.json` to add test clinics.

### 6d. API Reference

All endpoints require JSON content-type. Authentication uses Bearer tokens.

---

#### POST /api/auth/request-otp

Request OTP code for phone number.

**Auth required:** No  
**Rate limit:** 5 requests/minute  

**Request body:**
```json
{
  "phone": "+971501234567"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent",
  "demo_otp": "123456"
}
```

**Error responses:** 400 (invalid phone format)

---

#### POST /api/auth/verify-otp

Verify OTP and receive authentication token.

**Auth required:** No  
**Rate limit:** 5 requests/minute  

**Request body:**
```json
{
  "phone": "+971501234567",
  "code": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "token": "abc123xyz...",
  "patient_id": "uuid-here",
  "expires_at": "2025-01-02T12:00:00"
}
```

**Error responses:** 400 (invalid code)

---

#### POST /api/chat

Submit symptom message for AI triage.

**Auth required:** Yes (Bearer token)  
**Rate limit:** 15 requests/minute  

**Request body:**
```json
{
  "message": "عندي ألم في الحلق وحمى",
  "image_base64": "data:image/jpeg;base64,/9j/..."
}
```

**Response (immediate):**
```json
{
  "request_id": "uuid-here",
  "queue_position": 2,
  "status": "pending"
}
```

**Response (when done):**
```json
{
  "request_id": "uuid-here",
  "response": "قد تكون هذه الأعراض...",
  "structured": {
    "urgency": "SEE_A_DOCTOR",
    "explanation": "...",
    "steps": ["...", "..."],
    "warning_signs": ["..."],
    "disclaimer": "..."
  }
}
```

**Error responses:** 401 (unauthorized), 429 (rate limited), 413 (image too large)

---

#### GET /api/queue-status?request_id=UUID

Check status of a pending chat request.

**Auth required:** Yes (Bearer token)  
**Rate limit:** None (but request_id must belong to authenticated patient)  

**Query parameters:**
- `request_id` (required): UUID from chat response

**Response:**
```json
{
  "status": "done",
  "queue_position": 0,
  "response": {
    "urgency": "HOME_CARE",
    "explanation": "...",
    "steps": ["..."]
  }
}
```

**Error responses:** 404 (not found or unauthorized)

---

#### GET /api/clinics?lat=X&lon=Y&radius=Z

Get nearby clinics by GPS coordinates.

**Auth required:** No  
**Rate limit:** None  

**Query parameters:**
- `lat` (required): Latitude
- `lon` (required): Longitude
- `radius` (optional): Search radius in km (default: 20)

**Response:**
```json
{
  "clinics": [
    {
      "id": "clinic_123",
      "name": "Al-Noor Medical Center",
      "city": "Dubai",
      "lat": 25.2048,
      "lng": 55.2708,
      "phone": "+971501234567",
      "public_url": "http://example.com:8000"
    }
  ]
}
```

---

#### POST /api/notify-clinic

Notify clinic that patient wants a callback.

**Auth required:** Yes (Bearer token)  
**Rate limit:** 5 requests/minute  

**Request body:**
```json
{
  "patient_phone": "+971501234567",
  "patient_name": "أحمد محمد",
  "consent_given": true,
  "conversation": [...]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Clinic notified",
  "notification_id": "uuid-here"
}
```

**Error responses:** 400 (consent required), 401 (unauthorized)

---

#### GET /api/notifications

Get notifications for nurse dashboard.

**Auth required:** No (dashboard uses PIN separately)  
**Rate limit:** None  

**Query parameters:**
- `limit` (optional): Max results (default: 50)
- `filter_status` (optional): "pending", "called"
- `urgency_filter` (optional): "EMERGENCY", "PENDING"

**Response:**
```json
{
  "notifications": [
    {
      "id": "uuid",
      "patient_phone": "+971501234567",
      "summary": "Patient reports chest pain...",
      "urgency_level": "EMERGENCY",
      "status": "pending",
      "created_at": "2025-01-01T12:00:00"
    }
  ]
}
```

---

### 6e. Environment Variables

#### Backend (.env in tabib-clinic-server/)

| Variable | Description | Example |
|----------|-------------|---------|
| `OLLAMA_URL` | Ollama server URL | `http://localhost:11434` |
| `MODEL` | Model variant to use | `gemma4:e4b` |
| `OLLAMA_TIMEOUT` | Timeout for Ollama requests (seconds) | `120` |
| `REQUEST_TIMEOUT` | Max queue wait time (seconds) | `300` |
| `GEMMA_WORKERS` | Concurrent inference workers | `2` |
| `DB_PATH` | SQLite database path | `tabib_clinic.db` |
| `DASHBOARD_PIN` | 6-digit nurse dashboard PIN | `123456` |
| `CLINIC_NAME` | Clinic display name | `Al-Noor Medical Center` |
| `CLINIC_CITY` | City name | `Dubai` |
| `CLINIC_LAT` | Latitude | `25.2048` |
| `CLINIC_LNG` | Longitude | `55.2708` |
| `CLINIC_PHONE` | Contact phone | `+971501234567` |
| `MOCK_MODE` | Return fake responses (dev only) | `true` or `false` |
| `DEMO_MODE` | Accept any OTP code | `true` or `false` |
| `FORCE_HTTPS` | Redirect HTTP to HTTPS | `true` or `false` |

#### Frontend (.env in frontend/)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `http://localhost:8000` |

### 6f. Gemma 4 Integration

**Model Variant:** `gemma4:e4b` (approximately 18GB)

We chose this variant because:
- Fits in 16GB RAM (common in clinic PCs)
- Strong Arabic language understanding
- Good balance of speed and accuracy for triage

**Two-Prompt System:**

1.  **Triage Prompt:** Analyzes symptoms and outputs structured urgency assessment
    - System prompt defines output format (URGENCY, EXPLANATION, STEPS, etc.)
    - Parses response into structured JSON for the UI

2.  **Summarization Prompt:** Creates clinical summary for nurse notifications
    - Condenses conversation history into ~150 words
    - Highlights key symptoms and urgency level

**Multimodal Input:**

Patients can upload photos of visible symptoms (rashes, injuries, etc.). The image is:
- Stripped of EXIF metadata (privacy protection)
- Compressed to JPEG
- Sent to Gemma 4 alongside text description

**Emergency Keyword Safety Net:**

Before sending to AI, messages are scanned for emergency keywords:
- "chest pain", "difficulty breathing", "loss of consciousness", etc.
- If detected, returns immediate EMERGENCY response without waiting for AI
- Prevents dangerous delays in critical situations

**Response Parsing:**

Gemma 4 outputs structured text like:
```
URGENCY: SEE_A_DOCTOR
EXPLANATION: ...
STEPS:
1. ...
2. ...
WARNING SIGNS:
- ...
DISCLAIMER: ...
```

The parser extracts each section into JSON fields for the frontend.

---

## 📱 Patient Guide

**How to use Tabib:**

1.  Open your clinic's web address in your phone browser (e.g., `http://alnoor-clinic.duckdns.org:8000`)
2.  Choose your language (Arabic or English)
3.  Allow location access (to find nearby clinics)
4.  Select your clinic from the list
5.  Enter your phone number
6.  Enter the 6-digit code we send you
7.  Type or speak how you are feeling (be as specific as possible)
8.  Wait a few seconds for your result
9.  Read your guidance:
    - 🟢 **Home Care:** Rest, fluids, over-the-counter medicine
    - 🟡 **See a Doctor:** Make an appointment within 24-48 hours
    - 🔴 **Emergency:** Call emergency services immediately
10. If your result says 🔴 or 🟡, you can tap **"Notify my clinic"** and a nurse will call you back

**What Tabib cannot do:**

- ❌ It cannot diagnose your condition
- ❌ It cannot prescribe medication
- ❌ It is not a replacement for seeing a doctor
- ❌ In an emergency, always call **998** (UAE) or your local emergency number first

**Tips for best results:**

- Describe your symptoms clearly and specifically
- Mention how long you've had the symptoms
- Include any other health conditions you have
- If possible, take a photo of visible symptoms (rash, swelling, etc.)

---

## 🔒 Privacy & Data Protection

### What Data We Collect

| Data Type | How It's Stored | Who Can Access |
|-----------|-----------------|----------------|
| **Phone Number** | One-way hash (cannot be reversed) | Only your chosen clinic |
| **Conversation** | In memory only, deleted after session | Only your chosen clinic if you tap "Notify" |
| **Notification Summary** | Stored in clinic database | Clinic staff only |

### What Data We Do NOT Collect

- ❌ No names (unless you voluntarily provide one)
- ❌ No precise location (city-level only for clinic matching)
- ❌ No data sent to cloud services (everything is local)
- ❌ No data sold or shared with third parties
- ❌ No advertising of any kind
- ❌ No tracking cookies or analytics

### Where Your Data Lives

- **Entirely on your clinic's own hardware** — not on our servers, not in the cloud
- **Never leaves the clinic server** — no external API calls for inference
- **The Tabib developers have zero access** — we cannot see any patient data

### Compliance Notes

Tabib is designed to support compliance with:
- **HIPAA** (USA): Data stays on-premise, no cloud transmission
- **GDPR** (EU): Minimal data collection, patient consent required
- **UAE Health Data Law**: Local data storage, patient control

**Important:** Each clinic is responsible for their own compliance. Consult your legal team before deployment.

---

## 🤝 Contributing

We welcome contributions! Areas where help is most needed:

### High Priority

- [ ] **Real SMS OTP integration** — Twilio, AWS SNS, or regional providers (Unifonic, etc.)
- [ ] **Additional languages** — Urdu, French, Somali, Swahili
- [ ] **Fine-tuning Gemma 4** — On Arabic medical datasets for better accuracy
- [ ] **Native mobile apps** — iOS/Android wrappers for better offline support
- [ ] **Automated testing** — Unit tests, integration tests, E2E tests
- [ ] **Accessibility** — Screen reader compatibility, RTL improvements

### How to Contribute

1.  **Fork the repo** — Click "Fork" on GitHub
2.  **Create a feature branch** — `git checkout -b feature/your-feature-name`
3.  **Make your changes** — Follow existing code style
4.  **Test thoroughly** — Ensure no regressions
5.  **Submit a pull request** — Include a clear description of changes
6.  **Code review** — Maintainers will review and provide feedback

**License:** All contributions are licensed under CC-BY 4.0.

---

## 📜 Acknowledgments & License

**Built for:** Gemma 4 Good Hackathon by Google/Kaggle

**Powered by:**
- [Gemma 4](https://ai.google.dev/gemma) — Google DeepMind's open medical-capable model
- [Ollama](https://ollama.ai) — Local AI inference runtime
- [FastAPI](https://fastapi.tiangolo.com) — Modern Python web framework
- [React](https://react.dev) — Frontend UI library

**License:** Creative Commons Attribution 4.0 International ([CC-BY 4.0](https://creativecommons.org/licenses/by/4.0/))

You are free to:
- ✅ Share — copy and redistribute the material
- ✅ Adapt — remix, transform, and build upon the material
- ✅ Use commercially

Under these terms:
- **Attribution** — You must give appropriate credit to the original authors

**Arabic Font:** Amiri (open source, SIL Open Font License)

---

<div align="center">

**Need help?** Open an issue on GitHub or contact your clinic administrator.

**Built with ❤️ for better healthcare access in Arabic-speaking communities**

</div>
