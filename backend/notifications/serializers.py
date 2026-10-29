from rest_framework import serializers
from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    task_title = serializers.CharField(source='task.title', read_only=True)

    class Meta:
        model = Notification
        fields = [
            'id',
            'user',
            'task',
            'task_title',
            'message',
            'notification_type',
            'is_read',
            'created_at'
        ]
        read_only_fields = ['id', 'user', 'created_at']
