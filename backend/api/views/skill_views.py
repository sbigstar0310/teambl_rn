# 로그인 유저의 스킬 리스트를 보는 뷰
from ..serializers import SkillSerializer
from ..models import Skill
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated


class SkillListView(generics.ListAPIView):
    serializer_class = SkillSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        user = self.request.user
        return Skill.objects.filter(profile=user.profile)
