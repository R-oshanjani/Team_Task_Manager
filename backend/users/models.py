from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    ROLE_ADMIN = 'ADMIN'
    ROLE_MANAGER = 'MANAGER'
    ROLE_EMPLOYEE = 'EMPLOYEE'

    ROLE_CHOICES = (
        (ROLE_ADMIN, 'Admin'),
        (ROLE_MANAGER, 'Manager'),
        (ROLE_EMPLOYEE, 'Employee'),
    )

    first_name = models.CharField(max_length=150, blank=False)
    last_name = models.CharField(max_length=150, blank=False)
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default=ROLE_EMPLOYEE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    REQUIRED_FIELDS = ['first_name', 'last_name', 'email']

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip() or self.username

    @property
    def is_admin(self):
        return self.role == self.ROLE_ADMIN or self.is_superuser

    @property
    def is_manager(self):
        return self.role in [self.ROLE_ADMIN, self.ROLE_MANAGER] or self.is_superuser

    @property
    def is_employee(self):
        return self.role == self.ROLE_EMPLOYEE
