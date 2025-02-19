from rest_framework import generics, response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from ..HelperFuntions import update_profile_one_degree_count
from ..models import Profile, CustomUser
from ..serializers import ProfileCreateSerializer, ProfileUpdateSerializer
from rest_framework.response import Response


class RetrieveProfileView(generics.RetrieveAPIView):
    serializer_class = ProfileCreateSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        user_id = self.kwargs.get("user_id")
        if not user_id:
            raise ValueError("user_id is required in URL pattern.")

        user = get_object_or_404(CustomUser, id=user_id)

        # 본인의 프로필을 조회하는 경우
        if self.request.user.id == user.id:
            print(f"User {self.request.user.id} is viewing their own profile.")
            return get_object_or_404(Profile, user=user)

        # 다른 사용자의 프로필을 조회하는 경우
        print(f"User {self.request.user.id} is viewing the profile of user {user_id}.")
        return get_object_or_404(Profile, user=user)


class ProfileUpdateView(generics.UpdateAPIView):
    queryset = Profile.objects.all()
    serializer_class = ProfileUpdateSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return Profile.objects.get(user=self.request.user)

    def put(self, request, *args, **kwargs):
        return super().put(request, *args, **kwargs)


class UpdateOneDegreeCountView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        # 현재 사용자를 가져옴
        user = request.user

        # 전달된 user_id가 있다면 해당 사용자의 프로필을 업데이트
        user_id = kwargs.get("user_id")
        if user_id:
            user = get_object_or_404(CustomUser, id=user_id)

        # one_degree_count 업데이트
        update_profile_one_degree_count(user)

        # 업데이트된 one_degree_count를 반환
        profile = user.profile
        return Response({"one_degree_count": profile.one_degree_count})
