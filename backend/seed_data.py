"""
Database Seeder for Team Task Manager.
Populates realistic users, projects, tasks, comments, and notifications for development and testing.
"""

from datetime import timedelta
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.utils import timezone
from users.models import User
from projects.models import Project
from tasks.models import Task
from comments.models import Comment
from notifications.models import Notification


def seed():
    print("--- Seeding Database ---")

    # 1. Create Users
    users_data = [
        {
            'username': 'admin',
            'email': 'admin@teamtask.com',
            'first_name': 'System',
            'last_name': 'Administrator',
            'password': 'AdminPassword123!',
            'role': User.ROLE_ADMIN,
            'is_staff': True,
            'is_superuser': True,
        },
        {
            'username': 'manager_sarah',
            'email': 'sarah@teamtask.com',
            'first_name': 'Sarah',
            'last_name': 'Connor',
            'password': 'ManagerPassword123!',
            'role': User.ROLE_MANAGER,
        },
        {
            'username': 'john_dev',
            'email': 'john@teamtask.com',
            'first_name': 'John',
            'last_name': 'Doe',
            'password': 'EmployeePassword123!',
            'role': User.ROLE_EMPLOYEE,
        },
        {
            'username': 'emily_ui',
            'email': 'emily@teamtask.com',
            'first_name': 'Emily',
            'last_name': 'Chen',
            'password': 'EmployeePassword123!',
            'role': User.ROLE_EMPLOYEE,
        },
        {
            'username': 'alex_qa',
            'email': 'alex@teamtask.com',
            'first_name': 'Alex',
            'last_name': 'Rivera',
            'password': 'EmployeePassword123!',
            'role': User.ROLE_EMPLOYEE,
        },
    ]

    users = {}
    for u in users_data:
        user, created = User.objects.get_or_create(
            username=u['username'],
            defaults={
                'email': u['email'],
                'first_name': u['first_name'],
                'last_name': u['last_name'],
                'role': u['role'],
                'is_staff': u.get('is_staff', False),
                'is_superuser': u.get('is_superuser', False),
            }
        )
        if created:
            user.set_password(u['password'])
            user.save()
            print(f"Created user: {user.username} ({user.role})")
        users[u['username']] = user

    admin_user = users['admin']
    manager_user = users['manager_sarah']
    john = users['john_dev']
    emily = users['emily_ui']
    alex = users['alex_qa']

    # 2. Create Projects
    today = timezone.now().date()
    projects_data = [
        {
            'name': 'E-Commerce Application',
            'description': 'Modern omnichannel shopping platform with high-throughput checkout and Stripe integration.',
            'created_by': manager_user,
            'start_date': today - timedelta(days=20),
            'end_date': today + timedelta(days=40),
            'status': Project.STATUS_ACTIVE,
        },
        {
            'name': 'Mobile Banking App',
            'description': 'Next-gen iOS & Android biometric banking app with zero-trust security architecture.',
            'created_by': admin_user,
            'start_date': today - timedelta(days=10),
            'end_date': today + timedelta(days=60),
            'status': Project.STATUS_ACTIVE,
        },
        {
            'name': 'Cloud Migration & Infrastructure',
            'description': 'Migrate legacy microservices to Kubernetes clusters with automated GitOps pipelines.',
            'created_by': manager_user,
            'start_date': today + timedelta(days=5),
            'end_date': today + timedelta(days=90),
            'status': Project.STATUS_PLANNING,
        },
        {
            'name': 'AI Customer Support Bot',
            'description': 'LLM-powered contextual assistance bot integrated with Zendesk and Slack.',
            'created_by': admin_user,
            'start_date': today - timedelta(days=60),
            'end_date': today - timedelta(days=5),
            'status': Project.STATUS_COMPLETED,
        },
    ]

    projects = {}
    for p in projects_data:
        proj, created = Project.objects.get_or_create(
            name=p['name'],
            defaults=p
        )
        if created:
            print(f"Created project: {proj.name}")
        projects[p['name']] = proj

    ecommerce = projects['E-Commerce Application']
    banking = projects['Mobile Banking App']
    cloud = projects['Cloud Migration & Infrastructure']
    ai_bot = projects['AI Customer Support Bot']

    # 3. Create Tasks
    tasks_data = [
        {
            'title': 'Develop Login & JWT Auth API',
            'description': 'Implement secure JWT authentication endpoints with token refresh and role-based permissions.',
            'project': ecommerce,
            'created_by': manager_user,
            'assigned_to': john,
            'priority': Task.PRIORITY_HIGH,
            'status': Task.STATUS_COMPLETED,
            'due_date': today - timedelta(days=2),
            'progress': 100,
        },
        {
            'title': 'Design Product Catalog UI',
            'description': 'Create responsive, high-performance product grid with filtering, search, and optimistic cart updates.',
            'project': ecommerce,
            'created_by': manager_user,
            'assigned_to': emily,
            'priority': Task.PRIORITY_MEDIUM,
            'status': Task.STATUS_IN_PROGRESS,
            'due_date': today + timedelta(days=4),
            'progress': 65,
        },
        {
            'title': 'Stripe Payment Gateway Integration',
            'description': 'Integrate Stripe Webhooks, 3D Secure verification, and checkout session reconciliation.',
            'project': ecommerce,
            'created_by': manager_user,
            'assigned_to': john,
            'priority': Task.PRIORITY_CRITICAL,
            'status': Task.STATUS_IN_PROGRESS,
            'due_date': today + timedelta(days=7),
            'progress': 40,
        },
        {
            'title': 'Biometric Authentication Flow',
            'description': 'Implement FaceID and Fingerprint biometric prompts using React Native Keychain.',
            'project': banking,
            'created_by': admin_user,
            'assigned_to': emily,
            'priority': Task.PRIORITY_HIGH,
            'status': Task.STATUS_REVIEW,
            'due_date': today + timedelta(days=3),
            'progress': 90,
        },
        {
            'title': 'Security Audit & Penetration Testing',
            'description': 'Perform OWASP Top 10 vulnerability assessment and dependency audit on DRF endpoints.',
            'project': banking,
            'created_by': admin_user,
            'assigned_to': alex,
            'priority': Task.PRIORITY_CRITICAL,
            'status': Task.STATUS_IN_PROGRESS,
            'due_date': today + timedelta(days=5),
            'progress': 50,
        },
        {
            'title': 'Configure Terraform for EKS Clusters',
            'description': 'Write reproducible Infrastructure-as-Code modules for VPC, subnets, and AWS EKS worker nodes.',
            'project': cloud,
            'created_by': manager_user,
            'assigned_to': john,
            'priority': Task.PRIORITY_MEDIUM,
            'status': Task.STATUS_TODO,
            'due_date': today + timedelta(days=14),
            'progress': 0,
        },
        {
            'title': 'End-to-End Cypress Integration Tests',
            'description': 'Automate full customer checkout journey and verify transactional email dispatch.',
            'project': ecommerce,
            'created_by': manager_user,
            'assigned_to': alex,
            'priority': Task.PRIORITY_HIGH,
            'status': Task.STATUS_BLOCKED,
            'due_date': today - timedelta(days=1),  # Overdue example
            'progress': 25,
        },
        {
            'title': 'Train RAG Pipeline on Documentation',
            'description': 'Vectorize knowledge base articles into Pinecone and configure similarity retrieval prompts.',
            'project': ai_bot,
            'created_by': admin_user,
            'assigned_to': alex,
            'priority': Task.PRIORITY_MEDIUM,
            'status': Task.STATUS_COMPLETED,
            'due_date': today - timedelta(days=10),
            'progress': 100,
        },
    ]

    tasks = []
    for t in tasks_data:
        task, created = Task.objects.get_or_create(
            title=t['title'],
            project=t['project'],
            defaults=t
        )
        if created:
            print(f"Created task: {task.title}")
        tasks.append(task)

    # 4. Comments
    if tasks:
        auth_task = tasks[0]
        stripe_task = tasks[2]

        Comment.objects.get_or_create(
            task=auth_task,
            user=john,
            comment="Completed JWT rotation and blacklisting support. Unit tests passing with 98% coverage."
        )
        Comment.objects.get_or_create(
            task=auth_task,
            user=manager_user,
            comment="Great work John! Make sure CORS headers are also properly configured for localhost:5173."
        )
        Comment.objects.get_or_create(
            task=stripe_task,
            user=alex,
            comment="Webhook endpoint has been tested locally with Stripe CLI. Looking good so far."
        )

    # 5. Notifications
    Notification.objects.get_or_create(
        user=john,
        task=tasks[2],
        notification_type=Notification.TYPE_TASK_ASSIGNED,
        message='You have been assigned to task "Stripe Payment Gateway Integration" in project "E-Commerce Application".'
    )
    Notification.objects.get_or_create(
        user=alex,
        task=tasks[6],
        notification_type=Notification.TYPE_DEADLINE_APPROACHING,
        message='Task "End-to-End Cypress Integration Tests" deadline has passed and is currently Blocked.'
    )
    Notification.objects.get_or_create(
        user=manager_user,
        task=tasks[0],
        notification_type=Notification.TYPE_TASK_COMPLETED,
        message='Task "Develop Login & JWT Auth API" has been marked as Completed.'
    )

    print("--- Database Seeding Complete ---")
    print("Demo Accounts:")
    print("1. Admin:    admin / AdminPassword123!")
    print("2. Manager:  manager_sarah / ManagerPassword123!")
    print("3. Employee: john_dev / EmployeePassword123!")
    print("4. Employee: emily_ui / EmployeePassword123!")
    print("5. Employee: alex_qa / EmployeePassword123!")


if __name__ == '__main__':
    seed()
