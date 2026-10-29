from rest_framework import serializers
from users.serializers import UserSerializer
from .models import Project


class ProjectSerializer(serializers.ModelSerializer):
    created_by_detail = UserSerializer(source='created_by', read_only=True)
    total_tasks = serializers.IntegerField(source='total_tasks_count', read_only=True)
    completed_tasks = serializers.IntegerField(source='completed_tasks_count', read_only=True)
    progress_percentage = serializers.IntegerField(read_only=True)

    class Meta:
        model = Project
        fields = [
            'id',
            'name',
            'description',
            'created_by',
            'created_by_detail',
            'start_date',
            'end_date',
            'status',
            'total_tasks',
            'completed_tasks',
            'progress_percentage',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']

    def validate(self, attrs):
        start_date = attrs.get('start_date') or (self.instance.start_date if self.instance else None)
        end_date = attrs.get('end_date') or (self.instance.end_date if self.instance else None)

        if start_date and end_date and end_date < start_date:
            raise serializers.ValidationError({"end_date": "End date cannot be earlier than start date."})

        return attrs
