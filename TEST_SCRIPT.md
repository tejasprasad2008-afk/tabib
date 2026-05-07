# Tabib System Test Script

Use this to test all features implemented in this session.

## Prerequisites
- Backend running on localhost:8000
- ngrok tunnel active (for external testing)
- Frontend deployed to Vercel

---

## Test 1: New User Flow (Profile Creation)

### Steps:
1. Open frontend on phone/browser
2. Enter phone number: `+971501119999`
3. Enter OTP: `123456` (demo mode)
4. **EXPECTED**: Redirect to Profile Setup page

### Verify:
- [ ] Profile form shows (age, gender, height, weight)
- [ ] All fields are required
- [ ] Submit button navigates to Chat

### API Test:
```bash
# Request OTP
curl -s -X POST http://localhost:8000/api/auth/request-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "+971501119999"}'

# Verify OTP
curl -s -X POST http://localhost:8000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "+971501119999", "code": "123456"}'
# SAVE THE TOKEN FROM RESPONSE

# Save profile
curl -s -X POST http://localhost:8000/api/patient/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"age": 35, "gender": "male", "height_cm": 175, "weight_kg": 80}'
```

---

## Test 2: Follow-up Questions for Vague Symptoms

### Steps:
1. In Chat, send: "I have pain"
2. **EXPECTED**: AI asks follow-up questions instead of giving diagnosis

### API Test:
```bash
curl -s -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"message": "I have pain"}'
```

### Verify Response Contains:
- [ ] "Where exactly does it hurt?"
- [ ] "How bad is it (1 = mild, 10 = severe)?"
- [ ] "How long have you had this?"
- [ ] NO direct diagnosis

### Test Other Vague Words:
- "headache" → should ask follow-up
- "feel bad" → should ask follow-up
- "tired" → should ask follow-up
- "dizzy" → should ask follow-up

---

## Test 3: Specific Symptoms Get Triage

### Steps:
1. Send: "I have chest pain and can't breathe"
2. **EXPECTED**: URGENCY: EMERGENCY immediately (no follow-up)

### API Test:
```bash
curl -s -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"message": "I have chest pain and difficulty breathing"}'
```

### Verify:
- [ ] URGENCY: EMERGENCY
- [ ] Emergency numbers displayed first

---

## Test 4: Demographics Passed to AI

### Steps:
1. Send: "I have back pain" (after providing profile)
2. **EXPECTED**: AI response considers age/gender/height/weight

### Verify in Response:
- [ ] Response mentions context (age, etc.) not visible but used
- [ ] Different response for young vs elderly

---

## Test 5: Gemini Nano Modal Flow

### Steps:
1. Complete profile and reach Chat
2. Send first message, get AI response
3. **EXPECTED**: Modal appears asking about Gemini Nano

### Verify:
- [ ] Modal shows after first AI response
- [ ] Shows benefits (offline, faster, privacy)
- [ ] "Later" and "Accept" buttons work
- [ ] If Accept → shows installation progress
- [ ] User can continue chatting during download
- [ ] If skip → modal doesn't appear again

### Check LocalStorage:
```javascript
// After accepting
localStorage.getItem('gemma_nano_requested') // should be "true"
localStorage.getItem('gemma_nano_skipped')    // should be null or "true" after decline
```

---

## Test 6: Notify Clinic & Callback

### Steps:
1. Send 3 messages to get "Notify Clinic" button
2. Click "Notify Clinic"
3. Check dashboard for notification
4. Nurse clicks "Called Back"
5. **EXPECTED**: Popup on patient phone

### API Test:
```bash
# Notify clinic
curl -s -X POST http://localhost:8000/api/notify-clinic \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"patient_phone": "+971501119999", "consent_given": true}'

# Check notifications
curl -s "http://localhost:8000/api/notifications?pin=123456"

# Mark as called back
curl -s -X POST http://localhost:8000/api/notifications/<notification_id>/callback

# Check callback status
curl -s http://localhost:8000/api/patient/callback-status \
  -H "Authorization: Bearer <TOKEN>"
```

### Verify:
- [ ] Summary generated in notification
- [ ] Dashboard shows notification with summary
- [ ] Callback status returns true after nurse clicks

---

## Test 7: Session Memory

### Steps:
1. Ask: "I have headache"
2. Ask: "What about fever?"
3. **EXPECTED**: AI remembers previous context

### API Test:
```bash
# First message
curl -s -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"message": "I have headache"}'

# Follow-up
curl -s -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"message": "What about fever?"}'
```

### Verify:
- [ ] Second response mentions "headache" context
- [ ] Not treating as completely new conversation

---

## Test 8: Language Detection

### Steps:
1. Send Arabic message: "أعاني من صداع"
2. **EXPECTED**: Response in Arabic only (no English mix)

### API Test:
```bash
curl -s -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"message": "أعاني من صداع شديد"}'
```

### Verify:
- [ ] Entire response in Arabic
- [ ] No English words mixed in

---

## Expected API Responses Summary

### Health Check
```json
{"status": "ok", "ai_ready": true, "model_provider": "ollama", "queue_depth": 0}
```

### Profile Not Completed
```json
{"profile_completed": false}
```

### Profile Completed
```json
{"profile_completed": true, "age": 35, "gender": "male", "height_cm": 175, "weight_kg": 80}
```

### Vague Symptom (Follow-up)
```json
{"response": "EXPLANATION:\nTo give you the best advice, I need a few more details:\n• Where exactly does it hurt?\n• How bad is it...", "structured": {"urgency": "HOME_CARE"}}
```

### Emergency Keyword
```json
{"response": "...URGENCY: EMERGENCY...", "structured": {"urgency": "EMERGENCY"}}
```

---

## Quick Verification Commands

```bash
# 1. Check server is running
curl -s http://localhost:8000/health

# 2. Get new token
TOKEN=$(curl -s -X POST http://localhost:8000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "+971500000001", "code": "123456"}' | jq -r '.token')

# 3. Save profile
curl -s -X POST http://localhost:8000/api/patient/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"age": 30, "gender": "female", "height_cm": 165, "weight_kg": 60}'

# 4. Test vague symptom
curl -s -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"message": "I feel tired"}'

# 5. Test specific symptom
curl -s -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"message": "chest pain"}'
```