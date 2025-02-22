from rest_framework import generics, status, permissions, serializers
from ..models import (
    CustomUser,
    Friend,
    InvitationLink,
    Notification,
    ProjectCard,
    Conversation,
    Message,
)
from ..serializers import CustomUserSerializer
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework.exceptions import ValidationError
from staff_emails import STAFF_EMAILS
from django.db.models import Q
from django.shortcuts import get_object_or_404
from ..HelperFuntions import update_profile_one_degree_count
from rest_framework_simplejwt.authentication import JWTAuthentication


# 초대 없이 스스로 회원가입하는 뷰
class CreateUserAloneView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer
    permission_classes = [AllowAny]
    authentication_classes = []  # 인증 비활성화

    def perform_create(self, serializer):
        email = serializer.validated_data.get("email")

        # 새 사용자 저장 (회원가입 완료)
        is_staff = email in STAFF_EMAILS
        invitee = serializer.save(is_staff=is_staff)

        # 회원가입 축하 이메일 보내기 (가입자)
        email_body = f"""
                    <p>안녕하세요. 팀블입니다.</p>
                    <br>
                    <p>신뢰 기반의 프로젝트 네트워크, 팀블!</p>
                    <p>진행 중인 다양한 프로젝트를 살펴보고, 관심있는 프로젝트를 응원하며 소통을 시작해보세요!</p>
                    <br>
                    <p>감사합니다. <br> 팀블 드림.</p>
                    <p><a href="{settings.TEAMBL_URL}" target="_blank" style="color: #3498db; text-decoration: none;">팀블 바로가기</a></p>
                    """
        send_mail(
            f"[Teambl] {invitee.profile.user_name}님 가입을 축하합니다!",
            "",  # 텍스트 메시지는 사용하지 않음.
            "info@teambl.net",
            [invitee.email],
            fail_silently=False,
            html_message=email_body,  # HTML 형식 메시지 추가
        )


# 초대링크를 통해 회원가입하는 View
class CreateUserView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer
    permission_classes = [AllowAny]
    authentication_classes = []  # 인증 비활성화

    def perform_create(self, serializer):
        code = self.request.data.get("code", "")
        email = serializer.validated_data.get("email")  # 이메일을 가져옴

        # 초대자 및 초대 링크 초기화
        inviter = None
        invitation = None

        if code or len(code) > 0:
            # 초대 코드가 있는 경우 초대 링크 확인 및 초대자 가져오기
            invitation = InvitationLink.objects.filter(link__contains=code).first()
            if not invitation:
                raise ValidationError("유효하지 않은 초대 코드입니다.")

            try:
                inviter = CustomUser.objects.get(id=invitation.inviter_id)
            except CustomUser.DoesNotExist:
                raise ValidationError("유효하지 않은 초대자 ID입니다.")

        # 새 사용자 저장 (회원가입 완료)
        is_staff = email in STAFF_EMAILS
        invitee = serializer.save(is_staff=is_staff)

        # 회원가입에 성공한 경우 Friend 추가
        if inviter:
            # 초대자와 피초대자의 Friend 관계 생성
            Friend.objects.create(from_user=inviter, to_user=invitee, status="accepted")

            # 초대자와 피초대자의 one_degree_count 업데이트
            update_profile_one_degree_count(inviter)
            update_profile_one_degree_count(invitee)

        # 회원가입에 성공한 경우 InvitationLink의 invitee_id 변경 / 초대 링크 상태를 accepted로 변경 / 알림 생성
        if invitation:
            # 초대 링크 업데이트
            invitation.invitee_id = invitee.id
            invitation.status = "accepted"
            invitation.save()

            # 초대 링크 사용 가입 알림 생성
            Notification.objects.create(
                user=inviter,
                message=f"내가 초대한 {invitee.profile.user_name}님이 팀블에 가입했습니다.\n{invitee.profile.user_name}님의 프로필을 지금 확인해보세요!",
                notification_type="invitation_register",
                related_user_id=invitation.invitee_id,
            )

        # 회원가입 축하 이메일 보내기 (가입자)
        email_body_1 = f"""
                    <p>안녕하세요. 팀블입니다.</p>
                    <br>
                    <p>신뢰 기반의 프로젝트 네트워크, 팀블!</p>
                    <p>진행 중인 다양한 프로젝트를 살펴보고, 관심있는 프로젝트를 응원하며 소통을 시작해보세요!</p>
                    <br>
                    <p>감사합니다. <br> 팀블 드림.</p>
                    <p><a href="{settings.TEAMBL_URL}" target="_blank" style="color: #3498db; text-decoration: none;">팀블 바로가기</a></p>
                    """
        send_mail(
            f"[Teambl] {invitee.profile.user_name}님 가입을 축하합니다!",
            "",  # 텍스트 메시지는 사용하지 않음.
            "info@teambl.net",
            [invitee.email],
            fail_silently=False,
            html_message=email_body_1,  # HTML 형식 메시지 추가
        )

        # 회원가입 알림 이메일 보내기 (초대자)
        if inviter:
            email_body_2 = f"""
                        <p>안녕하세요. 팀블입니다.</p>
                        <br>
                        <p>내가 초대한 {invitee.profile.user_name}님이 팀블에 가입했습니다.</p>
                        <p>{invitee.profile.user_name}님의 프로필을 지금 확인해보세요!</p>
                        <br>
                        <p>감사합니다. <br> 팀블 드림.</p>
                        <p><a href="{settings.TEAMBL_URL}" target="_blank" style="color: #3498db; text-decoration: none;">팀블 바로가기</a></p>
                        """
            send_mail(
                f"[Teambl] 내가 초대한 {invitee.profile.user_name}님이 팀블에 가입했습니다.",
                "",  # 텍스트 메시지는 사용하지 않음.
                "info@teambl.net",
                [inviter.email],
                fail_silently=False,
                html_message=email_body_2,  # HTML 형식 메시지 추가
            )


