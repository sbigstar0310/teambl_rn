from django.utils import timezone
from django.conf import settings
from django.shortcuts import get_object_or_404
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from ..models import (
    Friend,
    ProjectCard,
    ProjectCardInvitation,
    ProjectCardInvitationLink,
    CustomUser,
    Notification,
)
from ..serializers import ProjectCardSerializer, ProjectCardInvitationLinkSerializer
from django.db.models import Q
from rest_framework.exceptions import PermissionDenied
import uuid


class ProjectCardInvitationLinkCreateView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ProjectCardInvitationLinkSerializer

    def perform_create(self, serializer):
        user = self.request.user
        unique_code = str(uuid.uuid4())
        project_card_invitation_link = serializer.save(
            inviter=user,
            link=f"{settings.TEAMBL_URL}project-card/welcome?code={unique_code}",
            status="pending",
        )


class ProjectCardInvitationLinkRetreiveFromCodeView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ProjectCardInvitationLinkSerializer

    def get_object(self):
        code = self.request.query_params.get("code")
        return get_object_or_404(ProjectCardInvitationLink, link__endswith=code)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()

        # 만료 날짜 계산
        expired_date = instance.created_at + timezone.timedelta(days=7)
        current_date = timezone.now()

        # 초대 링크가 만료된 경우
        if current_date > expired_date:
            instance.status = "expired"
            instance.save()

            return Response(
                {
                    "message": "Invitation link is expired",
                    "error_type": "expired",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = self.get_serializer(instance)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ProjectCardInvitationLinkDeleteView(generics.DestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ProjectCardInvitationLinkSerializer
    queryset = ProjectCardInvitationLink.objects.all()
