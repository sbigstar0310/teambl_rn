from django.core.mail import send_mail
from django.conf import settings
from django.db.models import Q
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from ..models import CustomUser, Friend, Notification, Profile
from ..serializers import (
    FriendCreateSerializer,
    FriendUpdateSerializer,
    CustomUserSerializer,
)
from ..HelperFuntions import update_profile_one_degree_count
from rest_framework.exceptions import ValidationError


class ListFriendView(generics.ListAPIView):
    serializer_class = FriendCreateSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        user_id = self.kwargs.get("user_id")

        # target_user를 user_id로 검색
        try:
            target_user = CustomUser.objects.get(id=user_id)
            return Friend.objects.filter(
                Q(from_user=target_user) | Q(to_user=target_user)
            )

        # 해당 id의 유저를 못 찾은 경우 404 오류 반환.
        except CustomUser.DoesNotExist:
            return Response(
                {"error": "Target user not found."}, status=status.HTTP_404_NOT_FOUND
            )


class ListCreateFriendView(generics.ListCreateAPIView):
    serializer_class = FriendCreateSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        user = self.request.user
        return Friend.objects.filter(from_user=user) | Friend.objects.filter(
            to_user=user
        )

    def perform_create(self, serializer):
        from_user = self.request.user
        to_user_id = serializer.validated_data.get("to_user").id

        try:
            to_user = CustomUser.objects.get(id=to_user_id)

            # 기존 친구 관계 확인
            existing_friendship = Friend.objects.filter(
                Q(from_user=from_user, to_user=to_user)
                | Q(from_user=to_user, to_user=from_user)
            ).first()

            if existing_friendship:
                if existing_friendship.status == "pending":
                    # 친구 요청이 진행 중인 경우: 에러 반환
                    raise ValidationError({"detail": "이미 친구 요청이 진행 중입니다."})
                elif existing_friendship.status == "accepted":
                    # 이미 친구 관계인 경우: 에러 반환
                    raise ValidationError({"detail": "이미 친구 관계입니다."})

            # 새로운 친구 관계 생성 (pending)
            Friend.create_or_replace_friendship(from_user, to_user)

            # 친구 추가 요청 알림 생성
            user_profile = Profile.objects.get(user=from_user)
            Notification.objects.create(
                user=to_user,
                message=f"{user_profile.user_name}님의 일촌 신청이 도착했습니다.\n일촌 리스트에서 확인해보세요!",
                notification_type="friend_request",
            )

            email_body = f"""
                    <p>안녕하세요. 팀블입니다.</p>
                    <br>
                    <p>{user_profile.user_name}님의 일촌 신청이 도착했습니다.</p>
                    <p>팀블 일촌 리스트에서 확인해보세요!</p>
                    <br>
                    <p>감사합니다. <br> 팀블 드림.</p>
                    <p><a href="{settings.TEAMBL_URL}" target="_blank" style="color: #3498db; text-decoration: none;">팀블 바로가기</a></p>
                    """
            send_mail(
                f"[팀블] {user_profile.user_name}님의 일촌 신청이 도착했습니다.",
                "",  # 텍스트 메시지는 사용하지 않음.
                "info@teambl.net",
                [to_user.email],
                fail_silently=False,
                html_message=email_body,  # HTML 형식 메시지 추가
            )

            # Profile의 one_degree_count도 업데이트
            update_profile_one_degree_count(from_user)
            update_profile_one_degree_count(to_user)

        except CustomUser.DoesNotExist:
            raise ValidationError(
                {"detail": "해당 아이디를 가진 사용자가 존재하지 않습니다."}
            )


