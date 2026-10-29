from rest_framework import serializers
from users.serializers import UserSerializer
from .models import Comment


class CommentSerializer(serializers.ModelSerializer):
    user_detail = UserSerializer(source='user', read_only=True)

    class Meta:
        model = Comment
        fields = [
            'id',
            'task',
            'user',
            'user_detail',
            'comment',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'task', 'user', 'created_at', 'updated_at']
