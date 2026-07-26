import httpx
from typing import AsyncGenerator, List, Dict, Optional
import logging
import os

logger = logging.getLogger(__name__)

OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"

SYSTEM_PROMPT = """You are an interview assistant. The user is in a live job interview.
The interviewer's speech has been transcribed from audio, so it may have minor errors.

Your task:
- Answer the interviewer's question concisely and professionally
- Keep answers between 2-5 sentences unless more detail is needed
- Be specific and use concrete examples when possible
- Sound natural and confident, not robotic
- If the transcription seems garbled, give your best interpretation"""


class OpenRouterService:
    """OpenRouter API integration (OpenAI-compatible) for AI answer generation."""

    def __init__(self, api_key: Optional[str] = None, model: Optional[str] = None):
        self.api_key = api_key or os.getenv("OPENROUTER_API_KEY")
        self.model = model or os.getenv("OPENROUTER_MODEL", "google/gemini-2.0-flash-001")
        self._available = bool(self.api_key)
        if self._available:
            logger.info(f"OpenRouter service initialized (model: {self.model})")
        else:
            logger.warning("OpenRouter API key not configured")

    async def generate_answer(
        self,
        question: str,
        conversation_history: Optional[List[Dict[str, str]]] = None,
        stream: bool = True,
        append_question: bool = True,
    ) -> AsyncGenerator[str, None]:
        """Generate an interview answer for the given question.

        Args:
            append_question: If True, appends the question as a user message.
                Set to False when the caller already includes the question in conversation_history
                (e.g. the chat endpoint).
        """
        if not self._available:
            yield "[AI not configured — add OPENROUTER_API_KEY to .env]"
            return

        messages = [{"role": "system", "content": SYSTEM_PROMPT}]

        # Add conversation history for context
        if conversation_history:
            for msg in conversation_history[-10:]:
                role = "user" if msg.get("role") in ("interviewer", "user") else "assistant"
                messages.append({"role": role, "content": msg.get("content", "")})

        # Add the current question only if caller hasn't already included it
        if append_question:
            messages.append({
                "role": "user",
                "content": f"Interviewer just said: {question}",
            })

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "HTTP-Referer": "https://avelyn.app",
            "X-Title": "Avelyn Interview Copilot",
            "Content-Type": "application/json",
        }

        payload = {
            "model": self.model,
            "messages": messages,
            "max_tokens": 300,
            "temperature": 0.7,
            "stream": stream,
        }

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                if stream:
                    async with client.stream(
                        "POST",
                        f"{OPENROUTER_BASE_URL}/chat/completions",
                        headers=headers,
                        json=payload,
                    ) as response:
                        if response.status_code != 200:
                            body = await response.aread()
                            logger.error(f"OpenRouter error {response.status_code}: {body.decode()}")
                            yield f"[Error: {response.status_code}]"
                            return

                        async for line in response.aiter_lines():
                            if not line.startswith("data: "):
                                continue
                            data = line[6:]
                            if data.strip() == "[DONE]":
                                break
                            try:
                                import json
                                chunk = json.loads(data)
                                delta = chunk.get("choices", [{}])[0].get("delta", {})
                                content = delta.get("content", "")
                                if content:
                                    yield content
                            except Exception:
                                continue
                else:
                    response = await client.post(
                        f"{OPENROUTER_BASE_URL}/chat/completions",
                        headers=headers,
                        json=payload,
                    )
                    if response.status_code != 200:
                        logger.error(f"OpenRouter error {response.status_code}: {response.text}")
                        yield f"[Error: {response.status_code}]"
                        return

                    result = response.json()
                    content = result.get("choices", [{}])[0].get("message", {}).get("content", "")
                    if content:
                        yield content

        except httpx.TimeoutException:
            logger.error("OpenRouter request timed out")
            yield "[Request timed out]"
        except Exception as e:
            logger.error(f"OpenRouter API error: {e}")
            yield f"[Error: {e}]"

    async def is_available(self) -> bool:
        return self._available
