from django.test import TestCase
from rest_framework.test import APIClient
from ai_engine.models import GenerationJob
from security_provenance.models import ProvenanceCertificate

class RecraftBackendSmokeTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_get_styles(self):
        response = self.client.get('/api/ai/styles/')
        self.assertEqual(response.status_code, 200)
        self.assertIn('styles', response.data)
        self.assertTrue(len(response.data['styles']) >= 5)

    def test_generate_vector_artwork(self):
        payload = {
            'prompt': 'cyberpunk robot cat in sleek vector style',
            'style_preset': 'vector_art',
            'aspect_ratio': '1:1',
            'palette_colors': ['#FF5C00', '#1A1A24', '#00E5FF']
        }
        response = self.client.post('/api/ai/generate/', payload, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertIn('svg_data', response.data)
        self.assertIn('content_hash', response.data)
        self.assertTrue(response.data['content_hash'].startswith('0x'))

    def test_verify_unregistered_artwork(self):
        response = self.client.post('/api/security/verify/', {'hash': '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'}, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertFalse(response.data['is_authentic'])
