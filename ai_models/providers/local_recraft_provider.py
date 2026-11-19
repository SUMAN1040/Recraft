import os
import sys
from pathlib import Path
from typing import Dict, Any, Optional
from .base import BaseAIProvider

# Import existing Recraft AI Generator
sys.path.append(str(Path(__file__).resolve().parent.parent.parent / "backend"))
from ai_engine.generator import RecraftAIGenerator

class LocalRecraftProvider(BaseAIProvider):
    """
    Built-in Recraft Algorithmic Vector Engine:
    Outputs pure, scalable SVG vector code and renders sharp raster previews.
    Completely offline, zero API fees, instant response.
    """

    def __init__(self, api_key: Optional[str] = None):
        super().__init__(api_key=None)

    def generate_image(
        self,
        prompt: str,
        style_preset: str = "vector_art",
        aspect_ratio: str = "1:1",
        palette_colors: Optional[list] = None,
        **kwargs
    ) -> Dict[str, Any]:
        result = RecraftAIGenerator.generate(
            prompt=prompt,
            style_preset=style_preset,
            aspect_ratio=aspect_ratio,
            palette_colors=palette_colors
        )
        result["provider"] = "Recraft Local Vector Engine"
        return result

    def enhance_prompt(
        self,
        prompt: str,
        style_preset: str = "vector_art",
        target_engine: str = "vector"
    ) -> str:
        tokens = {
            "vector_art": "clean geometric curves, layered flat vector, crisp outlines, SVG pathing, minimal anchor points",
            "3d_render": "isometric raytraced perspective, soft ambient occlusion, glossy reflections, 3D render",
            "digital_illustration": "rich color gradients, concept art detail, smooth shading, high contrast",
            "icon_set": "minimalist uniform line weight, app icon glyph, clean vector silhouette, pixel-perfect",
            "line_art": "fine single-stroke linework, black and white minimalist ink, elegant curve contours",
        }
        suffix = tokens.get(style_preset, "clean vector graphic")
        return f"{prompt.strip()}, {suffix}"

