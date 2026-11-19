import os
import json
import logging
from pathlib import Path
from typing import Dict, Any, Optional, List

from .providers import (
    BaseAIProvider,
    LocalRecraftProvider,
    OpenAIProvider,
    AnthropicProvider,
    GeminiProvider,
    StabilityAIProvider,
    ReplicateProvider,
)
from .registry import SUPPORTED_MODELS

logger = logging.getLogger("ai_models.manager")

CONFIG_PATH = Path(__file__).resolve().parent / "config.json"

class AIModelManager:
    """
    Central AI Model Gateway:
    Manages, configures, and routes generation and reasoning across
    Claude, Google Gemini, OpenAI ChatGPT/DALL-E, Stability AI, Replicate, and Recraft Local.
    """

    def __init__(self, config_file: Optional[Path] = None):
        self.config_path = config_file or CONFIG_PATH
        self.config = self._load_config()

        # Initialize providers map
        self.providers: Dict[str, BaseAIProvider] = {
            "recraft_local": LocalRecraftProvider(),
            "openai": OpenAIProvider(),
            "claude": AnthropicProvider(),
            "gemini": GeminiProvider(),
            "stability": StabilityAIProvider(),
            "replicate": ReplicateProvider(),
        }

    def _load_config(self) -> Dict[str, Any]:
        if self.config_path.exists():
            with open(self.config_path, "r", encoding="utf-8") as f:
                return json.load(f)
        return {
            "active_image_provider": "recraft_local",
            "active_llm_provider": "claude",
            "fallback_chain": ["recraft_local", "gemini", "openai", "stability", "replicate"],
            "providers": {},
        }

    def save_config(self):
        with open(self.config_path, "w", encoding="utf-8") as f:
            json.dump(self.config, f, indent=2)

    def get_provider(self, name: str) -> BaseAIProvider:
        provider = self.providers.get(name)
        if not provider:
            logger.warning(f"Provider '{name}' not found. Defaulting to 'recraft_local'.")
            return self.providers["recraft_local"]
        return provider

    def generate_artwork(
        self,
        prompt: str,
        style_preset: str = "vector_art",
        aspect_ratio: str = "1:1",
        palette_colors: Optional[list] = None,
        preferred_provider: Optional[str] = None,
        **kwargs
    ) -> Dict[str, Any]:
        """
        Routes generation request to the preferred or active provider.
        Automatically uses graceful fallback if an API key is missing or fails.
        """
        provider_name = preferred_provider or self.config.get("active_image_provider", "recraft_local")
        fallback_chain = [provider_name] + [
            p for p in self.config.get("fallback_chain", ["recraft_local"]) if p != provider_name
        ]

        last_error = None
        for p_name in fallback_chain:
            try:
                provider = self.get_provider(p_name)
                # Attempt generation
                result = provider.generate_image(
                    prompt=prompt,
                    style_preset=style_preset,
                    aspect_ratio=aspect_ratio,
                    palette_colors=palette_colors,
                    **kwargs
                )
                result["routed_provider"] = p_name
                return result
            except Exception as e:
                logger.warning(f"Provider '{p_name}' failed with error: {e}. Trying fallback...")
                last_error = e

        # If all fail, local recraft never fails
        local_result = self.providers["recraft_local"].generate_image(
            prompt=prompt,
            style_preset=style_preset,
            aspect_ratio=aspect_ratio,
            palette_colors=palette_colors,
            **kwargs
        )
        local_result["fallback_notice"] = f"Generated via Local Recraft Engine due to: {str(last_error)}"
        local_result["routed_provider"] = "recraft_local"
        return local_result

    def enhance_prompt(
        self,
        prompt: str,
        style_preset: str = "vector_art",
        preferred_llm: Optional[str] = None
    ) -> str:
        llm_name = preferred_llm or self.config.get("active_llm_provider", "claude")
        provider = self.get_provider(llm_name)
        try:
            return provider.enhance_prompt(prompt, style_preset=style_preset)
        except Exception as e:
            logger.warning(f"LLM enhance failed on {llm_name}: {e}. Using local prompt expander.")
            return self.providers["recraft_local"].enhance_prompt(prompt, style_preset=style_preset)

    def list_all_models(self) -> List[Dict[str, Any]]:
        """
        Lists all providers with their active status, available models, and API key presence.
        """
        providers_info = []
        for key, provider_obj in self.providers.items():
            meta = self.config.get("providers", {}).get(key, {})
            env_var = meta.get("env_key")
            has_key = bool(os.environ.get(env_var, "")) if env_var else True

            providers_info.append({
                "id": key,
                "name": meta.get("name", key),
                "type": meta.get("type", "image"),
                "models": meta.get("models", {}),
                "is_active_image": self.config.get("active_image_provider") == key,
                "is_active_llm": self.config.get("active_llm_provider") == key,
                "has_api_key": has_key,
                "requires_api_key": meta.get("requires_api_key", True),
                "description": meta.get("description", ""),
            })
        return providers_info

    def set_active_provider(self, image_provider: Optional[str] = None, llm_provider: Optional[str] = None):
        if image_provider and image_provider in self.providers:
            self.config["active_image_provider"] = image_provider
        if llm_provider and llm_provider in self.providers:
            self.config["active_llm_provider"] = llm_provider
        self.save_config()


# Global singleton instance
ai_manager = AIModelManager()

