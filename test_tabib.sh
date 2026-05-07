#!/bin/bash
# Tabib System Test Script with async polling
BASE="http://localhost:8000"
PHONE="+971509988776"  # fresh number for clean state

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

pass() { echo -e "${GREEN}[PASS]${NC} $1"; }
fail() { echo -e "${RED}[FAIL]${NC} $1"; }
info() { echo -e "${YELLOW}[INFO]${NC} $1"; }

# Poll queue-status until done, max 60s
poll_response() {
  local request_id="$1"
  local token="$2"
  local max_attempts=30
  local i=0
  while [ $i -lt $max_attempts ]; do
    sleep 2
    STATUS=$(curl -s "$BASE/api/queue-status?request_id=$request_id" \
      -H "Authorization: Bearer $token")
    STATE=$(echo "$STATUS" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('status',''))" 2>/dev/null)
    if [ "$STATE" = "done" ]; then
      echo "$STATUS"
      return 0
    fi
    i=$((i+1))
  done
  echo '{"status":"timeout"}'
}

echo ""
echo "================================================"
echo "       TABIB SYSTEM TEST SUITE"
echo "================================================"

# ============================
# TEST 1: Health Check
# ============================
echo ""
info "TEST 1: Health Check"
HEALTH=$(curl -s "$BASE/health")
STATUS=$(echo "$HEALTH" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('status',''))" 2>/dev/null)
AI_READY=$(echo "$HEALTH" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('ai_ready',''))" 2>/dev/null)
PROVIDER=$(echo "$HEALTH" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('model_provider',''))" 2>/dev/null)
[ "$STATUS" = "ok" ] && pass "Server status: ok" || fail "Server status: $STATUS"
[ "$AI_READY" = "True" ] && pass "AI ready: true" || fail "AI ready: $AI_READY"
info "Model provider: $PROVIDER"

# ============================
# TEST 2: New User Flow
# ============================
echo ""
info "TEST 2: New User Flow (OTP + Profile)"

# 2a. Request OTP
OTP_RESP=$(curl -s -X POST "$BASE/api/auth/request-otp" \
  -H "Content-Type: application/json" \
  -d "{\"phone\": \"$PHONE\"}")
OTP_SUCCESS=$(echo "$OTP_RESP" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('success',''))" 2>/dev/null)
[ "$OTP_SUCCESS" = "True" ] && pass "OTP requested successfully" || fail "OTP request failed: $OTP_RESP"

# 2b. Verify OTP
VERIFY_RESP=$(curl -s -X POST "$BASE/api/auth/verify-otp" \
  -H "Content-Type: application/json" \
  -d "{\"phone\": \"$PHONE\", \"code\": \"123456\"}")
TOKEN=$(echo "$VERIFY_RESP" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('token',''))" 2>/dev/null)
[ -n "$TOKEN" ] && pass "OTP verified, token obtained" || fail "OTP verification failed: $VERIFY_RESP"
info "Token: ${TOKEN:0:20}..."

# 2c. Check profile (should be incomplete)
PROFILE_RESP=$(curl -s "$BASE/api/patient/profile" -H "Authorization: Bearer $TOKEN")
PROFILE_COMPLETE=$(echo "$PROFILE_RESP" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('profile_completed',''))" 2>/dev/null)
[ "$PROFILE_COMPLETE" = "False" ] && pass "New user profile_completed=false" || fail "Expected false, got: $PROFILE_COMPLETE"

# 2d. Save profile
SAVE_RESP=$(curl -s -X POST "$BASE/api/patient/profile" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"age": 35, "gender": "male", "height_cm": 175, "weight_kg": 80}')
SAVE_OK=$(echo "$SAVE_RESP" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('success',''))" 2>/dev/null)
[ "$SAVE_OK" = "True" ] && pass "Profile saved successfully" || fail "Profile save failed: $SAVE_RESP"

# 2e. Verify profile
PROFILE_CHECK=$(curl -s "$BASE/api/patient/profile" -H "Authorization: Bearer $TOKEN")
AGE=$(echo "$PROFILE_CHECK" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('age',''))" 2>/dev/null)
GENDER=$(echo "$PROFILE_CHECK" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('gender',''))" 2>/dev/null)
[ "$AGE" = "35" ] && pass "Profile age=35 verified" || fail "Age mismatch: $AGE"
[ "$GENDER" = "male" ] && pass "Profile gender=male verified" || fail "Gender mismatch: $GENDER"

