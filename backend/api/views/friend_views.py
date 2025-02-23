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


class FriendListView(generics.ListAPIView):
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


class FriendCreateView(generics.CreateAPIView):
    serializer_class = FriendCreateSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None

    def perform_create(self, serializer):
        from_user = serializer.validated_data.get("from_user") or self.request.user
        to_user = serializer.validated_data.get("to_user")
        print("from_user", from_user)
        print("to_user", to_user)

        if not from_user:
            print("❌ 인증되지 않은 사용자입니다.")
            raise ValidationError({"message": "인증되지 않은 사용자입니다."})

        # 자기 자신에게 친구 요청 방지
        if from_user == to_user:
            print("❌ 자기 자신에게 친구 요청을 보낼 수 없습니다.")
            raise ValidationError(
                {"message": "자기 자신에게 친구 요청을 보낼 수 없습니다."}
            )

        # 중복 친구 요청 방지
        existing_friendship = Friend.objects.filter(
            Q(from_user=from_user, to_user=to_user)
            | Q(from_user=to_user, to_user=from_user)
        ).first()

        if existing_friendship:
            if existing_friendship.status == "pending":
                print("❌ 이미 친구 요청이 진행 중입니다.")
                raise ValidationError({"message": "이미 친구 요청이 진행 중입니다."})
            elif existing_friendship.status == "accepted":
                print("❌ 이미 친구 관계입니다.")
                raise ValidationError({"message": "이미 친구 관계입니다."})

        # ✅ `serializer.save()`를 사용하여 from_user 저장
        friend_request = serializer.save(from_user=from_user)

        # 친구 추가 요청 알림 생성
        if friend_request.status == "pending":
            friend_request.notify_friend_create()
            user_profile = friend_request.from_user.profile

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

        # ✅ 응답에서 `FriendCreateSerializer`를 다시 직렬화하여 반환
        return Response(
            FriendCreateSerializer(friend_request).data, status=status.HTTP_201_CREATED
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

        if status == "accepted":
            user_profile = friend.to_user.profile
            friend.notify_friend_accept()  # 친구 수락 알림 보내기

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
            user_profile = friend.to_user.profile
            friend.notify_friend_reject()  # 친구 거절 알림 보내기

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
            {"detail": "친구 요청이 성공적으로 취소되었습니다."},
            status=status.HTTP_204_NO_CONTENT,
        )


# 1촌 친구 목록을 얻는 View
# FriendListView 와 다르게 status가 accepted인 친구 관계만 필터링
class OneDegreeFriendsView(generics.ListAPIView):
    serializer_class = CustomUserSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        user_id = self.kwargs.get("user_id")

        try:
            user = CustomUser.objects.get(id=user_id)
        except CustomUser.DoesNotExist:
            return Response(
                {"error": "Target user not found."}, status=status.HTTP_404_NOT_FOUND
            )

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

        # ID 리스트로 사용자 필터링
        return CustomUser.objects.filter(id__in=friend_ids)
