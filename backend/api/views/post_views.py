from ..serializers import PostSerializer, ProjectSerializer, CustomUserSerializer
from ..models import (
    Post,
    PostImage,
    Project,
    Keyword,
    ProjectImage,
    Contact,
    Notification,
    CustomUser,
    Like,
)
from rest_framework import generics, permissions, status
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from rest_framework.exceptions import NotFound
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework.permissions import AllowAny


class PostCreateView(generics.CreateAPIView):
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        post = serializer.save(user=self.request.user)
        post.save()


# class PostListView(generics.ListAPIView):
#     serializer_class = PostSerializer
#     permission_classes = [IsAuthenticated]
#     pagination_class = None

#     def get_queryset(self):
#         project_card_id = self.request.query_params.get("project_card_id")

#         if project_card_id:
#             return Post.objects.filter(project_card__id=project_card_id).order_by(
#                 "-created_at"
#             )
#         else:
#             return Post.objects.all().order_by("-created_at")


# 모든 게시물을 조회하는 API (ListAPIView)
class PostListView(generics.ListAPIView):
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None
    queryset = Post.objects.all().order_by("-created_at")


# 특정 ProjectCard에 속한 게시물을 조회하는 API (ListAPIView)
class PostByProjectView(generics.ListAPIView):
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        project_card_id = self.kwargs.get(
            "project_card_id"
        )  # URL에서 project_card_id 가져오기
        return Post.objects.filter(project_card__id=project_card_id).order_by(
            "-created_at"
        )


# 특정 Post ID로 게시물 하나만 조회하는 API (RetrieveAPIView)
class PostRetrieveView(generics.RetrieveAPIView):
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticated]
    queryset = Post.objects.all()  # 단일 게시물 조회


class PostLikedListView(generics.ListAPIView):
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        user = self.request.user
        liked_posts = Post.objects.filter(liked_users=user).order_by("-created_at")
        return liked_posts


class PostUpdateView(generics.UpdateAPIView):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_update(self, serializer):
        serializer.save()


class PostDeleteView(generics.DestroyAPIView):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticated]


class PostLikeToggleView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        post_id = kwargs.get("post_id")
        post = get_object_or_404(Post, pk=post_id)
        user = request.user

        if user in post.liked_users.all():
            # 이미 좋아요를 눌렀다면, 좋아요 취소
            post.liked_users.remove(user)
            post.like_count -= 1
            message = "Post unliked"
        else:
            # 좋아요를 새로 누르면 추가
            post.liked_users.add(user)
            post.like_count += 1
            message = "Post liked"

            # 게시물 생성자에게 좋아요 알림 생성
            if post.user != user:
                notification_exists = Notification.objects.filter(
                    user=post.user,
                    message=f"{user.profile.user_name}님이 {post.project_card.title}의 게시물을 좋아합니다.",
                    notification_type="post_like",
                    related_user_id=user.id,
                    related_project_card_id=post.project_card.id,
                    related_post_id=post.id,
                ).exists()

                if not notification_exists:
                    Notification.objects.create(
                        user=post.user,  # 게시물 작성자
                        message=f"{user.profile.user_name}님이 {post.project_card.title}의 게시물을 좋아합니다.",
                        notification_type="post_like",
                        related_user_id=user.id,
                        related_project_card_id=post.project_card.id,
                        related_post_id=post.id,
                    )

        # 변경된 좋아요 개수 저장
        post.save(update_fields=["like_count"])

        return Response(
            {"message": message, "like_count": post.like_count},
            status=status.HTTP_200_OK,
        )


# TODO: The following are all old post codes. To be deleted later
class ProjectListCreate(generics.ListCreateAPIView):
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        return Project.objects.filter(user=self.request.user).order_by(
            "-created_at"
        )  # Return only the projects of the currently logged-in user

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
                        related_project_card_id=project.project_id,
                    ).exists()

                    if not notification_exists:
                        # Notification 생성
                        Notification.objects.create(
                            user=user,
                            message=f"{self.request.user.profile.user_name}님이 당신을 {project.title} 게시물에 태그했습니다.",
                            notification_type="project_tag",
                            related_project_card_id=project.project_id,
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
                    related_project_card_id=project.project_id,
                ).exists()

                # 중복 알림이 없을 때만 생성
                if not existing_notification:
                    Notification.objects.create(
                        user=profile_user,
                        message=notification_message,
                        notification_type="project_profile_keyword",
                        related_project_card_id=project.project_id,
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
                        related_project_card_id=project.project_id,
                    ).exists()

                    if not notification_exists:
                        # 알림 생성
                        Notification.objects.create(
                            user=user,
                            message=f"{self.request.user.profile.user_name}님이 당신을 {project.title} 게시물에 태그했습니다.",
                            notification_type="project_tag",
                            related_project_card_id=project.project_id,
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
                related_project_card_id=project.project_id,
            ).exists()

            # 중복 알림이 없을 때만 생성
            if not existing_notification:
                Notification.objects.create(
                    user=profile_user,
                    message=notification_message,
                    notification_type="project_profile_keyword",
                    related_project_card_id=project.project_id,
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
