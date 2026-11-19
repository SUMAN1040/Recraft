import sys
from pathlib import Path
from datetime import datetime
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.conf import settings
from .models import GenerationJob
from .serializers import GenerationJobSerializer
from .generator import RecraftAIGenerator, eth_sign_hash, STYLE_PALETTES

# Connect unified AI Models Gateway
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.append(str(PROJECT_ROOT))
from ai_models.manager import ai_manager

class GenerateArtworkView(APIView):
    """
    POST /api/ai/generate/
    Initiates AI design synthesis in requested style (vector_art, 3d_render, etc.)
    Routes to selected AI provider (Recraft Local, Claude, Gemini, OpenAI, etc.)
    with custom palette and cryptographic provenance signature.
    """
    def post(self, request):
        prompt = request.data.get('prompt', '').strip()
        if not prompt:
            return Response({'error': 'Prompt is required'}, status=status.HTTP_400_BAD_REQUEST)

        style_preset = request.data.get('style_preset', 'vector_art')
        aspect_ratio = request.data.get('aspect_ratio', '1:1')
        palette_colors = request.data.get('palette_colors', None)
        negative_prompt = request.data.get('negative_prompt', '')
        provider = request.data.get('provider', None)

        # Create record
        job = GenerationJob.objects.create(
            prompt=prompt,
            negative_prompt=negative_prompt,
            style_preset=style_preset,
            aspect_ratio=aspect_ratio,
            palette_colors=palette_colors or STYLE_PALETTES.get(style_preset, []),
            status='generating'
        )

        try:
            # Route request through AI Model Manager
            result = ai_manager.generate_artwork(
                prompt=prompt,
                style_preset=style_preset,
                aspect_ratio=aspect_ratio,
                palette_colors=palette_colors,
                preferred_provider=provider
            )

            # Generate Oracle cryptographic signature for Web3 provenance
            oracle_sig = eth_sign_hash(result['content_hash'], settings.ORACLE_PRIVATE_KEY)

            job.status = 'completed'
            job.image_url = result.get('image_url', '')
            job.svg_data = result.get('svg_content', '')
            job.content_hash = result['content_hash']
            job.prompt_hash = result['prompt_hash']
            job.oracle_signature = oracle_sig
            job.model_version = result.get('model_version', 'recraft-v3-vector')
            job.completed_at = datetime.now()
            job.save()

            serializer = GenerationJobSerializer(job)
            res_data = serializer.data
            res_data['routed_provider'] = result.get('routed_provider', 'recraft_local')
            return Response(res_data, status=status.HTTP_201_CREATED)

        except Exception as e:
            job.status = 'failed'
            job.error_message = str(e)
            job.save()
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class JobDetailView(APIView):
    def get(self, request, pk):
        try:
            job = GenerationJob.objects.get(pk=pk)
            serializer = GenerationJobSerializer(job)
            return Response(serializer.data)
        except GenerationJob.DoesNotExist:
            return Response({'error': 'Job not found'}, status=status.HTTP_404_NOT_FOUND)


class VectorizeImageView(APIView):
    def post(self, request):
        if 'image' in request.FILES:
            image_file = request.FILES['image']
            image_bytes = image_file.read()
        else:
            return Response({'error': 'No image file uploaded'}, status=status.HTTP_400_BAD_REQUEST)

        num_colors = int(request.data.get('colors', 6))
        try:
            svg_code = RecraftAIGenerator.vectorize_image(image_bytes, num_colors=num_colors)
            return Response({
                'success': True,
                'svg_code': svg_code,
                'colors': num_colors,
                'message': 'Image successfully vectorized into clean SVG paths'
            })
        except Exception as e:
            return Response({'error': f"Vectorization failed: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class StylesListView(APIView):
    def get(self, request):
        styles = [
            {
                'id': 'vector_art',
                'name': 'Vector Art',
                'description': 'Clean scalable geometry, layered SVG paths, infinite resolution',
                'palette': STYLE_PALETTES['vector_art'],
                'tag': 'Best for logos, illustrations & UI'
            },
            {
                'id': 'digital_illustration',
                'name': 'Digital Illustration',
                'description': 'Rich gradients, expressive dynamic lighting and fine details',
                'palette': STYLE_PALETTES['digital_illustration'],
                'tag': 'Editorial & Concept Art'
            },
            {
                'id': '3d_render',
                'name': '3D Render',
                'description': 'Isometric perspective, raytraced highlights, soft ambient occlusion',
                'palette': STYLE_PALETTES['3d_render'],
                'tag': 'Modern Web3 & SaaS'
            },
            {
                'id': 'realistic_image',
                'name': 'Photorealism',
                'description': 'High dynamic range, organic depth of field and photorealistic textures',
                'palette': STYLE_PALETTES['realistic_image'],
                'tag': 'Product & Stock Photo'
            },
            {
                'id': 'icon_set',
                'name': 'App & Web Icon Set',
                'description': 'Pixel-perfect harmonious icon glyphs with uniform line weights',
                'palette': STYLE_PALETTES['icon_set'],
                'tag': 'Design Systems'
            },
            {
                'id': 'pixel_art',
                'name': 'Pixel Art 2.0',
                'description': 'Crisp retro gaming aesthetic with modern palette lighting',
                'palette': STYLE_PALETTES['pixel_art'],
                'tag': 'Retro & Games'
            },
            {
                'id': 'line_art',
                'name': 'Minimalist Line Art',
                'description': 'Single-stroke aesthetic, black-and-white elegance',
                'palette': STYLE_PALETTES['line_art'],
                'tag': 'Minimalist & Print'
            },
        ]
        return Response({
            'styles': styles,
            'aspect_ratios': ['1:1', '16:9', '9:16', '4:3', '3:2'],
        })


class ModelManagementView(APIView):
    """
    GET /api/ai/models/ -> Lists Claude, Gemini, ChatGPT/OpenAI, Stability, Replicate, Recraft
    POST /api/ai/models/ -> Updates active model or switches provider
    """
    def get(self, request):
        models = ai_manager.list_all_models()
        return Response({
            "active_image_provider": ai_manager.config.get("active_image_provider"),
            "active_llm_provider": ai_manager.config.get("active_llm_provider"),
            "providers": models
        })

    def post(self, request):
        image_provider = request.data.get("active_image_provider")
        llm_provider = request.data.get("active_llm_provider")
        ai_manager.set_active_provider(image_provider=image_provider, llm_provider=llm_provider)
        return Response({
            "success": True,
            "active_image_provider": ai_manager.config.get("active_image_provider"),
            "active_llm_provider": ai_manager.config.get("active_llm_provider")
        })


class EnhancePromptView(APIView):
    """
    POST /api/ai/enhance-prompt/ -> Uses Claude / Gemini / ChatGPT to expand design prompts
    """
    def post(self, request):
        prompt = request.data.get("prompt", "")
        style_preset = request.data.get("style_preset", "vector_art")
        preferred_llm = request.data.get("llm", None)
        enhanced = ai_manager.enhance_prompt(prompt, style_preset=style_preset, preferred_llm=preferred_llm)
        return Response({"original": prompt, "enhanced": enhanced})
