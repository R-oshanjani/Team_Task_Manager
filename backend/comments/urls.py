from django.urls import path
from .views import CommentDetailView, TaskCommentsListCreateView

urlpatterns = [
    path('tasks/<int:task_id>/comments/', TaskCommentsListCreateView.as_view(), name='task_comments_list_create'),
    path('comments/<int:pk>/', CommentDetailView.as_view(), name='comment_detail'),
]
