from rest_framework import serializers
from projects.models import Project
from projects.serializers import ProjectSerializer
from users.models import User
from users.serializers import UserSerializer
from .models import Task


class TaskSerializer(serializers.ModelSerializer):
    project_detail = serializers.SerializerMethodField()
    created_by_detail = UserSerializer(source='created_by', read_only=True)
    assigned_to_detail = UserSerializer(source='assigned_to', read_only=True)
    comments_count = serializers.IntegerField(source='comments.count', read_only=True)

    class Meta:
        model = Task
        fields = [
            'id',
            'title',
            'description',
            'project',
            'project_detail',
            'created_by',
            'created_by_detail',
            'assigned_to',
            'assigned_to_detail',
            'priority',
            'status',
            'due_date',
            'progress',
            'comments_count',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']

    def get_project_detail(self, obj):
        return {
            'id': obj.project.id,
            'name': obj.project.name,
            'status': obj.project.status,
        }

    def validate_title(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Task title is required.")
        return value.strip()

    def validate_progress(self, value):
        if value < 0 or value > 100:
            raise serializers.ValidationError("Progress must be between 0 and 100.")
        return value

    def validate(self, attrs):
        request = self.context.get('request')
        user = request.user if request else None

        # Check permission constraints on Employee role during updates
        if self.instance and user and user.role == User.ROLE_EMPLOYEE and not user.is_superuser:
            # Employee cannot update title, project, created_by, assigned_to, or priority
            disallowed_fields = ['title', 'project', 'assigned_to', 'priority', 'due_date']
            for field in disallowed_fields:
                if field in attrs and attrs[field] != getattr(self.instance, field):
                    raise serializers.ValidationError({
                        field: "Employees are only permitted to update task status and progress."
                    })

        # Business rule: If status is Completed, progress is set to 100
        status_val = attrs.get('status', self.instance.status if self.instance else None)
        if status_val == Task.STATUS_COMPLETED:
            attrs['progress'] = 100

        return attrs
