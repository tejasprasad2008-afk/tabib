# Tabib - Quick Start Guide

## 🚀 Get Running in 2 Minutes

### 1. Install Dependencies
```bash
cd "/Users/tejasprasad/GEMMA 4 HACKATHON/frontend"
npm install
```
✅ **Status**: Already done (412 packages)

### 2. Start Dev Server
```bash
npm run dev
```
✅ **Opens**: http://localhost:5173

### 3. Test in Browser
- Select language (Arabic/English)
- Find clinics (geolocation)
- Select clinic
- Enter phone: `+966501234567`
- Enter OTP: `123456`
- Send symptom message
- See urgency badge response

---

## 📁 Key Files

```
frontend/src/
├── App.jsx                    # Main orchestrator
├── pages/
│   ├── Onboarding.jsx        # Language → Clinic → OTP
│   └── Chat.jsx              # Chat interface
├── components/
│   ├── ClinicSelector.jsx    # Clinic search
│   ├── OTPInput.jsx          # OTP verification
│   ├── ChatMessage.jsx       # Message + badge
│   ├── NotifyClinicModal.jsx # Consent modal
│   └── WaitingQueue.jsx      # Queue display
├── hooks/
│   ├── useClinicAPI.js       # API calls (6 methods)
│   └── useGeoLocation.js     # Geolocation
└── utils/
    └── storage.js            # localStorage
```

---

## 🔧 Configuration

### Local Dev (.env - already set)
```env
VITE_CLINIC_API_URL=http://localhost:8000
VITE_CHAT_POLL_INTERVAL=1000
VITE_GEOLOCATION_RADIUS=20
VITE_DEFAULT_LANGUAGE=ar
```

### Per Clinic (.env.example template)
```env
# Each clinic sets their server URL
VITE_CLINIC_API_URL=https://clinic.example.com
```

---

## 🧪 Test Without Backend

The onboarding works without a server. To test chat:

### Option A: Create Mock Server (Python)
```python
# mock_clinic_server.py
from http.server import HTTPServer, BaseHTTPRequestHandler
import json

class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        if '/api/clinics' in self.path:
            self.send_response(200)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            clinics = [{"id":"1","name":"عيادة","lat":24.7,"lon":46.6,"distance":1.5}]
            self.wfile.write(json.dumps(clinics).encode())
    
    def do_POST(self):
        if '/auth/request-otp' in self.path:
            self.send_response(200)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(b'{"success":true}')
        elif '/auth/verify-otp' in self.path:
            self.send_response(200)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(b'{"token":"x","patient_id":"123"}')
        elif '/api/chat' in self.path:
            self.send_response(200)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            response = '{"response":"🟡 SEE A DOCTOR","urgency":"doctor","request_id":"r1"}'
            self.wfile.write(response.encode())
        elif '/notify-clinic' in self.path:
            self.send_response(200)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(b'{"success":true}')
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.end_headers()

HTTPServer(('localhost', 8000), Handler).serve_forever()
```

Run it:
```bash
python mock_clinic_server.py
```

### Option B: Connect to Real Clinic Server
```bash
# Edit .env
VITE_CLINIC_API_URL=https://your-clinic-server.com

# Restart dev server
npm run dev
```

---

## 📦 Production Build

```bash
npm run build
# Output: dist/ folder (~170KB JS)

npm run preview
# Test production build locally
```

---

## 🎯 API Endpoints (Clinic Must Implement)

```
GET  /api/clinics?lat=X&lon=Y&radius=20
POST /api/auth/request-otp
POST /api/auth/verify-otp
POST /api/chat
GET  /api/queue-status
POST /api/notify-clinic
```

See README.md for full API contract.

---

## 📖 Full Documentation

- **README.md** - Complete guide + API contract
- **SETUP.md** - Development setup + troubleshooting
- **ARCHITECTURE.md** - System architecture
- **PROJECT_SUMMARY.md** - Project overview

---

## ✨ Features

✅ Full RTL Arabic support  
✅ Geolocation clinic search  
✅ OTP authentication  
✅ Chat with urgency badges (🔴🟡🟢)  
✅ Clinic notification with consent  
✅ Queue status polling  
✅ Service Worker PWA  
✅ Mobile-first design  
✅ Large text (16px+)  
✅ Large tap targets (44px+)  

---

## 🆘 Troubleshooting

**Port 5173 in use?**
```bash
npm run dev -- --port 3000
```

**Clinic server not responding?**
- Check `VITE_CLINIC_API_URL` in .env
- Verify clinic server is running
- Check browser console for CORS errors

**Arabic text not displaying?**
- Clear browser cache (Ctrl+Shift+Delete)
- Check Google Fonts loaded (DevTools → Network)

**Build errors?**
```bash
rm -rf node_modules
npm install
npm run build
```

---

## 🎉 You're Ready!

```bash
# Terminal 1: Start clinic server (or mock)
python mock_clinic_server.py

# Terminal 2: Start frontend
cd frontend && npm run dev

# Browser: Open http://localhost:5173
```

**5 minutes to a working clinic-connected health app!** 🚀
