import asyncio
from typing import AsyncGenerator, List, Dict
import json

from ..ai.model_router import ModelRouter, TaskType


class StreamingManager:
    """Manages streaming AI responses with cancellation support."""

    def __init__(self):
        self.model_router = ModelRouter()
        self.active_streams: Dict[str, asyncio.Event] = {}

    async def stream_chat(
        self,
        conversation_id: str,
        messages: List[Dict],
        model_provider: str,
        model_name: str
    ) -> AsyncGenerator[str, None]:
        """Stream tokens from the selected AI provider."""
        stop_event = asyncio.Event()
        self.active_streams[conversation_id] = stop_event

        try:
            service = await self.model_router.get_service(model_provider)

            async for token in service.chat(
                messages=messages,
                model=model_name,
                stream=True
            ):
                if stop_event.is_set():
                    break
                yield token
        finally:
            self.active_streams.pop(conversation_id, None)

    def stop_stream(self, conversation_id: str):
        """Stop an active stream."""
        event = self.active_streams.get(conversation_id)
        if event:
            event.set()
