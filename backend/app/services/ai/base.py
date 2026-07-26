from abc import ABC, abstractmethod
from typing import AsyncGenerator, List, Dict, Optional


class BaseAIService(ABC):
    """Abstract base class for AI services."""

    @abstractmethod
    async def chat(
        self,
        messages: List[Dict[str, str]],
        model: str,
        stream: bool = True,
        **kwargs
    ) -> AsyncGenerator[str, None] | str:
        """Send chat messages and get response."""
        pass

    @abstractmethod
    async def is_available(self) -> bool:
        """Check if the service is available."""
        pass

    @abstractmethod
    def list_models(self) -> List[Dict]:
        """List available models."""
        pass
