from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import CanvasProject, CanvasElement
from .serializers import CanvasProjectSerializer, CanvasElementSerializer

class ProjectListCreateView(APIView):
    def get(self, request):
        projects = CanvasProject.objects.all()
        serializer = CanvasProjectSerializer(projects, many=True)
        return Response(serializer.data)

    def post(self, request):
        title = request.data.get('title', 'Untitled Recraft Canvas')
        description = request.data.get('description', '')
        project = CanvasProject.objects.create(title=title, description=description)
        serializer = CanvasProjectSerializer(project)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class ProjectDetailView(APIView):
    def get(self, request, pk):
        try:
            project = CanvasProject.objects.get(pk=pk)
            serializer = CanvasProjectSerializer(project)
            return Response(serializer.data)
        except CanvasProject.DoesNotExist:
            return Response({'error': 'Project not found'}, status=status.HTTP_404_NOT_FOUND)

    def put(self, request, pk):
        try:
            project = CanvasProject.objects.get(pk=pk)
            project.title = request.data.get('title', project.title)
            project.description = request.data.get('description', project.description)
            project.save()
            serializer = CanvasProjectSerializer(project)
            return Response(serializer.data)
        except CanvasProject.DoesNotExist:
            return Response({'error': 'Project not found'}, status=status.HTTP_404_NOT_FOUND)

    def delete(self, request, pk):
        try:
            project = CanvasProject.objects.get(pk=pk)
            project.delete()
            return Response({'success': True, 'message': 'Project deleted'})
        except CanvasProject.DoesNotExist:
            return Response({'error': 'Project not found'}, status=status.HTTP_404_NOT_FOUND)


class ElementListCreateView(APIView):
    def get(self, request, project_id):
        elements = CanvasElement.objects.filter(project_id=project_id)
        serializer = CanvasElementSerializer(elements, many=True)
        return Response(serializer.data)

    def post(self, request, project_id):
        try:
            project = CanvasProject.objects.get(pk=project_id)
        except CanvasProject.DoesNotExist:
            return Response({'error': 'Project not found'}, status=status.HTTP_404_NOT_FOUND)

        data = request.data.copy()
        data['project'] = project.id
        serializer = CanvasElementSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ElementDetailView(APIView):
    def put(self, request, pk):
        try:
            element = CanvasElement.objects.get(pk=pk)
            serializer = CanvasElementSerializer(element, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except CanvasElement.DoesNotExist:
            return Response({'error': 'Element not found'}, status=status.HTTP_404_NOT_FOUND)

    def delete(self, request, pk):
        try:
            element = CanvasElement.objects.get(pk=pk)
            element.delete()
            return Response({'success': True, 'message': 'Element removed from canvas'})
        except CanvasElement.DoesNotExist:
            return Response({'error': 'Element not found'}, status=status.HTTP_404_NOT_FOUND)
