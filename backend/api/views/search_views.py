from rest_framework import generics, permissions, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from ..models import (
    CustomUser,
    Profile,
    Post,
    Project,
    ProjectCard,
    ExperienceDetail,
    Friend,
)
from ..serializers import (
    CustomUserSerializer,
    CustomUserSearchSerializer,
    PostSerializer,
    ProjectCardSerializer,
    ProjectSerializer,
    ProjectSearchSerializer,
    ExperienceSearchSerializer,
)
from django.utils import timezone
from datetime import timedelta
from rest_framework.response import Response
from ..HelperFuntions import (
    get_user_distances,
)
from django.db.models import Q
import time


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


# 이름으로 유저 검색 (1촌이 우선 정렬)
class SearchUsersByNameAPIView(generics.ListAPIView):
    serializer_class = CustomUserSearchSerializer
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        user = self.request.user
        data = request.data
        print(data)

        # 요청 데이터 검증
        if "user_name" not in data:
            return Response(
                {"error": "유저 이름이 필요합니다."}, status=status.HTTP_400_BAD_REQUEST
            )

        user_name = data.get("user_name", "")
        print("user_name: ", user_name)

        # 검색된 프로필 가져오기
        users = CustomUser.objects.filter(
            profile__user_name__icontains=user_name
        ).exclude(id=user.id)

        # 각 프로필과의 1촌 여부를 확인하여 정렬 리스트에 추가
        user_with_first_degree = []
        for target_user in users:
            # 현재 사용자와 타겟 프로필의 사용자 간의 1촌 여부 확인
            is_first_degree = Friend.objects.filter(
                (
                    Q(from_user=user, to_user=target_user)
                    | Q(from_user=target_user, to_user=user)
                ),
                status="accepted",
            ).exists()

            user_with_first_degree.append((target_user, is_first_degree))

        # 1촌 여부를 기준으로 정렬 (1촌이 True인 프로필이 앞에 오도록 내림차순 정렬)
        user_with_first_degree.sort(key=lambda x: x[1], reverse=True)

        # 정렬된 유저만 추출하여 반환
        sorted_users = [item[0] for item in user_with_first_degree]

        # 대상 유저 ID 추출 및 거리 계산
        target_user_ids = [user.id for user in sorted_users]
        target_user_and_distance_dic = get_user_distances(user, target_user_ids)

        # 직렬화
        serializer = self.get_serializer(
            sorted_users,
            many=True,
            context={
                "target_user_and_distance_dic": target_user_and_distance_dic,
            },
        )

        # Response로 감싸기
        return Response(serializer.data, status=status.HTTP_200_OK)


class SearchProjectCardsAPIView(generics.ListAPIView):
    serializer_class = ProjectCardSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = PageNumberPagination

    def post(self, request, *args, **kwargs):
        user = self.request.user
        data = request.data
        print(data)

        # 요청 데이터 검증
        if "q" not in data:
            return Response(
                {"error": "검색어가 필요합니다."}, status=status.HTTP_400_BAD_REQUEST
            )

        query = data.get("q", "")
        print("query: ", query)

        # 검색된 프로젝트 가져오기
        # 제목, 키워드, 사람, 짧은 소개글 검색
        projectCards = ProjectCard.objects.filter(
            Q(title__icontains=query)  # 제목 필터링
            | Q(keywords__keyword__icontains=query)  # 키워드 필터링
            | Q(
                accepted_users__profile__user_name__icontains=query
            )  # 참여자 이름 필터링
            | Q(description__icontains=query)  # 내용 필터링
        ).distinct()

        # 정렬 및 페이지네이션
        # 최신순으로 정렬
        projectCards = projectCards.order_by("-created_at")
        paginator = self.pagination_class()
        paginated_projectCards = paginator.paginate_queryset(projectCards, request)

        # 직렬화
        serializer = self.get_serializer(paginated_projectCards, many=True)
        return paginator.get_paginated_response(serializer.data)


class SearchPostsAPIView(generics.ListAPIView):
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = PageNumberPagination

    def post(self, request, *args, **kwargs):
        user = self.request.user
        data = request.data
        print(data)

        # 요청 데이터 검증
        if "q" not in data:
            return Response(
                {"error": "검색어가 필요합니다."}, status=status.HTTP_400_BAD_REQUEST
            )

        query = data.get("q", "")
        print("query: ", query)

        # 검색된 프로젝트 가져오기
        # 제목, 키워드, 사람, 짧은 소개글 검색
        posts = Post.objects.filter(
            Q(content__icontains=query)  # 내용 필터링
        ).distinct()

        # 정렬 및 페이지네이션
        # 최신순으로 정렬
        posts = posts.order_by("-created_at")
        paginator = self.pagination_class()
        paginated_posts = paginator.paginate_queryset(posts, request)

        # 직렬화
        serializer = self.get_serializer(paginated_posts, many=True)
        return paginator.get_paginated_response(serializer.data)


# TODO: Old 게시물 검색 API 삭제하기
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
    serializer_class = CustomUserSearchSerializer
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
