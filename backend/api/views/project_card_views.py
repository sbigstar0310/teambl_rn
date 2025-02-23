from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from ..models import (
    Friend,
    ProjectCard,
    ProjectCardInvitation,
    ProjectCardInvitationLink,
    CustomUser,
    Notification,
)
from ..serializers import ProjectCardSerializer, ProjectCardInvitationSerializer
from django.db.models import Q
from rest_framework.exceptions import PermissionDenied
import uuid


## 프로젝트 카드 (ProjectCard) 관련 API 뷰
# 프로젝트 카드 리스트 뷰 (전체 최신순 정렬)
class ProjectCardListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ProjectCardSerializer
    pagination_class = None

    def get_queryset(self):
        user = self.request.user
        return ProjectCard.objects.all().order_by("-created_at")


# 해당 사용자가 참여하고 있는 모든 프로젝트 카드를 불러옵니다.
class ProjectCardCurrentListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ProjectCardSerializer
    pagination_class = None

    def get_queryset(self):
        user = self.request.user
        return ProjectCard.objects.filter(accepted_users=user).order_by("-created_at")


# 해당 사용자(user_id)의 1촌이 참여하고 있는 프로젝트 카드 리스트 뷰
class ProjectCardOneDegreeListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ProjectCardSerializer
    pagination_class = None

    def get_queryset(self):
        # 사용자의 id를 변수로 받음
        user_id = self.kwargs["user_id"]

        # 해당 id로 사용자를 찾기 (없으면 404 오류)
        user = get_object_or_404(CustomUser, id=user_id)

        # 해당 사용자의 1촌 사용자 목록 가져오기
        friends = user.get_friends()

        # 1촌이 참여하고 있는 프로젝트 카드 필터링
        return ProjectCard.objects.filter(accepted_users__in=friends).distinct()


class ProjectCardCreateView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ProjectCardSerializer

    def perform_create(self, serializer):
        project_card = serializer.save(creator=self.request.user)
        project_card.accepted_users.add(self.request.user)
        project_card.save()

        return Response(serializer.data, status=status.HTTP_201_CREATED)


class ProjectCardRetrieveView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ProjectCardSerializer

    def get_queryset(self):
        return ProjectCard.objects.all()


