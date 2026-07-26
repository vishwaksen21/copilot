from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, List

router = APIRouter()


class InterviewStartRequest(BaseModel):
    type: str  # 'technical', 'behavioral', 'coding'
    difficulty: str = "medium"
    duration_minutes: int = 30
    resume_id: Optional[str] = None
    jd_id: Optional[str] = None


class InterviewQuestion(BaseModel):
    id: str
    question_text: str
    question_type: str
    difficulty: str
    time_limit_sec: int


@router.post("/start")
async def start_interview(request: InterviewStartRequest):
    """Start a new mock interview session."""
    return {
        "id": "interview-123",
        "type": request.type,
        "status": "in_progress",
        "first_question": {
            "id": "q1",
            "question_text": "Tell me about yourself and your experience.",
            "question_type": "behavioral",
            "difficulty": request.difficulty,
            "time_limit_sec": 120
        }
    }


@router.get("/")
async def list_interviews():
    """List past interviews."""
    return {"interviews": []}


@router.get("/{interview_id}")
async def get_interview(interview_id: str):
    """Get interview details."""
    return {"id": interview_id, "status": "completed"}


@router.post("/{interview_id}/answer")
async def submit_answer(interview_id: str, question_id: str, answer: str):
    """Submit answer to a question."""
    return {
        "evaluation": {
            "score": 85,
            "feedback": "Good response with clear structure.",
            "star_compliance": True
        },
        "follow_up": "Can you provide a specific example?"
    }


@router.post("/{interview_id}/complete")
async def complete_interview(interview_id: str):
    """Complete interview and get feedback."""
    return {
        "overall_score": 82,
        "feedback": {
            "strengths": ["Clear communication", "Good examples"],
            "improvements": ["Be more specific with metrics"],
            "star_compliance": 0.85
        }
    }
