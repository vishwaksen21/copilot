from pydantic_settings import BaseSettings
from typing import Optional
import os


class Settings(BaseSettings):
    # App
    app_name: str = "Avelyn"
    app_version: str = "1.0.0"
    debug: bool = False

    # Server
    host: str = "127.0.0.1"
    port: int = 8000

    # Security
    secret_key: str = "your-secret-key-change-in-production"

    # AI — Gemini
    gemini_api_key: Optional[str] = None

    # AI — OpenRouter
    openrouter_api_key: Optional[str] = None
    openrouter_model: str = "google/gemini-2.0-flash-001"

    # Speech
    whisper_model_size: str = "base.en"
    sample_rate: int = 16000

    # Audio capture — set to "BlackHole" or leave None for auto-detect
    audio_device_name: Optional[str] = None

    # Storage
    data_dir: str = os.path.join(os.path.expanduser("~"), ".interview-copilot")
    uploads_dir: str = os.path.join(data_dir, "uploads")

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()

os.makedirs(settings.data_dir, exist_ok=True)
os.makedirs(settings.uploads_dir, exist_ok=True)
