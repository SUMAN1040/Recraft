from rest_framework import serializers
from .models import CanvasProject, CanvasElement

class CanvasElementSerializer(serializers.ModelSerializer):
    class Meta:
        model = CanvasElement
        fields = '__all__'

class CanvasProjectSerializer(serializers.ModelSerializer):
    elements = CanvasElementSerializer(many=True, read_only=True)

    class Meta:
        model = CanvasProject
        fields = ['id', 'title', 'description', 'created_at', 'updated_at', 'elements']
