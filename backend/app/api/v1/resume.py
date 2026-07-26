from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
from typing import Optional, List

router = APIRouter()


class ResumeUploadResponse(BaseModel):
    id: str
    title: str
    file_type: str
    file_size: int
    skills: List[dict]
    experience: List[dict]
    projects: List[dict]


@router.post("/upload")
async def upload_resume(file: UploadFile = File(...)):
    """Upload and parse a resume."""
    if not file.filename.endswith(('.pdf', '.docx')):
        raise HTTPException(status_code=400, detail="Only PDF and DOCX files are supported")

    # TODO: Implement actual parsing
    return {
        "id": "resume-123",
        "title": file.filename,
        "file_type": file.filename.split('.')[-1],
        "file_size": file.size,
        "skills": [
            {"name": "Python", "category": "technical", "proficiency": "advanced"},
            {"name": "FastAPI", "category": "technical", "proficiency": "intermediate"},
        ],
        "experience": [],
        "projects": []
    }


@router.get("/")
async def list_resumes():
    """List user resumes."""
    return {"resumes": []}


@router.get("/{resume_id}")
async def get_resume(resume_id: str):
    """Get resume details."""
    return {"id": resume_id, "title": "Sample Resume"}


@router.get("/{resume_id}/skills")
async def get_resume_skills(resume_id: str):
    """Get extracted skills from resume."""
    return {"skills": []}


@router.delete("/{resume_id}")
async def delete_resume(resume_id: str):
    """Delete a resume."""
    return {"status": "deleted"}
