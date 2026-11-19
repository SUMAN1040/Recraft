"""
Model Registry & Capabilities Specification
Lists all supported AI model types (Claude, Gemini, ChatGPT/OpenAI, Stability, Replicate, Recraft).
"""

SUPPORTED_MODELS = {
    # 1. Recraft Native Engine
    "recraft_local": {
        "id": "recraft-v3-vector",
        "provider": "Recraft AI",
        "category": "Vector Art",
        "capabilities": ["text-to-svg", "image-to-vector", "color-palette-locking"],
        "output_format": "SVG / PNG",
        "resolution": "Infinite Vector",
        "pricing": "Free / Local",
        "recommended_for": "Logos, brand illustrations, icons, clean scalable UI",
    },

    # 2. Anthropic Claude
    "claude_3_5_sonnet": {
        "id": "claude-3-5-sonnet-20241022",
        "provider": "Anthropic",
        "category": "Code & Vector Generation",
        "capabilities": ["direct-svg-generation", "prompt-enhancement", "design-critique"],
        "output_format": "Clean Code (SVG / JSX)",
        "context_window": "200k tokens",
        "pricing": "$3.00 / MTok input, $15.00 / MTok output",
        "recommended_for": "Writing precise, editable SVG markup directly from natural language",
    },
    "claude_3_5_haiku": {
        "id": "claude-3-5-haiku-20241022",
        "provider": "Anthropic",
        "category": "Fast Prompt Expander",
        "capabilities": ["instant-prompt-optimization", "tag-generation"],
        "output_format": "Text",
        "context_window": "200k tokens",
        "pricing": "$0.80 / MTok input, $4.00 / MTok output",
        "recommended_for": "Real-time design prompt expansion & keyword autocomplete",
    },

    # 3. Google Gemini & Imagen
    "gemini_1_5_pro": {
        "id": "gemini-1.5-pro",
        "provider": "Google",
        "category": "Multimodal Design Engine",
        "capabilities": ["multimodal-vision", "prompt-engineering", "svg-generation"],
        "output_format": "Text / SVG / Image analysis",
        "context_window": "2M tokens",
        "pricing": "$1.25 / MTok input, $5.00 / MTok output",
        "recommended_for": "Large context brand book analysis & style matching",
    },
    "gemini_imagen_3": {
        "id": "imagen-3.0-generate-002",
        "provider": "Google",
        "category": "Image Generation",
        "capabilities": ["text-to-image", "photorealism", "typography-rendering"],
        "output_format": "PNG / JPEG",
        "resolution": "Up to 2048x2048",
        "pricing": "$0.03 per image",
        "recommended_for": "High-fidelity photorealism with accurate text rendering",
    },

    # 4. OpenAI ChatGPT & DALL-E
    "openai_dalle_3": {
        "id": "dall-e-3",
        "provider": "OpenAI",
        "category": "Image Generation",
        "capabilities": ["text-to-image", "complex-scenes", "style-adherence"],
        "output_format": "PNG",
        "resolution": "1024x1024 / 1792x1024",
        "pricing": "$0.040 - $0.080 per image",
        "recommended_for": "Detailed 3D renders, digital illustrations, and scenes",
    },
    "openai_gpt_4o": {
        "id": "gpt-4o",
        "provider": "OpenAI",
        "category": "Flagship LLM",
        "capabilities": ["prompt-refinement", "vision-analysis", "palette-generation"],
        "output_format": "Text / JSON",
        "context_window": "128k tokens",
        "pricing": "$2.50 / MTok input, $10.00 / MTok output",
        "recommended_for": "Creative prompt ideation, SVG generation, and color theory",
    },

    # 5. Stability AI
    "stability_sd3": {
        "id": "stable-diffusion-v3-medium",
        "provider": "Stability AI",
        "category": "Diffusion Model",
        "capabilities": ["text-to-image", "multi-subject-composition"],
        "output_format": "PNG",
        "resolution": "1024x1024",
        "pricing": "$0.035 per image",
        "recommended_for": "Realistic graphic design, posters, and textures",
    },

    # 6. Replicate (Flux)
    "replicate_flux": {
        "id": "black-forest-labs/flux-schnell",
        "provider": "Black Forest Labs / Replicate",
        "category": "Fast Diffusion",
        "capabilities": ["fast-inference", "open-weights", "sharp-textures"],
        "output_format": "WebP / PNG",
        "resolution": "1024x1024",
        "pricing": "$0.003 per run",
        "recommended_for": "Sub-second image generation for rapid prototyping",
    },
}

def get_all_models_summary():
    """Returns a simplified catalog for frontend UI dropdowns."""
    summary = []
    for key, info in SUPPORTED_MODELS.items():
        summary.append({
            "key": key,
            "id": info["id"],
            "name": f"{info['provider']} - {info['id']}",
            "provider": info["provider"],
            "category": info["category"],
            "output_format": info["output_format"],
            "recommended_for": info["recommended_for"],
        })
    return summary

