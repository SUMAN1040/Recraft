import uuid
from django.db import models

class ProvenanceCertificate(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    content_hash = models.CharField(max_length=66, unique=True, db_index=True) # 0x...
    prompt_hash = models.CharField(max_length=66)
    creator_address = models.CharField(max_length=42) # Ethereum wallet address
    style_preset = models.CharField(max_length=64)
    model_version = models.CharField(max_length=64, default="recraft-v3-vector")
    token_id = models.IntegerField(null=True, blank=True)
    transaction_hash = models.CharField(max_length=66, blank=True, default="")
    oracle_signature = models.TextField()
    is_verified_on_chain = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Certificate for {self.content_hash[:10]}... (Token #{self.token_id})"


class SecurityAuditLog(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    checked_hash = models.CharField(max_length=66)
    is_authentic = models.BooleanField()
    matched_certificate = models.ForeignKey(
        ProvenanceCertificate,
        null=True,
        blank=True,
        on_delete=models.SET_NULL
    )
    ip_address = models.CharField(max_length=45, blank=True, default="")
    user_agent = models.TextField(blank=True, default="")
    checked_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        status = "AUTHENTIC" if self.is_authentic else "SUSPICIOUS / UNVERIFIED"
        return f"{status} check on {self.checked_hash[:10]} at {self.checked_at}"
