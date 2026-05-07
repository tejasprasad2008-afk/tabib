"""
AI Client Wrapper for Tabib
Handles communication with Ollama, OpenRouter, or Mock responses
"""

import httpx
import os
import json
from typing import List, Dict, Any, Optional
from prompts import TRIAGE_SYSTEM_PROMPT, SUMMARIZATION_SYSTEM_PROMPT


# Mock response for testing
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


class OpenRouterClient:
    def __init__(self):
        self.api_key = os.getenv("OPENROUTER_API_KEY")
        self.model = os.getenv(
            "OPENROUTER_MODEL", 
            "google/gemma-3-27b-it:free"
        )
        self.base_url = "https://openrouter.ai/api/v1/chat/completions"
        self.site_url = os.getenv("SITE_URL", "https://tabib-pwa.vercel.app")
        self.site_name = os.getenv("SITE_NAME", "Tabib")
    
    async def chat(self, messages: list) -> str:
        if not self.api_key:
            raise ValueError(
                "OPENROUTER_API_KEY not set in .env"
            )
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "HTTP-Referer": self.site_url,
            "X-Title": self.site_name,
            "Content-Type": "application/json"
        }
        
        # Handle multimodal messages
        formatted_messages = []
        for msg in messages:
            if isinstance(msg.get("content"), list):
                # Already in multimodal format — pass through
                formatted_messages.append(msg)
            else:
                formatted_messages.append({
                    "role": msg["role"],
                    "content": msg["content"]
                })
        
        payload = {
            "model": self.model,
            "messages": formatted_messages,
            "temperature": 0.3,
            "max_tokens": 1024,
        }
        
        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                r = await client.post(
                    self.base_url,
                    headers=headers,
                    json=payload
                )
                
                if r.status_code == 429:
                    print("DEBUG: OpenRouter Rate Limit. Falling back to Mock.")
                    return MOCK_RESPONSE
                elif r.status_code == 402:
                    print("DEBUG: OpenRouter No Credits. Falling back to Mock.")
                    return MOCK_RESPONSE
                elif r.status_code == 401:
                    raise Exception("Invalid OpenRouter API key. Check OPENROUTER_API_KEY in .env")
                
                r.raise_for_status()
                data = r.json()
                return data["choices"][0]["message"]["content"]
        except httpx.TimeoutException:
            raise Exception("AI model timed out. Try again or switch to a faster model.")
        except Exception as e:
            if "Rate limit" in str(e) or "credits" in str(e) or "API key" in str(e):
                raise e
            raise Exception(f"OpenRouter Error: {str(e)}")
    
    async def summarize(self, session_history: list) -> str:
        messages = [
            {
                "role": "system", 
                "content": SUMMARIZATION_SYSTEM_PROMPT
            },
            {
                "role": "user", 
                "content": f"Summarize this triage session: {str(session_history)}"
            }
        ]
        return await self.chat(messages)
    
    async def health_check(self) -> bool:
        if not self.api_key:
            return False
        try:
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            async with httpx.AsyncClient(timeout=10.0) as client:
                r = await client.post(
                    self.base_url,
                    headers=headers,
                    json={
                        "model": self.model,
                        "messages": [
                            {
                                "role": "user",
                                "content": "hi"
                            }
                        ],
                        "max_tokens": 5
                    }
                )
                return r.status_code == 200
        except:
            return False


class OllamaClient:
    def __init__(self):
        self.url = os.getenv("OLLAMA_URL", "http://localhost:11434")
        self.model = os.getenv("MODEL", "gemma4:26b")
        self.timeout = int(os.getenv("OLLAMA_TIMEOUT", "120"))
        self.api_key = os.getenv("OLLAMA_API_KEY")

    async def chat(self, messages: List[Dict[str, str]]) -> str:
        url = f"{self.url}/api/chat"
        payload = {
            "model": self.model,
            "messages": messages,
            "stream": False
        }

        headers = {}
        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(url, json=payload, headers=headers)
                response.raise_for_status()
                return response.json()["message"]["content"]
        except Exception as e:
            raise Exception(f"Ollama Error: {str(e)}")

    async def summarize(self, session_history: List[Dict[str, str]]) -> str:
        messages = [
            {"role": "system", "content": SUMMARIZATION_SYSTEM_PROMPT},
            {"role": "user", "content": str(session_history)}
        ]
        return await self.chat(messages)

    async def health_check(self) -> bool:
        try:
            async with httpx.AsyncClient(timeout=5) as client:
                response = await client.get(f"{self.url}/api/tags")
                return response.status_code == 200
        except:
            return False


class MockClient:
    async def chat(self, messages: List[Dict[str, str]]) -> str:
        return MOCK_RESPONSE

    async def summarize(self, session_history: List[Dict[str, str]]) -> str:
        return "Clinical Summary (Mock): Patient reports mild symptoms. Recommended home care."

    async def health_check(self) -> bool:
        return True


class GroqClient:
    def __init__(self):
        self.api_key = os.getenv("GROQ_API_KEY")
        self.model = os.getenv("GROQ_MODEL", "gemma2-9b-it")
        self.base_url = "https://api.groq.com/openai/v1/chat/completions"

    async def chat(self, messages: list) -> str:
        if not self.api_key:
            raise ValueError("GROQ_API_KEY not set in .env")
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": 0.3,
            "max_tokens": 1024,
        }
        
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                r = await client.post(self.base_url, headers=headers, json=payload)
                if r.status_code != 200:
                    print(f"Groq API Error Status: {r.status_code}")
                    print(f"Groq API Error Response: {r.text}")
                r.raise_for_status()
                data = r.json()
                return data["choices"][0]["message"]["content"]
        except Exception as e:
            print(f"Groq Error: {e}. Falling back to Mock.")
            return MOCK_RESPONSE

    async def summarize(self, session_history: list) -> str:
        messages = [
            {"role": "system", "content": SUMMARIZATION_SYSTEM_PROMPT},
            {"role": "user", "content": f"Summarize: {str(session_history)}"}
        ]
        return await self.chat(messages)

    async def health_check(self) -> bool:
        return bool(self.api_key)


def get_ai_client():
    provider = os.getenv("MODEL_PROVIDER", "mock")
    
    if provider == "groq":
        return GroqClient()
    elif provider == "openrouter":
        return OpenRouterClient()
    elif provider == "ollama":
        return OllamaClient()
    else:
        return MockClient()
