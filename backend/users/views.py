from rest_framework import generics, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User
from .permissions import IsAdmin
from .serializers import (
    LoginSerializer,
    RegisterSerializer,
    UserSerializer,
    UserUpdateSerializer,
)


class RegisterView(generics.CreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        refresh = RefreshToken.for_user(user)
        return Response(
            {
                'message': 'User registered successfully.',
                'user': UserSerializer(user).data,
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            },
            status=status.HTTP_201_CREATED,
        )


class LoginView(generics.GenericAPIView):
    permission_classes = [AllowAny]
    serializer_class = LoginSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data, status=status.HTTP_200_OK)


class LogoutView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            return Response({'message': 'Logged out successfully.'}, status=status.HTTP_200_OK)
        except Exception:
            return Response({'message': 'Logged out.'}, status=status.HTTP_200_OK)


class CurrentUserView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user


class UserViewSet(viewsets.ModelViewSet):
    """
    CRUD API for Users.
    List/Retrieve: All authenticated users (to pick assignees).
    Create/Update/Delete/Change Role: Admin only.
    """
    queryset = User.objects.all().order_by('-created_at')
    serializer_class = UserSerializer

    def get_permissions(self):
        if self.action in ['create', 'destroy']:
            return [IsAdmin()]
        if self.action in ['update', 'partial_update']:
            # Admins can update any user; users can update basic info of themselves
            return [IsAuthenticated()]
        return [IsAuthenticated()]

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        # Non-admins can only update themselves and cannot change their role
        if not (request.user.role == 'ADMIN' or request.user.is_superuser):
            if instance.id != request.user.id:
                return Response(
                    {'detail': 'You do not have permission to edit this user.'},
                    status=status.HTTP_403_FORBIDDEN,
                )
            if 'role' in request.data and request.data['role'] != instance.role:
                return Response(
                    {'detail': 'Only administrators can change user roles.'},
                    status=status.HTTP_403_FORBIDDEN,
                )

        serializer = UserUpdateSerializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(UserSerializer(instance).data)

    @action(detail=False, methods=['get'])
    def team_members(self, request):
        """Returns list of active members available for assignment"""
        users = User.objects.filter(is_active=True).order_by('first_name', 'last_name')
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)
