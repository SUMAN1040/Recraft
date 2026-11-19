import os
import base64
import requests
from typing import Dict, Any, Optional
from .base import BaseAIProvider

class StabilityAIProvider(BaseAIProvider):
    """
    Stability AI Provider:
    - Stable Diffusion 3 Ultra / Medium
    - SDXL Core
    """

    def __init__(self, api_key: Optional[str] = None):
        key = api_key or os.environ.get("STABILITY_API_KEY", "")
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
            raise ValueError("STABILITY_API_KEY is not configured.")

        url = "https://api.stability.ai/v2beta/stable-image/generate/sd3"
        headers = {
            "authorization": f"Bearer {self.api_key}",
            "accept": "application/json"
        }

        # Stability aspect ratio mapping
        ar_map = {
            "1:1": "1:1",
            "16:9": "16:9",
            "9:16": "9:16",
            "4:3": "4:3"
        }

        files = {
            "prompt": (None, f"{prompt}, {style_preset.replace('_', ' ')} design"),
            "output_format": (None, "png"),
            "aspect_ratio": (None, ar_map.get(aspect_ratio, "1:1")),
            "mode": (None, "text-to-image")
        }

        response = requests.post(url, headers=headers, files=files, timeout=60)
        response.raise_for_status()
        data = response.json()

        image_b64 = data.get("image", "")
        data_url = f"data:image/png;base64,{image_b64}"

        import hashlib
        content_hash = "0x" + hashlib.sha256(image_b64.encode()).hexdigest()
        prompt_hash = "0x" + hashlib.sha256(prompt.encode()).hexdigest()

        return {
            "svg_content": None,
            "image_url": data_url,
            "content_hash": content_hash,
            "prompt_hash": prompt_hash,
            "model_version": "stable-diffusion-v3-medium",
            "provider": "Stability AI SD3",
        }

    def enhance_prompt(
        self,
        prompt: str,
        style_preset: str = "vector_art",
        target_engine: str = "vector"
    ) -> str:
        return f"{prompt}, sharp detailed {style_preset.replace('_', ' ')}, raytraced lighting, 8k resolution"

