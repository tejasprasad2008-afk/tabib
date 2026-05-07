"""
Tabib Clinic Server - Main FastAPI Application
Standalone clinic server for Gemma 4-powered medical triage
"""

import os
import sys
from contextlib import asynccontextmanager
from typing import Optional, Dict, Any
from fastapi import FastAPI, HTTPException, Depends, WebSocket, WebSocketDisconnect, Form, Request, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
import json
import uuid
import time
import asyncio

# Load environment variables from .env file
from dotenv import load_dotenv
env_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(dotenv_path=env_path)

from database import (
    init_db,
    create_notification,
    get_notifications,
    mark_notification_called,
    create_session,
    update_session_urgency,
    mark_session_notified,
    cleanup_old_sessions,
    update_patient_demographics,
    get_patient_demographics,
    get_patient_sessions,
    get_patient_notifications,
    get_queue_stats
)
from queue_manager import queue_manager, ai_client
from auth import request_otp, verify_otp, get_auth_error_message, validate_token, get_current_patient
from registry import register_clinic, get_nearby_clinics, get_local_clinic


# Force HTTPS by default in production
FORCE_HTTPS_DEFAULT = "false"


class OTPRequest(BaseModel):
    phone: str

class OTPVerifyRequest(BaseModel):
    phone: str
    code: str

class ChatRequest(BaseModel):
    message: str
    image_base64: Optional[str] = None


class NotifyClinicRequest(BaseModel):
    patient_phone: str
    patient_name: Optional[str] = None
    consent_given: bool
    conversation: Optional[list] = None


class CallbackRequest(BaseModel):
    notification_id: str


class ProfileRequest(BaseModel):
    age: int
    gender: str
    height_cm: int
    weight_kg: int


# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except:
                pass


manager = ConnectionManager()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    # Startup
    print("Starting Tabib Clinic Server...")

    # Initialize database
    await init_db()
    print("Database initialized")

    # Check AI status
    provider = os.getenv("MODEL_PROVIDER", "mock")
    print(f"DEBUG: Attempting to initialize AI Provider: {provider}")
    ai_ready = await ai_client.health_check()
    if not ai_ready:
        print(f"WARNING: AI Provider {provider} is not ready or health check failed.")
    else:
        print(f"SUCCESS: AI Provider {provider} is active and responding.")

    # Start queue manager
    await queue_manager.start()
    print("Queue manager started")

    # Cleanup old sessions (30 day retention policy)
    await cleanup_old_sessions(30)
    print("Old sessions cleaned up")

    yield

    # Shutdown
    print("Shutting down...")
    await queue_manager.stop()
    print("Queue manager stopped")


