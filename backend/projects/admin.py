from django.contrib import admin
from .models import Project


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('name', 'status', 'created_by', 'start_date', 'end_date', 'created_at')
    list_filter = ('status', 'start_date', 'end_date')
    search_fields = ('name', 'description')
