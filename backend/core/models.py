import uuid
from django.db import models

class CanvasProject(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255, default="Untitled Recraft Board")
    description = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        return f"{self.title} ({self.id})"


class CanvasElement(models.Model):
    ELEMENT_TYPES = [
        ('image', 'Image'),
        ('vector', 'Vector SVG'),
        ('frame', 'Frame Artboard'),
        ('text', 'Text Element'),
        ('icon', 'Icon'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey(CanvasProject, related_name='elements', on_delete=models.CASCADE)
    element_type = models.CharField(max_length=32, choices=ELEMENT_TYPES, default='image')
    x = models.FloatField(default=100.0)
    y = models.FloatField(default=100.0)
    width = models.FloatField(default=350.0)
    height = models.FloatField(default=350.0)
    rotation = models.FloatField(default=0.0)
    z_index = models.IntegerField(default=1)
    
    asset_url = models.TextField(blank=True, default="")
    vector_svg_data = models.TextField(blank=True, default="")
    prompt = models.TextField(blank=True, default="")
    style_preset = models.CharField(max_length=64, default="vector_art")
    image_hash = models.CharField(max_length=66, blank=True, default="")
    is_verified_on_chain = models.BooleanField(default=False)
    
    metadata_json = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['z_index', 'created_at']

    def __str__(self):
        return f"{self.element_type} - {self.prompt[:30]} ({self.id})"
