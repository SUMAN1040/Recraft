from django.urls import path
from .views import (
    ProjectListCreateView,
    ProjectDetailView,
    ElementListCreateView,
    ElementDetailView
)

urlpatterns = [
    path('projects/', ProjectListCreateView.as_view(), name='project-list-create'),
    path('projects/<uuid:pk>/', ProjectDetailView.as_view(), name='project-detail'),
    path('projects/<uuid:project_id>/elements/', ElementListCreateView.as_view(), name='element-list-create'),
    path('elements/<uuid:pk>/', ElementDetailView.as_view(), name='element-detail'),
]
