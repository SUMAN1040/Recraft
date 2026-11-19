from django.urls import path
from .views import GenerateArtworkView, JobDetailView, VectorizeImageView, StylesListView

urlpatterns = [
    path('generate/', GenerateArtworkView.as_view(), name='ai-generate'),
    path('jobs/<uuid:pk>/', JobDetailView.as_view(), name='ai-job-detail'),
    path('vectorize/', VectorizeImageView.as_view(), name='ai-vectorize'),
    path('styles/', StylesListView.as_view(), name='ai-styles'),
]
