import asyncio
import os
from dotenv import load_dotenv

# Load environment variables from .env file
env_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(dotenv_path=env_path)

from gemma_client import GroqClient

async def test_groq():
    client = GroqClient()
    print(f"Testing Groq with model: {client.model}")
    print(f"API Key: {client.api_key[:5]}...{client.api_key[-5:]}" if client.api_key else "No API Key")
    
    messages = [{"role": "user", "content": "Say 'Groq is working' in Arabic and English."}]
    try:
        response = await client.chat(messages)
        print("Response:")
        print(response)
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(test_groq())
