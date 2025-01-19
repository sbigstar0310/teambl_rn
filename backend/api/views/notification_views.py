from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from ..models import Notification
from ..serializers import NotificationSerializer
from rest_framework.response import Response


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
    serializer_class = NotificationSerializer
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
