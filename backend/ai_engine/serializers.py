from rest_framework import serializers
from .models import GenerationJob

class GenerationJobSerializer(serializers.ModelSerializer):
    class Meta:
        model = GenerationJob
        fields = [
            'id', 'prompt', 'negative_prompt', 'style_preset',
            'aspect_ratio', 'palette_colors', 'status',
            'image_url', 'svg_data', 'content_hash',
            'prompt_hash', 'oracle_signature', 'model_version',
            'error_message', 'created_at', 'completed_at'
        ]
        read_only_fields = [
            'id', 'status', 'image_url', 'svg_data',
            'content_hash', 'prompt_hash', 'oracle_signature',
            'model_version', 'error_message', 'created_at', 'completed_at'
        ]
