from rest_framework import permissions


class IsAdmin(permissions.BasePermission):
    """
    Allows access only to Admin users or superusers.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            (request.user.role == 'ADMIN' or request.user.is_superuser)
        )


class IsManager(permissions.BasePermission):
    """
    Allows access to Managers, Admins, or superusers.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            (request.user.role in ['ADMIN', 'MANAGER'] or request.user.is_superuser)
        )


class IsEmployee(permissions.BasePermission):
    """
    Allows access to any authenticated user.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)


class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Allows read-only access to authenticated users, write to Admins.
    """
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.role == 'ADMIN' or request.user.is_superuser


class IsManagerOrAdminOrReadOnly(permissions.BasePermission):
    """
    Allows read-only access to authenticated users, write to Managers and Admins.
    """
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.role in ['ADMIN', 'MANAGER'] or request.user.is_superuser
