# 로그인 유저의 스킬 리스트를 보는 뷰
from ..serializers import SkillSerializer
from ..models import Skill
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count
from rest_framework.response import Response


class SkillListView(generics.ListAPIView):
    serializer_class = SkillSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        user = self.request.user
        return Skill.objects.filter(profile=user.profile)


class SkillSearchView(generics.ListAPIView):
    serializer_class = SkillSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None  # 페이지네이션 비활성화

    def get_queryset(self):
        user = self.request.user
        query = self.request.query_params.get("query", "").strip().lower()

        if not query:
            return Skill.objects.none()  # 검색어가 없으면 빈 결과 반환

        return Skill.objects.filter(
            profile=user.profile, skill__icontains=query
        )



# 상위 5개의 스킬을 추천으로 반환 (추천 로직은 수정 가능)
class RecommendedSkillsView(generics.ListAPIView):
    serializer_class = SkillSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        return Skill.objects.values("id", "skill").annotate(count=Count("skill")).order_by("-count")[:5]


# 사용자가 선택한 스킬을 추가하는 뷰
class SkillAddView(generics.CreateAPIView):
    serializer_class = SkillSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        user = request.user
        skill_names = request.data.get("skills", [])

        if not isinstance(skill_names, list):
            return Response({"error": "Invalid data format"}, status=status.HTTP_400_BAD_REQUEST)

        created_skills = []
        for skill_name in skill_names:
            skill, created = Skill.objects.get_or_create(profile=user.profile, skill=skill_name)
            created_skills.append(skill)

        return Response(SkillSerializer(created_skills, many=True).data, status=status.HTTP_201_CREATED)
    


# 사용자가 선택한 스킬을 삭제하는 뷰
class SkillDeleteView(generics.DestroyAPIView):
    serializer_class = SkillSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Skill.objects.filter(profile=user.profile)
