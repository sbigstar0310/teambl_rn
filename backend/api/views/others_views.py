from rest_framework import generics, permissions, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from ..models import (
    CustomUser,
    Profile,
    Project,
    Skill,
    ExperienceDetail,
    InvitationLink,
    Friend,
    Notification,
    Inquiry,
    SearchHistory,
    Conversation,
    Message,
)
from ..serializers import (
    CustomUserSerializer,
    CustomUserSearchSerializer,
    ProfileCreateSerializer,
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
import time

logger = logging.getLogger(__name__)


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


class SearchUsersAPIView(generics.ListAPIView):
    serializer_class = CustomUserSearchSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = PageNumberPagination

    # 변수를 쿼리가 아닌 JSON 형식으로 전달받기 위해 POST 요청으로 변경
    # GET 요청 시 쿼리를 포함한 url이 너무 길어져서 반려.
    def post(self, request, *args, **kwargs):
        user = self.request.user
        data = request.data
        print(data)

        # 요청 데이터 검증
        if "q" not in data or "degree" not in data:
            return Response(
                {"error": "q와 degree가 요청에 없습니다."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        query = data.get("q", "")
        degrees = data.get("degree", [])

        print("query: ", query)
        print("degrees: ", degrees)

        # 오늘의 날짜와 이번 주 월요일 날짜 계산
        today = timezone.now().date()
        monday = today - timedelta(days=today.weekday())

        # 현재 사용자의 프로필을 제외한 전체 프로필을 가져옵니다.
        filtered_users = CustomUser.objects.exclude(id=user.id)

        # 1. 검색어로 필터링 (역참조를 통해 Profile 필드 접근)
        if query:
            filtered_users = filtered_users.filter(
                Q(profile__keywords__keyword__icontains=query)  # 키워드 필터링
                | Q(profile__user_name__icontains=query)  # 이름 필터링
                | Q(profile__school__icontains=query)  # 학교 필터링
                | Q(profile__current_academic_degree__icontains=query)  # 학력 필터링
                | Q(profile__major1__icontains=query)  # 전공1 필터링
                | Q(profile__major2__icontains=query)  # 전공2 필터링
            ).distinct()
        print("After query: ", filtered_users)

        # 대상 유저 ID 추출 및 거리 계산
        target_users = list(filtered_users.values_list("id", flat=True))
        target_user_and_distance_dic = get_user_distances(user, target_users)

        # 2. 촌수 필터링
        if degrees:
            # 촌수 필터링
            filtered_users = filtered_users.filter(
                id__in=[
                    user_id
                    for user_id, distance in target_user_and_distance_dic.items()
                    if distance in degrees
                ]
            )
        print("After degree: ", filtered_users)

        # 정렬 및 페이지네이션
        filtered_users = filtered_users.order_by("-date_joined")
        paginator = self.pagination_class()
        paginated_users = paginator.paginate_queryset(filtered_users, request)

        # 직렬화
        serializer = self.get_serializer(
            paginated_users,
            many=True,
            context={
                "target_user_and_distance_dic": target_user_and_distance_dic,
            },
        )
        return paginator.get_paginated_response(serializer.data)


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
        filtered_users = CustomUser.objects.filter(
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
