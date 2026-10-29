from django.conf import settings
from django.db import models


class Notification(models.Model):
    TYPE_TASK_ASSIGNED = 'TASK_ASSIGNED'
    TYPE_DEADLINE_APPROACHING = 'DEADLINE_APPROACHING'
    TYPE_TASK_COMPLETED = 'TASK_COMPLETED'
    TYPE_STATUS_CHANGED = 'STATUS_CHANGED'
    TYPE_GENERAL = 'GENERAL'

    TYPE_CHOICES = (
        (TYPE_TASK_ASSIGNED, 'Task Assigned'),
        (TYPE_DEADLINE_APPROACHING, 'Deadline Approaching'),
        (TYPE_TASK_COMPLETED, 'Task Completed'),
        (TYPE_STATUS_CHANGED, 'Status Changed'),
        (TYPE_GENERAL, 'General'),
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications'
    )
    # Generic or FK reference to task
    task = models.ForeignKey(
        'tasks.Task',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='notifications'
    )
    message = models.CharField(max_length=500)
    notification_type = models.CharField(max_length=50, choices=TYPE_CHOICES, default=TYPE_GENERAL)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Notification for {self.user.username}: {self.message[:40]}"