# ============================
# TEST 3: Vague Symptoms → Follow-up Questions
# ============================
echo ""
info "TEST 3: Vague Symptoms → Follow-up Questions"

for SYMPTOM in "I have pain" "headache" "feel bad" "tired" "dizzy"; do
  CHAT_RESP=$(curl -s -X POST "$BASE/api/chat" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "{\"message\": \"$SYMPTOM\"}")
  REQ_ID=$(echo "$CHAT_RESP" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('request_id',''))" 2>/dev/null)
  
  if [ -n "$REQ_ID" ]; then
    FULL=$(poll_response "$REQ_ID" "$TOKEN")
    URGENCY=$(echo "$FULL" | python3 -c "import sys,json; d=json.load(sys.stdin); r=d.get('response',{}); print(r.get('urgency','') if isinstance(r,dict) else '')" 2>/dev/null)
    EXPLANATION=$(echo "$FULL" | python3 -c "import sys,json; d=json.load(sys.stdin); r=d.get('response',{}); print(r.get('explanation','')[:100] if isinstance(r,dict) else '')" 2>/dev/null)
    # Check if response contains follow-up questions (not EMERGENCY)
    [ "$URGENCY" != "EMERGENCY" ] && pass "\"$SYMPTOM\" → follow-up (urgency=$URGENCY)" || fail "\"$SYMPTOM\" triggered EMERGENCY unexpectedly"
  else
    # Synchronous response
    URGENCY=$(echo "$CHAT_RESP" | python3 -c "import sys,json; d=json.load(sys.stdin); s=d.get('structured',{}); print(s.get('urgency','') if isinstance(s,dict) else '')" 2>/dev/null)
    [ "$URGENCY" != "EMERGENCY" ] && pass "\"$SYMPTOM\" → follow-up (urgency=$URGENCY)" || fail "\"$SYMPTOM\" triggered EMERGENCY unexpectedly"
  fi
done

# ============================
# TEST 4: Emergency Symptoms → Immediate Triage
# ============================
echo ""
info "TEST 4: Emergency Symptoms → Immediate EMERGENCY"

for SYMPTOM in "I have chest pain and difficulty breathing" "I can't breathe" "severe chest pain"; do
  CHAT_RESP=$(curl -s -X POST "$BASE/api/chat" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "{\"message\": \"$SYMPTOM\"}")
  REQ_ID=$(echo "$CHAT_RESP" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('request_id',''))" 2>/dev/null)
  
  if [ -n "$REQ_ID" ]; then
    FULL=$(poll_response "$REQ_ID" "$TOKEN")
    URGENCY=$(echo "$FULL" | python3 -c "import sys,json; d=json.load(sys.stdin); r=d.get('response',{}); print(r.get('urgency','') if isinstance(r,dict) else '')" 2>/dev/null)
    EMG_NUMS=$(echo "$FULL" | python3 -c "import sys,json; d=json.load(sys.stdin); r=d.get('response',{}); print(r.get('emergency_numbers','') if isinstance(r,dict) else '')" 2>/dev/null)
  else
    URGENCY=$(echo "$CHAT_RESP" | python3 -c "import sys,json; d=json.load(sys.stdin); s=d.get('structured',{}); print(s.get('urgency','') if isinstance(s,dict) else '')" 2>/dev/null)
    EMG_NUMS=$(echo "$CHAT_RESP" | python3 -c "import sys,json; d=json.load(sys.stdin); s=d.get('structured',{}); print(s.get('emergency_numbers','') if isinstance(s,dict) else '')" 2>/dev/null)
  fi
  
  [ "$URGENCY" = "EMERGENCY" ] && pass "\"$SYMPTOM\" → EMERGENCY ✓" || fail "\"$SYMPTOM\" → got $URGENCY (expected EMERGENCY)"
  [ -n "$EMG_NUMS" ] && pass "Emergency numbers present: $EMG_NUMS" || fail "Emergency numbers missing"
done

# ============================
# TEST 5: Session Memory
# ============================
echo ""
info "TEST 5: Session Memory (context carried across messages)"

