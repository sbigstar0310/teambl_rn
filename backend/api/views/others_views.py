from rest_framework import generics, permissions, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from ..models import (
    CustomUser,
    Profile,
    Post,
    Project,
    ProjectCard,
    Skill,
    ExperienceDetail,
    InvitationLink,
    Friend,
    Notification,
    Inquiry,
    Conversation,
    Message,
)
from ..serializers import (
    CustomUserSerializer,
    CustomUserSearchSerializer,
    PostSerializer,
    ProjectCardSerializer,
    ProjectSerializer,
    InvitationLinkSerializer,
    FriendCreateSerializer,
    ProjectSearchSerializer,
    ExperienceSearchSerializer,
    RelatedUserSerializer,
    SecondDegreeProfileSerializer,
    InquirySerializer,
    SearchHistorySerializer,
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
from datetime import timedelta
from uuid import uuid4
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from ..HelperFuntions import (
    get_user_distance,
    get_user_distances,
    get_users_by_degree,
    update_profile_one_degree_count,
)
from django.db.models import Q
import logging
from rest_framework.exceptions import ValidationError
from collections import deque
from django.conf import settings


logger = logging.getLogger(__name__)


# Health Check View
class HealthCheckView(generics.GenericAPIView):
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        return Response({"status": "ok"}, status=status.HTTP_200_OK)


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