# 경험 id, 초대유저 id를 받아서 회원가입 후 1촌추가 해주는 View
# 현재 경험을 통한 초대에서 사용
class CreateUserByExperienceView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer
    permission_classes = [AllowAny]
    authentication_classes = []  # 인증 비활성화

    def perform_create(self, serializer):
        # 프론트엔드에서 보내온 inviter_id, project_card_id 확인
        inviter_id = self.request.data.get("inviter_id")
        project_card_id = self.request.data.get("project_card_id")
        if inviter_id is None:
            raise ValueError("초대자 ID가 필요합니다.")
        if project_card_id is None:
            raise ValueError("프로젝트 카드 ID가 필요합니다.")

        try:
            inviter = CustomUser.objects.get(id=inviter_id)
        except CustomUser.DoesNotExist:
            # 초대자가 존재하지 않을 경우 예외 처리
            raise ValueError("유효하지 않은 초대자 ID입니다.")

        try:
            project_card = ProjectCard.objects.get(id=project_card_id)
        except ProjectCard.DoesNotExist:
            raise ValueError("유효하지 않은 프로젝트 카드 ID입니다.")

        # 새 유저 저장 (회원가입 완료)
        invitee = serializer.save()

        # Friend 관계 추가
        if not Friend.objects.filter(
            from_user=inviter, to_user=invitee, status="accepted"
        ).exists():
            Friend.objects.create(from_user=inviter, to_user=invitee, status="accepted")

        # 초대자와 새 유저의 one_degree_count 업데이트
        update_profile_one_degree_count(inviter)
        update_profile_one_degree_count(invitee)

        # 알림 생성
        if not Notification.objects.filter(
            user=inviter,
            message=(
                f"경험 {project_card.title}을 통해 {invitee.profile.user_name}님이 팀블에 가입했습니다.\n"
                f"{invitee.profile.user_name}님의 프로필을 지금 확인해보세요!"
            ),
            notification_type="experience_register", # TODO: Need to update to smth like project_card_register
            related_user_id=invitee.id,
        ).exists():
            Notification.objects.create(
                user=inviter,
                message=(
                    f"경험 {project_card.title}을 통해 {invitee.profile.user_name}님이 팀블에 가입했습니다.\n"
                    f"{invitee.profile.user_name}님의 프로필을 지금 확인해보세요!"
                ),
                notification_type="experience_register", # TODO: Need to update to smth like project_card_register
                related_user_id=invitee.id,
            )

        # 회원가입 축하 이메일 보내기 (가입자)
        email_body_1 = f"""
                    <p>안녕하세요. 팀블입니다.</p>
                    <br>
                    <p>신뢰 기반의 프로젝트 네트워크, 팀블!</p>
                    <p>진행 중인 다양한 프로젝트를 살펴보고, 관심있는 프로젝트를 응원하며 소통을 시작해보세요!</p>
                    <br>
                    <p>감사합니다. <br> 팀블 드림.</p>
                    <p><a href="{settings.TEAMBL_URL}" target="_blank" style="color: #3498db; text-decoration: none;">팀블 바로가기</a></p>
                    """
        send_mail(
            f"[Teambl] {invitee.profile.user_name}님 가입을 축하합니다!",
            "",  # 텍스트 메시지는 사용하지 않음.
            "info@teambl.net",
            [invitee.email],
            fail_silently=False,
            html_message=email_body_1,  # HTML 형식 메시지 추가
        )

        # 회원가입 알림 이메일 보내기 (초대자)
        if inviter:
            email_body_2 = f"""
                        <p>안녕하세요. 팀블입니다.</p>
                        <br>
                        <p>프로젝트 {project_card.title}을 통해 {invitee.profile.user_name}님이 팀블에 가입했습니다.</p>
                        <p>{invitee.profile.user_name}님의 프로필을 지금 확인해보세요!</p>
                        <br>
                        <p>감사합니다. <br> 팀블 드림.</p>
                        <p><a href="{settings.TEAMBL_URL}" target="_blank" style="color: #3498db; text-decoration: none;">팀블 바로가기</a></p>
                        """
            send_mail(
                f"[Teambl] 프로젝트 {project_card.title}을 통해 {invitee.profile.user_name}님이 팀블에 가입했습니다.",
                "",  # 텍스트 메시지는 사용하지 않음.
                "info@teambl.net",
                [inviter.email],
                fail_silently=False,
                html_message=email_body_2,  # HTML 형식 메시지 추가
            )


