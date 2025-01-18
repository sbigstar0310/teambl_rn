from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from ..models import Profile, CustomUser
from ..serializers import ProfileCreateSerializer, ProfileUpdateSerializer


class RetrieveProfileView(generics.RetrieveAPIView):
    serializer_class = ProfileCreateSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        userid = self.kwargs["userid"]
        user = get_object_or_404(CustomUser, id=userid)

        # 본인의 프로필을 조회하는 경우
        if self.request.user.id == user.id:
            print(f"User {self.request.user.id} is viewing their own profile.")
            return get_object_or_404(Profile, user=user)

        # 다른 사용자의 프로필을 조회하는 경우
        else:
            print(
                f"User {self.request.user.id} is viewing the profile of user {userid}."
            )
            return get_object_or_404(Profile, user=user)


class ProfileUpdateView(generics.UpdateAPIView):
    queryset = Profile.objects.all()
    serializer_class = ProfileUpdateSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return Profile.objects.get(user=self.request.user)
