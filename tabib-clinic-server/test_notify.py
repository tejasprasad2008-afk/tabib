
import asyncio
import httpx
import json
import os
from dotenv import load_dotenv

load_dotenv()

async def test_notify_clinic():
    print("--- Testing Notify Clinic ---")
    
    # We need a token to test this, or we can use the local DB directly.
    # But since we want to test the API, let's try to get a token first.
    
    url = "http://localhost:8000"
    
    # Use a dummy phone number for testing
    phone = "+971501234567"
    
    async with httpx.AsyncClient() as client:
        try:
            # 1. Request OTP
            print(f"Requesting OTP for {phone}...")
            r = await client.post(f"{url}/api/auth/request-otp", json={"phone": phone})
            print(f"Status: {r.status_code}, Response: {r.text}")
            
            # In demo mode, OTP is usually 123456
            otp = "123456"
            
            # 2. Verify OTP
            print(f"Verifying OTP {otp}...")
            r = await client.post(f"{url}/api/auth/verify-otp", json={"phone": phone, "code": otp})
            print(f"Status: {r.status_code}")
            auth_data = r.json()
            token = auth_data.get("token")
            
            if not token:
                print("Failed to get token")
                return

            headers = {"Authorization": f"Bearer {token}"}
            
            # 3. Notify Clinic
            print("Notifying clinic...")
            notify_payload = {
                "patient_phone": phone,
                "patient_name": "Test Patient",
                "consent_given": True
            }
            r = await client.post(f"{url}/api/notify-clinic", json=notify_payload, headers=headers)
            print(f"Status: {r.status_code}, Response: {r.text}")
            
            if r.status_code == 200:
                print("Notify Clinic Test Passed!")
            else:
                print("Notify Clinic Test Failed")

        except Exception as e:
            print(f"Test failed: {e}")

if __name__ == "__main__":
    # Note: The server must be running for this test to work via HTTP.
    # Alternatively, we could test the function directly.
    asyncio.run(test_notify_clinic())