class CurrentUserView(generics.RetrieveAPIView):
    serializer_class = CustomUserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


class OtherUserView(generics.RetrieveAPIView):
    queryset = CustomUser.objects.all()  # 전체 유저 쿼리셋
    serializer_class = CustomUserSerializer
    permission_classes = [IsAuthenticated]  # 인증된 사용자만 접근 가능

    def get_object(self):
        # URL로부터 id를 가져와 해당 유저를 반환
        user_id = self.kwargs.get("id")
        return generics.get_object_or_404(User, id=user_id)


class CheckUserLoginView(generics.RetrieveAPIView):
    permission_classes = [AllowAny]  # 모든 사용자가 접근 가능
    authentication_classes = []  # 인증 비활성화

    def get(self, request, *args, **kwargs):
        # 유저가 인증되었는지 확인
        if request.user.is_authenticated:
            return Response({"detail": True})  # 로그인한 경우
        else:
            return Response({"detail": False})  # 로그인하지 않은 경우


User = get_user_model()


class AllUsersView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = CustomUserSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None


class ChangePasswordView(generics.UpdateAPIView):
    queryset = CustomUser.objects.all()
    permission_classes = [AllowAny]
    authentication_classes = []  # 인증 비활성화

    def get_object(self):
        # (로그인 상태) Authorization 헤더에서 JWT 토큰 직접 추출
        auth_header = self.request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
            jwt_auth = JWTAuthentication()
            validated_token = jwt_auth.get_validated_token(token)
            user = jwt_auth.get_user(validated_token)
            return user

        # (로그아웃 상태) 인증된 사용자가 없을 경우, email로 사용자 찾기
        email = self.request.data.get("email")
        if email:
            return get_object_or_404(CustomUser, email=email)

        # (테스트 코드) self.request.user에서 유저 가져오기
        if self.request.user:
            return self.request.user

        return None

    def update(self, request, *args, **kwargs):
        instance = self.get_object()

        if instance is None:
            return Response(
                {"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND
            )

        new_password = request.data.get("new_password")
        if not new_password:
            return Response(
                {"detail": "New password is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        instance.set_password(new_password)
        instance.save()
        return Response(
            {"detail": "Password changed successfully."}, status=status.HTTP_200_OK
        )


# 유저의 비밀번호를 실제로 받은 비밀번호와 대조해서 비교.
class CheckPasswordView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]
    # CharField를 사용하여 비밀번호 입력을 받음
    password = serializers.CharField(write_only=True)

    def post(self, request, *args, **kwargs):
        password = request.data.get("password")
        user = self.request.user

        if not password:
            return Response(
                {"detail": "Password is required."}, status=status.HTTP_400_BAD_REQUEST
            )

        # 비밀번호가 실제 비밀번호와 일치하는지 확인
        if user.check_password(password):
            return Response(
                {"isSame": True, "detail": "Password is correct."},
                status=status.HTTP_200_OK,
            )
        else:
            return Response(
                {"isSame": False, "detail": "Incorrect password."},
                status=status.HTTP_200_OK,
            )


class DeleteUserView(generics.DestroyAPIView):
    queryset = User.objects.all()
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

    def destroy(self, request, *args, **kwargs):
        user = self.get_object()

        # 탈퇴하는 사용자의 ID와 일치하는 invitee_id를 가진 InvitationLink 삭제 (추후에는 status를 exited 등으로 바꿀 수 있음)
        InvitationLink.objects.filter(invitee_id=user.id).delete()

        # Friend DB에서 해당 유저와 관련된 row 삭제
        related_friends = Friend.objects.filter(Q(from_user=user) | Q(to_user=user))

        # 친구 관계에 있는 유저들을 저장
        related_users = set()
        for friend in related_friends:
            related_users.add(friend.from_user)
            related_users.add(friend.to_user)

        # 해당 유저와 관련된 친구 관계 삭제
        related_friends.delete()

        # 관련된 유저들의 one_degree_count 업데이트
        for related_user in related_users:
            if (
                related_user != user
            ):  # 탈퇴한 유저를 제외한 나머지 유저들에 대해 업데이트
                update_profile_one_degree_count(related_user)

        # 유저와 관련된 모든 대화방 처리
        related_conversations = Conversation.objects.filter(
            Q(user_1=user) | Q(user_2=user)
        )

        for conversation in related_conversations:
            if conversation.user_1 == user:
                # 유저 1이 탈퇴한 경우
                conversation.deleted_for_user1 = True
                Message.objects.create(
                    conversation=conversation,
                    sender=None,  # 시스템 메시지
                    is_system=True,
                    message=f"{user.profile.user_name}님이 대화방을 나갔습니다.",
                )
            elif conversation.user_2 == user:
                # 유저 2가 탈퇴한 경우
                conversation.deleted_for_user2 = True
                Message.objects.create(
                    conversation=conversation,
                    sender=None,  # 시스템 메시지
                    is_system=True,
                    message=f"{user.profile.user_name}님이 대화방을 나갔습니다.",
                )

            # 두 명 모두 대화방을 나갔으면 대화방 삭제
            if conversation.deleted_for_user1 and conversation.deleted_for_user2:
                conversation.delete()
            else:
                conversation.save()

        # 유저 삭제
        user.delete()

        return Response(
            {"detail": "User deleted successfully."}, status=status.HTTP_204_NO_CONTENT
        )


# 가장 최근(새로 가입한) 사용자의 id 얻기
class LatestUserIdView(generics.GenericAPIView):
    serializer_class = CustomUserSerializer

    def get(self, request, *args, **kwargs):
        try:
            latest_user = CustomUser.objects.latest("id")  # 가장 최근 생성된 유저 찾기
            return Response({"user_id": latest_user.id}, status=status.HTTP_200_OK)
        except CustomUser.DoesNotExist:
            return Response(
                {"error": "No users found"}, status=status.HTTP_404_NOT_FOUND
            )
