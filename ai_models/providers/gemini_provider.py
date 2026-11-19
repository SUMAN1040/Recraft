import os
import requests
from typing import Dict, Any, Optional
from .base import BaseAIProvider

class GeminiProvider(BaseAIProvider):
    """
    Google Gemini Provider:
    - Text / Multimodal: Gemini 1.5 Pro / Flash
    - Image Generation: Imagen 3 API
    """

    def __init__(self, api_key: Optional[str] = None):
        key = api_key or os.environ.get("GEMINI_API_KEY", "")
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
            raise ValueError("GEMINI_API_KEY is not configured.")

        # Using Google Vertex / Gemini Imagen 3 endpoint format
        url = f"https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key={self.api_key}"
        palette_note = f" Palette: {', '.join(palette_colors)}." if palette_colors else ""
        refined_prompt = f"{prompt}, {style_preset.replace('_', ' ')} style, high dynamic range, clean composition.{palette_note}"

        payload = {
            "instances": [{"prompt": refined_prompt}],
            "parameters": {
                "sampleCount": 1,
                "aspectRatio": aspect_ratio.replace(":", ""),
                "outputMimeType": "image/png"
            }
        }

        response = requests.post(url, json=payload, timeout=45)
        response.raise_for_status()
        data = response.json()

        # Imagen 3 returns base64 image bytes
        predictions = data.get("predictions", [])
        image_b64 = predictions[0].get("bytesBase64Encoded", "") if predictions else ""
        data_url = f"data:image/png;base64,{image_b64}"

        import hashlib
        content_hash = "0x" + hashlib.sha256(image_b64.encode()).hexdigest()
        prompt_hash = "0x" + hashlib.sha256(prompt.encode()).hexdigest()

        return {
            "svg_content": None,
            "image_url": data_url,
            "content_hash": content_hash,
            "prompt_hash": prompt_hash,
            "model_version": "imagen-3.0-generate-002",
            "provider": "Google Imagen 3",
        }

    def enhance_prompt(
        self,
        prompt: str,
        style_preset: str = "vector_art",
        target_engine: str = "vector"
    ) -> str:
        if not self.api_key:
            return f"{prompt}, enhanced with Google Gemini {style_preset} details"

        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={self.api_key}"
        payload = {
            "contents": [
                {
                    "parts": [
                        {
                            "text": f"You are an AI graphic design prompt specialist. Expand this concept into a vivid, descriptive prompt for a {style_preset} graphic: '{prompt}'. Return only the expanded prompt."
                        }
                    ]
                }
            ],
            "generationConfig": {"temperature": 0.6, "maxOutputTokens": 150}
        }

        try:
            res = requests.post(url, json=payload, timeout=20)
            res.raise_for_status()
            data = res.json()
            return data["candidates"][0]["content"]["parts"][0]["text"].strip()
        except Exception:
            return f"{prompt}, geometric clarity, vibrant {style_preset} artwork"

