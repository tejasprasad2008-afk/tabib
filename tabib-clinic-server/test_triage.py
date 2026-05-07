
import asyncio
import os
import sys
from dotenv import load_dotenv

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

load_dotenv()

from queue_manager import QueueManager
from database import init_db

async def test_arabic_emergency():
    print("--- Testing Arabic Emergency Triage ---")
    await init_db()
    qm = QueueManager()
    
    # Test message with emergency keywords
    payload = {"message": "أشعر بألم شديد في الصدر وضيق في التنفس"}
    result = await qm._run_inference(payload)
    
    print(f"Urgency: {result['urgency']}")
    print(f"Explanation: {result['explanation']}")
    
    assert result['urgency'] == "EMERGENCY"
    print("Arabic Emergency Test Passed!")

async def test_keyword_998():
    print("\n--- Testing Emergency Keyword 998 ---")
    qm = QueueManager()
    payload = {"message": "help me 998"}
    result = await qm._run_inference(payload)
    
    print(f"Urgency: {result['urgency']}")
    assert result['urgency'] == "EMERGENCY"
    print("Keyword 998 Test Passed!")

async def test_normal_triage():
    print("\n--- Testing Normal Arabic Triage (via OpenRouter) ---")
    if not os.getenv("OPENROUTER_API_KEY"):
        print("Skipping OpenRouter test (no API key)")
        return

    qm = QueueManager()
    # "I have a slight headache and a sore throat"
    payload = {"message": "عندي صداع خفيف وألم في الحلق منذ الصباح"}
    result = await qm._run_inference(payload)
    
    print(f"Urgency: {result['urgency']}")
    print(f"Explanation: {result['explanation']}")
    print(f"Steps: {result['steps']}")
    
    assert result['urgency'] in ["HOME_CARE", "SEE_A_DOCTOR"]
    print("Normal Triage Test Passed!")

async def main():
    try:
        await test_arabic_emergency()
        await test_keyword_998()
        await test_normal_triage()
    except Exception as e:
        print(f"Tests failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())
