from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, List

router = APIRouter()


class JDCreationRequest(BaseModel):
    title: str
    company: Optional[str] = None
    raw_text: str


class JDResponse(BaseModel):
    id: str
    title: str
    company: Optional[str]
    requirements: List[dict]
    skill_gaps: List[dict]


@router.post("/")
async def create_job_description(request: JDCreationRequest):
    """Create a new job description."""
    return {
        "id": "jd-123",
        "title": request.title,
        "company": request.company,
        "requirements": [],
        "skill_gaps": []
    }


@router.get("/")
async def list_job_descriptions():
    """List user job descriptions."""
    return {"job_descriptions": []}


@router.get("/{jd_id}")
async def get_job_description(jd_id: str):
    """Get job description details."""
    return {"id": jd_id, "title": "Sample JD"}


@router.get("/{jd_id}/gap-analysis")
async def get_gap_analysis(jd_id: str):
    """Get skill gap analysis between resume and JD."""
    return {"gaps": [], "matched": [], "partial": []}


@router.post("/{jd_id}/generate-questions")
async def generate_questions(jd_id: str):
    """Generate probable interview questions based on JD."""
    return {"questions": []}
