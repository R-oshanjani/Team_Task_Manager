from datetime import timedelta
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase
from projects.models import Project
from users.models import User


class ProjectAPITests(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_user(
            username='admin_test',
            email='admin_test@example.com',
            password='AdminPassword123!',
            first_name='Admin',
            last_name='User',
            role=User.ROLE_ADMIN,
        )
        self.manager = User.objects.create_user(
            username='manager_test',
            email='manager_test@example.com',
            password='ManagerPassword123!',
            first_name='Manager',
            last_name='User',
            role=User.ROLE_MANAGER,
        )
        self.employee = User.objects.create_user(
            username='emp_test',
            email='emp_test@example.com',
            password='EmpPassword123!',
            first_name='Emp',
            last_name='User',
            role=User.ROLE_EMPLOYEE,
        )

        today = timezone.now().date()
        self.project = Project.objects.create(
            name='Test Alpha Project',
            description='Test project description',
            created_by=self.manager,
            start_date=today,
            end_date=today + timedelta(days=30),
            status=Project.STATUS_ACTIVE,
        )

    def test_list_projects_authenticated(self):
        self.client.force_authenticate(user=self.employee)
        response = self.client.get('/api/projects/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_create_project_manager(self):
        self.client.force_authenticate(user=self.manager)
        today = timezone.now().date()
        payload = {
            'name': 'New Beta Project',
            'description': 'Description for beta',
            'start_date': str(today),
            'end_date': str(today + timedelta(days=20)),
            'status': 'Planning',
        }
        response = self.client.post('/api/projects/', payload)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['name'], 'New Beta Project')
        self.assertEqual(response.data['created_by'], self.manager.id)

    def test_create_project_employee_forbidden(self):
        self.client.force_authenticate(user=self.employee)
        today = timezone.now().date()
        payload = {
            'name': 'Unauthorized Project',
            'start_date': str(today),
            'end_date': str(today + timedelta(days=10)),
            'status': 'Planning',
        }
        response = self.client.post('/api/projects/', payload)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_update_project(self):
        self.client.force_authenticate(user=self.manager)
        payload = {'status': 'Completed'}
        response = self.client.patch(f'/api/projects/{self.project.id}/', payload)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.project.refresh_from_db()
        self.assertEqual(self.project.status, 'Completed')

    def test_delete_project_admin(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.delete(f'/api/projects/{self.project.id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Project.objects.filter(id=self.project.id).exists())

    def test_delete_project_manager_forbidden(self):
        self.client.force_authenticate(user=self.manager)
        response = self.client.delete(f'/api/projects/{self.project.id}/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
