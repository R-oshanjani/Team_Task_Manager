from rest_framework import filters, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from users.permissions import IsAdmin, IsManager
from .models import Project
from .serializers import ProjectSerializer


class ProjectViewSet(viewsets.ModelViewSet):
    """
    CRUD API for Projects.
    Read: Authenticated users.
    Create/Update: Manager or Admin.
    Delete: Admin only.
    """
    queryset = Project.objects.select_related('created_by').prefetch_related('tasks').order_by('-created_at')
    serializer_class = ProjectSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status']
    search_fields = ['name', 'description']
    ordering_fields = ['created_at', 'start_date', 'end_date', 'name', 'status']

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update']:
            return [IsManager()]
        if self.action == 'destroy':
            return [IsAdmin()]
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['get'])
    def tasks(self, request, pk=None):
        """Returns all tasks associated with this project"""
        project = self.get_object()
        from tasks.serializers import TaskSerializer
        tasks = project.tasks.select_related('project', 'assigned_to', 'created_by').order_by('-created_at')
        serializer = TaskSerializer(tasks, many=True)
        return Response(serializer.data)
