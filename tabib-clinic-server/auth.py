"""
Authentication module for patient tokens
Simple token-based auth with OTP simulation
"""

import hashlib
import secrets
import os
from typing import Optional, Dict, Any
from datetime import datetime, timedelta

from database import (
    create_patient,
    get_all_patients,
    update_patient_last_seen
)


import bcrypt

def hash_phone(phone: str) -> str:
    """Hash phone number for storage (never store plain phone)"""
    return bcrypt.hashpw(phone.encode(), bcrypt.gensalt()).decode()


# Feature flag for demo mode
DEMO_MODE = os.getenv("DEMO_MODE", "false").lower() == "true"

# In production, use real SMS provider (Twilio, etc.)
# For hackathon demo, OTP is always "123456" ONLY when DEMO_MODE=true
DEMO_OTP = "123456"


async def request_otp(phone: str) -> Dict[str, Any]:
    """
    Request OTP for phone number

    In production: send SMS via Twilio or similar
    In demo mode: always succeeds, OTP is always "123456"
    """
    if DEMO_MODE:
        return {
            "success": True,
            "message": "OTP sent",
            "demo_otp": DEMO_OTP  # Only for demo
        }

    # In production, send SMS via Twilio or similar
    # This is a placeholder for production implementation
    return {
        "success": True,
        "message": "OTP sent"
    }


async def verify_otp(phone: str, code: str) -> Dict[str, Any]:
    """
    Verify OTP and return token

    In demo mode: any code "123456" is valid
    In production: validate against stored OTP
    """
    if DEMO_MODE:
        if code != DEMO_OTP:
            return {
                "success": False,
                "message": "Invalid OTP code"
            }
    else:
        # In production, validate against stored OTP
        # This is a placeholder for production implementation
        pass

    patients = await get_all_patients()
    patient = None
    for p in patients:
        if p.get("phone_hash") and bcrypt.checkpw(phone.encode(), p["phone_hash"].encode()):
            patient = p
            break

    if not patient:
        phone_hash = hash_phone(phone)
        patient_id = await create_patient(phone_hash)
    else:
        patient_id = patient["id"]
        await update_patient_last_seen(patient_id)

    # Generate cryptographically secure token with expiry
    token = secrets.token_urlsafe(32)
    expires_at = datetime.now() + timedelta(hours=24)  # 24 hour expiry

    from database import update_patient_token
    await update_patient_token(patient_id, token, expires_at.isoformat())

    return {
        "success": True,
        "token": token,
        "patient_id": patient_id,
        "expires_at": expires_at.isoformat()
    }


async def validate_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Validate token and return patient info

    In production: look up token in database and check expiry
    For demo: tokens are not stored, so we return None
    """
    from database import get_patient_by_token
    patient = await get_patient_by_token(token)
    if patient:
        expires_at = datetime.fromisoformat(patient["expires_at"])
        if datetime.now() < expires_at:
            return patient
    return None


def get_auth_error_message() -> Dict[str, Any]:
    """Return authentication error message in Arabic and English"""
    return {
        "error": "Unauthorized",
        "message_ar": "غير مصرح. يرجى تسجيل الدخول.",
        "message_en": "Unauthorized. Please log in."
    }
