from django.conf import settings
from django.db import models


class Project(models.Model):
    STATUS_PLANNING = 'Planning'
    STATUS_ACTIVE = 'Active'
    STATUS_COMPLETED = 'Completed'
    STATUS_ON_HOLD = 'On Hold'
    STATUS_CANCELLED = 'Cancelled'

    STATUS_CHOICES = (
        (STATUS_PLANNING, 'Planning'),
        (STATUS_ACTIVE, 'Active'),
        (STATUS_COMPLETED, 'Completed'),
        (STATUS_ON_HOLD, 'On Hold'),
        (STATUS_CANCELLED, 'Cancelled'),
    )

    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, default='')
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='created_projects'
    )
    start_date = models.DateField()
    end_date = models.DateField()
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default=STATUS_PLANNING)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.name

    @property
    def total_tasks_count(self):
        return self.tasks.count()

    @property
    def completed_tasks_count(self):
        return self.tasks.filter(status='Completed').count()

    @property
    def progress_percentage(self):
        total = self.total_tasks_count
        if total == 0:
            return 0
        completed = self.completed_tasks_count
        return round((completed / total) * 100)
