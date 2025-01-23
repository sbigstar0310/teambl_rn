from rest_framework import generics, permissions, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from ..models import (
    CustomUser,
    Notification,
    Conversation,
    Message,
)
from ..serializers import (
    ConversationSerializer,
    MessageSerializer,
)
from django.db.models import Q


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
