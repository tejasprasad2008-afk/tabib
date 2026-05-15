import pytest
import httpx
from gemma_client import OllamaClient

@pytest.mark.asyncio
async def test_ollama_client_chat_exception(mocker):
    mocker.patch("httpx.AsyncClient.post", side_effect=httpx.RequestError("Mocked request error", request=None))

    client = OllamaClient()

    with pytest.raises(Exception) as exc_info:
        await client.chat([{"role": "user", "content": "hello"}])

    assert "Ollama Error" in str(exc_info.value)
    assert "Mocked request error" in str(exc_info.value)