class FriendUpdateView(generics.UpdateAPIView):
    serializer_class = FriendUpdateSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Friend.objects.filter(Q(from_user=user) | Q(to_user=user))

    def perform_update(self, serializer):
        status = serializer.validated_data.get("status")
        friend = serializer.instance
        friend.status = status
        friend.save()

        from_user = friend.from_user
        to_user = friend.to_user

        user_profile = Profile.objects.get(user=to_user)
        if status == "accepted":
            # 친구 요청 수락 시 알림 생성
            Notification.objects.create(
                user=from_user,
                message=f"{user_profile.user_name}님이 일촌 신청을 수락했습니다.\n{user_profile.user_name}님의 프로필을 확인해보세요!",
                notification_type="friend_accept",
                related_user_id=to_user.id,
            )
            email_body = f"""
                    <p>안녕하세요. 팀블입니다.</p>
                    <br>
                    <p>{user_profile.user_name}님이 일촌 신청을 수락했습니다.</p>
                    <p>{user_profile.user_name}님의 프로필을 확인해보세요!</p>
                    <br>
                    <p>감사합니다. <br> 팀블 드림.</p>
                    <p><a href="{settings.TEAMBL_URL}" target="_blank" style="color: #3498db; text-decoration: none;">팀블 바로가기</a></p>
                    """
            send_mail(
                f"[팀블] {user_profile.user_name}님이 일촌 신청을 수락했습니다.",
                "",  # 텍스트 메시지는 사용하지 않음.
                "info@teambl.net",
                [from_user.email],
                fail_silently=False,
                html_message=email_body,  # HTML 형식 메시지 추가
            )
        elif status == "rejected":
            # 친구 요청 거절 시 알림 생성
            Notification.objects.create(
                user=from_user,
                message=f"{user_profile.user_name}님이 일촌 신청을 거절했습니다.",
                notification_type="friend_reject",
            )

            email_body = f"""
                    <p>안녕하세요. 팀블입니다.</p>
                    <br>
                    <p>{user_profile.user_name}님이 일촌 신청을 거절했습니다.</p>
                    <br>
                    <p>감사합니다. <br> 팀블 드림.</p>
                    <p><a href="{settings.TEAMBL_URL}" target="_blank" style="color: #3498db; text-decoration: none;">팀블 바로가기</a></p>
                    """
            send_mail(
                f"[팀블] {user_profile.user_name}님이 일촌 신청을 거절했습니다.",
                "",  # 텍스트 메시지는 사용하지 않음.
                "info@teambl.net",
                [from_user.email],
                fail_silently=False,
                html_message=email_body,  # HTML 형식 메시지 추가
            )

        # Profile의 one_degree_count 업데이트
        update_profile_one_degree_count(from_user)
        update_profile_one_degree_count(to_user)


class FriendDeleteView(generics.DestroyAPIView):
    serializer_class = FriendCreateSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Friend.objects.filter(
            Q(from_user=user) | Q(to_user=user)
        )  # user가 포함된 친구 필터

    # 1촌 삭제 시에 from_user, to_user의 profile에 1촌 수를 빼주기
    def perform_destroy(self, instance):
        super().perform_destroy(instance)
        update_profile_one_degree_count(instance.from_user)
        update_profile_one_degree_count(instance.to_user)


# 진행중(pending)인 친구 요청을 취소하는 뷰
class FriendRequestCancelView(generics.DestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # 로그인한 사용자가 보낸 pending 상태의 친구 요청만 필터링
        return Friend.objects.filter(from_user=self.request.user, status="pending")

    def perform_destroy(self, instance):
        # 요청 삭제 처리
        instance.delete()

        # 삭제 성공 메시지 반환 (선택 사항)
        return Response(
            {"detail": "친구 요청이 성공적으로 취소되었습니다."}, status=204
        )


# 1촌 친구 목록을 얻는 View
class OneDegreeFriendsView(generics.ListAPIView):
    serializer_class = CustomUserSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        user = self.request.user

        # 친구 관계 필터링 (양방향 관계)
        friends = Friend.objects.filter(
            Q(from_user=user, status="accepted") | Q(to_user=user, status="accepted")
        )

        # 친구 ID 리스트 추출
        friend_ids = set()
        for friend in friends:
            # 현재 사용자가 `from_user`이면 상대방은 `to_user`
            if friend.from_user == user:
                friend_ids.add(friend.to_user.id)
            else:
                friend_ids.add(friend.from_user.id)