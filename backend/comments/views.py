from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status, viewsets
from rest_framework.response import Response

from tasks.models import Task
from .models import Comment
from .serializers import CommentSerializer


class IsCommentAuthorOrAdmin(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.user == request.user or request.user.role == 'ADMIN' or request.user.is_superuser


class TaskCommentsListCreateView(generics.ListCreateAPIView):
    """
    GET /api/tasks/{task_id}/comments/
    POST /api/tasks/{task_id}/comments/
    """
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        task_id = self.kwargs.get('task_id')
        return Comment.objects.filter(task_id=task_id).select_related('user').order_by('created_at')

    def perform_create(self, serializer):
        task_id = self.kwargs.get('task_id')
        task = get_object_or_404(Task, id=task_id)
        serializer.save(user=self.request.user, task=task)


class CommentDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET /api/comments/{id}/
    PUT /api/comments/{id}/
    DELETE /api/comments/{id}/
    """
    queryset = Comment.objects.select_related('user', 'task').all()
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated, IsCommentAuthorOrAdmin]
