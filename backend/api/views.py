from rest_framework import generics, permissions, status, serializers
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.exceptions import NotFound
from .models import (
    CustomUser,
    Profile,
    Keyword,
    Project,
    ProjectImage,
    ProjectCard,
    ProjectCardInvitation,
    Endorsement,
    Skill,
    Experience,
    ExperienceDetail,
    ExperienceInvitation,
    InvitationLink,
    Friend,
    Notification,
    Inquiry,
    SearchHistory,
    Like,
    Comment,
    Contact,
    Conversation,
    Message,
)
from .serializers import (
    CustomUserSerializer,
    ProfileCreateSerializer,
    ProfileUpdateSerializer,
    KeywordSerializer,
    ProjectSerializer,
    EndorsementSerializer,
    ExperienceSerializer,
    ExperienceDetailSerializer,
    ExperienceInvitationSerializer,
    InvitationLinkSerializer,
    FriendCreateSerializer,
    FriendUpdateSerializer,
    UserSearchSerializer,
    ProjectSearchSerializer,
    ProjectCardSerializer,
    ProjectCardInvitationSerializer,
    ExperienceSearchSerializer,
    NotificationSerializer,
    MyTokenObtainPairSerializer,
    RelatedUserSerializer,
    SecondDegreeProfileSerializer,
    InquirySerializer,
    SearchHistorySerializer,
    LikeSerializer,
    CommentSerializer,
    ContactSerializer,
    SkillSerializer,
    ConversationSerializer,
    MessageSerializer,
)
import json
from django.core.mail import send_mail
from django.http import JsonResponse
from django.views import View
from django.utils import timezone
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.utils.timezone import localtime
from datetime import timedelta
from uuid import uuid4
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .HelperFuntions import get_user_distance, get_user_distances, get_users_by_degree
from django.db.models import Q
import logging
from rest_framework.exceptions import ValidationError
from django.contrib.auth import get_user_model
from collections import OrderedDict, deque
from django.conf import settings
import time
from datetime import datetime

# from cryptography.fernet import Fernet
from hashids import Hashids
from django.http import Http404

logger = logging.getLogger(__name__)

# Hashids 초기화 (settings에서 키를 가져와 사용)
hashids = Hashids(salt=settings.SECRET_KEY_FERNET, min_length=8)


# 암호화 함수
def encrypt_id_short(id_value):
    return hashids.encode(id_value)


# 복호화 함수
def decrypt_id_short(encrypted_id):
    decoded = hashids.decode(encrypted_id)
    if len(decoded) == 0:
        raise ValueError("Invalid ID")
    return decoded[0]


class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer


