from enum import Enum
from typing import Optional, List, Dict
from .openai_service import OpenAIService
from .ollama_service import OllamaService


class TaskType(str, Enum):
    CHAT = "chat"
    COMPLEX_REASONING = "complex_reasoning"
    CODE_EXPLANATION = "code_explanation"
    SUMMARIZATION = "summarization"
    EXTRACTION = "extraction"
    VISION = "vision"


class ModelRouter:
    """Automatically selects the best model based on task and availability."""

    def __init__(self):
        self.openai = OpenAIService()
        self.ollama = OllamaService()

    async def select_model(
        self,
        task: TaskType,
        user_preference: Optional[str] = None,
        requires_vision: bool = False
    ) -> tuple[str, str]:
        """Select the best model for the given task.

        Returns: (provider, model_name)
        """

        # Check user preference
        if user_preference:
            if user_preference.startswith("gpt"):
                if await self.openai.is_available():
                    return "openai", user_preference
            else:
                if await self.ollama.is_available():
                    return "ollama", user_preference

        # Auto-select based on task
        if task == TaskType.VISION:
            if await self.openai.is_available():
                return "openai", "gpt-4o"
            return "ollama", "llava:13b"

        if task in (TaskType.COMPLEX_REASONING, TaskType.CODE_EXPLANATION):
            if await self.openai.is_available():
                return "openai", "gpt-4o"
            return "ollama", "llama3.1:8b"

        # Default: prefer local LLM for privacy and cost
        if await self.ollama.is_available():
            return "ollama", "llama3.1:8b"

        if await self.openai.is_available():
            return "openai", "gpt-4o-mini"

        raise RuntimeError("No AI models available. Configure OpenAI API key or install Ollama.")

    async def get_service(self, provider: str):
        """Get the appropriate AI service."""
        if provider == "openai":
            return self.openai
        elif provider == "ollama":
            return self.ollama
        else:
            raise ValueError(f"Unknown provider: {provider}")

    async def list_all_models(self) -> Dict:
        """List all available models from all providers."""
        models = []

        if await self.openai.is_available():
            for model in self.openai.list_models():
                models.append({**model, "provider": "openai"})

        if await self.ollama.is_available():
            for model in self.ollama.list_models():
                models.append({**model, "provider": "ollama"})

        return {
            "models": models,
            "openai_available": await self.openai.is_available(),
            "ollama_available": await self.ollama.is_available()
        }
