import os
import json
import requests
from typing import Dict, Any, Optional
from .base import BaseAIProvider

class OpenAIProvider(BaseAIProvider):
    """
    OpenAI Provider:
    - Image Generation: DALL-E 3
    - Prompt Engineering / Code: GPT-4o
    """

    def __init__(self, api_key: Optional[str] = None):
        key = api_key or os.environ.get("OPENAI_API_KEY", "")
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
            raise ValueError("OPENAI_API_KEY is not configured.")

        # Map aspect ratios to DALL-E 3 dimensions
        size_map = {
            "1:1": "1024x1024",
            "16:9": "1792x1024",
            "9:16": "1024x1792",
        }
        size = size_map.get(aspect_ratio, "1024x1024")

        # Inject style and color palette into DALL-E prompt
        palette_str = f" Using exact brand palette: {', '.join(palette_colors)}." if palette_colors else ""
        style_str = f" Render in {style_preset.replace('_', ' ')} style with clean vector aesthetic and vibrant contrast."
        full_prompt = f"{prompt.strip()}{style_str}{palette_str}"

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": "dall-e-3",
            "prompt": full_prompt,
            "n": 1,
            "size": size,
            "quality": "standard",
            "response_format": "url",
        }

        response = requests.post("https://api.openai.com/v1/images/generations", headers=headers, json=payload, timeout=45)
        response.raise_for_status()
        data = response.json()

        image_url = data["data"][0]["url"]
        revised_prompt = data["data"][0].get("revised_prompt", full_prompt)

        # Generate cryptographic hash placeholder
        import hashlib
        content_hash = "0x" + hashlib.sha256(image_url.encode()).hexdigest()
        prompt_hash = "0x" + hashlib.sha256(prompt.encode()).hexdigest()

        return {
            "svg_content": None,
            "image_url": image_url,
            "content_hash": content_hash,
            "prompt_hash": prompt_hash,
            "model_version": "openai-dall-e-3",
            "provider": "OpenAI DALL-E 3",
            "revised_prompt": revised_prompt,
        }

    def enhance_prompt(
        self,
        prompt: str,
        style_preset: str = "vector_art",
        target_engine: str = "vector"
    ) -> str:
        if not self.api_key:
            return f"{prompt}, high quality {style_preset.replace('_', ' ')} design"

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": "gpt-4o",
            "messages": [
                {
                    "role": "system",
                    "content": "You are an expert graphic designer for Recraft AI. Expand the user's short prompt into an evocative, precise prompt optimized for generative vector art and 3D design. Return only the improved prompt text."
                },
                {
                    "role": "user",
                    "content": f"Expand this prompt for a {style_preset} design: '{prompt}'"
                }
            ],
            "max_tokens": 150,
            "temperature": 0.7,
        }

        try:
            res = requests.post("https://api.openai.com/v1/chat/completions", headers=headers, json=payload, timeout=20)
            res.raise_for_status()
            data = res.json()
            return data["choices"][0]["message"]["content"].strip()
        except Exception:
            return f"{prompt}, professional {style_preset} graphic with clean geometry"

