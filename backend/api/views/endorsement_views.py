from rest_framework import generics, serializers
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from ..models import Endorsement, Skill
from ..serializers import EndorsementSerializer


# Endorsement List & Create View
class EndorsementListCreateView(generics.ListCreateAPIView):
    serializer_class = EndorsementSerializer
    permission_classes = [IsAuthenticated]  # 인증된 사용자만 접근 가능
    pagination_class = None

    def get_queryset(self):
        # URL에서 skill_id를 쿼리 파라미터로 가져옴
        skill_id = self.request.GET.get("skill_id")

        # skill_id가 없을 경우 오류 발생
        if not skill_id:
            raise ValidationError("skill_id 쿼리 파라미터가 필요합니다.")

        # Skill 객체를 가져오려고 시도, 없을 경우 404 오류 발생
        try:
            skill = Skill.objects.get(id=skill_id)
        except Skill.DoesNotExist:
            raise ValidationError(f"id가 {skill_id}인 Skill이 존재하지 않습니다.")

        # 해당 스킬에 대한 모든 endorsement 반환
        return Endorsement.objects.filter(skill=skill)

    def perform_create(self, serializer):
        # POST 요청의 body에서 skill을 가져옴
        skill_id = self.request.data.get("skill")
        print(skill_id)

        # skill 이름으로 Skill 객체를 가져오거나, 존재하지 않으면 404 반환
        skill = get_object_or_404(Skill, id=skill_id)
        print(skill.skill)

        # 현재 사용자가 동일한 스킬을 여러 번 엔도스먼트하는 것을 방지
        if Endorsement.objects.filter(
            skill=skill, endorsed_by=self.request.user
        ).exists():
            raise serializers.ValidationError("You have already endorsed this skill.")

        # 유저는 현재 로그인된 유저
        user = self.request.user

        # 엔도스먼트 저장 (endorsed_by는 현재 로그인된 유저)
        serializer.save(skill=skill, endorsed_by=user)


# endorsement를 삭제하는 View
class EndorsementDeleteView(generics.DestroyAPIView):
    serializer_class = EndorsementSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # user는 요청을 보낸 유저
        user = self.request.user
        return Endorsement.objects.filter(endorsed_by=user)
