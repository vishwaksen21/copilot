from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, List

router = APIRouter()


class TranscriptionStartRequest(BaseModel):
    source: str = "microphone"
    language: str = "en"


class TranscriptSegment(BaseModel):
    id: str
    speaker_label: str
    content: str
    start_time: float
    end_time: float
    confidence: float


@router.post("/")
async def start_transcription(request: TranscriptionStartRequest):
    """Start a new transcription session."""
    return {
        "id": "transcript-123",
        "status": "recording",
        "source": request.source
    }


@router.get("/")
async def list_transcriptions():
    """List past transcriptions."""
    return {"transcriptions": []}


@router.get("/{transcript_id}")
async def get_transcription(transcript_id: str):
    """Get transcription details."""
    return {"id": transcript_id, "segments": []}


@router.get("/{transcript_id}/segments")
async def get_segments(transcript_id: str):
    """Get transcript segments."""
    return {"segments": []}


@router.get("/{transcript_id}/search")
async def search_transcript(transcript_id: str, q: str):
    """Search within transcription."""
    return {"results": []}
