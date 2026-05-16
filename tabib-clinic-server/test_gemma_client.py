import pytest
import httpx
import os
from gemma_client import OpenRouterClient, MOCK_RESPONSE

@pytest.fixture
def openrouter_client(monkeypatch):
    monkeypatch.setenv("OPENROUTER_API_KEY", "test_key")
    return OpenRouterClient()

async def test_openrouter_rate_limit(httpx_mock, openrouter_client):
    httpx_mock.add_response(status_code=429)
    response = await openrouter_client.chat([{"role": "user", "content": "hi"}])
    assert response == MOCK_RESPONSE

async def test_openrouter_no_credits(httpx_mock, openrouter_client):
    httpx_mock.add_response(status_code=402)
    response = await openrouter_client.chat([{"role": "user", "content": "hi"}])
    assert response == MOCK_RESPONSE

async def test_openrouter_invalid_api_key(httpx_mock, openrouter_client):
    httpx_mock.add_response(status_code=401)
    with pytest.raises(Exception, match="Invalid OpenRouter API key. Check OPENROUTER_API_KEY in .env"):
        await openrouter_client.chat([{"role": "user", "content": "hi"}])

async def test_openrouter_timeout(httpx_mock, openrouter_client):
    httpx_mock.add_exception(httpx.TimeoutException("Timeout"))
    with pytest.raises(Exception, match="AI model timed out. Try again or switch to a faster model."):
        await openrouter_client.chat([{"role": "user", "content": "hi"}])

async def test_openrouter_other_error(httpx_mock, openrouter_client):
    httpx_mock.add_response(status_code=500, text="Internal Server Error")
    with pytest.raises(Exception, match="OpenRouter Error:"):
        await openrouter_client.chat([{"role": "user", "content": "hi"}])
