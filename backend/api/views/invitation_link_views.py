from uuid import uuid4
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.conf import settings
from django.utils import timezone
from api.models import InvitationLink, Notification
from api.serializers import InvitationLinkSerializer
from rest_framework import status
from rest_framework.exceptions import ValidationError
import logging

logger = logging.getLogger(__name__)


class CreateInvitationLinkView(generics.CreateAPIView):
    serializer_class = InvitationLinkSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request):
        unique_code = str(uuid4())
        name = request.data.get("name", "")

        invitation_link = InvitationLink.objects.create(
            inviter=request.user,
            invitee_name=name,
            invitee_id=None,
            link=f"{settings.TEAMBL_URL}welcome?code={unique_code}",
        )

        return Response(
            self.get_serializer(invitation_link).data,
            status=status.HTTP_201_CREATED,
        )


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

        # print(f"Fetching InvitationLinks for invitee_id: {invitee_id}")
        # print(f"Queryset: {queryset}")

        return queryset


# Code로부터 초대 링크를 찾아서 반환하는 뷰
# OldName: WelcomeView
class InvitationLinkRetrieveFromCodeView(generics.GenericAPIView):
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
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                # 초대 링크가 이미 사용되었는지 확인
                if invite_link.status == "accepted":
                    logger.warning(
                        f"Invitation link already used: code={code}"
                    )  # 로그 추가
                    return Response(
                        {"message": "Invitation link already used"},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                # 성공적으로 초대 링크 반환
                logger.info(
                    f"Invitation link valid: code={code}, inviter={inviter_name}, invitee={invitee_name}"
                )  # 로그 추가
                return Response(
                    InvitationLinkSerializer(invite_link).data,
                    status=status.HTTP_200_OK,
                )
            except InvitationLink.DoesNotExist:
                logger.warning(f"Invalid invitation code: {code}")  # 로그 추가
                return Response(
                    {"message": "Invalid invitation code.", "error_type": "invalid"},
                    status=status.HTTP_400_BAD_REQUEST,
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
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )
        else:
            logger.warning("Invalid invitation code provided")  # 로그 추가
            return Response(
                {"message": "Invalid invitation code.", "error_type": "invalid"},
                status=status.HTTP_400_BAD_REQUEST,
            )


class InvitationLinkDelete(generics.DestroyAPIView):
    serializer_class = InvitationLinkSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return InvitationLink.objects.filter(inviter=user)
