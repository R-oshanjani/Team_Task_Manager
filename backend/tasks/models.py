from django.conf import settings
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models


class Task(models.Model):
    PRIORITY_LOW = 'Low'
    PRIORITY_MEDIUM = 'Medium'
    PRIORITY_HIGH = 'High'
    PRIORITY_CRITICAL = 'Critical'

    PRIORITY_CHOICES = (
        (PRIORITY_LOW, 'Low'),
        (PRIORITY_MEDIUM, 'Medium'),
        (PRIORITY_HIGH, 'High'),
        (PRIORITY_CRITICAL, 'Critical'),
    )

    STATUS_TODO = 'To Do'
    STATUS_IN_PROGRESS = 'In Progress'
    STATUS_REVIEW = 'Review'
    STATUS_COMPLETED = 'Completed'
    STATUS_BLOCKED = 'Blocked'

    STATUS_CHOICES = (
        (STATUS_TODO, 'To Do'),
        (STATUS_IN_PROGRESS, 'In Progress'),
        (STATUS_REVIEW, 'Review'),
        (STATUS_COMPLETED, 'Completed'),
        (STATUS_BLOCKED, 'Blocked'),
    )

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, default='')
    project = models.ForeignKey(
        'projects.Project',
        on_delete=models.CASCADE,
        related_name='tasks'
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='created_tasks'
    )
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_tasks'
    )
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default=PRIORITY_MEDIUM)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_TODO)
    due_date = models.DateField()
    progress = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} ({self.status})"

    def save(self, *args, **kwargs):
        # Business logic requirement: When marked as Completed, progress automatically becomes 100%
        if self.status == self.STATUS_COMPLETED:
            self.progress = 100
        elif self.progress == 100 and self.status == self.STATUS_TODO:
            self.status = self.STATUS_COMPLETED
        super().save(*args, **kwargs)
