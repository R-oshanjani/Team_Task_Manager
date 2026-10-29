import django_filters
from django.utils import timezone
from .models import Task


class TaskFilter(django_filters.FilterSet):
    status = django_filters.ChoiceFilter(choices=Task.STATUS_CHOICES)
    priority = django_filters.ChoiceFilter(choices=Task.PRIORITY_CHOICES)
    project = django_filters.NumberFilter(field_name='project__id')
    assigned_to = django_filters.NumberFilter(field_name='assigned_to__id')
    due_date = django_filters.DateFilter(field_name='due_date')
    due_date_after = django_filters.DateFilter(field_name='due_date', lookup_expr='gte')
    due_date_before = django_filters.DateFilter(field_name='due_date', lookup_expr='lte')
    is_overdue = django_filters.BooleanFilter(method='filter_is_overdue')

    class Meta:
        model = Task
        fields = ['status', 'priority', 'project', 'assigned_to', 'due_date']

    def filter_is_overdue(self, queryset, name, value):
        today = timezone.now().date()
        if value:
            return queryset.filter(due_date__lt=today).exclude(status=Task.STATUS_COMPLETED)
        return queryset
