from datetime import timedelta
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase
from notifications.models import Notification
from projects.models import Project
from tasks.models import Task
from users.models import User


class TaskAPITests(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_user(
            username='admin_task_user',
            email='admintask@example.com',
            password='Password123!',
            role=User.ROLE_ADMIN,
        )
        self.manager = User.objects.create_user(
            username='manager_task_user',
            email='managertask@example.com',
            password='Password123!',
            role=User.ROLE_MANAGER,
        )
        self.employee = User.objects.create_user(
            username='emp_task_user',
            email='emptask@example.com',
            password='Password123!',
            role=User.ROLE_EMPLOYEE,
        )
        self.other_employee = User.objects.create_user(
            username='emp_other_user',
            email='otheremp@example.com',
            password='Password123!',
            role=User.ROLE_EMPLOYEE,
        )

        today = timezone.now().date()
        self.project = Project.objects.create(
            name='Task Test Project',
            created_by=self.manager,
            start_date=today,
            end_date=today + timedelta(days=30),
            status='Active',
        )

        self.task = Task.objects.create(
            title='Implement Core Feature',
            description='Core feature description',
            project=self.project,
            created_by=self.manager,
            assigned_to=self.employee,
            priority=Task.PRIORITY_HIGH,
            status=Task.STATUS_IN_PROGRESS,
            due_date=today + timedelta(days=7),
            progress=40,
        )

    def test_create_task_manager(self):
        self.client.force_authenticate(user=self.manager)
        today = timezone.now().date()
        payload = {
            'title': 'New Task for Employee',
            'description': 'Details here',
            'project': self.project.id,
            'assigned_to': self.employee.id,
            'priority': 'Critical',
            'status': 'To Do',
            'due_date': str(today + timedelta(days=5)),
            'progress': 0,
        }
        response = self.client.post('/api/tasks/', payload)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['title'], 'New Task for Employee')
        # Verify notification triggered for assigned employee
        self.assertTrue(
            Notification.objects.filter(
                user=self.employee,
                notification_type=Notification.TYPE_TASK_ASSIGNED
            ).exists()
        )

    def test_create_task_employee_forbidden(self):
        self.client.force_authenticate(user=self.employee)
        today = timezone.now().date()
        payload = {
            'title': 'Unauthorized Task',
            'project': self.project.id,
            'due_date': str(today + timedelta(days=3)),
            'priority': 'Low',
        }
        response = self.client.post('/api/tasks/', payload)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_get_task_detail(self):
        self.client.force_authenticate(user=self.employee)
        response = self.client.get(f'/api/tasks/{self.task.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], self.task.id)

    def test_employee_update_status_and_progress_on_assigned_task(self):
        self.client.force_authenticate(user=self.employee)
        payload = {
            'status': 'Review',
            'progress': 85,
        }
        response = self.client.patch(f'/api/tasks/{self.task.id}/', payload)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.task.refresh_from_db()
        self.assertEqual(self.task.status, 'Review')
        self.assertEqual(self.task.progress, 85)

    def test_completed_status_auto_sets_progress_100(self):
        self.client.force_authenticate(user=self.manager)
        payload = {
            'status': 'Completed',
        }
        response = self.client.patch(f'/api/tasks/{self.task.id}/', payload)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.task.refresh_from_db()
        self.assertEqual(self.task.status, 'Completed')
        self.assertEqual(self.task.progress, 100)

    def test_employee_cannot_reassign_or_change_title(self):
        self.client.force_authenticate(user=self.employee)
        payload = {
            'title': 'Hacked Title',
            'assigned_to': self.other_employee.id,
        }
        response = self.client.patch(f'/api/tasks/{self.task.id}/', payload)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_employee_cannot_update_unassigned_task(self):
        self.client.force_authenticate(user=self.other_employee)
        payload = {'status': 'Completed'}
        response = self.client.patch(f'/api/tasks/{self.task.id}/', payload)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_delete_task_admin(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.delete(f'/api/tasks/{self.task.id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Task.objects.filter(id=self.task.id).exists())

    def test_delete_task_manager_forbidden(self):
        self.client.force_authenticate(user=self.manager)
        response = self.client.delete(f'/api/tasks/{self.task.id}/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_task_filtering_and_search(self):
        self.client.force_authenticate(user=self.employee)
        # Filter by status
        res = self.client.get(f'/api/tasks/?status={Task.STATUS_IN_PROGRESS}')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data['results']), 1)

        # Search by title
        res_search = self.client.get('/api/tasks/?search=Core Feature')
        self.assertEqual(res_search.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(res_search.data['results']), 1)
