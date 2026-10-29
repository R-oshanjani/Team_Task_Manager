from datetime import timedelta
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase
from comments.models import Comment
from projects.models import Project
from tasks.models import Task
from users.models import User


class CommentAPITests(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_user(
            username='admin_comment',
            email='admincomm@example.com',
            password='Password123!',
            role=User.ROLE_ADMIN,
        )
        self.user1 = User.objects.create_user(
            username='author_user',
            email='author@example.com',
            password='Password123!',
            role=User.ROLE_EMPLOYEE,
        )
        self.user2 = User.objects.create_user(
            username='other_user',
            email='othercomm@example.com',
            password='Password123!',
            role=User.ROLE_EMPLOYEE,
        )

        today = timezone.now().date()
        self.project = Project.objects.create(
            name='Comment Project',
            created_by=self.admin,
            start_date=today,
            end_date=today + timedelta(days=20),
        )
        self.task = Task.objects.create(
            title='Comment Target Task',
            project=self.project,
            created_by=self.admin,
            due_date=today + timedelta(days=5),
        )

        self.comment = Comment.objects.create(
            task=self.task,
            user=self.user1,
            comment='Initial comment from author',
        )

    def test_list_comments_for_task(self):
        self.client.force_authenticate(user=self.user2)
        response = self.client.get(f'/api/tasks/{self.task.id}/comments/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)

    def test_create_comment(self):
        self.client.force_authenticate(user=self.user2)
        payload = {'comment': 'New reply from user 2'}
        response = self.client.post(f'/api/tasks/{self.task.id}/comments/', payload)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['comment'], 'New reply from user 2')
        self.assertEqual(response.data['user_detail']['username'], 'other_user')

    def test_author_can_update_comment(self):
        self.client.force_authenticate(user=self.user1)
        payload = {'comment': 'Updated author comment text'}
        response = self.client.patch(f'/api/comments/{self.comment.id}/', payload)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.comment.refresh_from_db()
        self.assertEqual(self.comment.comment, 'Updated author comment text')

    def test_non_author_cannot_update_comment(self):
        self.client.force_authenticate(user=self.user2)
        payload = {'comment': 'Malicious modification'}
        response = self.client.patch(f'/api/comments/{self.comment.id}/', payload)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_can_delete_comment(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.delete(f'/api/comments/{self.comment.id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Comment.objects.filter(id=self.comment.id).exists())
