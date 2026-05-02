"""
Ollama API client wrapper for Gemma 4
Handles all communication with the local Ollama server
"""

import httpx
import os
from typing import List, Dict, Any
from prompts import TRIAGE_SYSTEM_PROMPT, SUMMARIZATION_SYSTEM_PROMPT


OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434")
MODEL = os.getenv("MODEL", "gemma4:26b")
TIMEOUT = int(os.getenv("OLLAMA_TIMEOUT", "120"))
MOCK_MODE = os.getenv("MOCK_MODE", "false").lower() == "true"


# Mock response for testing without Ollama
MOCK_RESPONSE = """URGENCY: SEE_A_DOCTOR

EXPLANATION:
قد تكون هذه الأعراض ناتجة عن التهاب في الحلق أو عدوى فيروسية. من الشائع أن تصاحب هذه الأعراض الحمى والتعب.

STEPS:
1. استرح في المنزل وتجنب المجهود الشديد
2. اشرب كميات كبيرة من السوائل الدافئة
3. تناول خافض للحرارة إذا كانت درجة حرارتك مرتفعة
4. راجع الطبيب إذا استمرت الأعراض أكثر من 3 أيام

WARNING SIGNS:
- صعوبة في التنفس أو البلع
- ارتفاع شديد في درجة الحرارة فوق 39 درجة
- تورم في الرقبة

EMERGENCY NUMBERS:
UAE: 998 | Saudi Arabia: 911 | Egypt: 123

DISCLAIMER:
هذه المعلومات للتوجيه فقط وليست تشخيصاً طبياً.
This is guidance only. Always consult a qualified doctor."""


class OllamaError(Exception):
    """Custom exception for Ollama-related errors"""
    pass


async def chat(messages: List[Dict[str, str]], model: str = MODEL) -> str:
    """
    Send chat request to Ollama

    Args:
        messages: List of message dicts with 'role' and 'content'
        model: Model name to use

    Returns:
        Response text from the model

    Raises:
        OllamaError: If Ollama is not running or request fails
    """
    # Return mock response if MOCK_MODE is enabled
    if MOCK_MODE:
        print("[MOCK MODE] Returning hardcoded response")
        return MOCK_RESPONSE
    
    url = f"{OLLAMA_URL}/api/chat"
    payload = {
        "model": model,
        "messages": messages,
        "stream": False
    }

    try:
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            response = await client.post(url, json=payload)
            response.raise_for_status()
            return response.json()["message"]["content"]
    except httpx.ConnectError:
        raise OllamaError(
            "Ollama is not running. Please start Ollama first by running: ollama serve"
        )
    except httpx.TimeoutException:
        raise OllamaError("Request to Ollama timed out. Please try again.")
    except httpx.HTTPStatusError as e:
        raise OllamaError(f"Ollama returned error: {e.response.status_code}")
    except Exception as e:
        raise OllamaError(f"Unexpected error communicating with Ollama: {str(e)}")


async def summarize(session_history: List[Dict[str, str]]) -> str:
    """
    Generate clinical summary of a session

    Args:
        session_history: List of messages from the session

    Returns:
        Clinical summary text (max 150 words)
    """
    messages = [
        {"role": "system", "content": SUMMARIZATION_SYSTEM_PROMPT},
        {"role": "user", "content": str(session_history)}
    ]
    return await chat(messages)


async def health_check() -> Dict[str, Any]:
    """
    Check if Ollama is running and model is available

    Returns:
        Dict with status information
    """
    # If in mock mode, report as running
    if MOCK_MODE:
        return {
            "running": True,
            "model_loaded": True,
            "available_models": ["gemma4:26b (mock)"],
            "target_model": MODEL,
            "mock_mode": True
        }
    
    try:
        url = f"{OLLAMA_URL}/api/tags"
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.get(url)
            response.raise_for_status()
            models = response.json().get("models", [])

            model_names = [m.get("name", "") for m in models]
            model_loaded = MODEL in model_names

            return {
                "running": True,
                "model_loaded": model_loaded,
                "available_models": model_names,
                "target_model": MODEL
            }
    except Exception:
        return {
            "running": False,
            "model_loaded": False,
            "available_models": [],
            "target_model": MODEL
        }
