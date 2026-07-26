from fastapi import APIRouter, UploadFile, File
from pydantic import BaseModel
from typing import Optional, List

router = APIRouter()


class OCRRequest(BaseModel):
    image_path: str
    explain: bool = False


class OCRResponse(BaseModel):
    text: str
    confidence: float
    explanation: Optional[str] = None


@router.post("/extract")
async def extract_text(file: UploadFile = File(...)):
    """Extract text from image using OCR."""
    # TODO: Implement with EasyOCR
    return {
        "text": "Extracted text from image",
        "confidence": 0.95,
        "regions": []
    }


@router.post("/explain")
async def explain_image(file: UploadFile = File(...), prompt: str = ""):
    """Explain image content using vision LLM."""
    # TODO: Implement with multimodal LLM
    return {
        "explanation": "This image shows a diagram of a binary tree with nodes labeled A through F.",
        "text": "A B C D E F"
    }
