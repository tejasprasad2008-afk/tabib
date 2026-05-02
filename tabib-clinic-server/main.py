"""
Tabib Clinic Server - Main FastAPI Application
Standalone clinic server for Gemma 4-powered medical triage
"""

import os
import sys
from contextlib import asynccontextmanager
from typing import Optional, Dict, Any
from fastapi import FastAPI, HTTPException, Depends, WebSocket, WebSocketDisconnect, Form, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
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
    cleanup_old_sessions
)
from queue_manager import queue_manager
from gemma_client import health_check
from auth import request_otp, verify_otp, get_auth_error_message
from registry import register_clinic, get_nearby_clinics, get_local_clinic


# Rate limiting
limiter = Limiter(key_func=get_remote_address)


class OTPRequest(BaseModel):
    phone: str

class OTPVerifyRequest(BaseModel):
    phone: str
    code: str

class ChatRequest(BaseModel):
    patient_id: str
    message: str
    image_base64: Optional[str] = None


class NotifyClinicRequest(BaseModel):
    patient_id: str
    patient_phone: str
    patient_name: Optional[str] = None
    consent_given: bool
    conversation: Optional[list] = None


class CallbackRequest(BaseModel):
    notification_id: str


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

    # Check Ollama status
    ollama_status = await health_check()
    if not ollama_status["running"]:
        print("WARNING: Ollama is not running. Start with: ollama serve")
    elif not ollama_status["model_loaded"]:
        print(f"WARNING: Model {ollama_status['target_model']} not loaded")
        print(f"Available models: {ollama_status['available_models']}")
    else:
        print(f"Ollama running with model: {ollama_status['target_model']}")

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

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler to prevent stack trace leaks"""
    print(f"Unhandled error: {exc}") # Log it internally
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal Server Error",
            "message_en": "An unexpected error occurred. Please try again later.",
            "message_ar": "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى لاحقاً."
        }
    )

from fastapi.responses import RedirectResponse, JSONResponse

@app.middleware("http")
async def https_redirect(request: Request, call_next):
    if request.url.scheme == "http" and os.getenv("FORCE_HTTPS") == "true":
        return RedirectResponse(url=request.url.replace(scheme="https"), status_code=301)
    return await call_next(request)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    """Health check endpoint"""
    ollama_status = await health_check()
    clinic_info = await get_local_clinic()

    return {
        "status": "ok",
        "ollama_running": ollama_status["running"],
        "model_loaded": ollama_status["model_loaded"],
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
@limiter.limit("5/minute")
async def request_otp_endpoint(request: Request, data: OTPRequest):
    """Request OTP for phone number"""
    import re
    if not data.phone or not re.match(r"^\+[1-9]\d{1,14}$", data.phone):
        raise HTTPException(status_code=400, detail="Invalid phone number format")

    result = await request_otp(data.phone)
    return result


@app.post("/api/auth/verify-otp")
@limiter.limit("5/minute")
async def verify_otp_endpoint(request: Request, data: OTPVerifyRequest):
    """Verify OTP and return token"""
    result = await verify_otp(data.phone, data.code)
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["message"])
    return result


@app.post("/api/chat")
@limiter.limit("15/minute")
async def chat_endpoint(request: ChatRequest):
    """Submit chat request to queue"""
    if not request.message and not request.image_base64:
        raise HTTPException(status_code=400, detail="Message or image required")

    if request.image_base64:
        import base64
        import io
        from PIL import Image
        try:
            image_bytes = base64.b64decode(request.image_base64)
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
            request.image_base64 = base64.b64encode(buffered.getvalue()).decode()
            
        except Exception as e:
            if isinstance(e, HTTPException):
                raise e
            raise HTTPException(400, "Invalid image data")

    # Use the real patient_id from the device
    patient_id = request.patient_id

    # Submit to queue
    queue_id = await queue_manager.submit(patient_id, {
        "message": request.message,
        "image_base64": request.image_base64
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
async def queue_status(request_id: str, patient_id: Optional[str] = None):
    """Get status of a queue request"""
    # patient_id is logged for tracking multiple devices
    status = await queue_manager.get_status(request_id)
    return status


@app.post("/api/notify-clinic")
@limiter.limit("5/minute")
async def notify_clinic(request: NotifyClinicRequest):
    """Notify clinic about patient session"""
    if not request.consent_given:
        raise HTTPException(
            status_code=400,
            detail="Patient consent is required to notify clinic"
        )

    # Use the real patient_id
    patient_id = request.patient_id

    # Create notification in database
    notification_id = await create_notification(
        patient_id=patient_id,
        patient_phone=request.patient_phone,
        summary="Clinical summary will be generated",
        urgency_level="PENDING",
        session_id=f"session-{uuid.uuid4().hex[:8]}"
    )

    # Broadcast real-time "ping" to all open dashboards
    await manager.broadcast({
        "type": "new_notification",
        "notification_id": notification_id,
        "patient_phone": request.patient_phone,
        "patient_name": request.patient_name or "مريض مجهول",
        "summary": request.summary or "طلب استشارة طبيب",
        "urgency_level": "PENDING",
        "patient_id": patient_id
    })

    return {
        "success": True,
        "message": "Clinic notified",
        "notification_id": notification_id
    }


@app.post("/api/notifications/{notification_id}/callback")
async def mark_callback(notification_id: str):
    """Mark notification as called back"""
    await mark_notification_called(notification_id)
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
    token = websocket.query_params.get("token")
    from auth import validate_token
    if not token or not await validate_token(token):
        await websocket.close(code=1008, reason="Unauthorized")
        return
    await manager.connect(websocket)
    try:
        while True:
            # Keep connection alive
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
