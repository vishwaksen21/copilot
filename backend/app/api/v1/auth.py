from fastapi import APIRouter

router = APIRouter()


@router.get("/status")
async def auth_status():
    """Check authentication status."""
    return {"authenticated": True, "user": "local"}


@router.post("/login")
async def login():
    """Local login (no-op for desktop app)."""
    return {"status": "ok", "token": "local-dev-token"}


@router.post("/logout")
async def logout():
    """Logout."""
    return {"status": "ok"}