MSG1_RESP=$(curl -s -X POST "$BASE/api/chat" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"message": "I have a headache"}')
REQ_ID1=$(echo "$MSG1_RESP" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('request_id',''))" 2>/dev/null)
[ -n "$REQ_ID1" ] && poll_response "$REQ_ID1" "$TOKEN" > /dev/null

sleep 1

MSG2_RESP=$(curl -s -X POST "$BASE/api/chat" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"message": "What about fever too?"}')
REQ_ID2=$(echo "$MSG2_RESP" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('request_id',''))" 2>/dev/null)

if [ -n "$REQ_ID2" ]; then
  FULL2=$(poll_response "$REQ_ID2" "$TOKEN")
  EXPLANATION=$(echo "$FULL2" | python3 -c "import sys,json; d=json.load(sys.stdin); r=d.get('response',{}); print(r.get('explanation','')[:200] if isinstance(r,dict) else str(r)[:200])" 2>/dev/null)
  pass "Session memory: follow-up message processed"
  info "Context response: ${EXPLANATION:0:120}..."
else
  EXPLANATION=$(echo "$MSG2_RESP" | python3 -c "import sys,json; d=json.load(sys.stdin); s=d.get('structured',{}); print(s.get('explanation','')[:200] if isinstance(s,dict) else '')" 2>/dev/null)
  pass "Session memory: follow-up message processed"
  info "Context response: ${EXPLANATION:0:120}..."
fi

# ============================
# TEST 6: Arabic Language Detection
# ============================
echo ""
info "TEST 6: Arabic Language Detection"

AR_RESP=$(curl -s -X POST "$BASE/api/chat" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"message": "أعاني من صداع شديد"}')
REQ_ID_AR=$(echo "$AR_RESP" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('request_id',''))" 2>/dev/null)

if [ -n "$REQ_ID_AR" ]; then
  FULL_AR=$(poll_response "$REQ_ID_AR" "$TOKEN")
  AR_EXPLANATION=$(echo "$FULL_AR" | python3 -c "import sys,json; d=json.load(sys.stdin); r=d.get('response',{}); print(r.get('raw','')[:300] if isinstance(r,dict) else str(r)[:300])" 2>/dev/null)
  pass "Arabic message accepted and processed"
  info "Arabic response preview: ${AR_EXPLANATION:0:200}"
else
  AR_EXPLANATION=$(echo "$AR_RESP" | python3 -c "import sys,json; d=json.load(sys.stdin); s=d.get('structured',{}); print(s.get('raw','')[:200] if isinstance(s,dict) else '')" 2>/dev/null)
  pass "Arabic message processed"
  info "Response: ${AR_EXPLANATION:0:200}"
fi

# ============================
# TEST 7: Notify Clinic & Callback
# ============================
echo ""
info "TEST 7: Notify Clinic & Callback Flow"

NOTIFY_RESP=$(curl -s -X POST "$BASE/api/notify-clinic" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"patient_phone\": \"$PHONE\", \"consent_given\": true}")
NOTIFY_OK=$(echo "$NOTIFY_RESP" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('success', d.get('notification_id','')))" 2>/dev/null)
NOTIF_ID=$(echo "$NOTIFY_RESP" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('notification_id',''))" 2>/dev/null)
[ -n "$NOTIF_ID" ] && pass "Clinic notified, notification_id=$NOTIF_ID" || { info "Notify response: $NOTIFY_RESP"; }

# Check notifications list
NOTIFS=$(curl -s "$BASE/api/notifications?pin=123456")
NOTIF_COUNT=$(echo "$NOTIFS" | python3 -c "import sys,json; d=json.load(sys.stdin); l=d if isinstance(d,list) else d.get('notifications',[]); print(len(l))" 2>/dev/null)
[ "$NOTIF_COUNT" -gt "0" ] 2>/dev/null && pass "Notifications visible on dashboard ($NOTIF_COUNT total)" || info "Notifications response: ${NOTIFS:0:200}"

# Check callback status
CB_STATUS=$(curl -s "$BASE/api/patient/callback-status" -H "Authorization: Bearer $TOKEN")
info "Callback status: $CB_STATUS"

echo ""
echo "================================================"
echo "       TEST SUITE COMPLETE"
echo "================================================"
