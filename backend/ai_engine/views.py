from datetime import datetime
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.conf import settings
from .models import GenerationJob
from .serializers import GenerationJobSerializer
from .generator import RecraftAIGenerator, eth_sign_hash, STYLE_PALETTES

class GenerateArtworkView(APIView):
    """
    POST /api/ai/generate/
    Initiates AI design synthesis in requested style (vector_art, 3d_render, etc.)
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
            result = RecraftAIGenerator.generate(
                prompt=prompt,
                style_preset=style_preset,
                aspect_ratio=aspect_ratio,
                palette_colors=palette_colors
            )

            # Generate Oracle cryptographic signature for Web3 provenance
            oracle_sig = eth_sign_hash(result['content_hash'], settings.ORACLE_PRIVATE_KEY)

            job.status = 'completed'
            job.image_url = result['image_url']
            job.svg_data = result['svg_content']
            job.content_hash = result['content_hash']
            job.prompt_hash = result['prompt_hash']
            job.oracle_signature = oracle_sig
            job.completed_at = datetime.now()
            job.save()

            serializer = GenerationJobSerializer(job)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Exception as e:
            job.status = 'failed'
            job.error_message = str(e)
            job.save()
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class JobDetailView(APIView):
    """
    GET /api/ai/jobs/<id>/
    """
    def get(self, request, pk):
        try:
            job = GenerationJob.objects.get(pk=pk)
            serializer = GenerationJobSerializer(job)
            return Response(serializer.data)
        except GenerationJob.DoesNotExist:
            return Response({'error': 'Job not found'}, status=status.HTTP_404_NOT_FOUND)


class VectorizeImageView(APIView):
    """
    POST /api/ai/vectorize/
    Recraft's hallmark feature: converts raster graphics into clean SVG vector code.
    """
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
    """
    GET /api/ai/styles/
    Returns list of Recraft style presets with sample color palettes.
    """
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
