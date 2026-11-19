# 🤖 AI Models Management & Gateway (`ai_models/`)

A centralized, multi-provider AI model orchestration gateway built for the Recraft platform.
It lets you switch, configure, route, and fallback across **Anthropic Claude**, **Google Gemini**, **OpenAI ChatGPT/DALL-E**, **Stability AI**, **Replicate (Flux)**, and the **Local Recraft Vector Engine**.

---

## 📁 Directory Structure

```
ai_models/
├── config.json                     # Active model selection, API key references, fallback chain
├── manager.py                      # Central AIModelManager router & fallback dispatcher
├── registry.py                     # Catalog of models, specs, capabilities, tokens & pricing
├── test_providers.py               # Automated test script verifying routing & fallbacks
├── README.md                       # Documentation & configuration guide
└── providers/
    ├── __init__.py                 # Exported provider registry
    ├── base.py                     # Abstract Base Provider interface
    ├── local_recraft_provider.py   # Native Recraft Vector Engine (Offline SVG synthesis)
    ├── anthropic_provider.py       # Claude 3.5 Sonnet (Direct SVG coding & design prompt critique)
    ├── gemini_provider.py          # Google Gemini 1.5 Pro & Imagen 3 (High-res image generation)
    ├── openai_provider.py          # OpenAI DALL-E 3 (Image synthesis) & GPT-4o (Prompt expander)
    ├── stability_provider.py       # Stability AI (Stable Diffusion 3 & SDXL)
    └── replicate_provider.py       # Replicate (Black Forest Labs Flux.1 Schnell)
```

---

## 🚀 Supported AI Model Providers

| Provider | Model Identifier | Type | Output | Key Capability |
|---|---|---|---|---|
| **Recraft Local** | `recraft-v3-vector` | Vector Engine | Pure `.svg` / `.png` | Infinite resolution, zero API costs, offline |
| **Anthropic** | `claude-3-5-sonnet-20241022` | Code & Vector | Raw SVG / Prompt | Generates clean, editable SVG code directly |
| **Anthropic** | `claude-3-5-haiku-20241022` | Fast LLM | Text | Sub-second design prompt optimization |
| **Google** | `imagen-3.0-generate-002` | Image Gen | PNG | High fidelity photorealism & text rendering |
| **Google** | `gemini-1.5-pro` | Multimodal LLM | Multimodal / SVG | Brand guidelines analysis & style extraction |
| **OpenAI** | `dall-e-3` | Image Gen | PNG | Detailed 3D renders & digital illustrations |
| **OpenAI** | `gpt-4o` | Multimodal LLM | Text / JSON | Creative prompt ideation & color palette advice |
| **Stability AI**| `stable-diffusion-v3-medium` | Diffusion | PNG | Fast artistic textures & graphic design |
| **Replicate** | `black-forest-labs/flux-schnell` | Diffusion | WebP / PNG | Sub-second generative inference |

---

## ⚙️ Configuration & Environment Variables

Add your API keys to `.env` or export them in your shell:

```bash
# Optional: Set keys for providers you want to use
export ANTHROPIC_API_KEY="sk-ant-api03-..."
export GEMINI_API_KEY="AIzaSy..."
export OPENAI_API_KEY="sk-proj-..."
export STABILITY_API_KEY="sk-..."
export REPLICATE_API_TOKEN="r8_..."
```

> **Note**: Even if you do not set any external API keys, the system **never crashes**. It automatically routes to `recraft_local` (the built-in offline SVG vector engine).

---

## 🔄 Dynamic Model Switching via REST API

The Django backend exposes endpoints to manage models from the UI:

### 1. List Available Models & Status
```http
GET /api/ai/models/
```
**Response:**
```json
{
  "active_image_provider": "recraft_local",
  "active_llm_provider": "claude",
  "providers": [
    {
      "id": "claude",
      "name": "Anthropic Claude",
      "has_api_key": true,
      "is_active_llm": true
    },
    {
      "id": "gemini",
      "name": "Google Gemini & Imagen",
      "has_api_key": true,
      "is_active_image": false
    }
  ]
}
```

### 2. Switch Active Provider
```http
POST /api/ai/models/
Content-Type: application/json

{
  "active_image_provider": "gemini",
  "active_llm_provider": "claude"
}
```

### 3. Generate Artwork With a Specific Model
In `/api/ai/generate/`, pass `"provider"` in the JSON body:
```json
{
  "prompt": "cyberpunk robot cat in vector style",
  "style_preset": "vector_art",
  "provider": "claude"
}
```
*(Options: `recraft_local`, `claude`, `gemini`, `openai`, `stability`, `replicate`)*

### 4. Enhance a Prompt with an LLM
```http
POST /api/ai/enhance-prompt/
Content-Type: application/json

{
  "prompt": "neon fox badge",
  "style_preset": "icon_set",
  "llm": "claude"
}
```

---

## 🛡️ Automatic Fallback Chain

Configured in [`ai_models/config.json`](file:///home/InnoX107/Documents/Recraft/ai_models/config.json):
```json
"fallback_chain": ["recraft_local", "gemini", "openai", "stability", "replicate"]
```
If a user selects `openai` but the `OPENAI_API_KEY` is not present or OpenAI experiences an outage, `AIModelManager` automatically catches the error and falls back to the next working provider in the chain without interrupting the user's design session.

---

## 🧪 Testing the AI Gateway

Run the automated test runner:
```bash
python ai_models/test_providers.py
```
Outputs provider discovery, prompt enhancement, multi-model routing, and simulated fallback validation.

