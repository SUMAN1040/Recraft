import os
import re
import requests
from typing import Dict, Any, Optional
from .base import BaseAIProvider

class AnthropicProvider(BaseAIProvider):
    """
    Anthropic Provider (Claude 3.5 Sonnet & Claude 3 Opus):
    - Synthesizes raw SVG vector code directly using Claude 3.5 Sonnet
    - Refines design prompts with architectural precision
    """

    def __init__(self, api_key: Optional[str] = None):
        key = api_key or os.environ.get("ANTHROPIC_API_KEY", "")
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
            raise ValueError("ANTHROPIC_API_KEY is not configured.")

        # Instruct Claude to code a full, clean SVG vector asset
        palette_info = f"Use these exact palette colors: {', '.join(palette_colors)}." if palette_colors else ""
        system_prompt = (
            "You are an elite vector artist and SVG engineer for Recraft AI. "
            "Output ONLY valid, standalone SVG code (starting with <svg> and ending with </svg>). "
            "Do not include any markdown backticks, explanations, or prose. "
            "Use clean geometric paths, gradients, and cohesive styling."
        )

        user_content = (
            f"Generate an SVG asset for: '{prompt}'. "
            f"Style: {style_preset}. Viewbox: 0 0 800 800. {palette_info}"
        )

        headers = {
            "x-api-key": self.api_key,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
        }

        payload = {
            "model": "claude-3-5-sonnet-20241022",
            "max_tokens": 4096,
            "temperature": 0.3,
            "system": system_prompt,
            "messages": [{"role": "user", "content": user_content}],
        }

        response = requests.post("https://api.anthropic.com/v1/messages", headers=headers, json=payload, timeout=60)
        response.raise_for_status()
        data = response.json()

        raw_text = data["content"][0]["text"].strip()
        
        # Extract SVG if enclosed in markdown blocks
        svg_match = re.search(r"<svg[\s\S]*?</svg>", raw_text)
        svg_code = svg_match.group(0) if svg_match else raw_text

        # Compute hash
        import hashlib
        content_hash = "0x" + hashlib.sha256(svg_code.encode()).hexdigest()
        prompt_hash = "0x" + hashlib.sha256(prompt.encode()).hexdigest()

        return {
            "svg_content": svg_code,
            "image_url": "",
            "content_hash": content_hash,
            "prompt_hash": prompt_hash,
            "model_version": "claude-3-5-sonnet-20241022",
            "provider": "Anthropic Claude 3.5 Sonnet",
        }

    def enhance_prompt(
        self,
        prompt: str,
        style_preset: str = "vector_art",
        target_engine: str = "vector"
    ) -> str:
        if not self.api_key:
            return f"{prompt}, styled by Claude 3.5 in {style_preset} vector curves"

        headers = {
            "x-api-key": self.api_key,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
        }
        payload = {
            "model": "claude-3-5-haiku-20241022",
            "max_tokens": 200,
            "temperature": 0.5,
            "messages": [
                {
                    "role": "user",
                    "content": f"Enhance this design prompt for a {style_preset} graphic: '{prompt}'. Return only the final enhanced prompt without quotes."
                }
            ],
        }

        try:
            res = requests.post("https://api.anthropic.com/v1/messages", headers=headers, json=payload, timeout=20)
            res.raise_for_status()
            data = res.json()
            return data["content"][0]["text"].strip()
        except Exception:
            return f"{prompt}, vector precision curves, {style_preset}"

