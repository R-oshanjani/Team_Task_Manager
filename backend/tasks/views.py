from django.db.models import Count, Q
from django.utils import timezone
from rest_framework import filters, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from notifications.models import Notification
from projects.models import Project
from users.models import User
from users.permissions import IsAdmin, IsManager
from .filters import TaskFilter
from .models import Task
from .serializers import TaskSerializer


class IsTaskEditor(permissions.BasePermission):
    """
    Admin and Manager can edit any task.
    Employee can only edit tasks assigned to them.
    """
    def has_object_permission(self, request, view, obj):
        if request.user.role in [User.ROLE_ADMIN, User.ROLE_MANAGER] or request.user.is_superuser:
            return True
        return obj.assigned_to == request.user


class TaskViewSet(viewsets.ModelViewSet):
    """
    CRUD API for Tasks.
    List/Retrieve: Authenticated users.
    Create: Manager or Admin.
    Update: Manager, Admin, or assigned Employee.
    Delete: Admin only.
    """
    serializer_class = TaskSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = TaskFilter
    search_fields = [
        'title',
        'description',
        'project__name',
        'assigned_to__username',
        'assigned_to__first_name',
        'assigned_to__last_name',
    ]
    ordering_fields = ['due_date', 'priority', 'status', 'progress', 'created_at']

    def get_queryset(self):
        # Database optimization with select_related and prefetch_related
        qs = Task.objects.select_related(
            'project',
            'assigned_to',
            'created_by'
        ).prefetch_related('comments').order_by('-created_at')

        user = self.request.user
        # Allow query parameter "assigned_only=true" for employees or any user
        if self.request.query_params.get('assigned_only') == 'true':
            qs = qs.filter(assigned_to=user)

        return qs

    def get_permissions(self):
        if self.action == 'create':
            return [IsManager()]
        if self.action in ['update', 'partial_update']:
            return [permissions.IsAuthenticated(), IsTaskEditor()]
        if self.action == 'destroy':
            return [IsAdmin()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        task = serializer.save(created_by=self.request.user)

        # Trigger notification if assigned to another user
        if task.assigned_to and task.assigned_to != self.request.user:
            Notification.objects.create(
                user=task.assigned_to,
                task=task,
                notification_type=Notification.TYPE_TASK_ASSIGNED,
                message=f'You have been assigned to task "{task.title}" in project "{task.project.name}".'
            )

    def perform_update(self, serializer):
        prev_instance = self.get_object()
        prev_assigned_to = prev_instance.assigned_to
        prev_status = prev_instance.status

        task = serializer.save()

        # Notification for assignment change
        if task.assigned_to and task.assigned_to != prev_assigned_to and task.assigned_to != self.request.user:
            Notification.objects.create(
                user=task.assigned_to,
                task=task,
                notification_type=Notification.TYPE_TASK_ASSIGNED,
                message=f'You have been assigned to task "{task.title}" in project "{task.project.name}".'
            )

        # Notification for status change
        if task.status != prev_status:
            # If completed
            if task.status == Task.STATUS_COMPLETED:
                recipients = set(filter(None, [task.created_by, task.assigned_to]))
                for recipient in recipients:
                    if recipient != self.request.user:
                        Notification.objects.create(
                            user=recipient,
                            task=task,
                            notification_type=Notification.TYPE_TASK_COMPLETED,
                            message=f'Task "{task.title}" has been completed.'
                        )
            # If status changed to Review
            elif task.status == Task.STATUS_REVIEW:
                if task.created_by and task.created_by != self.request.user:
                    Notification.objects.create(
                        user=task.created_by,
                        task=task,
                        notification_type=Notification.TYPE_STATUS_CHANGED,
                        message=f'Your task "{task.title}" was changed to Review.'
                    )
            # Other status changes
            else:
                target = task.assigned_to if self.request.user == task.created_by else task.created_by
                if target and target != self.request.user:
                    Notification.objects.create(
                        user=target,
                        task=task,
                        notification_type=Notification.TYPE_STATUS_CHANGED,
                        message=f'Task "{task.title}" status was changed to {task.status}.'
                    )

    @action(detail=False, methods=['get'], url_path='my-tasks')
    def my_tasks(self, request):
        """Tasks assigned to current authenticated user"""
        tasks = self.get_queryset().filter(assigned_to=request.user)
        page = self.paginate_queryset(tasks)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(tasks, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='dashboard-stats')
    def dashboard_stats(self, request):
        """Aggregated task and team statistics for the Dashboard"""
        user = request.user
        today = timezone.now().date()
        all_tasks = Task.objects.all()

        total_tasks = all_tasks.count()
        pending_tasks = all_tasks.filter(status__in=[Task.STATUS_TODO, Task.STATUS_BLOCKED]).count()
        in_progress_tasks = all_tasks.filter(status=Task.STATUS_IN_PROGRESS).count()
        review_tasks = all_tasks.filter(status=Task.STATUS_REVIEW).count()
        completed_tasks = all_tasks.filter(status=Task.STATUS_COMPLETED).count()
        high_priority_tasks = all_tasks.filter(priority__in=[Task.PRIORITY_HIGH, Task.PRIORITY_CRITICAL]).count()
        overdue_tasks = all_tasks.filter(due_date__lt=today).exclude(status=Task.STATUS_COMPLETED).count()
        my_tasks_count = all_tasks.filter(assigned_to=user).count()

        # User's personal task stats
        my_tasks = all_tasks.filter(assigned_to=user)
        my_completed = my_tasks.filter(status=Task.STATUS_COMPLETED).count()
        my_in_progress = my_tasks.filter(status=Task.STATUS_IN_PROGRESS).count()
        my_pending = my_tasks.filter(status__in=[Task.STATUS_TODO, Task.STATUS_BLOCKED]).count()
        my_overdue = my_tasks.filter(due_date__lt=today).exclude(status=Task.STATUS_COMPLETED).count()

        data = {
            'total_tasks': total_tasks,
            'pending_tasks': pending_tasks,
            'in_progress_tasks': in_progress_tasks,
            'review_tasks': review_tasks,
            'completed_tasks': completed_tasks,
            'high_priority_tasks': high_priority_tasks,
            'overdue_tasks': overdue_tasks,
            'my_tasks_count': my_tasks_count,
            'my_stats': {
                'total': my_tasks_count,
                'completed': my_completed,
                'in_progress': my_in_progress,
                'pending': my_pending,
                'overdue': my_overdue,
            }
        }

        # Extra statistics for Managers & Admins
        if user.role in [User.ROLE_ADMIN, User.ROLE_MANAGER] or user.is_superuser:
            total_team_members = User.objects.filter(is_active=True).count()
            total_projects = Project.objects.count()
            active_projects = Project.objects.filter(status='Active').count()

            # Priority breakdown
            priority_breakdown = {
                'Low': all_tasks.filter(priority=Task.PRIORITY_LOW).count(),
                'Medium': all_tasks.filter(priority=Task.PRIORITY_MEDIUM).count(),
                'High': all_tasks.filter(priority=Task.PRIORITY_HIGH).count(),
                'Critical': all_tasks.filter(priority=Task.PRIORITY_CRITICAL).count(),
            }

            # Status breakdown
            status_breakdown = {
                'To Do': all_tasks.filter(status=Task.STATUS_TODO).count(),
                'In Progress': all_tasks.filter(status=Task.STATUS_IN_PROGRESS).count(),
                'Review': all_tasks.filter(status=Task.STATUS_REVIEW).count(),
                'Completed': all_tasks.filter(status=Task.STATUS_COMPLETED).count(),
                'Blocked': all_tasks.filter(status=Task.STATUS_BLOCKED).count(),
            }

            data.update({
                'total_team_members': total_team_members,
                'total_projects': total_projects,
                'active_projects': active_projects,
                'priority_breakdown': priority_breakdown,
                'status_breakdown': status_breakdown,
            })

        return Response(data, status=status.HTTP_200_OK)
