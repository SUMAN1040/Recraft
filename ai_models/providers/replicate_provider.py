import os
import requests
from typing import Dict, Any, Optional
from .base import BaseAIProvider

class ReplicateProvider(BaseAIProvider):
    """
    Replicate Provider:
    - Black Forest Labs Flux.1 Schnell / Dev
    """

    def __init__(self, api_key: Optional[str] = None):
        key = api_key or os.environ.get("REPLICATE_API_TOKEN", "")
        super().__init__(api_key=key)

    def generate_image(
        self,
        prompt: str,
        style_preset: str = "vector_art",
        aspect_ratio: str = "1:1",
        palette_colors: Optional[list] = None,
        **kwargs
    ) -> Dict[str, Any]:
        if not self.api_key:
            raise ValueError("REPLICATE_API_TOKEN is not configured.")

        url = "https://api.replicate.com/v1/predictions"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "Prefer": "wait"
        }

        ar_map = {"1:1": "1:1", "16:9": "16:9", "9:16": "9:16", "4:3": "4:3"}

        payload = {
            "version": "553803d9f11cf52e3029c5463dcb97245ad33c5049f8b7477d86f938704dd535", # flux-schnell
            "input": {
                "prompt": f"{prompt}, in {style_preset.replace('_', ' ')} art style",
                "aspect_ratio": ar_map.get(aspect_ratio, "1:1"),
                "output_format": "webp"
            }
        }

        response = requests.post(url, headers=headers, json=payload, timeout=60)
        response.raise_for_status()
        data = response.json()

        output = data.get("output", [])
        image_url = output[0] if isinstance(output, list) and output else ""

        import hashlib
        content_hash = "0x" + hashlib.sha256(image_url.encode()).hexdigest()
        prompt_hash = "0x" + hashlib.sha256(prompt.encode()).hexdigest()

        return {
            "svg_content": None,
            "image_url": image_url,
            "content_hash": content_hash,
            "prompt_hash": prompt_hash,
            "model_version": "flux-schnell",
            "provider": "Replicate Flux.1",
        }

    def enhance_prompt(
        self,
        prompt: str,
        style_preset: str = "vector_art",
        target_engine: str = "vector"
    ) -> str:
        return f"{prompt}, trending on ArtStation, {style_preset.replace('_', ' ')} graphic masterpiece"

