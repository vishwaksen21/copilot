from fastapi import APIRouter

from .auth import router as auth_router
from .chat import router as chat_router
from .resume import router as resume_router
from .job_description import router as jd_router
from .transcription import router as transcription_router
from .mock_interview import router as interview_router
from .coding import router as coding_router
from .meeting import router as meeting_router
from .ocr import router as ocr_router
from .settings import router as settings_router

api_router = APIRouter()

api_router.include_router(auth_router, prefix="/auth", tags=["Authentication"])
api_router.include_router(chat_router, prefix="/chat", tags=["Chat"])
api_router.include_router(resume_router, prefix="/resumes", tags=["Resume"])
api_router.include_router(jd_router, prefix="/job-descriptions", tags=["Job Descriptions"])
api_router.include_router(transcription_router, prefix="/transcriptions", tags=["Transcription"])
api_router.include_router(interview_router, prefix="/interviews", tags=["Mock Interview"])
api_router.include_router(coding_router, prefix="/coding", tags=["Coding"])
api_router.include_router(meeting_router, prefix="/meetings", tags=["Meetings"])
api_router.include_router(ocr_router, prefix="/ocr", tags=["OCR"])
api_router.include_router(settings_router, prefix="/settings", tags=["Settings"])
