import httpx
from typing import AsyncGenerator, List, Dict
import json

from .base import BaseAIService


class OllamaService(BaseAIService):
    """Ollama local LLM integration service."""

    def __init__(self, base_url: str = "http://localhost:11434"):
        self.base_url = base_url

    async def chat(
        self,
        messages: List[Dict[str, str]],
        model: str = "llama3.1:8b",
        stream: bool = True,
        **kwargs
    ) -> AsyncGenerator[str, None]:
        """Stream chat response from Ollama."""
        async with httpx.AsyncClient() as client:
            async with client.stream(
                "POST",
                f"{self.base_url}/api/chat",
                json={
                    "model": model,
                    "messages": messages,
                    "stream": stream
                },
                timeout=120.0
            ) as response:
                async for line in response.aiter_lines():
                    if line:
                        data = json.loads(line)
                        content = data.get("message", {}).get("content", "")
                        if content:
                            yield content

    async def is_available(self) -> bool:
        """Check if Ollama is available."""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(f"{self.base_url}/api/tags", timeout=5.0)
                return response.status_code == 200
        except Exception:
            return False

    def list_models(self) -> List[Dict]:
        """List available Ollama models."""
        import httpx as sync_httpx
        try:
            response = sync_httpx.get(f"{self.base_url}/api/tags", timeout=5.0)
            if response.status_code == 200:
                data = response.json()
                return [
                    {"name": m["name"], "capabilities": ["chat"]}
                    for m in data.get("models", [])
                ]
        except Exception:
            pass
        return []
