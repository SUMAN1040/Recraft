from abc import ABC, abstractmethod
from typing import Dict, Any, Optional

class BaseAIProvider(ABC):
    """
    Abstract interface for AI model providers (OpenAI, Claude, Gemini, Stability, etc.)
    """

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key

    @abstractmethod
    def generate_image(
        self,
        prompt: str,
        style_preset: str = "vector_art",
        aspect_ratio: str = "1:1",
        palette_colors: Optional[list] = None,
        **kwargs
    ) -> Dict[str, Any]:
        """
        Generates an image/SVG and returns standardized dictionary:
        {
            "svg_content": str or None,
            "image_url": str,
            "content_hash": str,
            "prompt_hash": str,
            "model_version": str,
            "provider": str
        }
        """
        pass

    @abstractmethod
    def enhance_prompt(
        self,
        prompt: str,
        style_preset: str = "vector_art",
        target_engine: str = "vector"
    ) -> str:
        """
        Refines a user prompt into a high-detail design prompt with style tokens.
        """
        pass

