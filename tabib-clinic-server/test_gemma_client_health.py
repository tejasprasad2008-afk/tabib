import pytest
from pytest_httpx import HTTPXMock
import httpx
import os

# Ensure we're importing from the right place
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from gemma_client import OpenRouterClient

@pytest.mark.asyncio
async def test_health_check_no_api_key(monkeypatch):
    monkeypatch.setenv("OPENROUTER_API_KEY", "")
    client = OpenRouterClient()
    # It might pick up from .env if load_dotenv is used, but gemma_client only uses os.getenv
    assert await client.health_check() is False

@pytest.mark.asyncio
async def test_health_check_success(httpx_mock: HTTPXMock, monkeypatch):
    monkeypatch.setenv("OPENROUTER_API_KEY", "test_key")
    client = OpenRouterClient()

    httpx_mock.add_response(url=client.base_url, status_code=200)

    assert await client.health_check() is True

@pytest.mark.asyncio
async def test_health_check_failure_status(httpx_mock: HTTPXMock, monkeypatch):
    monkeypatch.setenv("OPENROUTER_API_KEY", "test_key")
    client = OpenRouterClient()

    httpx_mock.add_response(url=client.base_url, status_code=401)

    assert await client.health_check() is False

@pytest.mark.asyncio
async def test_health_check_exception(httpx_mock: HTTPXMock, monkeypatch):
    monkeypatch.setenv("OPENROUTER_API_KEY", "test_key")
    client = OpenRouterClient()

    httpx_mock.add_exception(httpx.TimeoutException("Timeout"), url=client.base_url)

    assert await client.health_check() is False
