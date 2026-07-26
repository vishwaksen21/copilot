from openai import AsyncOpenAI
from typing import AsyncGenerator, List, Dict, Optional
import os

from .base import BaseAIService


class OpenAIService(BaseAIService):
    """OpenAI GPT integration service."""

    def __init__(self):
        api_key = os.getenv("OPENAI_API_KEY")
        self.client = AsyncOpenAI(api_key=api_key) if api_key else None

    async def chat(
        self,
        messages: List[Dict[str, str]],
        model: str = "gpt-4o",
        stream: bool = True,
        **kwargs
    ) -> AsyncGenerator[str, None]:
        """Stream chat response from OpenAI."""
        if not self.client:
            raise RuntimeError("OpenAI API key not configured")

        response = await self.client.chat.completions.create(
            model=model,
            messages=messages,
            stream=stream,
            **kwargs
        )

        async for chunk in response:
            content = chunk.choices[0].delta.content
            if content:
                yield content

    async def is_available(self) -> bool:
        """Check if OpenAI is available."""
        return self.client is not None

    def list_models(self) -> List[Dict]:
        """List available OpenAI models."""
        return [
            {"name": "gpt-4o", "capabilities": ["chat", "vision", "reasoning"]},
            {"name": "gpt-4o-mini", "capabilities": ["chat", "summarization"]},
        ]
