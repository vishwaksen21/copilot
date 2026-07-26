from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List

router = APIRouter()


class ChatRequest(BaseModel):
    conversation_id: str
    content: str
    model_provider: str = "ollama"
    model_name: str = "llama3.1:8b"


class ChatMessage(BaseModel):
    id: str
    role: str
    content: str
    model: Optional[str] = None
    tokens_used: Optional[int] = None


class ModelInfo(BaseModel):
    provider: str
    name: str
    available: bool
    capabilities: List[str]


@router.post("/send")
async def send_message(request: ChatRequest):
    """Send a message and get streaming response."""
    # TODO: Implement streaming chat
    # This would use SSE or WebSocket for streaming
    return {
        "message_id": "mock-id",
        "content": "This is a mock response. Implement streaming.",
        "tokens_used": 42
    }


@router.post("/stop")
async def stop_streaming(conversation_id: str):
    """Stop streaming response."""
    return {"status": "stopped"}


@router.get("/models")
async def list_models():
    """List available AI models."""
    models = [
        {
            "provider": "openai",
            "name": "gpt-4o",
            "available": True,
            "capabilities": ["chat", "vision", "reasoning"]
        },
        {
            "provider": "openai",
            "name": "gpt-4o-mini",
            "available": True,
            "capabilities": ["chat", "summarization"]
        },
        {
            "provider": "ollama",
            "name": "llama3.1:8b",
            "available": False,
            "capabilities": ["chat"]
        }
    ]
    return {"models": models, "ollama_available": False}
