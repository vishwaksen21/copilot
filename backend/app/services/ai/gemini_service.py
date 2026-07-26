from google import genai
from typing import AsyncGenerator, List, Dict, Optional
import logging
import os

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are an interview assistant. The user is in a live job interview.
The interviewer's speech has been transcribed from audio, so it may have minor errors.

Your task:
- Answer the interviewer's question concisely and professionally
- Keep answers between 2-5 sentences unless more detail is needed
- Be specific and use concrete examples when possible
- Sound natural and confident, not robotic
- If the transcription seems garbled, give your best interpretation"""


class GeminiService:
    """Google Gemini API integration for interview answer generation."""

    def __init__(self, api_key: Optional[str] = None):
        key = api_key or os.getenv("GEMINI_API_KEY")
        if key:
            self.client = genai.Client(api_key=key)
            self._available = True
            logger.info("Gemini service initialized (google-genai SDK)")
        else:
            self.client = None
            self._available = False
            logger.warning("Gemini API key not configured")

    async def generate_answer(
        self,
        question: str,
        conversation_history: Optional[List[Dict[str, str]]] = None,
        stream: bool = True,
    ) -> AsyncGenerator[str, None]:
        """Generate an interview answer for the given question."""
        if not self._available:
            yield "[AI not configured — add GEMINI_API_KEY to .env]"
            return

        # Build contents list
        contents = []

        # Add conversation history for context
        if conversation_history:
            for msg in conversation_history[-10:]:
                role = "user" if msg.get("role") == "interviewer" else "model"
                contents.append(genai.types.Content(
                    role=role,
                    parts=[genai.types.Part.from_text(text=msg.get("content", ""))]
                ))

        # Add the current question
        contents.append(genai.types.Content(
            role="user",
            parts=[genai.types.Part.from_text(text=f"Interviewer just said: {question}")]
        ))

        try:
            if stream:
                response = self.client.models.generate_content_stream(
                    model="gemini-2.0-flash",
                    contents=contents,
                    config=genai.types.GenerateContentConfig(
                        system_instruction=SYSTEM_PROMPT,
                        temperature=0.7,
                        max_output_tokens=300,
                    ),
                )
                for chunk in response:
                    if chunk.text:
                        yield chunk.text
            else:
                response = self.client.models.generate_content(
                    model="gemini-2.0-flash",
                    contents=contents,
                    config=genai.types.GenerateContentConfig(
                        system_instruction=SYSTEM_PROMPT,
                        temperature=0.7,
                        max_output_tokens=300,
                    ),
                )
                if response.text:
                    yield response.text

        except Exception as e:
            logger.error(f"Gemini API error: {e}")
            yield f"[Error generating answer: {e}]"

    async def is_available(self) -> bool:
        return self._available

    def list_models(self) -> List[Dict]:
        return [
            {"name": "gemini-2.0-flash", "capabilities": ["chat", "reasoning", "speed"]},
            {"name": "gemini-2.5-pro", "capabilities": ["chat", "reasoning", "complex"]},
        ]
