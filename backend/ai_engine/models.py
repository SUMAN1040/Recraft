import uuid
from django.db import models

class GenerationJob(models.Model):
    STYLE_CHOICES = [
        ('vector_art', 'Vector Art (Clean SVG)'),
        ('digital_illustration', 'Digital Illustration'),
        ('3d_render', '3D Render'),
        ('realistic_image', 'Photorealistic Image'),
        ('icon_set', 'App & Web Icon Set'),
        ('pixel_art', 'Pixel Art 2.0'),
        ('line_art', 'Minimalist Line Art'),
    ]

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('generating', 'Generating'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    prompt = models.TextField()
    negative_prompt = models.TextField(blank=True, default="")
    style_preset = models.CharField(max_length=64, choices=STYLE_CHOICES, default='vector_art')
    aspect_ratio = models.CharField(max_length=16, default='1:1')
    palette_colors = models.JSONField(default=list, blank=True) # list of hex codes, e.g. ["#ff5c00", "#1a1a1a"]
    
    status = models.CharField(max_length=32, choices=STATUS_CHOICES, default='pending')
    image_url = models.TextField(blank=True, default="")
    svg_data = models.TextField(blank=True, default="")
    
    # Cryptographic provenance & security fields
    content_hash = models.CharField(max_length=66, blank=True, default="") # keccak256 hash (0x...)
    prompt_hash = models.CharField(max_length=66, blank=True, default="")
    oracle_signature = models.TextField(blank=True, default="") # ECDSA signature from backend oracle
    model_version = models.CharField(max_length=64, default="recraft-v3-vector")
    
    error_message = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.style_preset} - {self.prompt[:30]} ({self.status})"
