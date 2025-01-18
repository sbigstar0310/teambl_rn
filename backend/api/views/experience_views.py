from django.conf import settings
from django.db.models import Q
from rest_framework import generics, status
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.generics import get_object_or_404
from ..serializers import (
    ExperienceSerializer,
    ExperienceDetailSerializer,
    ExperienceInvitationSerializer,
    CustomUserSerializer,
)
from ..models import (
    Experience,
    ExperienceDetail,
    ExperienceInvitation,
    Notification,
    CustomUser,
    Notification,
    Friend,
)
from ..HelperFuntions import (
    update_profile_one_degree_count,
    encrypt_id_short,
    decrypt_id_short,
)


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
