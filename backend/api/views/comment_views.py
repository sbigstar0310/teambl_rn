from django.shortcuts import get_object_or_404
from rest_framework import generics, status
from ..models import (
    Notification,
    Project,
    Comment,
)
from ..serializers import CommentSerializer, CustomUserSerializer
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework.exceptions import ValidationError
from staff_emails import STAFF_EMAILS
from django.db.models import Q


# 댓글 작성
class CommentCreateView(generics.CreateAPIView):
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated]

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
    permission_classes = [IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        project_id = self.kwargs.get("project_id")
        return Comment.objects.filter(project_id=project_id)


# 댓글 수정
class CommentUpdateView(generics.UpdateAPIView):
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated]
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
    permission_classes = [IsAuthenticated]
    queryset = Comment.objects.all()

    def perform_destroy(self, instance):
        if instance.user != self.request.user:
            return Response(
                {"error": "You are not allowed to delete this comment"},
                status=status.HTTP_403_FORBIDDEN,
            )
        super().perform_destroy(instance)