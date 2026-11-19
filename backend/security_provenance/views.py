import json
import os
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.conf import settings
from Crypto.Hash import keccak
from .models import ProvenanceCertificate, SecurityAuditLog
from ai_engine.generator import keccak256, eth_sign_hash

def get_contract_config():
    """Loads contract address and ABI generated during deployment."""
    abi_path = os.path.join(
        settings.BASE_DIR,
        'security_provenance/contract_abi/RecraftSecurityProvenance.json'
    )
    if os.path.exists(abi_path):
        with open(abi_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {
        'address': '0x5FbDB2315678afecb367f032d93F642f64180aa3',
        'network': 'localhost',
        'oracleSigner': settings.ORACLE_PUBLIC_ADDRESS,
        'abi': []
    }

class OracleSignatureView(APIView):
    """
    POST /api/security/oracle-signature/
    Generates a cryptographically valid oracle signature for user address to mint on-chain.
    """
    def post(self, request):
        user_address = request.data.get('user_address', '').strip()
        image_hash = request.data.get('image_hash', '').strip()
        prompt_hash = request.data.get('prompt_hash', '').strip()
        style_preset = request.data.get('style_preset', 'vector_art')
        model_version = request.data.get('model_version', 'recraft-v3-vector')
        nonce = int(request.data.get('nonce', 0))

        if not user_address or not image_hash or not prompt_hash:
            return Response(
                {'error': 'user_address, image_hash, and prompt_hash are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Build Solidity packed message hash:
        # keccak256(abi.encodePacked(to, imageHash, promptHash, stylePreset, modelVersion, nonce))
        from Crypto.Hash import keccak
        clean_user = bytes.fromhex(user_address[2:] if user_address.startswith('0x') else user_address)
        clean_img = bytes.fromhex(image_hash[2:] if image_hash.startswith('0x') else image_hash)
        clean_prompt = bytes.fromhex(prompt_hash[2:] if prompt_hash.startswith('0x') else prompt_hash)
        style_bytes = style_preset.encode('utf-8')
        model_bytes = model_version.encode('utf-8')
        nonce_bytes = nonce.to_bytes(32, byteorder='big')

        packed_payload = clean_user + clean_img + clean_prompt + style_bytes + model_bytes + nonce_bytes
        k = keccak.new(digest_bits=256)
        k.update(packed_payload)
        message_hash = "0x" + k.hexdigest()

        # Generate Oracle signature
        oracle_sig = eth_sign_hash(message_hash, settings.ORACLE_PRIVATE_KEY)

        contract_config = get_contract_config()

        return Response({
            'success': True,
            'message_hash': message_hash,
            'oracle_signature': oracle_sig,
            'oracle_address': settings.ORACLE_PUBLIC_ADDRESS,
            'contract_address': contract_config.get('address'),
            'user_address': user_address,
            'image_hash': image_hash,
            'prompt_hash': prompt_hash,
            'style_preset': style_preset,
            'model_version': model_version,
            'nonce': nonce,
        })


class VerifyArtworkView(APIView):
    """
    POST /api/security/verify/
    Verifies artwork authenticity, checks tamper-proofing, and validates copyright provenance.
    """
    def post(self, request):
        content_hash = request.data.get('hash', '').strip()
        raw_svg = request.data.get('svg', '').strip()
        
        # Or calculate hash if file uploaded
        if 'file' in request.FILES:
            uploaded_bytes = request.FILES['file'].read()
            content_hash = keccak256(uploaded_bytes)
        elif raw_svg:
            content_hash = keccak256(raw_svg.encode('utf-8'))

        if not content_hash:
            return Response({'error': 'Hash, raw SVG, or file must be provided'}, status=status.HTTP_400_BAD_REQUEST)

        # Normalize hash
        if not content_hash.startswith('0x'):
            content_hash = '0x' + content_hash

        # Query Certificate DB
        cert = ProvenanceCertificate.objects.filter(content_hash__iexact=content_hash).first()
        contract_config = get_contract_config()

        is_authentic = cert is not None
        
        # Log security audit check
        SecurityAuditLog.objects.create(
            checked_hash=content_hash,
            is_authentic=is_authentic,
            matched_certificate=cert,
            ip_address=request.META.get('REMOTE_ADDR', ''),
            user_agent=request.META.get('HTTP_USER_AGENT', '')
        )

        if is_authentic:
            return Response({
                'is_authentic': True,
                'status': 'VERIFIED_GENUINE',
                'badge': 'Verified Authentic Recraft Creation',
                'hash': cert.content_hash,
                'creator_address': cert.creator_address,
                'style_preset': cert.style_preset,
                'model_version': cert.model_version,
                'token_id': cert.token_id,
                'is_verified_on_chain': cert.is_verified_on_chain,
                'contract_address': contract_config.get('address'),
                'created_at': cert.created_at,
            })
        else:
            return Response({
                'is_authentic': False,
                'status': 'UNVERIFIED_OR_TAMPERED',
                'badge': 'Warning: Hash Not Registered or Content Tampered',
                'hash': content_hash,
                'message': 'This asset does not match any genuine Recraft cryptographic provenance signatures in the registry.'
            }, status=status.HTTP_200_OK)


class RecordMintView(APIView):
    """
    POST /api/security/record-mint/
    Records on-chain mint details after transaction completes.
    """
    def post(self, request):
        content_hash = request.data.get('content_hash', '')
        prompt_hash = request.data.get('prompt_hash', '')
        creator_address = request.data.get('creator_address', '')
        style_preset = request.data.get('style_preset', 'vector_art')
        token_id = request.data.get('token_id', None)
        tx_hash = request.data.get('transaction_hash', '')
        oracle_signature = request.data.get('oracle_signature', '')

        if not content_hash or not creator_address:
            return Response({'error': 'content_hash and creator_address are required'}, status=status.HTTP_400_BAD_REQUEST)

        cert, created = ProvenanceCertificate.objects.update_or_create(
            content_hash=content_hash,
            defaults={
                'prompt_hash': prompt_hash,
                'creator_address': creator_address,
                'style_preset': style_preset,
                'token_id': token_id,
                'transaction_hash': tx_hash,
                'oracle_signature': oracle_signature,
                'is_verified_on_chain': True,
            }
        )

        return Response({
            'success': True,
            'certificate_id': str(cert.id),
            'content_hash': cert.content_hash,
            'token_id': cert.token_id,
        })


class ContractInfoView(APIView):
    """
    GET /api/security/contract/
    Returns contract address, network, and ABI.
    """
    def get(self, request):
        config = get_contract_config()
        return Response(config)
