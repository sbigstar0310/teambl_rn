from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from ..models import ProjectCard, ProjectCardInvitation
from ..serializers import ProjectCardSerializer, ProjectCardInvitationSerializer


## 프로젝트 카드 (ProjectCard) 관련 API 뷰
# 프로젝트 카드 리스트 뷰 (전체 최신순 정렬)
class ProjectCardListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ProjectCardSerializer
    pagination_class = None

    def get_queryset(self):
        user = self.request.user
        return ProjectCard.objects.all().order_by("-created_at")


class ProjectCardCreateView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ProjectCardSerializer

    def perform_create(self, serializer):
        project_card = serializer.save(creator=self.request.user)
        project_card.accepted_users.add(self.request.user)

        return Response(
            {
                "message": "Project card created successfully.",
                "project_card_id": project_card.id,
            },
            status=status.HTTP_201_CREATED,
        )


class ProjectCardUpdateView(generics.UpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ProjectCardSerializer
    queryset = ProjectCard.objects.all()

    def perform_update(self, serializer):
        project_card = self.get_object()
        if project_card.creator != self.request.user:
            return Response(
                {"error": "관리자만 프로젝트 카드를 수정할 수 있습니다."},
                status=status.HTTP_403_FORBIDDEN,
            )
        serializer.save()


# 프로젝트 카드에서 탈퇴하는 뷰
class ProjectCardLeaveView(generics.UpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ProjectCardSerializer
    queryset = ProjectCard.objects.all()

    def perform_update(self, serializer):
        project_card = self.get_object()
        user = self.request.user
        accepted_users = (
            project_card.accepted_users.all()
        )  # 프로젝트 카드에 참여 중인 사용자 목록

        # 1. 프로젝트 카드에 참여 중인지 확인
        if user not in project_card.accepted_users.all():
            raise ValidationError("프로젝트 카드에 참여 중이 아닙니다.")

        # 2. 관리자인 경우 처리
        if project_card.creator == user:
            if accepted_users.count() > 1:
                new_creator = accepted_users.exclude(
                    id=user.id
                ).first()  # 다른 사용자에게 관리자 위임 TODO: 오래된 순서로 위임
                project_card.creator = new_creator
                project_card.accepted_users.remove(user)
                project_card.save()
            else:  # 마지막 사용자일 경우 카드 삭제
                project_card.delete()
        else:
            # 관리자가 아닌 경우 탈퇴 처리
            project_card.accepted_users.remove(user)

        # 3. 프로젝트 카드 초대 이력 삭제
        ProjectCardInvitation.objects.filter(
            project_card=project_card, invitee=user
        ).delete()

        return Response(
            {"message": "프로젝트 카드에서 성공적으로 탈퇴했습니다."},
            status=status.HTTP_200_OK,
        )


class ProjectCardDestroyView(generics.DestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ProjectCardSerializer
    queryset = ProjectCard.objects.all()

    def perform_destroy(self, instance):
        if instance.creator != self.request.user:
            raise ValidationError("관리자만 프로젝트 카드를 삭제할 수 있습니다.")
        super().perform_destroy(instance)


class ProjectCardInvitationCreateView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ProjectCardInvitationSerializer

    def perform_create(self, serializer):
        return super().perform_create(serializer)


class ProjectCardInvitationResponseView(generics.UpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ProjectCardInvitationSerializer
    queryset = ProjectCardInvitation.objects.all()

    def perform_update(self, serializer):
        invitation = self.get_object()
        if invitation.invitee != self.request.user:
            return Response(
                {
                    "error": "해당 프로젝트 카드를 수락 또는 거절할 수 있는 권한이 없습니다."
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        # 초대 수락 처리
        if serializer.validated_data.get("status") == "accepted":
            invitation.project_card.accepted_users.add(invitation.invitee)
            return Response(
                {"message": "프로젝트 카드 초대를 수락했습니다."},
                status=status.HTTP_200_OK,
            )
        elif serializer.validated_data.get("status") == "rejected":
            return Response(
                {"message": "프로젝트 카드 초대를 거절했습니다."},
                status=status.HTTP_200_OK,
            )
        else:
            return Response(
                {"error": "올바르지 않은 응답입니다. (accepted 또는 rejected)"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer.save()
