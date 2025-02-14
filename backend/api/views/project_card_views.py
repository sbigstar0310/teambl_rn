from django.shortcuts import get_object_or_404
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from ..models import Friend, ProjectCard, ProjectCardInvitation, CustomUser, Notification
from ..serializers import ProjectCardSerializer, ProjectCardInvitationSerializer
from django.db.models import Q
from rest_framework.exceptions import PermissionDenied


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
            else:  # 마지막 사용자일 경우 카드 삭제
                project_card.delete()
        else:
            # 관리자가 아닌 경우 탈퇴 처리
            project_card.accepted_users.remove(user)

        # 3. 프로젝트 카드 초대 이력 삭제
        ProjectCardInvitation.objects.filter(
            project_card=project_card, invitee=user
        ).delete()

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
