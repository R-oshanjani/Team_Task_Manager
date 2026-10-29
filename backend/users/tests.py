from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from users.models import User


class AuthenticationAPITests(APITestCase):
    def setUp(self):
        self.register_url = reverse('auth_register')
        self.login_url = reverse('auth_login')
        self.me_url = reverse('auth_me')

        self.user = User.objects.create_user(
            username='testuser',
            email='testuser@example.com',
            password='TestPassword123!',
            first_name='Test',
            last_name='User',
            role=User.ROLE_EMPLOYEE,
        )

    def test_user_registration_success(self):
        payload = {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'first_name': 'New',
            'last_name': 'Employee',
            'password': 'StrongPassword123!',
            'confirm_password': 'StrongPassword123!',
            'role': 'EMPLOYEE',
        }
        response = self.client.post(self.register_url, payload)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertEqual(response.data['user']['username'], 'newuser')

    def test_user_registration_password_mismatch(self):
        payload = {
            'username': 'mismatchuser',
            'email': 'mismatch@example.com',
            'first_name': 'Mismatch',
            'last_name': 'User',
            'password': 'Password123!',
            'confirm_password': 'DifferentPassword123!',
        }
        response = self.client.post(self.register_url, payload)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('confirm_password', response.data)

    def test_user_registration_duplicate_email(self):
        payload = {
            'username': 'uniqueuser',
            'email': 'testuser@example.com',  # existing email
            'first_name': 'Dup',
            'last_name': 'User',
            'password': 'Password123!',
            'confirm_password': 'Password123!',
        }
        response = self.client.post(self.register_url, payload)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_user_login_with_username(self):
        payload = {
            'username': 'testuser',
            'password': 'TestPassword123!',
        }
        response = self.client.post(self.login_url, payload)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertEqual(response.data['user']['username'], 'testuser')

    def test_user_login_with_email(self):
        payload = {
            'username': 'testuser@example.com',
            'password': 'TestPassword123!',
        }
        response = self.client.post(self.login_url, payload)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)

    def test_user_login_invalid_credentials(self):
        payload = {
            'username': 'testuser',
            'password': 'WrongPassword!',
        }
        response = self.client.post(self.login_url, payload)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_jwt_protected_me_endpoint(self):
        # Unauthenticated should fail
        response = self.client.get(self.me_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        # Authenticate with credentials
        login_res = self.client.post(self.login_url, {
            'username': 'testuser',
            'password': 'TestPassword123!',
        })
        token = login_res.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        response = self.client.get(self.me_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], 'testuser')
