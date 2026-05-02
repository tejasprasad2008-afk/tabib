# Tabib Frontend Setup Guide

## Complete Setup & Testing Instructions

### 1. Prerequisites

#### Node.js (18+)
```bash
# macOS
brew install node

# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify
node --version
npm --version
```

### 2. Frontend Setup

```bash
cd "/Users/tejasprasad/GEMMA 4 HACKATHON/frontend"

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

### 3. Configure for Your Clinic Server

Edit `.env`:
```env
# Set to your clinic server URL
VITE_CLINIC_API_URL=http://localhost:8000

# Other settings (usually don't need to change)
VITE_CHAT_POLL_INTERVAL=1000
VITE_GEOLOCATION_RADIUS=20
VITE_DEFAULT_LANGUAGE=ar
```

### 4. Start Development Server

```bash
npm run dev
```

You'll see output like:
```
VITE v5.0.0  ready in 123 ms

➜  Local:   http://localhost:5173/
```

Open `http://localhost:5173` in your browser.

## 🧪 Testing the App Locally

### Testing Without a Real Clinic Server

The frontend includes mock/simulation in the OTP flow for testing without a backend. Here's the flow:

#### Step 1: Language Selection
- App auto-detects device language (Arabic if available)
- You can toggle between Arabic (العربية) and English
- Click Continue