from staff_emails import STAFF_EMAILS


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
                    <p>신뢰기반의 팀빌딩 플랫폼에 오신 걸 환영합니다.</p>
                    <p>팀블의 여러가지 기능들을 이용해보세요.</p>
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
                    <p>신뢰기반의 팀빌딩 플랫폼에 오신 걸 환영합니다.</p>
                    <p>팀블의 여러가지 기능들을 이용해보세요.</p>
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
        # 프론트엔드에서 보내온 inviter_id, experience_id 확인
        inviter_id = self.request.data.get("inviter_id")
        experience_id = self.request.data.get("experience_id")
        if inviter_id is None:
            raise ValueError("초대자 ID가 필요합니다.")
        if experience_id is None:
            raise ValueError("경험 ID가 필요합니다.")

        try:
            inviter = CustomUser.objects.get(id=inviter_id)
        except CustomUser.DoesNotExist:
            # 초대자가 존재하지 않을 경우 예외 처리
            raise ValueError("유효하지 않은 초대자 ID입니다.")

        try:
            experience = Experience.objects.get(id=experience_id)
        except Experience.DoesNotExist:
            raise ValueError("유효하지 않은 경험 ID입니다.")

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
                f"경험 {experience.title}을 통해 {invitee.profile.user_name}님이 팀블에 가입했습니다.\n"
                f"{invitee.profile.user_name}님의 프로필을 지금 확인해보세요!"
            ),
            notification_type="experience_register",
            related_user_id=invitee.id,
        ).exists():
            Notification.objects.create(
                user=inviter,
                message=(
                    f"경험 {experience.title}을 통해 {invitee.profile.user_name}님이 팀블에 가입했습니다.\n"
                    f"{invitee.profile.user_name}님의 프로필을 지금 확인해보세요!"
                ),
                notification_type="experience_register",
                related_user_id=invitee.id,
            )

        # 회원가입 축하 이메일 보내기 (가입자)
        email_body_1 = f"""
                    <p>안녕하세요. 팀블입니다.</p>
                    <br>
                    <p>신뢰기반의 팀빌딩 플랫폼에 오신 걸 환영합니다.</p>
                    <p>팀블의 여러가지 기능들을 이용해보세요.</p>
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
                        <p>경험 {experience.title}을 통해 {invitee.profile.user_name}님이 팀블에 가입했습니다.</p>
                        <p>{invitee.profile.user_name}님의 프로필을 지금 확인해보세요!</p>
                        <br>
                        <p>감사합니다. <br> 팀블 드림.</p>
                        <p><a href="{settings.TEAMBL_URL}" target="_blank" style="color: #3498db; text-decoration: none;">팀블 바로가기</a></p>
                        """
            send_mail(
                f"[Teambl] 경험 {experience.title}을 통해 {invitee.profile.user_name}님이 팀블에 가입했습니다.",
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
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    authentication_classes = []  # 인증 비활성화

    def get_object(self):
        if self.request.user.is_authenticated:
            # If the user is logged in, return the currently authenticated user
            return self.request.user
        else:
            # If the user is logged out, get the user by email from the request data
            email = self.request.data.get("email")
            if email:
                return get_object_or_404(CustomUser, email=email)
            else:
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
                {"detail": "Password is correct."}, status=status.HTTP_200_OK
            )
        else:
            return Response(
                {"detail": "Incorrect password."}, status=status.HTTP_400_BAD_REQUEST
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


class CurrentProfileView(generics.RetrieveAPIView):
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
            profile = get_object_or_404(Profile, user=user)
            print(
                f"User {self.request.user.id} is viewing the profile of user {userid}."
            )
            # 추가 권한 검사나 제한된 정보만 반환할 수 있음
            return profile


class ProfileUpdateView(generics.UpdateAPIView):
    queryset = Profile.objects.all()
    serializer_class = ProfileUpdateSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return Profile.objects.get(user=self.request.user)


class ProjectListCreate(generics.ListCreateAPIView):
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        return Project.objects.filter(user=self.request.user).order_by(
            "-created_at"
        )  # 현재 로그인된 사용자의 프로젝트만 반환

    def perform_create(self, serializer):
        keywords_data = self.request.data.getlist("keywords[]")
        images = self.request.FILES.getlist("images")
        contact_data = self.request.data.getlist("contacts[]")
        tagged_users_data = self.request.data.getlist("tagged_users[]")
        liked_users_data = self.request.data.getlist("liked_users[]")

        if serializer.is_valid():
            project = serializer.save(user=self.request.user)

            # 키워드 업데이트
            keyword_objs = []
            for keyword in keywords_data:
                keyword_obj, created = Keyword.objects.get_or_create(keyword=keyword)
                keyword_objs.append(keyword_obj)

            project.keywords.set(keyword_objs)  # ManyToMany 관계 설정

            # 이미지 업데이트
            for image in images:
                ProjectImage.objects.create(project=project, image=image)

            # Contact 생성
            for contact_info in contact_data:
                Contact.objects.create(project=project, contact_info=contact_info)

            # tagged_users 설정 및 Notification 생성
            tagged_users = []
            for user_id in tagged_users_data:
                try:
                    user = CustomUser.objects.get(id=user_id)
                    tagged_users.append(user)

                    # 동일한 알림이 있는지 확인
                    notification_exists = Notification.objects.filter(
                        user=user,
                        message=f"{self.request.user.profile.user_name}님이 당신을 {project.title} 게시물에 태그했습니다.",
                        notification_type="project_tag",
                        related_project_id=project.project_id,
                    ).exists()

                    if not notification_exists:
                        # Notification 생성
                        Notification.objects.create(
                            user=user,
                            message=f"{self.request.user.profile.user_name}님이 당신을 {project.title} 게시물에 태그했습니다.",
                            notification_type="project_tag",
                            related_project_id=project.project_id,
                        )
                except CustomUser.DoesNotExist:
                    continue

            project.tagged_users.set(tagged_users)  # ManyToMany 관계 설정

            # liked_users 설정
            liked_users = []
            for user_id in liked_users_data:
                try:
                    user = CustomUser.objects.get(id=user_id)
                    liked_users.append(user)
                except CustomUser.DoesNotExist:
                    continue

            project.liked_users.set(liked_users)  # liked_users 설정

            # 키워드 및 스킬 일치하는 profile.user 알림 생성
            matching_profiles = CustomUser.objects.filter(
                Q(profile__keywords__in=project.keywords.all())
                | Q(
                    profile__skills__skill__in=[
                        keyword.keyword for keyword in project.keywords.all()
                    ]
                )
            ).distinct()

            # 알림 메시지 포맷 정의
            notification_message = (
                f"당신이 흥미로워 할만한 {project.title} 게시물을 추천해드려요."
            )

            for profile_user in matching_profiles:
                # 동일한 프로젝트에 대한 정확한 메시지의 알림이 있는지 확인
                existing_notification = Notification.objects.filter(
                    user=profile_user,
                    message=notification_message,
                    notification_type="project_profile_keyword",
                    related_project_id=project.project_id,
                ).exists()

                # 중복 알림이 없을 때만 생성
                if not existing_notification:
                    Notification.objects.create(
                        user=profile_user,
                        message=notification_message,
                        notification_type="project_profile_keyword",
                        related_project_id=project.project_id,
                    )

        else:
            print(serializer.errors)


# 현재 로그인한 유저가 좋아요한 프로젝트를 얻는 view
class ProjectLikedListView(generics.ListAPIView):
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        user = self.request.user
        liked_projects = Project.objects.filter(likes__user=user).order_by(
            "-created_at"
        )
        return liked_projects


# 로그인 유저의 스킬 리스트를 보는 뷰
class SkillListView(generics.ListAPIView):
    serializer_class = SkillSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        user = self.request.user
        return Skill.objects.filter(profile=user.profile)


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


# Experience 특정 id 유저 리스트 뷰
class ExperienceByUserListView(generics.ListAPIView):
    serializer_class = ExperienceSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        # 특정 user_id를 받아서 Experience 필터링
        user_id = self.kwargs.get("user_id")
        if user_id is None:
            return Experience.objects.none()  # user_id가 없으면 빈 쿼리셋 반환

        # Experience.accepted_users에 user_id가 포함된 목록 필터링
        return Experience.objects.filter(accepted_users__id=user_id)


# Experience 특정 id 유저 리스트 뷰 (pending까지 포함)
class ExperienceByUserWithPendingListView(generics.ListAPIView):
    serializer_class = ExperienceSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        # 특정 user_id를 받아서 Experience 필터링
        user_id = self.kwargs.get("user_id")
        if user_id is None:
            return Experience.objects.none()  # user_id가 없으면 빈 쿼리셋 반환

        # 필터 조건:
        # 관계는 OR
        # 1. `accepted_users`에 포함된 유저
        # 2. `pending_invitations`에서 invitee가 user_id이고 status가 "pending"인 경우
        return Experience.objects.filter(
            Q(accepted_users__id=user_id)
            | Q(
                pending_invitations__invitee__id=user_id,
                pending_invitations__status="pending",
            )
        ).distinct()


# Experience 모든 유저 리스트 뷰
class ExperienceEveryListView(generics.ListAPIView):
    serializer_class = ExperienceSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        # 모든 Experience 반환
        return Experience.objects.all()


# Experience 생성 뷰
class ExperienceCreateView(generics.CreateAPIView):
    serializer_class = ExperienceSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        print("Request data:", request.data)  # 디버깅
        data = request.data.copy()
        inviter_profile = request.user.profile
        inviter = request.user

        # 본인의 ID를 accepted_users 필드에 추가
        if "accepted_users" not in data:
            data["accepted_users"] = [request.user.id]
        else:
            if request.user.id not in data["accepted_users"]:
                data["accepted_users"].append(request.user.id)

        # 경험 생성자를 creator로 설정
        # data["creator"] = request.user.id  # Note: Serializer에서 처리해야 함.

        # Serializer에 데이터 전달 및 context 추가 (여기서 creator 정보 serializer로 넘겨줌)
        serializer = self.get_serializer(data=data, context={"request": request})
        if not serializer.is_valid():
            print("Validation Errors:", serializer.errors)
        serializer.is_valid(raise_exception=True)
        experience = serializer.save()

        headers = self.get_success_headers(serializer.data)
        return Response(
            serializer.data, status=status.HTTP_201_CREATED, headers=headers
        )


# Experience 업데이트 뷰
# 임시로 새로운 태그 유저 초대, 기존 태그 유저 삭제에 따른 알림을 여기서 보내도록 함.
# TODO: 이후에는 새로운 태그 유저 초대는 ExperienceInvitationCreateView, 기존 태그 유저 삭제는 ExperienceAcceptedUsersUpdateView에서 진행함.
class ExperienceUpdateView(generics.UpdateAPIView):
    serializer_class = ExperienceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # 사용자가 소유자(creator)인 경험만 수정 가능.
        return Experience.objects.filter(creator=user).distinct()

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", True)  # 부분 업데이트 허용
        instance = self.get_object()
        data = request.data.copy()

        # 이전 상태 기록
        previous_accepted_users = set(
            instance.accepted_users.values_list("id", flat=True)
        )
        previous_pending_invitations = set(
            instance.pending_invitations.filter(status="pending").values_list(
                "invitee", flat=True
            )
        )

        # 데이터 업데이트
        serializer = self.get_serializer(instance, data=data, partial=partial)
        serializer.is_valid(raise_exception=True)
        experience = serializer.save()

        # 새로운 상태 기록
        new_accepted_users = set(experience.accepted_users.values_list("id", flat=True))
        new_pending_invitations = set(
            experience.pending_invitations.filter(status="pending").values_list(
                "invitee", flat=True
            )
        )

        # 변경 사항 계산
        removed_users = previous_accepted_users - new_accepted_users
        added_pending_invitations = (
            new_pending_invitations - previous_pending_invitations
        )
        removed_pending_invitations = (
            previous_pending_invitations - new_pending_invitations
        )

        # 알림 생성
        inviter = self.request.user
        inviter_profile = inviter.profile

        # 추가된 초대 알림
        for pending_invitation_id in added_pending_invitations:
            try:
                pending_invitation = ExperienceInvitation.objects.get(
                    id=pending_invitation_id
                )
                invitee = pending_invitation.invitee
                Notification.objects.create(
                    user=invitee,
                    message=f"{inviter_profile.user_name}님이 경험 {experience.title}에 당신을 태그했습니다.",
                    notification_type="experience_request",
                )
            except ExperienceInvitation.DoesNotExist:
                print(
                    f"ExperienceInvitation with ID {pending_invitation_id} does not exist."
                )
            except CustomUser.DoesNotExist:
                print(
                    f"Invitee does not exist for invitation ID {pending_invitation_id}."
                )

        # 삭제된 초대 알림 (취소된 초대)
        for pending_invitation_id in removed_pending_invitations:
            try:
                pending_invitation = ExperienceInvitation.objects.get(
                    id=pending_invitation_id
                )
                invitee = pending_invitation.invitee
                Notification.objects.get_or_create(
                    user=invitee,
                    message=f"{inviter_profile.user_name}님이 보낸 경험 {experience.title}의 태그가 취소되었습니다.",
                    notification_type="experience_invitation_deleted",
                    related_user_id=inviter.id,
                )
            except ExperienceInvitation.DoesNotExist:
                print(
                    f"ExperienceInvitation with ID {pending_invitation_id} does not exist."
                )
            except CustomUser.DoesNotExist:
                print(
                    f"Invitee does not exist for invitation ID {pending_invitation_id}."
                )

        # 삭제된 유저 알림 (수락 후 멤버에서 제거된 경우)
        for user_id in removed_users:
            try:
                user = CustomUser.objects.get(id=user_id)
                Notification.objects.create(
                    user=user,
                    message=f"당신이 경험 {experience.title}의 멤버에서 제외되었습니다.",
                    notification_type="experience_deleted",
                )
            except CustomUser.DoesNotExist:
                print(f"User with ID {user_id} does not exist.")

        return Response(serializer.data)


# Experience 삭제 뷰
class ExperienceDestroyView(generics.DestroyAPIView):
    serializer_class = ExperienceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Experience.objects.filter(accepted_users=user)

    def delete(self, request, *args, **kwargs):
        experience_id = kwargs.get("pk")
        user = request.user

        try:
            experience = Experience.objects.get(id=experience_id)
        except Experience.DoesNotExist:
            return Response(
                {"detail": "Experience with given ID does not exist."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # accepted_users에서 현재 유저를 제거
        experience.accepted_users.remove(user)

        # 해당 experience에 user의 experience_detail이 있다면 같이 제거
        # ExperienceDetail.objects.filter(experience=experience, user=user).delete()

        # accepted_users가 비어있는 경우, 경험을 삭제
        if experience.accepted_users.count() == 0:
            experience.delete()
            return Response(
                {"detail": "Experience deleted as it had no accepted_users left."},
                status=status.HTTP_204_NO_CONTENT,
            )

        # 만약 현재 user가 creator인 경우, 이후 초대된 유저로 creator 이관하기.
        if experience.creator_id == user.id:
            # 초대된 유저 중에서 수락된 유저 찾기
            try:
                oldest_invitation = ExperienceInvitation.objects.filter(
                    experience=experience, status="accepted"
                ).earliest("created_at")
            except ExperienceInvitation.DoesNotExist:
                oldest_invitation = None

            if oldest_invitation:
                # creator를 그 다음 경험에 초대된 유저로 변경
                experience.creator = oldest_invitation.invitee
            else:
                # 초대된 유저가 없으면 creator를 None으로 설정
                experience.creator = None

        # 변경된 경험을 저장
        experience.save()
        return Response(
            {"detail": "User removed from Experience."}, status=status.HTTP_200_OK
        )


# ExperienceDetail 리스트 뷰
class ExperienceDetailListView(generics.ListAPIView):
    serializer_class = ExperienceDetailSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        # 현재 로그인한 사용자가 포함된 모든 Experience Detail 반환
        user = self.request.user
        return ExperienceDetail.objects.filter(Q(user=user))


# ExperienceDetail 생성 뷰
class ExperienceDetailCreateView(generics.CreateAPIView):
    serializer_class = ExperienceDetailSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        user = request.user

        # Experience가 존재하는지 확인.
        experience_id = data.get("experience")
        if not experience_id:
            raise ValidationError({"detail": "Experience is required."})

        # 해당 Experience에 사용자의 ExperienceDetail 중복 여부 확인
        if ExperienceDetail.objects.filter(
            experience_id=experience_id, user=user
        ).exists():
            raise ValidationError(
                {
                    "detail": "ExperienceDetail for this Experience already exists for this user."
                }
            )

        data["user"] = user.id

        if "skills_used" not in data:
            data["skills_used"] = []
        if "tags" not in data:
            data["tags"] = []

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        experience_detail = serializer.save()

        return Response(serializer.data, status=status.HTTP_201_CREATED)


# ExperienceDetail 수정 뷰
class ExperienceDetailUpdateView(generics.UpdateAPIView):
    serializer_class = ExperienceDetailSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        현재 요청한 사용자의 ExperienceDetail만 필터링합니다.
        """
        user = self.request.user
        return ExperienceDetail.objects.filter(user=user)

    def update(self, request, *args, **kwargs):
        """
        부분 업데이트를 명시적으로 처리합니다.
        """
        partial = kwargs.pop("partial", True)  # 기본적으로 partial 업데이트 활성화
        instance = self.get_object()  # 업데이트 대상 객체 가져오기
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)


# ExperienceDetail 삭제 뷰
# class ExperienceDetailDestroyView(generics.DestroyAPIView):
#     """
#     전체 ExperienceDetail에서 특정 ID를 삭제하는 뷰
#     """

#     serializer_class = ExperienceDetailSerializer
#     permission_classes = [IsAuthenticated]

#     def get_queryset(self):
#         return ExperienceDetail.objects.all()


class ExperienceDetailDestroyView(generics.DestroyAPIView):
    """
    전체 ExperienceDetail에서 특정 ID를 삭제하는 뷰
    """

    serializer_class = ExperienceDetailSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ExperienceDetail.objects.all()

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()  # 삭제할 객체 가져오기

        # 삭제 작업 전에 필요한 데이터를 저장
        deleted_user = instance.user  # 경험에서 제거된 유저
        experience = instance.experience  # 관련 경험 정보

        # 실제 삭제 작업 수행
        self.perform_destroy(instance)

        # 알림 생성
        # Notification.objects.get_or_create(
        #     user=deleted_user,
        #     message=f"당신이 경험 {experience.title}의 멤버에서 제외되었습니다.",
        #     notification_type="experience_deleted",
        #     related_user_id=deleted_user.id,
        # )

        # 삭제 후 응답 반환
        return Response(
            {"message": "ExperienceDetail has been deleted and notification sent."},
            status=status.HTTP_204_NO_CONTENT,
        )


# 경험 초대(태그) 생성 뷰
class ExperienceInvitationCreateView(generics.CreateAPIView):
    """
    경험 초대를 생성하는 뷰

    입력:
        experience_id: 초대할 경험의 id
        invitee_id: 초대할 사람의 id

    출력:
        Reponse
    """

    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        user = request.user  # 현재 로그인한 유저 (inviter)
        inviter = user
        data = request.data

        # 입력 데이터에서 experience_id와 invitee_id 가져오기
        experience_id = data.get("experience_id")
        invitee_id = data.get("invitee_id")

        print(f"experience_id: {experience_id}, invitee_id: {invitee_id}")

        if not experience_id or not invitee_id:
            print("Error: Missing experience_id or invitee_id")
            return Response(
                {"detail": "Both experience_id and invitee_id are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            # Experience 가져오기
            experience = Experience.objects.get(id=experience_id)
        except Experience.DoesNotExist:
            print("Error: Experience not found")
            return Response(
                {"detail": "Experience not found."}, status=status.HTTP_404_NOT_FOUND
            )

        # 초대자가 경험의 관리자(creator)인 경우에만 초대 가능.
        print(f"experience creator: {experience.creator}, user: {user}")
        if not experience.creator == user:
            print("Error: User is not the creator of the experience")
            return Response(
                {"detail": "관리지만 경험 초대를 진행할 수 있습니다."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            # 초대받을 유저 (invitee) 가져오기
            invitee = CustomUser.objects.get(id=invitee_id)
        except CustomUser.DoesNotExist:
            print("Error: Invitee user not found")
            return Response(
                {"detail": "Invitee user not found."}, status=status.HTTP_404_NOT_FOUND
            )

        # 초대 중복 확인
        if experience.pending_invitations.filter(
            invitee=invitee, status="pending"
        ).exists():
            print("Error: Duplicate invitation detected")
            return Response(
                {"detail": "This user has already been invited to this experience."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ExperienceInvitation 생성
        invitation = ExperienceInvitation.objects.create(
            experience=experience,
            inviter=inviter,  # 현재 로그인한 유저가 inviter
            invitee=invitee,
            status="pending",
        )
        print(f"Experience Invitation Created: inviter:{inviter}, invitee: {invitee}")

        # 초대한 유저에게 알림 생성
        # 디버깅 출력
        Notification.objects.create(
            user=invitee,
            message=f"{inviter.profile.user_name}님이 경험 {experience.title}에 당신을 태그했습니다.",
            notification_type="experience_request",
        )

        return Response(
            {
                "detail": "Experience invitation created successfully.",
                "invitation_id": invitation.id,
            },
            status=status.HTTP_201_CREATED,
        )


# 경험 accepted_users에서 태그 유저 삭제 뷰 (현재 프론트에서 사용 안되는것 같음)
class ExperienceAcceptedUsersUpdateView(generics.UpdateAPIView):
    """
    PATCH 요청을 통해 경험에서 특정 유저를 태그 리스트에서 삭제

    경험에서 태그 리스트에서 특정 태그를 삭제
    해당 경험의 관리자(creator)만 삭제 가능

    입력:
        {
            "deleted_user_id": int
        }

    출력:
        {
            "detail": str
        }
    """

    queryset = Experience.objects.all()
    serializer_class = ExperienceSerializer
    permission_classes = [IsAuthenticated]

    def patch(self, request, *args, **kwargs):
        experience_id = kwargs.get("pk")
        deleted_user_id = request.data.get("deleted_user_id")

        if not deleted_user_id:
            return Response(
                {"detail": "삭제할 유저 ID가 필요합니다."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # 객체 가져오기
        experience = get_object_or_404(Experience, id=experience_id)
        deleted_user = get_object_or_404(CustomUser, id=deleted_user_id)

        # 현재 유저가 관리자(creator)인지 확인
        if experience.creator != request.user:
            return Response(
                {"detail": "경험 태그를 수정할 권한이 없습니다."},
                status=status.HTTP_403_FORBIDDEN,
            )

        # 태그 리스트에서 유저 제거
        if deleted_user in experience.accepted_users.all():
            experience.accepted_users.remove(deleted_user)

            # 제거된 유저에게 알림 생성
            Notification.objects.get_or_create(
                user=deleted_user,
                message=f"당신이 경험 {experience.title}의 멤버에서 제외되었습니다.",
                notification_type="experience_deleted",
                related_user_id=deleted_user.id,
            )

            return Response(
                {"detail": "경험 초대가 성공적으로 삭제되었습니다."},
                status=status.HTTP_200_OK,
            )
        else:
            return Response(
                {"detail": "해당 유저는 태그 리스트에 포함되지 않았습니다."},
                status=status.HTTP_404_NOT_FOUND,
            )


# 경험 초대(태그) 삭제 뷰
class ExperienceInvitationDeleteView(generics.DestroyAPIView):
    """
    경험 초대 삭제
    해당 경험 초대의 초대자(inviter)만 삭제 가능

    입력:
        {
            "experience_invitation_id": int
        }

    출력:
        {
            "detail": str
        }
    """

    permission_classes = [IsAuthenticated]

    def delete(self, request, experience_invitation_id, *args, **kwargs):
        # 객체를 안전하게 가져오기 (404 처리 포함)
        experience_invitation = get_object_or_404(
            ExperienceInvitation, id=experience_invitation_id
        )

        # 초대자가 현재 사용자와 일치하는지 확인
        if experience_invitation.inviter != request.user:
            return Response(
                {"detail": "해당 초대를 삭제할 권한이 없습니다."},
                status=status.HTTP_403_FORBIDDEN,
            )

        if not experience_invitation.invitee or not experience_invitation.inviter:
            return Response(
                {"detail": "초대 데이터가 유효하지 않습니다."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # 초대 삭제
        experience_invitation.delete()

        try:
            Notification.objects.get_or_create(
                user=experience_invitation.invitee,
                message=f"{experience_invitation.inviter.profile.user_name}님이 보낸 경험 {experience_invitation.experience.title}의 태그가 취소되었습니다.",
                notification_type="experience_invitation_deleted",
                related_user_id=experience_invitation.inviter.id,
            )
            print(f"경험 취소 알림 생성 완료 {experience_invitation.invitee}")
        except Exception as e:
            # 로깅 또는 추가 에러 핸들링
            return Response(
                {"detail": "알림 생성 중 오류가 발생했습니다."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        return Response(
            {"detail": "경험 초대가 성공적으로 삭제되었습니다."},
            status=status.HTTP_200_OK,
        )


# 경험 초대(태그) 수락/거절 뷰
class ExperienceInvitationResponseView(generics.GenericAPIView):
    """
    경험 초대 응답 (수락/거절)

    입력:
        {
            "experience_id": int,
            "response": "accept" or "reject"
        }
    출력:
        {
            "detail": "Experience invitation accepted." or "Experience invitation rejected."
        }
    """

    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        user = request.user
        invitee = user
        data = request.data

        response = data.get("response")  # 'accept' 또는 'reject' 기대
        experience_id = data.get("experience_id")

        if not experience_id or not response:
            return Response(
                {"detail": "Both experience_id and response are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # 유효한 reponse인지 확인.
        if response not in ["accept", "reject"]:
            return Response(
                {"detail": "Invalid response."}, status=status.HTTP_400_BAD_REQUEST
            )

        try:
            experience = Experience.objects.get(id=experience_id)
        except Experience.DoesNotExist:
            return Response(
                {"detail": "Experience not found."}, status=status.HTTP_404_NOT_FOUND
            )

        # 해당 유저가 pending 상태인지 확인
        invitation = experience.pending_invitations.filter(
            invitee=user, experience=experience, status="pending"
        ).first()
        if not invitation:
            return Response(
                {"detail": "User is not in pending state for this experience."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # 초대 정보를 통해 초대한 유저 가져오기
        inviter = invitation.inviter

        if response == "accept":
            # 초대한 유저(inviter)의 experience_detail 데이터를 복사해서 생성
            experience_detail = experience.details.filter(user=inviter).first()
            print("inviter's experience detail", experience_detail)

            if experience_detail:
                # 참고할 Experience detail이 있는 경우
                new_experience_detail = ExperienceDetail.objects.create(
                    experience=experience,
                    user=user,
                    description=experience_detail.description,
                    start_date=experience_detail.start_date,
                    end_date=experience_detail.end_date,
                )
                # Many-to-Many 필드(tags) 설정
                new_experience_detail.tags.set(experience_detail.tags.all())
            else:
                # 참고할 Experience detail이 없는 경우
                new_experience_detail = ExperienceDetail.objects.create(
                    experience=experience,
                    user=user,
                    description="",
                    start_date=None,
                    end_date=None,
                )

            # 유저를 accepted_users에 추가하고 pending_invitations에서 해당 초대를 제거
            experience.accepted_users.add(user)
            experience.save()

            # 초대 상태를 'accepted'로 변경
            invitation.status = "accepted"
            invitation.save()

            # 경험 초대자에게 알림 생성
            Notification.objects.get_or_create(
                user=inviter,
                message=f"{user.profile.user_name}님이 경험 {experience.title}의 참여 요청을 수락했습니다.",
                notification_type="experience_accept",
                related_user_id=user.id,
            )

            # 초대자와 유저와 1촌 관계 형성 또는 업데이트
            Friend.create_or_replace_friendship(
                from_user=inviter, to_user=invitee, status="accepted"
            )

            # 초대자와 새 유저의 one_degree_count 업데이트
            update_profile_one_degree_count(inviter)
            update_profile_one_degree_count(invitee)

            return Response(
                {"detail": "Experience invitation accepted."}, status=status.HTTP_200_OK
            )
        elif response == "reject":
            # 초대 상태를 'rejected'로 변경
            invitation.status = "rejected"
            invitation.save()

            # 경험 초대자에게 알림 생성
            Notification.objects.get_or_create(
                user=inviter,
                message=f"{user.profile.user_name}님이 경험 {experience.title}의 참여 요청을 거절했습니다.",
                notification_type="experience_accept",
                related_user_id=user.id,
            )

            return Response(
                {"detail": "Experience invitation rejected."}, status=status.HTTP_200_OK
            )
        else:
            return Response(
                {"detail": "Invalid response."}, status=status.HTTP_400_BAD_REQUEST
            )


class ExperienceInvitationListView(generics.ListAPIView):
    """
    현재 로그인한 유저가 받은 초대 목록 반환
    """

    serializer_class = ExperienceInvitationSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        # 현재 요청한 유저가 받은 초대만 필터링
        user = self.request.user
        return ExperienceInvitation.objects.filter(invitee=user)


class ExperienceLinkView(generics.RetrieveAPIView):
    """
    사용자 ID와 경험 ID를 입력으로 받아 ExperienceDetail ID를 암호화하고
    고유 링크를 생성하여 반환하는 View.

    입력:
        user_id
        experience_id

    출력:
        encrypted_id
    """

    permission_classes = [IsAuthenticated]  # 인증된 사용자만 접근 가능

    def get(self, request, *args, **kwargs):
        user_id = self.kwargs.get("user_id")  # URL에서 사용자 ID 가져오기
        experience_id = self.kwargs.get("experience_id")  # URL에서 경험 ID 가져오기

        try:
            # Experience와 CustomUser 가져오기
            experience = Experience.objects.get(id=experience_id)
            user = CustomUser.objects.get(id=user_id)

            # # 초대 링크 생성은 Creator만 가능
            # if user != experience.creator:
            #     return Response(
            #         {"error": "경험 초대 링크 생성은 creator만 가능합니다."},
            #         status=status.HTTP_404_NOT_FOUND,
            #     )

            # ExperienceDetail 가져오기
            experience_detail = ExperienceDetail.objects.filter(
                user=user, experience=experience
            ).first()

            # 참고할 ExperienceDetail이 없는 경우
            if not experience_detail:
                print("초대자의 Experience Detail이 없기 떄문에, 기본값으로 하나 생성.")
                experience_detail = ExperienceDetail.objects.create(
                    experience=experience,
                    user=user,
                    description="",
                    start_date=None,
                    end_date=None,
                )

            # ExperienceDetail ID를 암호화
            encrypted_experience_detail_id = encrypt_id_short(experience_detail.id)

            return Response(
                {
                    "link": f"{settings.TEAMBL_URL}experience/welcome/{encrypted_experience_detail_id}/"
                },
                status=200,
            )

        except Experience.DoesNotExist:
            return Response({"error": "Experience not found."}, status=404)
        except CustomUser.DoesNotExist:
            return Response({"error": "User not found."}, status=404)
        except Exception as e:
            return Response({"error": str(e)}, status=500)


class ExperienceDetailFromLinkView(generics.RetrieveAPIView):
    """
    암호화된 ExperienceDetail ID를 받아서 해당 데이터 반환

    입력:
        encrypted_id

    출력:
        experience (ExperienceSerializer로 직렬화된 데이터)
        user (CustomUserSerializer로 직렬화된 데이터)
    """

    permission_classes = [AllowAny]
    authentication_classes = []  # 인증 비활성화

    def get(self, request, *args, **kwargs):
        encrypted_id = self.kwargs.get("encrypted_id")  # 암호화된 ID를 URL에서 가져옴

        try:
            # ExperienceDetail ID 복호화
            experience_detail_id = decrypt_id_short(encrypted_id)

            # ExperienceDetail 가져오기
            experience_detail = ExperienceDetail.objects.select_related(
                "experience", "user"
            ).get(id=experience_detail_id)

            # Experience와 User를 각각 직렬화
            experience_serializer = ExperienceSerializer(experience_detail.experience)
            user_serializer = CustomUserSerializer(experience_detail.user)

            # JSON 응답 반환
            return Response(
                {
                    "experience": experience_serializer.data,
                    "user": user_serializer.data,
                },
                status=200,
            )

        except ExperienceDetail.DoesNotExist:
            return Response({"error": "ExperienceDetail not found."}, status=404)
        except ValueError:
            return Response({"error": "Invalid ID."}, status=400)
        except Exception as e:
            return Response({"error": str(e)}, status=500)


class ExperienceAfterInvitationView(generics.RetrieveAPIView):
    """
    온/오프라인 경험 초대를 받은 유저가 로그인/회원가입 후에 해당 경험 및 경험 상세를 추가하는 뷰
    1촌 관계인지 확인 후, 1촌 관계가 아직 아니라면 1촌 관계 추가하기.

    Input:
        encrypted_id

    Output:
        None
    """

    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        encrypted_id = self.kwargs.get("encrypted_id")  # 암호화된 ID를 URL에서 가져옴

        # ExperienceDetail ID 복호화
        experience_detail_id = decrypt_id_short(encrypted_id)

        # 현재 유저 가져오기
        user = request.user

        # 경험 세부 정보를 가져오기
        experience_detail = get_object_or_404(ExperienceDetail, id=experience_detail_id)

        # 초대자, 초대 받은 사람 설정
        invitee = user
        inviter = experience_detail.user

        # 경험 정보 가져오기
        experience = get_object_or_404(Experience, id=experience_detail.experience_id)

        # 초대한 유저와 동일한 경험의 세부 사항을 기반으로 새로 생성 (tags, skills_used 제외)
        new_experience_detail = ExperienceDetail.objects.create(
            experience=experience,
            user=user,  # 현재 요청한 유저를 새로 생성된 detail의 유저로 설정
            description=experience_detail.description,
            start_date=experience_detail.start_date,
            end_date=experience_detail.end_date,
        )
        # Many-to-Many 필드(tags) 설정
        new_experience_detail.tags.set(experience_detail.tags.all())

        # 현재 유저를 해당 경험의 accepted_users에 추가
        experience.accepted_users.add(user)
        experience.save()

        # 1촌 관계로 생성 또는 업데이트하기
        Friend.create_or_replace_friendship(
            from_user=invitee, to_user=inviter, status="accepted"
        )

        return Response(
            {"detail": "success for adding invited experience"},
            status=status.HTTP_200_OK,
        )


# User가 Project에 Like를 눌렀는지 확인하는 View
class ProjectLikedStatusView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        project_id = self.kwargs.get("project_id")
        project = get_object_or_404(Project, pk=project_id)
        user = request.user

        # Check if the user has liked this project
        liked = Like.objects.filter(user=user, project=project).exists()

        return Response({"liked": liked})


# 특정 Project에 태그된 유저들을 보여주는 View
class ProjectTaggedUsersListView(generics.ListAPIView):
    serializer_class = CustomUserSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        project_id = self.kwargs["project_id"]
        try:
            project = Project.objects.get(pk=project_id)
        except Project.DoesNotExist:
            raise NotFound(detail="Project not found.")
        return project.tagged_users.all()


# 특정 프로젝트를 가져오는 View
@method_decorator(csrf_exempt, name="dispatch")
class ProjectRetrieveView(generics.RetrieveAPIView):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [AllowAny]
    authentication_classes = []


# 모든 User의 Project를 보여주는 View
class ProjectEveryListCreate(generics.ListCreateAPIView):
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        return Project.objects.all().order_by("-created_at")

    def perform_create(self, serializer):
        keywords_data = self.request.data.getlist("keywords[]")  # 배열로 키워드 처리
        images = self.request.FILES.getlist("images")  # 다중 이미지 처리
        contact_data = self.request.data.getlist("contacts[]")
        liked_users_data = self.request.data.getlist("liked_users[]")

        if serializer.is_valid():
            project = serializer.save(user=self.request.user)

            # 키워드 업데이트
            keyword_objs = []
            for keyword in keywords_data:
                keyword_obj, created = Keyword.objects.get_or_create(keyword=keyword)
                keyword_objs.append(keyword_obj)

            project.keywords.set(keyword_objs)  # ManyToMany 관계 설정

            # 이미지 업데이트
            for image in images:
                ProjectImage.objects.create(project=project, image=image)

            # Create Contact instances
            for contact_info in contact_data:
                Contact.objects.create(project=project, contact_info=contact_info)

            # liked_users 설정
            liked_users = []
            for user_id in liked_users_data:
                try:
                    user = CustomUser.objects.get(id=user_id)
                    liked_users.append(user)
                except CustomUser.DoesNotExist:
                    continue

            project.liked_users.set(liked_users)  # liked_users 필드에 사용자 추가

        else:
            print(serializer.errors)


# 프로젝트 수정 뷰
class ProjectUpdateView(generics.UpdateAPIView):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_update(self, serializer):
        keywords_data = self.request.data.getlist("keywords[]")
        images = self.request.FILES.getlist("images")
        contact_data = self.request.data.getlist("contacts[]")
        tagged_users_data = self.request.data.getlist("tagged_users[]")
        liked_users_data = self.request.data.getlist("liked_users[]")

        # 삭제할 이미지 ID 리스트를 요청에서 받음
        images_to_delete = self.request.data.getlist("images_to_delete[]")

        # Project 인스턴스를 먼저 업데이트
        project = serializer.save()

        # 키워드를 업데이트
        keyword_objs = []
        for keyword in keywords_data:
            keyword_obj, created = Keyword.objects.get_or_create(keyword=keyword)
            keyword_objs.append(keyword_obj)

        project.keywords.set(keyword_objs)  # ManyToMany 관계 설정

        # 기존 이미지 삭제
        if images_to_delete:
            for image_id in images_to_delete:
                try:
                    image = ProjectImage.objects.get(id=image_id, project=project)
                    image.delete()  # 이미지 삭제
                except ProjectImage.DoesNotExist:
                    pass  # 해당 이미지가 없으면 그냥 넘어감

        # 중복 방지를 위해 새로 추가된 이미지가 있을 때만 저장
        if images:
            for image in images:
                # 이미지가 중복되지 않도록 체크한 후 추가
                if not ProjectImage.objects.filter(
                    project=project, image=image
                ).exists():
                    ProjectImage.objects.create(project=project, image=image)

        # 연락처 정보 업데이트
        project.contacts.all().delete()  # 기존 연락처 삭제
        for contact_info in contact_data:
            Contact.objects.create(project=project, contact_info=contact_info)

        # liked_users 업데이트
        if liked_users_data:
            liked_users = CustomUser.objects.filter(id__in=liked_users_data)
            project.liked_users.set(liked_users)  # liked_users 업데이트

        # tagged_users 업데이트
        if tagged_users_data:
            # 현재 프로젝트의 기존 tagged_users 가져오기
            current_tagged_users = set(
                project.tagged_users.values_list("id", flat=True)
            )
            new_tagged_users_data = set(map(int, tagged_users_data))

            # 새롭게 추가된 tagged_users 추출
            added_tagged_users = new_tagged_users_data - current_tagged_users
            tagged_users_objs = CustomUser.objects.filter(id__in=new_tagged_users_data)
            project.tagged_users.set(tagged_users_objs)
            print("added tagged users:", added_tagged_users)

            # 알림 생성
            for user_id in added_tagged_users:
                try:
                    user = CustomUser.objects.get(id=user_id)

                    # 동일한 알림이 있는지 확인
                    notification_exists = Notification.objects.filter(
                        user=user,
                        notification_type="project_tag",
                        related_project_id=project.project_id,
                    ).exists()

                    if not notification_exists:
                        # 알림 생성
                        Notification.objects.create(
                            user=user,
                            message=f"{self.request.user.profile.user_name}님이 당신을 {project.title} 게시물에 태그했습니다.",
                            notification_type="project_tag",
                            related_project_id=project.project_id,
                        )
                except CustomUser.DoesNotExist:
                    print("doesn't exist")
                    continue

        # 키워드 및 스킬 일치하는 profile.user 알림 생성
        matching_profiles = CustomUser.objects.filter(
            Q(profile__keywords__in=project.keywords.all())
            | Q(
                profile__skills__skill__in=[
                    keyword.keyword for keyword in project.keywords.all()
                ]
            )
        ).distinct()

        # 알림 메시지 포맷 정의
        notification_message = (
            f"당신이 흥미로워 할만한 {project.title} 게시물을 추천해드려요."
        )

        for profile_user in matching_profiles:
            # 동일한 프로젝트에 대한 정확한 메시지의 알림이 있는지 확인
            existing_notification = Notification.objects.filter(
                user=profile_user,
                message=notification_message,
                notification_type="project_profile_keyword",
                related_project_id=project.project_id,
            ).exists()

            # 중복 알림이 없을 때만 생성
            if not existing_notification:
                Notification.objects.create(
                    user=profile_user,
                    message=notification_message,
                    notification_type="project_profile_keyword",
                    related_project_id=project.project_id,
                )

        project.save()


class ProjectDelete(generics.DestroyAPIView):
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Project.objects.filter(user=user)  # user가 user인 project만 필터


# class ProjectLikeToggleView(generics.GenericAPIView):
#     permission_classes = [IsAuthenticated]

#     def post(self, request, *args, **kwargs):
#         project_id = kwargs.get("project_id")
#         project = get_object_or_404(Project, pk=project_id)
#         user = request.user


#         # 사용자가 이미 좋아요를 눌렀는지 확인
#         if project.liked_users.filter(id=user.id).exists():
#             # 이미 좋아요를 눌렀다면 좋아요를 취소하고 `liked_users`에서 제거
#             project.liked_users.remove(user)
#             project.like_count -= 1
#             project.save()
#             return Response(
#                 {"message": "Project unliked", "like_count": project.like_count},
#                 status=status.HTTP_200_OK,
#             )
#         else:
#             # 좋아요를 처음 눌렀다면 `liked_users`에 추가
#             project.liked_users.add(user)
#             project.like_count += 1
#             project.save()
#             return Response(
#                 {"message": "Project liked", "like_count": project.like_count},
#                 status=status.HTTP_200_OK,
#             )
class ProjectLikeToggleView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        project_id = kwargs.get("project_id")
        project = get_object_or_404(Project, pk=project_id)
        user = request.user

        # Like 객체 생성 또는 존재 여부 확인
        like, created = Like.objects.get_or_create(user=user, project=project)

        if created:
            # 좋아요가 새로 눌렸을 때 - Like 객체 생성 및 liked_users에 사용자 추가
            project.liked_users.add(user)
            project.like_count += 1
            message = "Project liked"
        else:
            # 좋아요가 이미 눌려져 있을 때 - Like 객체 삭제 및 liked_users에서 사용자 제거
            like.delete()
            project.liked_users.remove(user)
            project.like_count -= 1
            message = "Project unliked"

        # 프로젝트 정보 저장
        project.save()

        # 응답 반환
        return Response(
            {"message": message, "like_count": project.like_count},
            status=status.HTTP_200_OK,
        )


class KeywordListView(generics.ListAPIView):
    serializer_class = KeywordSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None
    queryset = Keyword.objects.all()


@method_decorator(csrf_exempt, name="dispatch")
class SendCodeView(View):
    def post(self, request, *args, **kwargs):
        try:
            data = json.loads(request.body)
            email = data.get("email")
            code = data.get("code")
        except (json.JSONDecodeError, KeyError):
            return JsonResponse({"error": "Invalid JSON data"}, status=400)

        if not email or not code:
            return JsonResponse({"error": "Email and code are required"}, status=400)

        email_body = f"""
                    <p>안녕하세요. 팀블입니다.</p>
                    <p>인증코드는 다음과 같습니다:</p>
                    <p style="font-size: 20px; font-weight: bold; color: #2c3e50;">{code}</p>
                    <p>만약 인증코드를 요청하지 않으셨다면, 이 이메일을 무시하셔도 됩니다.</p>
                    <br>
                    <p>감사합니다. <br> 팀블 드림.</p>
                    <p><a href="{settings.TEAMBL_URL}" target="_blank" style="color: #3498db; text-decoration: none;">팀블 바로가기</a></p>
                    """
        send_mail(
            "[Teambl] 인증코드",
            "",  # 텍스트 메시지는 사용하지 않음.
            "info@teambl.net",
            [email],
            fail_silently=False,
            html_message=email_body,  # HTML 형식 메시지 추가
        )

        return JsonResponse({"message": "Verification code sent"}, status=200)


@method_decorator(csrf_exempt, name="dispatch")
class SendEmailView(View):
    def post(self, request, *args, **kwargs):
        try:
            data = json.loads(request.body)
            title = data.get("title")
            to_email = data.get("to_email")
            body = data.get("body")
        except (json.JSONDecodeError, KeyError):
            return JsonResponse({"error": "Invalid JSON data"}, status=400)

        if not title or not to_email or not body:
            return JsonResponse(
                {"error": "제목, 수신자, 내용이 누락되었습니다."}, status=400
            )

        send_mail(
            f"{title}",  # 이메일 제목
            f"{body}",  # 이메일 본문
            "info@teambl.net",  # 발신자 이메일 주소
            [to_email],  # 수신사 이메일 주소 목록
            fail_silently=False,  # 에러 발생 시 예외 발생 여부
        )

        return JsonResponse({"message": "메일 전송 성공"}, status=200)


@method_decorator(csrf_exempt, name="dispatch")
class SendInquiryEmailView(View):
    def post(self, request, *args, **kwargs):
        try:
            data = json.loads(request.body)
            from_email = data.get("from_email")
            body = data.get("body")
        except (json.JSONDecodeError, KeyError):
            return JsonResponse({"error": "Invalid JSON data"}, status=400)

        if not from_email or not body:
            return JsonResponse({"error": "Email and code are required"}, status=400)

        send_mail(
            "문의 메일",  # 이메일 제목
            f"From: {from_email}\n\n{body}",  # 이메일 본문
            "info@teambl.net",  # 발신자 이메일 주소
            ["info@teambl.net"],  # 수신사 이메일 주소 목록
            fail_silently=False,  # 에러 발생 시 예외 발생 여부
        )

        return JsonResponse({"message": "문의 메일 전송 성공"}, status=200)


class InvitationLinkList(generics.ListAPIView):
    serializer_class = InvitationLinkSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        invitee_id = self.request.query_params.get("invitee_id", None)

        if (
            invitee_id
        ):  # invitee_id가 unique하므로, inviter 조건 없이 invitee_id로만 필터링
            queryset = InvitationLink.objects.filter(invitee_id=invitee_id)
        else:
            queryset = InvitationLink.objects.filter(
                inviter=self.request.user
            )  # invitee_id가 없는 경우 로그인한 user가 초대한 링크들 반환

        print(f"Fetching InvitationLinks for invitee_id: {invitee_id}")
        print(f"Queryset: {queryset}")

        return queryset


class CreateInvitationLinkView(generics.CreateAPIView):
    serializer_class = InvitationLinkSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request):
        unique_code = str(uuid4())
        name = request.data.get("name", "")
        invitee_email = request.data.get("invitee_email", None)

        invitation_link = InvitationLink.objects.create(
            inviter=request.user,
            invitee_name=name,
            invitee_id=None,
            link=f"{settings.TEAMBL_URL}welcome?code={unique_code}",
        )

        return Response(
            {
                "id": invitation_link.id,
                "inviter": invitation_link.inviter.id,
                "invitee_name": invitation_link.invitee_name,
                "invitee_id": invitation_link.invitee_id,
                "link": invitation_link.link,
                "created_at": invitation_link.created_at,
                "status": invitation_link.status,
            },
            status=201,
        )


class WelcomeView(generics.GenericAPIView):
    permission_classes = [AllowAny]
    authentication_classes = []  # 인증 비활성화

    def get(self, request):
        code = request.query_params.get("code", None)
        logger.debug(f"Received request with code: {code}")  # 로그 추가

        if code:
            try:
                # code로 InvitationLink 객체를 찾기
                invite_link = InvitationLink.objects.get(link__endswith=code)
                inviter_name = invite_link.inviter.profile.user_name
                invitee_name = invite_link.invitee_name

                logger.debug(
                    f"Found InvitationLink: inviter={inviter_name}, invitee={invitee_name}"
                )  # 로그 추가

                # 만료 날짜 계산
                expired_date = invite_link.created_at + timezone.timedelta(days=7)
                current_date = timezone.now()

                # 초대 링크가 만료된 경우
                if current_date > expired_date:
                    invite_link.status = "expired"
                    invite_link.save()
                    logger.warning(f"Invitation link expired: code={code}")  # 로그 추가

                    # 초대 링크 만료 알림 생성
                    Notification.objects.create(
                        user=invite_link.inviter,
                        message=f"내가 초대한 {invitee_name}님의 초대 링크가 만료됐습니다.\n초대 링크를 다시 생성해주세요!",
                        notification_type="invitation_expired",
                    )
                    return Response(
                        {
                            "message": "Invitation link is expired",
                            "error_type": "expired",
                        },
                        status=400,
                    )

                # 초대 링크가 이미 사용되었는지 확인
                if invite_link.status == "accepted":
                    logger.warning(
                        f"Invitation link already used: code={code}"
                    )  # 로그 추가
                    return Response(
                        {"message": "Invitation link already used"}, status=400
                    )

                # 성공적으로 초대 링크 반환
                logger.info(
                    f"Invitation link valid: code={code}, inviter={inviter_name}, invitee={invitee_name}"
                )  # 로그 추가
                return Response(
                    {
                        "inviter_name": inviter_name,
                        "invitee_name": invitee_name,
                    }
                )
            except InvitationLink.DoesNotExist:
                logger.warning(f"Invalid invitation code: {code}")  # 로그 추가
                return Response(
                    {"message": "Invalid invitation code.", "error_type": "invalid"},
                    status=400,
                )
            except Exception as e:
                logger.error(
                    f"Error processing invitation link: {str(e)}"
                )  # 오류 로그 추가
                return Response(
                    {
                        "message": "An error occurred while processing the invitation link.",
                        "error_type": "unknown",
                    },
                    status=500,
                )
        else:
            logger.warning("Invalid invitation code provided")  # 로그 추가
            return Response(
                {"message": "Invalid invitation code.", "error_type": "invalid"},
                status=400,
            )


class InvitationLinkDelete(generics.DestroyAPIView):
    serializer_class = InvitationLinkSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return InvitationLink.objects.filter(inviter=user)


# Friend가 변경될 때 (create, update, delete) Profile 모델의 1촌 수도 같이 업데이트 해주는 함수.
def update_profile_one_degree_count(user):
    profile = user.profile  # User를 통해 Profile에 접근
    profile.one_degree_count = Friend.objects.filter(
        Q(from_user=user) | Q(to_user=user), status="accepted"
    ).count()
    profile.save()


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


class GetUserDistanceAPIView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]

    def retrieve(self, request, *args, **kwargs):
        user = request.user
        target_user_id = kwargs.get("pk")
        try:
            target_user = CustomUser.objects.get(id=target_user_id)
        except CustomUser.DoesNotExist:
            return Response(
                {"error": "Target user not found."}, status=status.HTTP_404_NOT_FOUND
            )

        distance = get_user_distance(user, target_user)
        return Response({"distance": distance}, status=status.HTTP_200_OK)


class SearchUsersAPIView(generics.ListAPIView):
    serializer_class = CustomUserSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = PageNumberPagination

    # 변수를 쿼리가 아닌 JSON 형식으로 전달받기 위해 POST 요청으로 변경
    # GET 요청 시 쿼리를 포함한 url이 너무 길어져서 반려.
    def post(self, request, *args, **kwargs):
        serializer = UserSearchSerializer(data=request.data)
        user = self.request.user

        # 데이터 유효성 검증 (Serializer Validity)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        query = serializer.validated_data.get("q", "")
        degrees = serializer.validated_data.get("degree", [])
        majors = serializer.validated_data.get("majors", [])

        print("query: ", query)
        print("degrees: ", degrees)
        print("majors: ", majors)

        # 오늘의 날짜와 이번 주 월요일 날짜 계산
        today = timezone.now().date()
        monday = today - timedelta(days=today.weekday())

        # 현재 사용자의 프로필을 제외한 전체 프로필을 가져옵니다.
        filtered_profiles = Profile.objects.exclude(user=user)

        # 1. 검색 쿼리로 필터링
        if query != "":
            filtered_profiles = filtered_profiles.filter(
                Q(keywords__keyword__icontains=query)  # 키워드 필터링
                | Q(user_name__icontains=query)  # 이름 필터링
                | Q(school__icontains=query)  # 학교 필터링
                | Q(current_academic_degree__icontains=query)  # 학력 필터링
                | Q(major1__icontains=query)  # 전공1 필터링
                | Q(major2__icontains=query)  # 전공2 필터링
            ).distinct()  # distinct로 중복된 결과값 삭제
        print("After query: ", filtered_profiles)

        # 2. 전공 필터링
        if majors:
            filtered_profiles = filtered_profiles.filter(
                Q(major1__in=majors) | Q(major2__in=majors)
            )
        print("After major: ", filtered_profiles)

        # 3. 촌수 필터링
        if degrees:
            degrees = list(map(int, degrees))
            max_degree = max(degrees)

            start_time = time.time()
            # filtered_profiles에서 user 필드만 리스트로 변환
            target_users = list(filtered_profiles.values_list("user", flat=True))
            # get_user_distance 호출
            target_user_and_distance_dic = get_user_distances(
                user, target_users, max_degree
            )
            filtered_profiles = [
                Profile.objects.get(user__id=user_id)
                for user_id, distance in target_user_and_distance_dic.items()
                if distance is not None and distance in degrees
            ]
            end_time = time.time()
            elapsed_time = end_time - start_time
        print("After degree: ", filtered_profiles)

        # 유저 필터링 및 최신 가입일 기준 정렬
        filtered_users = User.objects.filter(
            id__in=[profile.user.id for profile in filtered_profiles]
        ).order_by("-date_joined")

        # 가입일 기준 new_user 추가
        serialized_users = self.get_serializer(filtered_users, many=True).data
        user_data = [
            {"user": user, "new_user": user["date_joined"] >= monday.isoformat()}
            for user in serialized_users
        ]

        # 페이지네이션
        paginator = self.pagination_class()
        paginated_users = paginator.paginate_queryset(user_data, request)
        return paginator.get_paginated_response(paginated_users)


class SearchProjectsAPIView(generics.ListAPIView):
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = PageNumberPagination

    # 검색을 위해 POST 요청을 사용하여 쿼리를 JSON 형식으로 전달받음
    def post(self, request, *args, **kwargs):
        serializer = ProjectSearchSerializer(data=request.data)
        user = request.user

        if serializer.is_valid():
            query = serializer.validated_data.get("q", "")
            degrees = serializer.validated_data.get("degree", [])
            keywords = serializer.validated_data.get("keywords", [])

            print("query: ", query)
            print("degrees: ", degrees)

            # 전체 프로젝트 목록에서 필터링 시작
            filtered_projects = Project.objects.all()

            # 1. 검색 쿼리를 title, content, keywords에 적용하여 필터링
            if query != "":
                filtered_projects = filtered_projects.filter(
                    Q(title__icontains=query)  # 제목 필터링
                    | Q(content__icontains=query)  # 내용 필터링
                    | Q(keywords__keyword__icontains=query)  # 키워드 필터링
                ).distinct()
            print("After query: ", filtered_projects)

            # 2. 촌수 필터링
            if degrees:
                degrees = list(map(int, degrees))
                max_degree = max(degrees)

                start_time = time.time()
                # filtered_profiles에서 user 필드만 리스트로 변환
                target_users = list(filtered_projects.values_list("user", flat=True))
                # get_user_distance 호출
                target_user_and_distance_dic = get_user_distances(
                    user, target_users, max_degree
                )
                filtered_projects = Project.objects.filter(
                    user__id__in=[
                        user_id
                        for user_id, distance in target_user_and_distance_dic.items()
                        if distance is not None and distance in degrees
                    ]
                )
                end_time = time.time()
                elapsed_time = end_time - start_time
            print("After degree: ", filtered_projects)

            # # 3. 키워드 기반 추가 필터링
            # if keywords:
            #     filtered_projects = filtered_projects.filter(keywords__keyword__in=keywords)

            # 페이지네이션 적용
            paginator = self.pagination_class()

            # 최신순으로 정렬
            filtered_projects = filtered_projects.order_by("-created_at")

            paginated_projects = paginator.paginate_queryset(filtered_projects, request)

            # 시리얼라이저를 사용하여 페이지네이션된 결과 반환
            serializer = self.get_serializer(paginated_projects, many=True)
            return paginator.get_paginated_response(serializer.data)

        # 유효하지 않은 요청 처리
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class SearchExperienceAPIView(generics.ListAPIView):
    serializer_class = CustomUserSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = PageNumberPagination

    def post(self, request, *args, **kwargs):
        serializer = ExperienceSearchSerializer(data=request.data)
        user = request.user

        if not serializer.is_valid():
            return Response(
                {"error": "올바른 검색 요청 형식이 아닙니다."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        query = serializer.validated_data.get("q", "")
        degrees = serializer.validated_data.get("degree", [])

        # 오늘의 날짜와 이번 주 월요일 날짜 계산
        today = timezone.now().date()
        monday = today - timedelta(days=today.weekday())

        # 상세 경험 필터링 (요청 유저의 상세 경험은 제외)
        filtered_experience_detail = (
            ExperienceDetail.objects.exclude(user=user)
            .select_related("experience", "user")
            .prefetch_related("tags", "skills_used")
        )

        # 1. Query 필터링
        if query != "":
            filtered_experience_detail = filtered_experience_detail.filter(
                Q(experience__title__icontains=query)  # Experience의 title 필터
                | Q(tags__keyword__icontains=query)  # ManyToManyField 관계 필터
                | Q(description__icontains=query)  # TextField 필터
                | Q(skills_used__skill__icontains=query)  # ManyToManyField 관계 필터
            ).distinct()

        # 2. 촌수 필터링
        if degrees:
            degrees = list(map(int, degrees))
            max_degree = max(degrees)

            start_time = time.time()
            # filtered_experience_detail에서 user 필드만 리스트로 변환
            target_users = list(
                filtered_experience_detail.values_list("user", flat=True)
            )
            # get_user_distance 호출
            target_user_and_distance_dic = get_user_distances(
                user, target_users, max_degree
            )
            filtered_user_ids = [
                user_id
                for user_id, distance in target_user_and_distance_dic.items()
                if distance is not None and distance in degrees
            ]
            filtered_experience_detail = filtered_experience_detail.filter(
                user__id__in=filtered_user_ids
            )
            end_time = time.time()
            elapsed_time = end_time - start_time
        print("After degree: ", filtered_experience_detail)

        # 유저 필터링 및 최신 가입일 기준 정렬
        filtered_users = User.objects.filter(
            id__in=filtered_experience_detail.values_list("user", flat=True)
        ).order_by("-date_joined")

        # 가입일 기준 new_user 추가
        user_data = [
            {
                "user": self.get_serializer(user).data,
                "new_user": user.date_joined.date() >= monday,
            }
            for user in filtered_users
        ]

        # 페이지네이션
        paginator = self.pagination_class()
        paginated_users = paginator.paginate_queryset(user_data, request)
        return paginator.get_paginated_response(paginated_users)


# 이름으로 유저 검색 (1촌이 우선 정렬)
class SearchUsersByNameAPIView(generics.ListAPIView):
    serializer_class = ProfileCreateSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user_name = self.request.query_params.get("user_name", None)
        current_user = self.request.user

        if not user_name:
            return Profile.objects.none()  # user_name이 없는 경우 빈 QuerySet 반환

        # 검색된 프로필 가져오기
        profiles = Profile.objects.filter(user_name__icontains=user_name)

        # 각 프로필과의 1촌 여부를 확인하여 정렬 리스트에 추가
        profile_with_first_degree = []
        for profile in profiles:
            # 현재 사용자와 타겟 프로필의 사용자 간의 1촌 여부 확인 (1촌이면 True, 아니면 False)
            is_first_degree = Friend.objects.filter(
                (
                    Q(from_user=current_user, to_user=profile.user)
                    | Q(from_user=profile.user, to_user=current_user)
                ),
                status="accepted",
            ).exists()

            profile_with_first_degree.append((profile, is_first_degree))

        # 1촌 여부를 기준으로 정렬 (1촌이 True인 프로필이 앞에 오도록 내림차순 정렬)
        profile_with_first_degree.sort(key=lambda x: x[1], reverse=True)

        # 정렬된 프로필만 추출하여 반환
        sorted_profiles = [item[0] for item in profile_with_first_degree]
        return sorted_profiles

    def get(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        user_id_list = [profile.user.id for profile in queryset]  # user ID 리스트 생성
        one_degree_distance_list = []
        user = request.user
        for profile in queryset:
            target_user = profile.user
            one_degree_distance_list.append(get_user_distance(user, target_user))

        response_data = {
            "profiles": serializer.data,
            "user_id_list": user_id_list,
            "one_degree_distacne_list": one_degree_distance_list,
        }
        return Response(response_data, status=status.HTTP_200_OK)


class NotificationListCreateView(generics.ListCreateAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        # 현재 로그인한 사용자에게만 해당하는 알림을 반환합니다.
        user = self.request.user
        return Notification.objects.filter(user=user).order_by("-created_at")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class NotificationUpdateView(generics.UpdateAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        # 현재 로그인한 사용자의 특정 알림을 업데이트합니다.
        user = self.request.user
        notification = get_object_or_404(
            Notification, pk=self.kwargs.get("pk"), user=user
        )
        return notification

    def perform_update(self, serializer):
        serializer.save()


class NotificationDeleteView(generics.DestroyAPIView):
    permission_classes = [IsAuthenticated]

    def get_object(self):
        # 현재 로그인한 사용자의 특정 알림을 삭제합니다.
        user = self.request.user
        notification = get_object_or_404(
            Notification, pk=self.kwargs.get("pk"), user=user
        )
        return notification


# 읽지 않은 알림 수 반환
class UnreadNotificationCountView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        unread_count = Notification.objects.filter(user=user, is_read=False).count()
        return Response({"unread_count": unread_count})


class NotificationAllReadView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        user = request.user
        # 모든 읽지 않은 알림을 읽음 처리
        unread_notifications = Notification.objects.filter(user=user, is_read=False)
        updated_count = unread_notifications.update(is_read=True)
        return Response({"message": f"{updated_count} notifications marked as read."})


# 이미 존재하는 이메일인지 확인
class CheckEmailExistsView(generics.GenericAPIView):
    permission_classes = [AllowAny]
    authentication_classes = []  # 인증 비활성화

    def post(self, request, *args, **kwargs):
        email = request.data.get("email")
        if not email:
            return Response(
                {"message": "Email is required."}, status=status.HTTP_400_BAD_REQUEST
            )

        if CustomUser.objects.filter(email=email).exists():
            return Response(
                {"message": "이미 사용중인 이메일입니다."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {"message": "사용 가능한 이메일입니다."}, status=status.HTTP_200_OK
        )


class SameAcademicDegreeAndYearView(generics.ListAPIView):
    """
    current_academic_degree와 year가 동일한 CustomUser 리스트 반환
    """

    permission_classes = [IsAuthenticated]
    serializer_class = CustomUserSerializer

    def get_queryset(self):
        # 현재 로그인한 사용자의 프로필 정보 가져오기
        current_user_profile = self.request.user.profile
        academic_degree = current_user_profile.current_academic_degree
        year = current_user_profile.year

        # Profile을 기준으로 CustomUser 필터링
        queryset = CustomUser.objects.filter(
            profile__current_academic_degree=academic_degree, profile__year=year
        ).exclude(
            id=self.request.user.id
        )  # 현재 사용자 제외

        return queryset


# 같은 전공을 가진 유저 목록을 얻는 뷰
class SameMajorUsersListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = CustomUserSerializer

    def get_queryset(self):
        """
        기본 queryset은 빈 QuerySet을 반환합니다.
        """
        return CustomUser.objects.none()  # 실제 필터링은 list()에서 처리합니다.

    def list(self, request, *args, **kwargs):
        # 현재 로그인한 사용자 가져오기
        current_user = self.request.user

        # 현재 로그인한 사용자의 전공 정보 가져오기
        user_profile = current_user.profile
        major1 = user_profile.major1
        major2 = user_profile.major2

        # 현재 로그인한 사용자와 전공이 일치하는 다른 사용자들 필터링
        queryset = CustomUser.objects.exclude(
            id=current_user.id
        )  # 자신을 제외한 유저들

        # 중복 제거를 위한 사용자 ID 추적
        seen_user_ids = set()

        # 결과 저장
        results = []

        # major1과 major2 모두 일치하는 사용자 필터링
        combined_queryset = queryset.filter(
            (Q(profile__major1=major1) | Q(profile__major2=major1))
            & (Q(profile__major1=major2) | Q(profile__major2=major2))
        )
        if combined_queryset.exists():
            combined_serialized = self.get_serializer(combined_queryset, many=True).data
            seen_user_ids.update(user["id"] for user in combined_serialized)
            results.append({"major": [major1, major2], "users": combined_serialized})

        # major1과만 일치하는 사용자 필터링
        if major1:
            major1_queryset = queryset.filter(
                (Q(profile__major1=major1) | Q(profile__major2=major1))
                & ~Q(id__in=seen_user_ids)  # 이미 처리된 사용자 제외
            )
            if major1_queryset.exists():
                major1_serialized = self.get_serializer(major1_queryset, many=True).data
                seen_user_ids.update(user["id"] for user in major1_serialized)
                results.append({"major": [major1], "users": major1_serialized})

        # major2와만 일치하는 사용자 필터링
        if major2:
            major2_queryset = queryset.filter(
                (Q(profile__major1=major2) | Q(profile__major2=major2))
                & ~Q(id__in=seen_user_ids)  # 이미 처리된 사용자 제외
            )
            if major2_queryset.exists():
                major2_serialized = self.get_serializer(major2_queryset, many=True).data
                seen_user_ids.update(user["id"] for user in major2_serialized)
                results.append({"major": [major2], "users": major2_serialized})

        # 커스텀 응답 반환
        return Response(results)


class KeywordBasedUserSimilarityView(generics.GenericAPIView):
    serializer_class = RelatedUserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        recent_times = timezone.now() - timezone.timedelta(days=7)

        # 유사한 사용자 목록을 가져옴
        related_users_data = user.get_related_users_by_keywords()

        # 최근 15분 이내에 가입한 유저들로 필터링
        recent_related_users = [
            user_data
            for user_data in related_users_data
            if user_data["user"].date_joined >= recent_times
        ]

        # 필터링된 데이터를 직렬화
        serializer = self.get_serializer(recent_related_users, many=True)
        return Response(serializer.data)


# 2촌/같은 키워드 사용자 수의 증가량을 반환
class UserStatisticsDifferenceView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user

        recent_times = timezone.now() - timezone.timedelta(days=7)

        # 1촌 및 2촌 정보 가져오기
        first_degree_ids, second_degree_ids, second_degree_connections = (
            user.get_friend_counts()
        )

        # 최근 15분 이내에 가입한 2촌 사용자 필터링
        new_second_degree_profiles = CustomUser.objects.filter(
            id__in=second_degree_ids, date_joined__gte=recent_times
        )

        # 결과가 비어 있는지 확인하기 위해 로그 출력
        print("new_second_degree_profiles:", new_second_degree_profiles)

        # 2촌 프로필 정보와 연결된 1촌 ID를 포함하여 직렬화
        response_data = []
        for profile in new_second_degree_profiles:
            for second_degree_id, connector_id in second_degree_connections:
                if profile.id == second_degree_id:
                    response_data.append(
                        {
                            "second_degree_profile_id": profile.id,
                            "connector_friend_id": connector_id,
                        }
                    )

        # 결과가 비어 있는지 확인하기 위해 로그 출력
        print("response_data:", response_data)

        serializer = SecondDegreeProfileSerializer(response_data, many=True)
        return Response(serializer.data, status=200)


class InquiryCreateView(generics.CreateAPIView):
    queryset = Inquiry.objects.all()
    serializer_class = InquirySerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class UpdateOneDegreeCountView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        # 현재 사용자를 가져옴
        user = request.user

        # 전달된 user_id가 있다면 해당 사용자의 프로필을 업데이트
        user_id = kwargs.get("user_id")
        if user_id:
            user = get_object_or_404(CustomUser, id=user_id)

        # one_degree_count 업데이트
        update_profile_one_degree_count(user)

        # 업데이트된 one_degree_count를 반환
        profile = user.profile
        return Response({"one_degree_count": profile.one_degree_count})


class SearchHistoryListCreateView(generics.ListCreateAPIView):
    serializer_class = SearchHistorySerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        return SearchHistory.objects.filter(user=self.request.user).order_by(
            "-created_at"
        )

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class SearchHistoryDeleteView(generics.DestroyAPIView):
    queryset = SearchHistory.objects.all()
    serializer_class = SearchHistorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return SearchHistory.objects.filter(user=self.request.user)


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


class GetUserAllPathsAPIView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    lookup_url_kwarg = "target_user_id"  # user_id로 lookup

    # BFS를 통해 start_user와 target_user의 모든 중간 경로 배열을 반환합니다.
    # 만약 경로가 4촌 이상인 경우 빈 리스트를 반환합니다.
    # 예시, 성대규와 권대용의 모든 경로 배열이 다음과 같을 때,
    # 성대규 -> 카리나 -> 권대용, 성대규 -> 아이유 -> 권대용인 경우.
    # 반환값, [[카리나], [아이유]]
    def find_paths_to_target_user(self, start_user, target_user):
        # 결과 경로를 저장할 리스트
        result_paths = []

        # BFS를 위한 큐 초기화 (시작 사용자, 경로 히스토리 배열)
        queue = deque([(start_user, [start_user])])

        while queue:
            # 큐에서 사용자와 그 경로를 꺼냄
            last_path_user, path_history = queue.popleft()

            # 4촌 이상의 관계인 경우, 종료
            if len(path_history) >= 5:
                return result_paths

            # 타겟 유저에 도달한 경우
            if last_path_user == target_user:
                del path_history[0]  # start_user를 히스토리에서 제거
                del path_history[-1]  # target_user를 히스토리에서 제거
                result_paths.append(path_history)
                continue

            # 친구 관계 조회 (from_user 또는 to_user가 last_path_user인 경우)
            friends = Friend.objects.filter(
                Q(from_user=last_path_user) | Q(to_user=last_path_user),
                status="accepted",
            )

            # 인접한 친구들을 큐에 추가
            for friend in friends:
                # friend가 from_user 또는 to_user 중 어떤 역할인지 판별
                next_user = (
                    friend.to_user
                    if friend.from_user == last_path_user
                    else friend.from_user
                )

                # next_user가 기존 path 경로에 없어야 함.
                if next_user in path_history:
                    continue

                # 새로운 경로를 복사하여 큐에 추가
                new_path = path_history + [next_user]
                queue.append((next_user, new_path))

        return result_paths

    def retrieve(self, request, *args, **kwargs):
        # 현재 로그인한 유저
        current_user = request.user
        target_user_id = self.kwargs.get(
            self.lookup_url_kwarg
        )  # URL에서 user_id 가져오기

        # target_user를 user_id로 검색
        try:
            target_user = CustomUser.objects.get(id=target_user_id)
        except CustomUser.DoesNotExist:
            return Response(
                {"error": "Target user not found."}, status=status.HTTP_404_NOT_FOUND
            )

        results_path = self.find_paths_to_target_user(current_user, target_user)

        # 최소 길이 계산
        if results_path:
            min_length = min(len(path) for path in results_path)
            # 최소 길이에 해당하는 경로만 필터링
            results_path = [path for path in results_path if len(path) == min_length]

        # CustomUser를 user_id로 변환
        paths_as_ids = []
        for path in results_path:
            path_ids = [CustomUser.objects.get(id=u.id).id for u in path]
            paths_as_ids.append(path_ids)

        # CustomUser를 user_id로 변환
        paths_as_names = []
        for path in results_path:
            path_names = [
                CustomUser.objects.get(id=u.id).profile.user_name for u in path
            ]
            paths_as_names.append(path_names)

        return Response(
            {
                "paths_name": paths_as_names,
                "paths_id": paths_as_ids,
                "current_user_id": current_user.id,
                "target_user_id": target_user.id,
            },
            status=status.HTTP_200_OK,
        )


# 댓글 작성
class CommentCreateView(generics.CreateAPIView):
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        project_id = self.kwargs.get("project_id")
        project = get_object_or_404(Project, pk=project_id)

        parent_comment_id = self.request.data.get(
            "parent_comment"
        )  # Get parent_comment from request
        parent_comment = None
        if parent_comment_id:
            parent_comment = get_object_or_404(
                Comment, pk=parent_comment_id
            )  # Validate the parent comment

        serializer.save(
            user=self.request.user, project=project, parent_comment=parent_comment
        )

        # 프로젝트 작성자가 본인이 아닌 경우에만 Notification 생성
        if project.user != self.request.user:
            Notification.objects.create(
                user=project.user,  # 프로젝트 작성자에게 알림
                message=f"{self.request.user.profile.user_name}님이 '{project.title}' 게시물에 새로운 댓글을 작성했습니다.",
                notification_type="new_comment",
                related_user_id=project.user.id,
                related_project_id=project.project_id,
            )

        # 부모 댓글 작성자가 본인이 아닌 경우에만 Notification 생성
        if parent_comment and parent_comment.user != self.request.user:
            Notification.objects.create(
                user=parent_comment.user,  # 부모 댓글 작성자에게 알림
                message=f"{self.request.user.profile.user_name}님이 '{project.title}' 게시물의 당신의 댓글에 답글을 남겼습니다.",
                notification_type="reply_comment",
                related_user_id=parent_comment.user.id,
                related_project_id=project.project_id,
            )


# 댓글 목록
class CommentListView(generics.ListAPIView):
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        project_id = self.kwargs.get("project_id")
        return Comment.objects.filter(project_id=project_id)


# 댓글 수정
class CommentUpdateView(generics.UpdateAPIView):
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Comment.objects.all()

    def perform_update(self, serializer):
        comment = self.get_object()
        if comment.user != self.request.user:
            return Response(
                {"error": "You are not allowed to edit this comment"},
                status=status.HTTP_403_FORBIDDEN,
            )
        serializer.save()


# 댓글 삭제
class CommentDeleteView(generics.DestroyAPIView):
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Comment.objects.all()

    def perform_destroy(self, instance):
        if instance.user != self.request.user:
            return Response(
                {"error": "You are not allowed to delete this comment"},
                status=status.HTTP_403_FORBIDDEN,
            )
        super().perform_destroy(instance)


# class ConversationListView(generics.ListAPIView):
#     """
#     현재 유저가 참여 중인 모든 대화 목록을 반환.
#     삭제된 대화방은 보이지 않음.
#     """

#     serializer_class = ConversationSerializer
#     permission_classes = [IsAuthenticated]

#     def get_queryset(self):
#         user = self.request.user

#         # 필터링 조건 추가: 현재 사용자가 삭제하지 않은 대화방만 포함
#         queryset = Conversation.objects.filter(
#             (Q(user_1=user) & Q(deleted_for_user1=False))
#             | (Q(user_2=user) & Q(deleted_for_user2=False))
#         )

#         print("Filtered queryset:", queryset)  # 디버깅용 출력
#         for conversation in queryset:
#             print(
#                 f"Conversation ID: {conversation.id}, User 1: {conversation.user_1}, User 2: {conversation.user_2}"
#             )
#             print(
#                 f"Deleted for user 1: {conversation.deleted_for_user1}, Deleted for user 2: {conversation.deleted_for_user2}"
#             )

#         return queryset

#     def list(self, request, *args, **kwargs):
#         queryset = self.get_queryset()

#         try:
#             serialized_data = ConversationSerializer(queryset, many=True).data
#             print("Serialized data:", serialized_data)  # 디버깅용 출력
#         except Exception as e:
#             print("Serialization error:", str(e))  # 직렬화 오류 확인
#             return Response({"error": "Serialization failed"}, status=500)

#         return Response(serialized_data)


class ConversationListView(generics.ListAPIView):
    """
    현재 유저가 참여 중인 모든 대화 목록을 반환.
    삭제된 대화방은 보이지 않음.
    """

    serializer_class = ConversationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        # 현재 사용자가 삭제하지 않은 대화방만 포함
        queryset = Conversation.objects.filter(
            (Q(user_1=user) & Q(deleted_for_user1=False))
            | (Q(user_2=user) & Q(deleted_for_user2=False))
        )

        return queryset

    def get_serializer_context(self):
        """
        Serializer에 추가 컨텍스트 전달.
        """
        context = super().get_serializer_context()
        context["request"] = self.request  # 요청 객체를 전달
        return context

    def list(self, request, *args, **kwargs):
        """
        대화방 리스트를 반환하며 상대방 프로필 정보를 포함.
        """
        queryset = self.get_queryset()

        try:
            # 직렬화 시 컨텍스트를 포함
            serialized_data = self.get_serializer(queryset, many=True).data
        except Exception as e:
            # 직렬화 오류 처리
            return Response({"error": f"Serialization failed: {str(e)}"}, status=500)

        return Response(serialized_data)


class CreateConversationView(generics.CreateAPIView):
    """
    1:1 대화방 생성. 이미 대화방이 존재하면 오류 반환.
    삭제된 대화방인 경우 플래그를 업데이트하여 재활성화.
    """

    serializer_class = ConversationSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        user_1 = self.request.user
        user_2_id = self.request.data.get("user_2")

        if not user_2_id:
            raise ValidationError("user_2 field is required.")

        user_2 = CustomUser.objects.filter(id=user_2_id).first()
        if not user_2:
            raise ValidationError("User does not exist.")

        # 본인 스스로와의 대화 방지
        if user_1 == user_2:
            raise ValidationError("You cannot create a conversation with yourself.")

        # 기존 대화방이 있는지 확인
        existing_conversation = Conversation.objects.filter(
            Q(user_1=user_1, user_2=user_2) | Q(user_1=user_2, user_2=user_1)
        ).first()

        if existing_conversation:
            # user_1가 삭제한 상태라면 복구
            if (
                existing_conversation.deleted_for_user1
                and not existing_conversation.deleted_for_user2
            ):
                # 기존 메시지의 가시성을 업데이트
                Message.objects.filter(conversation=existing_conversation).update(
                    visible_for_user1=False
                )
                existing_conversation.deleted_for_user1 = False
                existing_conversation.save()
                return  # 대화방 복구 후 새로운 대화방을 생성하지 않음

            # user_2가 삭제한 상태라면 복구
            if (
                existing_conversation.deleted_for_user2
                and not existing_conversation.deleted_for_user1
            ):
                # 기존 메시지의 가시성을 업데이트
                Message.objects.filter(conversation=existing_conversation).update(
                    visible_for_user2=False
                )
                existing_conversation.deleted_for_user2 = False
                existing_conversation.save()
                return  # 대화방 복구 후 새로운 대화방을 생성하지 않음

            # 대화방이 이미 존재하고 삭제 상태가 아니면 오류 반환
            raise ValidationError("A conversation between these users already exists.")

        # 새로운 대화방 생성
        conversation = serializer.save(user_1=user_1, user_2=user_2)

        # 기존 대화방의 메시지를 가시성 처리
        if existing_conversation:
            Message.objects.filter(conversation=existing_conversation).update(
                visible_for_user1=False,
                visible_for_user2=False,
            )

        return conversation


class MessageListView(generics.ListAPIView):
    """
    특정 대화방의 메시지를 발신자별로 정리해서 반환
    """

    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        conversation_id = self.kwargs.get("conversation_id")
        user = self.request.user

        # 대화방 접근 권한 확인
        conversation = Conversation.objects.filter(
            Q(id=conversation_id) & (Q(user_1=user) | Q(user_2=user))
        ).first()

        if not conversation:
            raise ValidationError("You do not have access to this conversation.")

        # 사용자별 가시성 필터링
        if user == conversation.user_1:
            # user1이 볼 수 있는 메시지만 가져오기
            user1_messages = Message.objects.filter(
                conversation=conversation,
                sender=conversation.user_1,
                visible_for_user1=True,
            ).order_by("created_at")
            user2_messages = Message.objects.filter(
                conversation=conversation,
                sender=conversation.user_2,
                visible_for_user1=True,
            ).order_by("created_at")
        elif user == conversation.user_2:
            # user2가 볼 수 있는 메시지만 가져오기
            user1_messages = Message.objects.filter(
                conversation=conversation,
                sender=conversation.user_1,
                visible_for_user2=True,
            ).order_by("created_at")
            user2_messages = Message.objects.filter(
                conversation=conversation,
                sender=conversation.user_2,
                visible_for_user2=True,
            ).order_by("created_at")
        else:
            raise ValidationError("You do not have access to this conversation.")

        # 시스템 메시지는 모든 사용자에게 보여야 함
        system_messages = Message.objects.filter(
            conversation=conversation, is_system=True
        ).order_by("created_at")

        # 메시지를 JSON 형식으로 응답
        return Response(
            {
                "user1_messages": MessageSerializer(user1_messages, many=True).data,
                "user2_messages": MessageSerializer(user2_messages, many=True).data,
                "system_messages": MessageSerializer(system_messages, many=True).data,
            }
        )


class LastMessageView(generics.RetrieveAPIView):
    """
    특정 대화방의 가장 최근 메시지 반환
    """

    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        conversation_id = self.kwargs.get("conversation_id")
        user = request.user

        # 대화방 접근 권한 확인
        conversation = Conversation.objects.filter(
            Q(id=conversation_id) & (Q(user_1=user) | Q(user_2=user))
        ).first()

        if not conversation:
            raise ValidationError("You do not have access to this conversation.")

        # 사용자별 가시성 필터링
        if user == conversation.user_1:
            # user1이 볼 수 있는 메시지 중 가장 최근 메시지
            recent_message = (
                Message.objects.filter(
                    conversation=conversation, visible_for_user1=True
                )
                .order_by("-created_at")
                .first()
            )
        elif user == conversation.user_2:
            # user2가 볼 수 있는 메시지 중 가장 최근 메시지
            recent_message = (
                Message.objects.filter(
                    conversation=conversation, visible_for_user2=True
                )
                .order_by("-created_at")
                .first()
            )
        else:
            raise ValidationError("You do not have access to this conversation.")

        # 최근 메시지가 없을 경우 빈 응답 반환
        if not recent_message:
            return Response({"message": "No messages found in this conversation."})

        # 메시지를 JSON 형식으로 응답
        return Response({"last_message": MessageSerializer(recent_message).data})


class ConversationReadView(generics.UpdateAPIView):
    """
    특정 대화방의 모든 읽지 않은 메시지를 읽음 처리
    """

    queryset = Conversation.objects.all()
    permission_classes = [IsAuthenticated]

    def update(self, request, *args, **kwargs):
        conversation_id = self.kwargs.get("pk")  # URL에서 대화방 ID 가져오기
        user = request.user

        # 대화방 존재 및 접근 권한 확인
        conversation = (
            self.get_queryset()
            .filter(Q(id=conversation_id) & (Q(user_1=user) | Q(user_2=user)))
            .first()
        )

        if not conversation:
            raise ValidationError("You do not have access to this conversation.")

        # 읽지 않은 메시지를 읽음 처리
        unread_messages = Message.objects.filter(
            conversation=conversation,
            sender__isnull=False,  # 시스템 메시지(sender=None)는 제외
            is_read=False,
        ).exclude(
            sender=user
        )  # 자신이 보낸 메시지는 제외

        unread_count = unread_messages.count()
        unread_messages.update(is_read=True)

        return Response(
            {
                "message": f"Marked {unread_count} messages as read.",
                "conversation_id": conversation_id,
            },
            status=200,
        )


class CreateMessageView(generics.CreateAPIView):
    """
    대화방에 메시지 추가 (텍스트 또는 이미지 포함 가능).
    """

    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        conversation_id = self.kwargs.get("conversation_id")
        user = self.request.user

        # conversation_id 유효성 검증
        if not conversation_id:
            raise ValidationError("conversation_id is required.")

        # Conversation 존재 여부 확인
        conversation = Conversation.objects.filter(
            Q(id=conversation_id) & (Q(user_1=user) | Q(user_2=user))
        ).first()

        if not conversation:
            raise ValidationError("You do not have access to this conversation.")

        # 텍스트 또는 이미지가 반드시 하나는 있어야 함
        message_text = self.request.data.get("message", "").strip()
        message_image = self.request.FILES.get("image")

        if not message_text and not message_image:
            raise ValidationError("Either 'message' or 'image' must be provided.")

        # 기존 메시지의 가시성 업데이트 (user1이 삭제한 상태라면 새 메시지를 보이도록 설정)
        if user == conversation.user_2 and conversation.deleted_for_user1:
            Message.objects.filter(conversation=conversation).update(
                visible_for_user1=False
            )
            conversation.deleted_for_user1 = False  # user1이 대화방을 다시 활성화
            conversation.save()

        if user == conversation.user_1 and conversation.deleted_for_user2:
            Message.objects.filter(conversation=conversation).update(
                visible_for_user2=False
            )
            conversation.deleted_for_user2 = False  # user2가 대화방을 다시 활성화
            conversation.save()

        # 메시지 저장
        message = serializer.save(sender=user, conversation=conversation)

        # 상대방 식별
        recipient = (
            conversation.user_1 if conversation.user_2 == user else conversation.user_2
        )

        # 상대방이 존재할 경우 알림 생성
        if recipient:
            Notification.objects.get_or_create(
                user=recipient,
                message=f"{user.profile.user_name}님이 당신에게 메시지를 보냈습니다: {message.message}",
                notification_type="new_message",
                related_user_id=user.id,
            )


class DeleteConversationView(generics.DestroyAPIView):
    """
    대화방 삭제. 한 사용자가 삭제하면 상대방에게 대화방은 남아 있으며,
    두 사용자가 모두 삭제한 경우 데이터베이스에서 삭제됩니다.
    """

    queryset = Conversation.objects.all()
    serializer_class = ConversationSerializer
    permission_classes = [IsAuthenticated]

    def perform_destroy(self, instance):
        """
        perform_destroy를 오버라이드하여 사용자에 따라 삭제 동작을 제어.
        """
        user = self.request.user

        # 유저가 대화방에 접근 가능한지 확인
        if user != instance.user_1 and user != instance.user_2:
            raise ValidationError("You do not have access to this conversation.")

        # 삭제 처리
        if user == instance.user_1:
            instance.deleted_for_user1 = True
            # 시스템 메시지 추가
            # Message.objects.create(
            #     conversation=instance,
            #     sender=None,  # 시스템 메시지는 sender를 비워둡니다.
            #     is_system=True,
            #     message=f"{instance.user_1.profile.user_name}님이 대화방을 나갔습니다.",
            # )
        elif user == instance.user_2:
            instance.deleted_for_user2 = True
            # 시스템 메시지 추가
            # Message.objects.create(
            #     conversation=instance,
            #     sender=None,  # 시스템 메시지는 sender를 비워둡니다.
            #     is_system=True,
            #     message=f"{instance.user_2.profile.user_name}님이 대화방을 나갔습니다.",
            # )

        # 두 사용자가 모두 삭제했을 경우 실제로 Conversation 삭제
        if instance.deleted_for_user1 and instance.deleted_for_user2:
            super().perform_destroy(instance)  # 부모 클래스의 삭제 메서드 호출
        else:
            instance.save()  # 변경 사항만 저장


class DeleteMessageView(generics.UpdateAPIView):
    """
    메시지 삭제 View: 메시지 내용을 "삭제된 메시지입니다."로 변경합니다. 이미지가 있으면 null로 변경합니다.
    """

    queryset = Message.objects.all()
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]

    def partial_update(self, request, *args, **kwargs):
        message = self.get_object()
        user = request.user

        # 메시지 작성자 또는 대화방 참여자인지 확인
        if user != message.sender and user not in [
            message.conversation.user_1,
            message.conversation.user_2,
        ]:
            raise ValidationError("You do not have permission to delete this message.")

        # 메시지 내용 변경
        message.message = "삭제된 메시지입니다."

        # 메시지 이미지가 있으면 null로 설정
        if message.image:
            message.image = None

        message.save()

        return Response({"message": "Message deleted successfully."}, status=200)


class NewUserSuggestionView(generics.GenericAPIView):
    """
    이번 주 새로운 회원 소식 정보들을 반환합니다.
    1. 이번 주 추가되고, 2촌인 유저들
    2. 이번 주 추가되고, 관심사가 일치하는 유저들
    3. 이번 주 추가되고, 전공이 일치하는 유저들
    4. 이번 주 추가되고, 스킬이 일치하는 유저들
    5. 이번 주 추가되고, 경험 키워드가 일치하는 유저들
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        # 결과 저장 변수
        secondDegreeList = []
        keywordDic = {}
        majorDic = {}
        skillDic = {}
        experienceKeywordDic = {}

        # 이번 주 월요일 계산
        today = timezone.now().date()
        monday = today - timedelta(days=today.weekday())  # 이번 주 월요일

        # 1. 이번 주 추가되고, 2촌인 유저들
        second_degree_list = get_users_by_degree(user.id, 2)  # 2촌 유저 ID 리스트 반환
        secondDegreeList = CustomUser.objects.filter(
            id__in=second_degree_list, date_joined__date__gte=monday
        )

        # 2. 이번 주 추가되고, 관심사가 일치하는 유저들
        user_keywords = Profile.objects.get(user=user).keywords.all()  # 관심사 키워드
        for keyword in user_keywords:
            new_keyword_users = CustomUser.objects.filter(
                profile__keywords=keyword, date_joined__date__gte=monday
            )
            keywordDic[keyword.keyword] = new_keyword_users

        # 3. 이번 주 추가되고, 전공이 일치하는 유저들
        user_majors = [user.profile.major1, user.profile.major2]
        for major in user_majors:
            if not major:  # major가 blank 또는 null인 경우 건너뜀
                continue

            new_major_users = CustomUser.objects.filter(
                Q(profile__major1=major) | Q(profile__major2=major),
                date_joined__date__gte=monday,
            )
            majorDic[major] = new_major_users

        # 4. 이번 주 추가되고, 스킬이 일치하는 유저들
        user_skills = Skill.objects.filter(profile=user.profile)  # 유저의 스킬 가져오기
        for skill in user_skills:
            # ForeignKey 관계에서 필터링
            new_skill_users = CustomUser.objects.filter(
                profile__skills__skill__iexact=skill.skill,  # ForeignKey 관계에서 skill 값 비교
                date_joined__date__gte=monday,
            ).select_related(
                "profile"
            )  # 최적화

            skillDic[skill.skill] = new_skill_users

        # 5. 이번 주 추가되고, 경험 키워드가 일치하는 유저들
        user_experience_keywords = (
            ExperienceDetail.objects.filter(user=user)
            .values_list("tags__keyword", flat=True)
            .distinct()
        )
        for keyword in user_experience_keywords:
            # 키워드 일치하는 유저 조회
            new_experience_keyword_users = (
                CustomUser.objects.filter(
                    Q(
                        experience_details__tags__keyword__iexact=keyword
                    ),  # 키워드 정확히 일치
                    date_joined__date__gte=monday,  # 가입일 필터
                )
                .distinct()
                .prefetch_related("experience_details__tags")
            )

            experienceKeywordDic[keyword] = new_experience_keyword_users

        # 결과 반환
        return Response(
            {
                "secondDegree": secondDegreeList.values(
                    "id", "profile__user_name", "date_joined"
                ),
                "keyword": {
                    k: v.values("id", "profile__user_name", "date_joined")
                    for k, v in keywordDic.items()
                },
                "major": {
                    k: v.values("id", "profile__user_name", "date_joined")
                    for k, v in majorDic.items()
                },
                "skill": {
                    k: v.values("id", "profile__user_name", "date_joined")
                    for k, v in skillDic.items()
                },
                "experience_keyword": {
                    k: v.values("id", "profile__user_name", "date_joined")
                    for k, v in experienceKeywordDic.items()
                },
            }
        )


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
