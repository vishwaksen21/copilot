from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import List, Dict, Optional
import json
import asyncio
import base64
import numpy as np
import logging
import time

from app.config import settings
from app.services.speech.transcription_service import TranscriptionService
from app.services.audio.capture_service import AudioCaptureService
from app.services.ai.gemini_service import GeminiService
from app.services.ai.openrouter_service import OpenRouterService

logger = logging.getLogger(__name__)

router = APIRouter()

# Singletons — lazy initialized
_transcription_service: Optional[TranscriptionService] = None
_gemini_service: Optional[GeminiService] = None
_openrouter_service: Optional[OpenRouterService] = None


def _get_transcription() -> TranscriptionService:
    global _transcription_service
    if _transcription_service is None:
        _transcription_service = TranscriptionService(settings.whisper_model_size)
    return _transcription_service


def _get_gemini() -> GeminiService:
    global _gemini_service
    if _gemini_service is None:
        _gemini_service = GeminiService(settings.gemini_api_key)
    return _gemini_service


def _get_openrouter() -> OpenRouterService:
    global _openrouter_service
    if _openrouter_service is None:
        _openrouter_service = OpenRouterService(settings.openrouter_api_key, settings.openrouter_model)
    return _openrouter_service


async def _get_ai_service():
    """Return the best available AI service (OpenRouter first, then Gemini)."""
    openrouter = _get_openrouter()
    if await openrouter.is_available():
        return openrouter
    gemini = _get_gemini()
    if await gemini.is_available():
        return gemini
    return None


class SessionState:
    """Tracks state for a single WebSocket session."""

    def __init__(self):
        self.audio_capture: Optional[AudioCaptureService] = None
        self.capture_task: Optional[asyncio.Task] = None
        self.conversation_history: List[Dict[str, str]] = []
        self.running = False


