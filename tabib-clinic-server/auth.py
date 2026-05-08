"""
Authentication module for patient tokens
Simple token-based auth with OTP simulation
"""

import hashlib
import hmac
import secrets
import os
from typing import Optional, Dict, Any
from datetime import datetime, timedelta

from database import (
    create_patient,
    get_all_patients,
    update_patient_last_seen,
    get_patient_by_phone_hash,
    update_patient_phone_hash,
    has_legacy_users
)


import bcrypt

# Get pepper from environment. Fail fast if missing or empty to ensure security.
phone_pepper_env = os.getenv("PHONE_PEPPER")
if not phone_pepper_env:
    raise RuntimeError("PHONE_PEPPER environment variable is missing or empty. It must be set for secure phone hashing.")
PHONE_PEPPER = phone_pepper_env.encode()

def hash_phone(phone: str) -> str:
    """Hash phone number for storage using HMAC-SHA256 with a pepper (O(1) lookup)"""
    return hmac.new(PHONE_PEPPER, phone.encode(), hashlib.sha256).hexdigest()


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

    # Try O(1) lookup first using the fast hash
    fast_hash = hash_phone(phone)
    patient = await get_patient_by_phone_hash(fast_hash)

    # If not found, try O(N) bcrypt loop ONLY if legacy users still exist
    if not patient and await has_legacy_users():
        patients = await get_all_patients()
        for p in patients:
            if p.get("phone_hash") and p["phone_hash"].startswith("$2b$") and bcrypt.checkpw(phone.encode(), p["phone_hash"].encode()):
                patient = p
                # Migrate legacy user to fast hash
                await update_patient_phone_hash(patient["id"], fast_hash)
                break

    if not patient:
        phone_hash = fast_hash
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


from fastapi import HTTPException, Header

async def get_current_patient(authorization: Optional[str] = Header(None)) -> Dict[str, Any]:
    """
    Dependency to get current authenticated patient from Authorization header.
    """
    # Validate token
    if not authorization:
        raise HTTPException(
            status_code=401,
            detail={
                "error": "Unauthorized",
                "message_ar": "غير مصرح. يرجى تسجيل الدخول.",
                "message_en": "Unauthorized. Please log in."
            }
        )
    
    # Extract token from "Bearer <token>" format
    if authorization.startswith("Bearer "):
        token = authorization[7:]
    else:
        token = authorization
    
    patient = await validate_token(token)
    if not patient:
        raise HTTPException(
            status_code=401,
            detail={
                "error": "Unauthorized",
                "message_ar": "غير مصرح. يرجى تسجيل الدخول.",
                "message_en": "Unauthorized. Please log in."
            }
        )
    
    return patient
