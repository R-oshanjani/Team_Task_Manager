# TaskPulse — Team Task Manager

> A production-ready, full-stack collaborative task management platform engineered with **Django REST Framework**, **React**, **PostgreSQL**, and **JWT Authentication**.

[![Python](https://img.shields.io/badge/Python-3.12-blue.svg?logo=python&logoColor=white)](https://python.org)
[![Django](https://img.shields.io/badge/Django-5.2-092E20.svg?logo=django&logoColor=white)](https://djangoproject.com)
[![DRF](https://img.shields.io/badge/Django%20REST%20Framework-3.15-red.svg)](https://django-rest-framework.org)
[![React](https://img.shields.io/badge/React-19-61DAFB.svg?logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF.svg?logo=vite&logoColor=white)](https://vitejs.dev)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791.svg?logo=postgresql&logoColor=white)](https://postgresql.org)
[![JWT](https://img.shields.io/badge/JWT-SimpleJWT-black.svg?logo=jsonwebtokens)](https://jwt.io)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 1. Project Overview

**TaskPulse (Team Task Manager)** is an enterprise-grade collaborative task tracking platform built for modern product engineering teams and organizations. It provides a centralized hub to coordinate deliverables across multi-tiered roles (**Admin**, **Manager**, **Employee**), automate deadline tracking, visualize team velocity through Kanban boards and analytics, and conduct task-level technical discussions.

### Key Highlights
- **Role-Based Access Control (RBAC)**: Fine-grained permissions for Admins, Managers, and Employees.
- **Client-Server Separation**: RESTful API backend decoupled cleanly from an ultra-responsive React Single-Page Application (SPA).
- **Relational Integrity**: Foreign keys, cascades, custom validators, and query optimizations (`select_related`, `prefetch_related`).
- **Real-Time Notification Pipeline**: Automated alerts triggered on task assignment, deadline proximity, and status changes.
- **Interactive Kanban & Grid Views**: Seamless toggling between drag-and-drop styled Kanban boards and paginated filter grids.

---

## 2. Features

### 🔐 Authentication & Session Security
- User registration with password strength requirements, unique email/username checks, and role assignment.
- JWT token authentication using `djangorestframework-simplejwt` with automated refresh rotation and server-side blacklisting.
- Automatic Axios interceptor pipeline for transparent access token refreshing on 401 expiration.
- 1-Click quick demo credential switcher for instant role evaluation.

### 👥 User Roles & Permissions
- **Admin**:
  - Full workspace authority.
  - User directory administration (promote/demote roles between Admin, Manager, Employee).
  - Create, update, and delete any project or task.
- **Manager**:
  - Create and manage projects.
  - Create tasks and assign them to any team member.
  - Adjust task priorities, statuses, and deadlines.
  - Access aggregated team workload statistics and status distributions.
- **Employee**:
  - View assigned tasks and project contexts.
  - Update execution progress (0%–100%) and transition statuses (`To Do`, `In Progress`, `Review`, `Completed`, `Blocked`).
  - Automatic business rule: Marking task as `Completed` instantly auto-locks progress to 100%.
  - Participate in task discussions through threaded comments.

### 📁 Project Management
- Full lifecycle management (`Planning`, `Active`, `Completed`, `On Hold`, `Cancelled`).
- Dynamic progress calculation based on completed tasks ratio.
- Detailed project dashboards showing milestone dates, project leaders, and associated deliverables.

### 📋 Task Management, Filtering & Search
- Task metadata: Title, Description, Project, Assignee, Priority (`Low`, `Medium`, `High`, `Critical`), Status, Progress %, Due Date.
- Multi-dimensional filtering:
  - By Status
  - By Priority
  - By Project
  - By Assigned Team Member
  - "Assigned to Me" quick toggle
  - "Overdue Only" deadline alert filter
- Debounced search across title, description, project name, and assignee name.
- View switcher: Responsive Grid vs. 5-Column Kanban Board (`To Do`, `In Progress`, `Review`, `Completed`, `Blocked`).

### 💬 Threaded Discussion & Activity Feed
- Task-level comments with author attribution, timestamps, and real-time updates.
- Authors can edit and delete their own remarks; Admins maintain moderation capabilities.

### 🔔 Notification System
- Automated notification generation for:
  - Task assignment to team member.
  - Task status transition (e.g. moved to `Review` or `Completed`).
  - Overdue and approaching deadlines.
- Navbar popover with unread counter badge, mark-as-read, and mark-all-read shortcuts.
- Direct navigation from notification to the target task.

---

## 3. Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, JavaScript (ES2024), Vite, React Router DOM 7, Lucide Icons |
| **Styling** | Vanilla CSS Design System, Glassmorphism, CSS Custom Properties, Dark Mode Palette |
| **Backend** | Python 3.12, Django 5.2, Django REST Framework 3.15, django-filter |
| **Authentication** | JSON Web Tokens (`djangorestframework-simplejwt`), Token Rotation & Blacklist |
| **Database** | PostgreSQL 16 (production-ready) / SQLite (development fallback via `.env`) |
| **Networking** | Axios with request/response interceptors |
| **Testing** | Django Test Framework, DRF `APITestCase`, Postman Collection |
| **Version Control** | Git, GitHub Feature Branch Workflow |

---

## 4. Architecture

```text
                                TASKPULSE
                                    │
             ┌──────────────────────┴──────────────────────┐
             ▼                                             ▼
     React Frontend (Vite)                         Django REST API (DRF)
             │                                             │
      Axios HTTP Client                             JWT Bearer Guard
   (Auto-refresh Interceptor)                              │
             │                                    Modular DRF Apps:
             │                                     ├── users (RBAC)
             │                                     ├── projects
             │                                     ├── tasks
             │                                     ├── comments
             │                                     └── notifications
             │                                             │
             └──────────────────────┬──────────────────────┘
                                    ▼
                         Django ORM Engine
                    (select_related, prefetch)
                                    │
                                    ▼
                          PostgreSQL Database
```

---

## 5. Database Design & Models

```text
User (AbstractUser)
 ├── id, username, email, first_name, last_name, role ('ADMIN', 'MANAGER', 'EMPLOYEE')
 ├── creates Projects (created_projects)
 ├── creates Tasks (created_tasks)
 ├── assigned to Tasks (assigned_tasks)
 ├── authors Comments
 └── receives Notifications

Project
 ├── id, name, description, start_date, end_date, status
 ├── created_by -> FK(User)
 └── contains Tasks (tasks)

Task
 ├── id, title, description, priority, status, due_date, progress (0-100)
 ├── project -> FK(Project)
 ├── created_by -> FK(User)
 ├── assigned_to -> FK(User, null=True)
 └── contains Comments (comments)

Comment
 ├── id, task -> FK(Task), user -> FK(User), comment, created_at, updated_at

Notification
 ├── id, user -> FK(User), task -> FK(Task, null=True), message, notification_type, is_read, created_at
```

---

## 6. Installation & Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm
- Git

### 1. Clone Repository
```bash
git clone https://github.com/your-username/team-task-manager.git
cd "team-task-manager"
```

### 2. Backend Setup
```bash
cd backend

# Create and activate virtual environment
python -m venv venv

# Windows:
venv\Scripts\activate
# macOS/Linux:
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Seed realistic demo data (users, projects, tasks, comments, notifications)
python seed_data.py

# Start Django development server
python manage.py runserver 127.0.0.1:8000
```

### 3. Frontend Setup
In a new terminal window:
```bash
cd frontend

# Install packages
npm install

# Start Vite React server
npm run dev
```

Open your browser at **`http://localhost:5173`** or **`http://127.0.0.1:5173`**.

---

## 7. Demo Accounts

The database seeder automatically initializes the following credentials:

| Role | Username | Password | Privileges |
|---|---|---|---|
| **Admin** | `admin` | `AdminPassword123!` | Full control, user roles, project & task deletion |
| **Manager** | `manager_sarah` | `ManagerPassword123!` | Project creation, task assignment, progress tracking |
| **Employee** | `john_dev` | `EmployeePassword123!` | Assigned tasks view, status & progress updates, comments |
| **Employee** | `emily_ui` | `EmployeePassword123!` | Assigned tasks view, status & progress updates, comments |
| **Employee** | `alex_qa` | `EmployeePassword123!` | Assigned tasks view, status & progress updates, comments |

*(You can also use the 1-Click buttons on the Login page to authenticate instantly).*

---

## 8. Environment Variables

Create `.env` in `backend/`:

```env
# Django Settings
SECRET_KEY=django-insecure-task-manager-prod-key-7f9e8a1b2c3d4e5f6g7h8i9j0k
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database Selection
# Set USE_POSTGRES=True when running a PostgreSQL server, or False for SQLite
USE_POSTGRES=False
DB_NAME=task_manager
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432

# CORS Configuration
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000
```

---

## 9. API Documentation & Endpoints

Base URL: `http://127.0.0.1:8000/api/`

### 🔑 Authentication
| Method | Endpoint | Description | Permission |
|---|---|---|---|
| `POST` | `/api/auth/register/` | Register new user account | AllowAny |
| `POST` | `/api/auth/login/` | Obtain access & refresh tokens | AllowAny |
| `POST` | `/api/auth/token/refresh/` | Refresh expired access token | AllowAny |
| `POST` | `/api/auth/logout/` | Blacklist refresh token & logout | IsAuthenticated |
| `GET` | `/api/auth/me/` | Fetch current authenticated user | IsAuthenticated |

### 👥 Users
| Method | Endpoint | Description | Permission |
|---|---|---|---|
| `GET` | `/api/users/` | List all users | IsAuthenticated |
| `GET` | `/api/users/team_members/` | Active users available for assignment | IsAuthenticated |
| `GET` | `/api/users/{id}/` | Get user details | IsAuthenticated |
| `PUT` | `/api/users/{id}/` | Update user / change user role | IsAdmin (or Self for basic info) |
| `DELETE` | `/api/users/{id}/` | Delete user | IsAdmin |

### 📁 Projects
| Method | Endpoint | Description | Permission |
|---|---|---|---|
| `GET` | `/api/projects/` | List projects (filterable by `status`) | IsAuthenticated |
| `POST` | `/api/projects/` | Create a project | IsManager / IsAdmin |
| `GET` | `/api/projects/{id}/` | Retrieve project details & progress | IsAuthenticated |
| `PATCH` | `/api/projects/{id}/` | Update project | IsManager / IsAdmin |
| `DELETE` | `/api/projects/{id}/` | Delete project and cascade tasks | IsAdmin |
| `GET` | `/api/projects/{id}/tasks/` | Fetch all tasks belonging to project | IsAuthenticated |

### 📋 Tasks
| Method | Endpoint | Description | Permission |
|---|---|---|---|
| `GET` | `/api/tasks/` | List tasks (filters: status, priority, project, assignee, due_date) | IsAuthenticated |
| `POST` | `/api/tasks/` | Create task and notify assignee | IsManager / IsAdmin |
| `GET` | `/api/tasks/{id}/` | Retrieve task details | IsAuthenticated |
| `PATCH` | `/api/tasks/{id}/` | Update task (Employees: status & progress only) | Manager / Assignee |
| `DELETE` | `/api/tasks/{id}/` | Delete task | IsAdmin |
| `GET` | `/api/tasks/my-tasks/` | Retrieve tasks assigned to current user | IsAuthenticated |
| `GET` | `/api/tasks/dashboard-stats/` | Aggregated dashboard KPI & team telemetry | IsAuthenticated |

### 💬 Comments
| Method | Endpoint | Description | Permission |
|---|---|---|---|
| `GET` | `/api/tasks/{task_id}/comments/` | List all comments on a task | IsAuthenticated |
| `POST` | `/api/tasks/{task_id}/comments/` | Add comment to a task | IsAuthenticated |
| `PUT` | `/api/comments/{id}/` | Edit own comment | Author only |
| `DELETE` | `/api/comments/{id}/` | Delete comment | Author or Admin |

### 🔔 Notifications
| Method | Endpoint | Description | Permission |
|---|---|---|---|
| `GET` | `/api/notifications/` | List user's notifications | IsAuthenticated |
| `GET` | `/api/notifications/unread-count/` | Count unread notifications | IsAuthenticated |
| `PATCH` | `/api/notifications/{id}/read/` | Mark notification as read | IsAuthenticated |
| `POST` | `/api/notifications/read-all/` | Mark all notifications as read | IsAuthenticated |

---

## 10. Postman Testing

A complete Postman collection is included in:
[`postman/Team_Task_Manager.postman_collection.json`](file:///c:/Users/DELL/OneDrive/Desktop/Team%20Task%20Manager/postman/Team_Task_Manager.postman_collection.json)

### Importing:
1. Open Postman.
2. Click **Import** → Choose `postman/Team_Task_Manager.postman_collection.json`.
3. Set the environment variable `baseUrl` to `http://127.0.0.1:8000/api`.
4. Run the **Login (Admin)** request; the test script automatically sets `accessToken` and `refreshToken` for subsequent calls.

---

## 11. Backend Unit & API Testing

The backend includes 28 automated test cases covering authentication, permissions, CRUD flows, filters, and cascade rules.

To execute tests:
```bash
cd backend
.\venv\Scripts\python.exe manage.py test
```

Expected result:
```text
Creating test database for alias 'default'...
............................
----------------------------------------------------------------------
Ran 28 tests in 42.810s

OK
```

---

## 12. Professional Git Workflow

```text
main (Production)
 │
 ├── develop (Integration)
 │    │
 │    ├── feature/authentication       (JWT auth, custom User model, serializers)
 │    ├── feature/project-management   (Projects CRUD, date validation, lead metrics)
 │    ├── feature/task-management      (Tasks, filters, auto-100% rule, notifications)
 │    ├── feature/comments-system      (Task comments CRUD, authorization checks)
 │    └── feature/react-frontend-ui    (Vite, dashboard, Kanban board, Axios service)
```

Sample commit history follows Conventional Commits:
- `feat: implement custom user model and JWT authentication endpoints`
- `feat: create project management models, serializers, and task sub-endpoints`
- `feat: build task CRUD with role-based permissions and notification triggers`
- `feat: integrate threaded task discussion and activity notifications`
- `feat: implement React SPA with Kanban board, filters, and responsive design`
- `test: add comprehensive unit and API test suite for backend services`

---

## 13. Resume Description

```text
Team Task Manager (Full-Stack Collaborative Web Application)
Python, Django, Django REST Framework, React, JavaScript, PostgreSQL, JWT, Git

• Architected a production-ready task management platform with Django REST Framework and React, allowing organizations to manage projects, tasks, assignments, priorities, and deadlines across 3 user roles.
• Engineered secure JWT authentication with automatic token rotation, session blacklisting, and client-side Axios refresh interceptors.
• Designed relational PostgreSQL schemas with Django ORM, incorporating query optimizations (select_related, prefetch_related) and custom model validation (auto-100% completion rule).
• Implemented interactive Kanban and grid boards with real-time multi-criteria filtering, search debouncing, task discussion threads, and an automated event-driven notification engine.
• Authored 28 automated unit and API test suites achieving full coverage across authentication, role permissions, and CRUD operations.
```