app = FastAPI(
    title="Tabib Clinic Server",
    description="Gemma 4-powered medical triage for clinics",
    version="1.0.0",
    lifespan=lifespan
)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler to prevent stack trace leaks"""
    print(f"Unhandled error: {exc}") # Log it internally
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal Server Error",
            "debug_message": str(exc),
            "message_en": "An unexpected error occurred. Please try again later.",
            "message_ar": "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى لاحقاً."
        }
    )

from fastapi.responses import RedirectResponse, JSONResponse

@app.middleware("http")
async def https_redirect(request: Request, call_next):
    # Force HTTPS by default unless explicitly disabled for local dev
    force_https = os.getenv("FORCE_HTTPS", FORCE_HTTPS_DEFAULT).lower() == "true"
    if request.url.scheme == "http" and force_https:
        return RedirectResponse(url=request.url.replace(scheme="https"), status_code=301)
    response = await call_next(request)
    # Add HSTS header when using HTTPS
    if force_https and request.url.scheme == "https":
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response

# CORS configuration - more robust for local dev + production
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=".*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Length", "Content-Type"],
)

@app.middleware("http")
async def add_cors_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    return response

@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = (time.time() - start_time) * 1000
    print(f"DEBUG: {request.method} {request.url.path} - {response.status_code} ({process_time:.2f}ms)")
    return response

@app.get("/")
async def root():
    """Welcome endpoint"""
    return {
        "status": "online",
        "message": "Tabib Clinic Server is running",
        "endpoints": {
            "health": "/health",
            "dashboard": "/dashboard",
            "api": "/api"
        }
    }

@app.get("/health")
async def health():
    """Health check endpoint"""
    ai_ready = await ai_client.health_check()
    clinic_info = await get_local_clinic()

    return {
        "status": "ok",
        "ai_ready": ai_ready,
        "model_provider": os.getenv("MODEL_PROVIDER", "mock"),
        "queue_depth": await queue_manager.get_depth(),
        "clinic_name": clinic_info.get("name") if clinic_info else None,
        "version": "1.0.0"
    }


@app.get("/api/clinics")
async def get_clinics(
    lat: float,
    lon: float,
    radius: float = 20
):
    """Get nearby clinics"""
    clinics = await get_nearby_clinics(lat, lon, radius)
    return {"clinics": clinics}


@app.post("/api/auth/request-otp")
async def request_otp_endpoint(request: Request, data: OTPRequest):
    """Request OTP for phone number"""
    import re
    if not data.phone or not re.match(r"^\+[1-9]\d{1,14}$", data.phone):
        raise HTTPException(status_code=400, detail="Invalid phone number format")

    result = await request_otp(data.phone)
    return result


@app.post("/api/auth/verify-otp")
async def verify_otp_endpoint(request: Request, data: OTPVerifyRequest):
    """Verify OTP and return token"""
    result = await verify_otp(data.phone, data.code)
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["message"])
    return result


@app.post("/api/chat")
async def chat_endpoint(request: Request, chat_data: ChatRequest, patient: dict = Depends(get_current_patient)):
    """Submit chat request to queue - validates ownership"""
    # Use the authenticated patient_id from token
    patient_id = patient["id"]
    
    if not chat_data.message and not chat_data.image_base64:
        raise HTTPException(status_code=400, detail="Message or image required")

    if chat_data.image_base64:
        import base64
        import io
        from PIL import Image
        try:
            image_bytes = base64.b64decode(chat_data.image_base64)
            if len(image_bytes) > 5 * 1024 * 1024:
                raise HTTPException(400, "File too large")
            
            if not (image_bytes.startswith(b'\xff\xd8') or image_bytes.startswith(b'\x89PNG')):
                raise HTTPException(400, "Invalid file type")
                
            img = Image.open(io.BytesIO(image_bytes))
            data = list(img.getdata())
            image_without_exif = Image.new(img.mode, img.size)
            image_without_exif.putdata(data)
            
            buffered = io.BytesIO()
            image_without_exif.save(buffered, format="JPEG")
            chat_data.image_base64 = base64.b64encode(buffered.getvalue()).decode()
            
        except Exception as e:
            if isinstance(e, HTTPException):
                raise e
            raise HTTPException(400, "Invalid image data")

    # Submit to queue
    queue_id = await queue_manager.submit(patient_id, {
        "message": chat_data.message,
        "image_base64": chat_data.image_base64
    })

    # Wait for result (simple sync wrapper for demo)
    max_wait = 60 # seconds
    start_time = time.time()
    
    while time.time() - start_time < max_wait:
        status = await queue_manager.get_status(queue_id)
        if status["status"] == "done":
            # Flatten the response for the frontend
            resp = status.get("response", {})
            return {
                "request_id": queue_id,
                "response": resp.get("raw") or resp.get("explanation") or "I processed your request.",
                "structured": resp
            }
        elif status["status"] == "error":
            raise HTTPException(status_code=500, detail=status.get("error", "AI Error"))
        
        await asyncio.sleep(0.5)

    return {
        "request_id": queue_id,
        "queue_position": (await queue_manager.get_status(queue_id))["queue_position"],
        "status": "pending"
    }


@app.get("/api/queue-status")
async def queue_status(request: Request, request_id: str, patient: dict = Depends(get_current_patient)):
    """Get status of a queue request - validates ownership"""
    # Get the queue item first to check existence
    from database import get_queue_item
    queue_item = await get_queue_item(request_id)
    
    if not queue_item:
        raise HTTPException(status_code=404, detail="Request not found")
    
    # Verify ownership - prevent IDOR attack
    if queue_item["patient_id"] != patient["id"]:
        print(f"IDOR attempt detected: patient {patient['id']} tried to access {request_id}")
        raise HTTPException(status_code=404, detail="Request not found")
    
    item = await queue_manager.get_status(request_id)
    return item


@app.get("/api/patient/callback-status")
async def get_callback_status(patient: dict = Depends(get_current_patient)):
    """Check if any notification for this patient has been called back"""
    from database import get_patient_latest_notification
    notification = await get_patient_latest_notification(patient["id"])
    if notification and notification.get("called_back"):
        return {
            "callback_completed": True,
            "notification_id": notification["id"],
            "urgency_level": notification.get("urgency_level"),
            "summary": notification.get("summary")
        }
    return {"callback_completed": False}


@app.post("/api/notify-clinic")
async def notify_clinic(request: Request, notify_data: NotifyClinicRequest, patient: dict = Depends(get_current_patient)):
    """Notify clinic about patient session"""
    if not notify_data.consent_given:
        raise HTTPException(
            status_code=400,
            detail="Patient consent is required to notify clinic"
        )

    # Use the authenticated patient_id
    patient_id = patient["id"]

    # Get the patient's latest session for summary and urgency
    from database import get_latest_session
    session = await get_latest_session(patient_id)
    
    session_id = session["id"] if session else f"session-{uuid.uuid4().hex[:8]}"
    urgency_level = session.get("urgency_level", "SEE_A_DOCTOR") if session else "SEE_A_DOCTOR"
    
    # Generate clinical summary from session messages
    summary = "Clinical summary will be generated"
    if session and session.get("messages"):
        import json
        try:
            session_messages = json.loads(session["messages"])
            # Get AI client and summarize
            from gemma_client import get_ai_client
            ai_client = get_ai_client()
            summary = await ai_client.summarize(session_messages)
        except Exception as e:
            print(f"Error generating summary: {e}")
            summary = "Unable to generate summary"

    # Create notification in database
    notification_id = await create_notification(
        patient_id=patient_id,
        patient_phone=notify_data.patient_phone,
        summary=summary,
        urgency_level=urgency_level,
        session_id=session_id
    )

    # Broadcast real-time "ping" to all open dashboards
    await manager.broadcast({
        "type": "new_notification",
        "notification_id": notification_id,
        "patient_phone": notify_data.patient_phone,
        "patient_name": notify_data.patient_name or "مريض مجهول",
        "summary": summary[:100] + "..." if len(summary) > 100 else summary,
        "urgency_level": urgency_level,
        "patient_id": patient_id
    })

    return {
        "success": True,
        "message": "Clinic notified",
        "notification_id": notification_id
    }


@app.post("/api/notifications/{notification_id}/callback")
async def mark_callback(notification_id: str):
    """Mark notification as called back and notify patient"""
    await mark_notification_called(notification_id)
    
    # Get notification details to find patient
    from database import get_notification_by_id
    notification = await get_notification_by_id(notification_id)
    
    if notification:
        # Broadcast callback notification
        await manager.broadcast({
            "type": "callback_completed",
            "notification_id": notification_id,
            "patient_id": notification.get("patient_id"),
            "patient_phone": notification.get("patient_phone")
        })
    
    return {"success": True}


@app.get("/api/notifications")
async def get_notifications_endpoint(
    limit: int = 50,
    filter_status: Optional[str] = None,
    urgency_filter: Optional[str] = None
):
    """Get notifications for dashboard"""
    notifications = await get_notifications(limit, filter_status, urgency_filter)
    return {"notifications": notifications}


@app.post("/api/patient/profile")
async def save_patient_profile(
    profile_data: ProfileRequest,
    patient: dict = Depends(get_current_patient)
):
    """Save or update patient demographics"""
    patient_id = patient["id"]
    
    # Validate
    if profile_data.age < 1 or profile_data.age > 120:
        raise HTTPException(status_code=400, detail="Invalid age")
    if profile_data.gender not in ["male", "female", "other"]:
        raise HTTPException(status_code=400, detail="Invalid gender")
    if profile_data.height_cm < 50 or profile_data.height_cm > 300:
        raise HTTPException(status_code=400, detail="Invalid height")
    if profile_data.weight_kg < 10 or profile_data.weight_kg > 500:
        raise HTTPException(status_code=400, detail="Invalid weight")
    
    await update_patient_demographics(
        patient_id,
        profile_data.age,
        profile_data.gender,
        profile_data.height_cm,
        profile_data.weight_kg
    )
    
    return {"success": True, "message": "Profile updated"}


@app.get("/api/patient/profile")
async def get_patient_profile(patient: dict = Depends(get_current_patient)):
    """Get patient profile status"""
    patient_id = patient["id"]
    demographics = await get_patient_demographics(patient_id)
    
    if not demographics or not demographics.get("profile_completed"):
        return {"profile_completed": False}
    
    return {
        "profile_completed": True,
        "age": demographics.get("age"),
        "gender": demographics.get("gender"),
        "height_cm": demographics.get("height_cm"),
        "weight_kg": demographics.get("weight_kg")
    }


@app.get("/api/live-stats")
async def live_stats():
    """Get live queue statistics for the patient PWA"""
    stats = await get_queue_stats()
    return {
        "position": stats.get("pending", 0) + 1, # Simplified: pending + 1
        "pending": stats.get("pending", 0),
        "processing": stats.get("processing", 0),
        "estimated_wait": (stats.get("pending", 0) * 5) + 5 # 5 mins per patient
    }


@app.get("/api/admin/patient-history/{patient_id}")
async def patient_history(patient_id: str, pin: str = Header(None)):
    """Get full patient history (PIN protected)"""
    expected_pin = os.getenv("DASHBOARD_PIN", "123456")
    if pin != expected_pin:
        raise HTTPException(status_code=401, detail="Unauthorized: Invalid PIN")
    
    sessions = await get_patient_sessions(patient_id)
    notifications = await get_patient_notifications(patient_id)
    demographics = await get_patient_demographics(patient_id)
    
    return {
        "patient_id": patient_id,
        "demographics": demographics,
        "sessions": sessions,
        "notifications": notifications
    }


@app.get("/api/dashboard/config")
async def dashboard_config():
    """Get dashboard configuration (PIN, etc.)"""
    return {
        "pin": os.getenv("DASHBOARD_PIN", "123456")
    }


@app.get("/dashboard", response_class=HTMLResponse)
async def dashboard(request: Request):
    """Serve nurse dashboard"""
    client_ip = request.client.host
    if client_ip not in ["127.0.0.1", "localhost", "::1"] and os.getenv("ALLOW_REMOTE_DASHBOARD") != "true":
        raise HTTPException(403, "Dashboard access restricted to localhost")
    dashboard_path = os.path.join(
        os.path.dirname(__file__),
        "dashboard",
        "index.html"
    )
    with open(dashboard_path, "r") as f:
        return f.read()


@app.websocket("/ws/dashboard")
async def dashboard_websocket(websocket: WebSocket):
    """WebSocket for real-time dashboard updates"""
    # For demo purposes, we allow dashboard websocket without token
    # In production, this should be secured with a clinic-specific token
    await manager.connect(websocket)
    try:
        while True:
            # Keep connection alive
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