#### Step 2: Clinic Selection
- Click "ابحث عن العيادات القريبة" (Find Nearby Clinics) OR "Find Nearby Clinics"
- Simulated geolocation returns mock clinics
- Select one (they're all test clinics)

#### Step 3: OTP Verification
- Enter any phone number (e.g., `+966501234567`)
- Click "إرسال رمز التحقق" (Send Verification Code)
- Enter any 6-digit code (e.g., `123456`)
- Click "تحقق من الرمز" (Verify Code)
- → Lands in Chat screen

#### Step 4: Chat (Requires Real Clinic Server)

To test chat functionality, you need a clinic server running.

**Option A: Mock Clinic Server**

Create a simple mock at `localhost:8000`:

```python
# mock_clinic_server.py
from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import time

class MockClinicHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/api/clinics':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            clinics = [
                {
                    "id": "clinic-1",
                    "name": "عيادة المركز الطبي",
                    "lat": 24.7136,
                    "lon": 46.6753,
                    "distance": 1.5,
                    "api_url": "http://localhost:8000"
                }
            ]
            self.wfile.write(json.dumps(clinics).encode())

    def do_POST(self):
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length)

        if self.path == '/api/auth/request-otp':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({"success": True}).encode())

        elif self.path == '/api/auth/verify-otp':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            response = {
                "token": f"token-{int(time.time())}",
                "patient_id": "patient-123"
            }
            self.wfile.write(json.dumps(response).encode())

        elif self.path == '/api/chat':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            response = {
                "response": "🟡 SEE A DOCTOR\n\nYou should see a doctor. This could be something serious.",
                "urgency": "doctor",
                "request_id": "req-123"
            }
            self.wfile.write(json.dumps(response).encode())

        elif self.path == '/api/notify-clinic':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({"success": True}).encode())

        elif self.path == '/api/queue-status':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            # Return ready after 2 seconds
            response = {"ready": True, "response": "🟢 HOME CARE"}
            self.wfile.write(json.dumps(response).encode())

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

if __name__ == '__main__':
    server = HTTPServer(('localhost', 8000), MockClinicHandler)
    print('Mock clinic server running on http://localhost:8000')
    server.serve_forever()
```

Run it:
```bash
python mock_clinic_server.py
```

**Option B: Real Clinic Server**

If you have a clinic server running elsewhere:
```bash
VITE_CLINIC_API_URL=https://your-clinic.com npm run dev
```

### Testing Flows

#### 1. Chat with Urgency Badge
- Type in Arabic or English: "I have chest pain"
- Click Send
- Mock server returns response with 🟡 badge
- Verify yellow urgency badge displays

#### 2. Image Upload
- Click camera button
- Select an image from your device
- Add text description
- Click Send
- Image displays in message bubble

#### 3. Notify Clinic
- After getting a response with urgency 🔴 or 🟡, click "📞 إخبر العيادة" (Notify Clinic)
- Consent modal appears with Arabic + English text
- Check the confirmation box
- Click "أوافق" (Agree)
- Notification sent, confirmation message shows

#### 4. Queue Status
- If clinic server returns 202 Accepted with queue position:
- Modal shows "You are number X in queue"
- Spins while polling
- When response ready, displays in chat

#### 5. RTL Arabic Text
- Make sure Arabic text displays right-to-left
- Chat bubbles align properly
- Input area text direction matches

#### 6. Offline UI
- Turn off WiFi/network
- App UI shell still loads (cached by Service Worker)
- Try to send message → error about no connection
- Turn WiFi back on → works again

## 🏗️ Production Build

```bash
# Build for production
npm run build

# Output: dist/ folder with all static files
# Ready to deploy to any static host
```

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd ../frontend  # if not already there
vercel

# Follow prompts, set VITE_CLINIC_API_URL environment variable
```

### Deploy to Netlify

```bash
# Build locally
npm run build

# Drag dist/ folder to Netlify
# Or use Netlify CLI:
npm i -g netlify-cli
netlify deploy --prod --dir=dist
```

### Deploy to S3 + CloudFront (AWS)

```bash
# Build
npm run build

# Sync to S3
aws s3 sync dist/ s3://your-bucket/tabib/ --delete

# CloudFront will cache automatically
```

### Set Clinic Server URL Per Deployment

Each clinic needs their own deployment with their own server URL:

**Option 1: Environment Variable at Build Time**
```bash
VITE_CLINIC_API_URL=https://clinic1.com npm run build
# Deploy dist/ for clinic 1

VITE_CLINIC_API_URL=https://clinic2.com npm run build
# Deploy dist/ for clinic 2
```

**Option 2: Build Once, Set URL at Runtime**
Create a `public/config.json`:
```json
{
  "clinicUrl": "http://localhost:8000"
}
```

Update `useClinicAPI.js`:
```javascript
const clinicUrl = window.__CLINIC_CONFIG__?.clinicUrl || 
                  import.meta.env.VITE_CLINIC_API_URL;
```

Add to `index.html` before React script:
```html
<script>
  window.__CLINIC_CONFIG__ = {
    clinicUrl: new URL(window.location).searchParams.get('clinic') || 'http://localhost:8000'
  };
</script>
```

Then run: `http://domain.com?clinic=https://clinic.com`

## 🧹 Troubleshooting

### Port 5173 Already in Use
```bash
# Kill process on port 5173
lsof -i :5173
kill -9 <PID>

# Or use different port
npm run dev -- --port 3000
```

### Clinic Server Not Responding
- Verify `VITE_CLINIC_API_URL` is correct in `.env`
- Check clinic server is running at that URL
- Test with curl: `curl http://localhost:8000/api/clinics`
- Check browser console for CORS errors

### Image Upload Not Working
- Verify browser has permission to access files
- Check file size (shouldn't be > 10MB)
- See browser console for errors

### Arabic Text Not Displaying
- Clear browser cache (Cmd+Shift+Delete on Mac, Ctrl+Shift+Delete on Windows)
- Check that Noto Sans Arabic font loaded (DevTools → Network → woff2 files)
- Verify `dir="rtl"` is set correctly

### App Won't Load
- Check that Node.js version is 18+
- Delete `node_modules/` and reinstall: `rm -rf node_modules && npm install`
- Check for errors in terminal output

## 📱 Testing on Mobile

### iOS Safari
```bash
# Get your machine's local IP
ipconfig getifaddr en0  # macOS

# Run dev server
npm run dev

# On iPhone, open: http://[YOUR_IP]:5173
```

### Android Chrome
```bash
# Forward port from Android
adb reverse tcp:5173 tcp:5173

# Open in Chrome: http://localhost:5173
```

### Test Features
- ✅ Tap targets are large (44px+)
- ✅ Text is readable (16px+)
- ✅ Keyboard appears correctly for Arabic
- ✅ Image upload works
- ✅ Chat scrolls smoothly
- ✅ Buttons respond to touch

## 📚 Additional Resources

- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Noto Sans Arabic Font](https://fonts.google.com/noto/specimen/Noto+Sans+Arabic)
- [PWA Guide](https://web.dev/progressive-web-apps/)
- [Web Geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API)
