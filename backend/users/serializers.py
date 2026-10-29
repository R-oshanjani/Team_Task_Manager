from django.contrib.auth import authenticate
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User


class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()

    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'full_name',
            'role',
            'is_active',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class RegisterSerializer(serializers.ModelSerializer):
    confirm_password = serializers.CharField(write_only=True, required=True)
    role = serializers.ChoiceField(choices=User.ROLE_CHOICES, default=User.ROLE_EMPLOYEE, required=False)

    class Meta:
        model = User
        fields = [
            'first_name',
            'last_name',
            'email',
            'username',
            'password',
            'confirm_password',
            'role'
        ]
        extra_kwargs = {
            'password': {'write_only': True, 'min_length': 6},
            'first_name': {'required': True},
            'last_name': {'required': True},
            'email': {'required': True},
        }

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value.lower()

    def validate_username(self, value):
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("A user with this username already exists.")
        return value

    def validate(self, attrs):
        if attrs.get('password') != attrs.get('confirm_password'):
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        password = validated_data.pop('password')
        user = User.objects.create_user(password=password, **validated_data)
        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(required=True)
    password = serializers.CharField(required=True, write_only=True)

    def validate(self, attrs):
        identifier = attrs.get('username')
        password = attrs.get('password')

        user = None
        # Check if login identifier is email
        if '@' in identifier:
            try:
                user_obj = User.objects.get(email__iexact=identifier)
                user = authenticate(username=user_obj.username, password=password)
            except User.DoesNotExist:
                user = None
        else:
            user = authenticate(username=identifier, password=password)

        if not user:
            raise serializers.ValidationError("Invalid email/username or password.")

        if not user.is_active:
            raise serializers.ValidationError("This account has been deactivated.")

        refresh = RefreshToken.for_user(user)

        return {
            'user': UserSerializer(user).data,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }


class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'email', 'role', 'is_active']

    def validate_email(self, value):
        user = self.instance
        if User.objects.filter(email__iexact=value).exclude(id=user.id).exists():
            raise serializers.ValidationError("This email is already in use.")
        return value.lower()