@router.websocket("/ws/transcription/{session_id}")
async def transcription_websocket(websocket: WebSocket, session_id: str):
    """WebSocket endpoint for real-time audio transcription + AI answers.

    Supports two modes:
    1. Server-side audio capture (BlackHole) — client sends {"type": "start", "mode": "server"}
    2. Client-side audio capture (fallback) — client sends audio_chunk messages

    The pipeline: audio → Faster-Whisper → Gemini AI answer → stream back to client.
    """
    await websocket.accept()
    session = SessionState()
    session.running = True

    # Audio buffer for accumulating chunks before transcription
    audio_buffer: list[np.ndarray] = []
    buffer_samples = 0
    target_chunk_samples = settings.sample_rate * 3  # 3 seconds

    try:
        await websocket.send_text(json.dumps({
            "type": "status",
            "message": "Connected. Send {\"type\": \"start\"} to begin."
        }))

        while session.running:
            try:
                raw = await asyncio.wait_for(websocket.receive_text(), timeout=1.0)
            except asyncio.TimeoutError:
                # If server-side capture is running, check for audio
                if session.capture_task and not session.capture_task.done():
                    continue
                continue

            msg = json.loads(raw)
            msg_type = msg.get("type", "")

            # ── START ──────────────────────────────────────────────
            if msg_type == "start":
                mode = msg.get("mode", "server")

                if mode == "server":
                    # Server-side audio capture from BlackHole
                    device_name = msg.get("device") or settings.audio_device_name
                    capture = AudioCaptureService(device_name=device_name)
                    device_idx = capture.find_device()

                    if device_idx is None:
                        await websocket.send_text(json.dumps({
                            "type": "error",
                            "message": (
                                "No virtual audio device found. "
                                "Install BlackHole: brew install blackhole-2ch "
                                "then create an Aggregate Device in Audio MIDI Setup."
                            )
                        }))
                        continue

                    session.audio_capture = capture

                    async def capture_and_transcribe():
                        """Background task: capture audio → transcribe → send results."""
                        nonlocal audio_buffer, buffer_samples

                        if not capture.start():
                            await websocket.send_text(json.dumps({
                                "type": "error",
                                "message": "Failed to start audio capture"
                            }))
                            return

                        await websocket.send_text(json.dumps({
                            "type": "status",
                            "message": f"Server audio capture started on: {capture.device_index}"
                        }))

                        transcription = _get_transcription()

                        # Run capture in a thread since sounddevice is blocking
                        def audio_generator():
                            return capture.chunks(settings.sample_rate)

                        loop = asyncio.get_event_loop()

                        try:
                            while session.running:
                                # Get next audio chunk from the generator (runs in thread)
                                try:
                                    chunk = await loop.run_in_executor(
                                        None, lambda: next(audio_generator(), None)
                                    )
                                except StopIteration:
                                    break

                                if chunk is None:
                                    continue

                                audio_buffer.append(chunk)
                                buffer_samples += len(chunk)

                                # Send audio level
                                level = capture.get_audio_level()
                                await websocket.send_text(json.dumps({
                                    "type": "audio_level",
                                    "level": round(level, 3)
                                }))

                                # Transcribe when buffer is full
                                if buffer_samples >= target_chunk_samples:
                                    audio_data = np.concatenate(audio_buffer)
                                    audio_buffer = []
                                    buffer_samples = 0

                                    # Run transcription in thread pool (it's CPU-heavy)
                                    result = await loop.run_in_executor(
                                        None,
                                        lambda: transcription.transcribe(audio_data, settings.sample_rate)
                                    )

                                    text = result.get("text", "").strip()
                                    if text:
                                        # Send final transcription
                                        await websocket.send_text(json.dumps({
                                            "type": "final",
                                            "text": text,
                                            "confidence": result.get("confidence", 0),
                                            "timestamps": result.get("timestamps"),
                                        }))

                                        # Generate AI answer
                                        ai = await _get_ai_service()
                                        if ai:
                                            answer_parts = []
                                            async for token in ai.generate_answer(
                                                text, session.conversation_history
                                            ):
                                                answer_parts.append(token)
                                                # Stream each token to client
                                                await websocket.send_text(json.dumps({
                                                    "type": "ai_answer_token",
                                                    "text": token,
                                                }))

                                            full_answer = "".join(answer_parts)

                                            # Signal answer is complete
                                            await websocket.send_text(json.dumps({
                                                "type": "ai_answer",
                                                "text": full_answer,
                                            }))

                                            # Update conversation history
                                            session.conversation_history.append({
                                                "role": "interviewer",
                                                "content": text
                                            })
                                            session.conversation_history.append({
                                                "role": "assistant",
                                                "content": full_answer
                                            })
                        except asyncio.CancelledError:
                            pass
                        finally:
                            capture.stop()

                    session.capture_task = asyncio.create_task(capture_and_transcribe())

                elif mode == "client":
                    # Client-side audio capture — just acknowledge
                    await websocket.send_text(json.dumps({
                        "type": "status",
                        "message": "Client audio mode active. Send audio_chunk messages."
                    }))

            # ── AUDIO CHUNK (from client) ─────────────────────────
            elif msg_type == "audio_chunk":
                # Client sends base64-encoded float32 audio
                try:
                    raw_b64 = msg.get("data", "")
                    audio_bytes = base64.b64decode(raw_b64)
                    audio_array = np.frombuffer(audio_bytes, dtype=np.float32)

                    audio_buffer.append(audio_array)
                    buffer_samples += len(audio_array)

                    # Transcribe when buffer is full
                    if buffer_samples >= target_chunk_samples:
                        audio_data = np.concatenate(audio_buffer)
                        audio_buffer = []
                        buffer_samples = 0

                        transcription = _get_transcription()
                        loop = asyncio.get_event_loop()
                        result = await loop.run_in_executor(
                            None,
                            lambda: transcription.transcribe(audio_data, settings.sample_rate)
                        )

                        text = result.get("text", "").strip()
                        if text:
                            await websocket.send_text(json.dumps({
                                "type": "final",
                                "text": text,
                                "confidence": result.get("confidence", 0),
                            }))

                            # Generate AI answer
                            ai = await _get_ai_service()
                            if ai:
                                answer_parts = []
                                async for token in ai.generate_answer(
                                    text, session.conversation_history
                                ):
                                    answer_parts.append(token)
                                    await websocket.send_text(json.dumps({
                                        "type": "ai_answer_token",
                                        "text": token,
                                    }))

                                full_answer = "".join(answer_parts)
                                await websocket.send_text(json.dumps({
                                    "type": "ai_answer",
                                    "text": full_answer,
                                }))

                                session.conversation_history.append({
                                    "role": "interviewer",
                                    "content": text
                                })
                                session.conversation_history.append({
                                    "role": "assistant",
                                    "content": full_answer
                                })
                except Exception as e:
                    logger.error(f"Error processing audio chunk: {e}")

            # ── STOP ──────────────────────────────────────────────
            elif msg_type == "stop":
                session.running = False
                if session.capture_task:
                    session.capture_task.cancel()
                break

    except WebSocketDisconnect:
        logger.info(f"Client disconnected: {session_id}")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
    finally:
        session.running = False
        if session.capture_task:
            session.capture_task.cancel()
        if session.audio_capture:
            session.audio_capture.stop()


@router.websocket("/ws/chat/{conversation_id}")
async def chat_websocket(websocket: WebSocket, conversation_id: str):
    """WebSocket for real-time chat streaming."""
    await websocket.accept()
    conversation_history: List[Dict[str, str]] = []

    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)

            if message.get("type") == "message":
                content = message.get("content", "")
                conversation_history.append({"role": "user", "content": content})

                ai = await _get_ai_service()
                if ai:
                    async for token in ai.generate_answer(
                        content, conversation_history, stream=True
                    ):
                        await websocket.send_text(json.dumps({
                            "type": "token",
                            "content": token,
                        }))

                    await websocket.send_text(json.dumps({
                        "type": "done",
                        "message_id": f"msg-{int(time.time())}",
                        "tokens_used": 0,
                    }))
                else:
                    await websocket.send_text(json.dumps({
                        "type": "token",
                        "content": "[AI not configured — add OPENROUTER_API_KEY to .env]",
                    }))
                    await websocket.send_text(json.dumps({
                        "type": "done",
                        "message_id": f"msg-{int(time.time())}",
                        "tokens_used": 0,
                    }))

            elif message.get("type") == "stop":
                break
    except WebSocketDisconnect:
        pass
