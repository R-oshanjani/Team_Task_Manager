from django.urls import include, path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    CurrentUserView,
    LoginView,
    LogoutView,
    RegisterView,
    UserViewSet,
)

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')

urlpatterns = [
    # Auth Endpoints
    path('auth/register/', RegisterView.as_view(), name='auth_register'),
    path('auth/login/', LoginView.as_view(), name='auth_login'),
    path('auth/logout/', LogoutView.as_view(), name='auth_logout'),
    path('auth/me/', CurrentUserView.as_view(), name='auth_me'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Users ViewSet
    path('', include(router.urls)),
]