class ProjectCardUpdateView(generics.UpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ProjectCardSerializer
    queryset = ProjectCard.objects.all()

    def perform_update(self, serializer):
        project_card = self.get_object()

        # ✅ 관리자(creator)만 업데이트 가능하도록 예외 발생
        if project_card.creator != self.request.user:
            raise PermissionDenied(
                "관리자만 프로젝트 카드를 수정할 수 있습니다."
            )  # ❗ Response가 아니라 예외 발생

        serializer.save()

        # 프로젝트 카드 수정 알림 생성
        request_user = self.request.user
        accept_users = project_card.accepted_users.all()
        bookmark_users = project_card.bookmarked_users.all()

        # 팀원에게 수정 알림 생성
        for user in accept_users:
            # 본인이면 알림 안 보냄
            if user == request_user:
                continue

            # 중복 알림 방지
            notification_exists = Notification.objects.filter(
                user=user,
                message=f"{request_user.profile.user_name}님이 {project_card.title} 카드를 수정했습니다.",
                notification_type="project_card_update",
                related_project_card_id=project_card.id,
            ).exists()

            if not notification_exists:
                Notification.objects.create(
                    user=user,
                    message=f"{request_user.profile.user_name}님이 {project_card.title} 카드를 수정했습니다.",
                    notification_type="project_card_update",
                    related_project_card_id=project_card.id,
                )

        # 북마크(저장)한 회원에게 수정 알림 생성
        for user in bookmark_users:
            # 중복 알림 방지
            notification_exists = Notification.objects.filter(
                user=user,
                # message=f"{request_user.profile.user_name}님이 당신이 저장한 {project_card.title} 카드를 수정했습니다.",
                message=f"당신이 저장한 {project_card.title} 카드가 수정되었습니다.",
                notification_type="project_card_update",
                related_project_card_id=project_card.id,
            ).exists()

            if not notification_exists:
                Notification.objects.create(
                    user=user,
                    # message=f"{request_user.profile.user_name}님이 당신이 저장한 {project_card.title} 카드를 수정했습니다.",
                    message=f"당신이 저장한 {project_card.title} 카드가 수정되었습니다.",
                    notification_type="project_card_update",
                    related_project_card_id=project_card.id,
                )


# 프로젝트 카드 소식받기(북마크)를 토클 하는 뷰
# bookmarked_users 필드에 사용자 추가/제거
class ProjectCardBookmarkToggleView(generics.UpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ProjectCardSerializer
    queryset = ProjectCard.objects.all()

    def perform_update(self, serializer):
        project_card = self.get_object()
        user = self.request.user

        # 북마크 토글
        if user in project_card.bookmarked_users.all():
            project_card.bookmarked_users.remove(user)
        else:
            project_card.bookmarked_users.add(user)

        serializer.instance = project_card
        return Response(serializer.data, status=status.HTTP_200_OK)


# 프로젝트 카드에서 나가는 뷰
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
            print("프로젝트 카드에 참여 중이 아닙니다.")
            raise ValidationError("프로젝트 카드에 참여 중이 아닙니다.")

        # 2. 프로젝트 카드 초대 이력 삭제
        projectCardInvitation = ProjectCardInvitation.objects.filter(
            project_card=project_card, invitee=user
        ).exists()
        if projectCardInvitation:
            ProjectCardInvitation.objects.filter(
                project_card=project_card, invitee=user
            ).delete()

        # 3. 관리자인 경우 처리
        if project_card.creator == user:
            if accepted_users.count() > 1:
                new_creator = accepted_users.exclude(
                    id=user.id
                ).first()  # 다른 사용자에게 관리자 위임 TODO: 오래된 순서로 위임
                project_card.creator = new_creator
                project_card.accepted_users.remove(user)
            else:  # 마지막 사용자일 경우 카드 삭제
                project_card.delete()
                return  # 삭제 후 바로 종료
        else:
            # 관리자가 아닌 경우 탈퇴 처리
            project_card.accepted_users.remove(user)

        # 변경 사항 저장
        project_card.save()


class ProjectCardDestroyView(generics.DestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ProjectCardSerializer
    queryset = ProjectCard.objects.all()

    def perform_destroy(self, instance):
        if instance.creator != self.request.user:
            raise ValidationError("관리자만 프로젝트 카드를 삭제할 수 있습니다.")
        super().perform_destroy(instance)


# 사용자의 북마크(소식 받기)한 프로젝트 카드 목록을 불러오는 뷰
class ProjectCardBookmarkedListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ProjectCardSerializer
    pagination_class = None

    def get_queryset(self):
        user = self.request.user
        return user.bookmarked_project_cards.all()


class ProjectCardInvitationCreateView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ProjectCardInvitationSerializer

    # def perform_create(self, serializer):
    #     return super().perform_create(serializer)

    def perform_create(self, serializer):
        invitation = serializer.save()

        # Project Card에 초대받은 유저에게 알림 생성
        notification_exists = Notification.objects.filter(
            user=invitation.invitee,
            message=f"{invitation.inviter.profile.user_name}님이 당신을 {invitation.project_card.title} 프로젝트에 초대했습니다.",
            notification_type="project_card_invite",
            related_project_card_id=invitation.project_card.id,
        ).exists()

        if not notification_exists:
            Notification.objects.create(
                user=invitation.invitee,
                message=f"{invitation.inviter.profile.user_name}님이 당신을 {invitation.project_card.title} 프로젝트에 초대했습니다.",
                notification_type="project_card_invite",
                related_project_card_id=invitation.project_card.id,
            )


class ProjectCardInvitationDeleteView(generics.DestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ProjectCardInvitationSerializer

    def get_object(self):
        """
        특정 초대 정보를 가져오고, 요청한 유저가 관리자인지 확인
        """
        project_card_id = self.kwargs.get("project_card_id")
        invitee_id = self.kwargs.get("invitee_id")

        try:
            invitation = ProjectCardInvitation.objects.get(
                project_card_id=project_card_id, invitee_id=invitee_id
            )
        except ProjectCardInvitation.DoesNotExist:
            raise ValidationError("해당 초대가 존재하지 않습니다.")

        # 🔥 삭제 권한 체크 (creator만 가능)
        if invitation.project_card.creator != self.request.user:
            raise ValidationError("관리자만 프로젝트 카드 초대를 삭제할 수 있습니다.")

        return invitation


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

            # 프로젝트 카드 생성자에게 수락 알림 생성
            notification_exists = Notification.objects.filter(
                user=invitation.inviter,  # 초대한 사람에게 알림
                message=f"{invitation.invitee.profile.user_name}님이 당신의 프로젝트 초대를 수락했습니다.",
                notification_type="project_card_accept",
                related_user_id=invitation.invitee.id,
                related_project_card_id=invitation.project_card.id,
            ).exists()

            if not notification_exists:
                Notification.objects.create(
                    user=invitation.inviter,
                    message=f"{invitation.invitee.profile.user_name}님이 당신의 프로젝트 초대를 수락했습니다.",
                    notification_type="project_card_accept",
                    related_user_id=invitation.invitee.id,
                    related_project_card_id=invitation.project_card.id,
                )

            return Response(
                {"message": "프로젝트 카드 초대를 수락했습니다."},
                status=status.HTTP_200_OK,
            )
        elif serializer.validated_data.get("status") == "rejected":

            # 프로젝트 카드 생성자에게 거절 알림 생성
            notification_exists = Notification.objects.filter(
                user=invitation.inviter,  # 초대한 사람에게 알림
                message=f"{invitation.invitee.profile.user_name}님이 당신의 프로젝트 초대를 거절했습니다.",
                notification_type="project_card_reject",
                related_user_id=invitation.invitee.id,
                related_project_card_id=invitation.project_card.id,
            ).exists()

            if not notification_exists:
                Notification.objects.create(
                    user=invitation.inviter,
                    message=f"{invitation.invitee.profile.user_name}님이 당신의 프로젝트 초대를 거절했습니다.",
                    notification_type="project_card_reject",
                    related_user_id=invitation.invitee.id,
                    related_project_card_id=invitation.project_card.id,
                )

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


class ProjectCardInvitationResponseByCodeView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ProjectCardInvitationSerializer

    def get_link_data(self):
        code = self.request.query_params.get("code")
        return get_object_or_404(ProjectCardInvitationLink, link__endswith=code)

    def retrieve(self, request, *args, **kwargs):
        link_data = self.get_link_data()

        # 만료 날짜 계산
        expired_date = link_data.created_at + timezone.timedelta(days=7)
        current_date = timezone.now()

        # 초대 링크가 만료된 경우
        if current_date > expired_date:
            link_data.status = "expired"
            link_data.save()

            return Response(
                {
                    "message": "Invitation link is expired",
                    "error_type": "expired",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        invitation_status = request.query_params.get("status")
        if invitation_status is None or (
            invitation_status != "accepted" and invitation_status != "rejected"
        ):
            return Response(
                {
                    "error": "Status parameter is required and must be either 'accepted' or 'rejected'"
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        # 초대 수락 처리
        project_card_invitation = ProjectCardInvitation.objects.create(
            project_card=link_data.project_card,
            inviter=link_data.inviter,
            invitee=self.request.user,
            status=invitation_status,
        )
        return Response(project_card_invitation.id, status=status.HTTP_200_OK)


class ProjectCardLinkView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        # 요청에서 project_card_id 가져오기
        project_card_id = request.data.get("project_card_id")

        # 프로젝트 카드가 존재하는지 확인
        project_card = get_object_or_404(ProjectCard, id=project_card_id)

        # UUID4를 사용하여 고유 ID 생성
        unique_id = str(uuid.uuid4())[:10]  # 앞자리만 사용

        return Response(
            {"project_card_id": project_card.id, "unique_id": unique_id},
            status=status.HTTP_200_OK,
        )
