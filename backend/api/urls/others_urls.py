from django.urls import path
from .. import views

urlpatterns = []

# Conversation & Message
urlpatterns += [
    path(
        "conversations/", views.ConversationListView.as_view(), name="conversation-list"
    ),
    path(
        "conversations/create/",
        views.CreateConversationView.as_view(),
        name="conversation-create",
    ),
    path(
        "conversations/<int:conversation_id>/messages/",
        views.MessageListView.as_view(),
        name="message-list",
    ),
    path(
        "conversations/<int:conversation_id>/last-message/",
        views.LastMessageView.as_view(),
        name="last-message",
    ),
    path(
        "conversations/<int:pk>/delete/",
        views.DeleteConversationView.as_view(),
        name="conversation-delete",
    ),
    path(
        "conversations/<int:pk>/read/",
        views.ConversationReadView.as_view(),
        name="conversation-read",
    ),
    path(
        "messages/<int:conversation_id>/create/",
        views.CreateMessageView.as_view(),
        name="message-create",
    ),
    path(
        "messages/<int:pk>/delete/",
        views.DeleteMessageView.as_view(),
        name="message-delete",
    ),
]

# Experience
urlpatterns += [
    path(
        "experiences/<int:user_id>/",
        views.ExperienceByUserListView.as_view(),
        name="experience-list",
    ),
    path(
        "experiences-with-pending/<int:user_id>/",
        views.ExperienceByUserWithPendingListView.as_view(),
        name="experience-list-with-pending",
    ),
    path(
        "experiences/every/",
        views.ExperienceEveryListView.as_view(),
        name="experience-every-list",
    ),
    path(
        "experiences/create/",
        views.ExperienceCreateView.as_view(),
        name="experience-create",
    ),
    path(
        "experiences/<int:pk>/update/",
        views.ExperienceUpdateView.as_view(),
        name="experience-update",
    ),
    path(
        "experiences/<int:pk>/delete/",
        views.ExperienceDestroyView.as_view(),
        name="experience-delete",
    ),
    path(
        "experiences/<int:pk>/delete/accepted-users/",
        views.ExperienceAcceptedUsersUpdateView.as_view(),
        name="experience-update-accepted-users",
    ),
]

# Experience Detail
urlpatterns += [
    path(
        "experience-details/",
        views.ExperienceDetailListView.as_view(),
        name="experience-detail",
    ),
    path(
        "experience-details/create/",
        views.ExperienceDetailCreateView.as_view(),
        name="experience-detail-create",
    ),
    path(
        "experience-details/<int:pk>/update/",
        views.ExperienceDetailUpdateView.as_view(),
        name="experience-detail-update",
    ),
    path(
        "experience-details/<int:pk>/delete/",
        views.ExperienceDetailDestroyView.as_view(),
        name="experience-detail-delete",
    ),
]


# OnOff Experience Invitation
urlpatterns += [
    path(
        "experience-link/<int:user_id>/<int:experience_id>/",
        views.ExperienceLinkView.as_view(),
        name="experience-link",
    ),
    path(
        "experience-detail/<str:encrypted_id>/",
        views.ExperienceDetailFromLinkView.as_view(),
        name="experience-detail",
    ),
    path(
        "experience-after-invitation/<str:encrypted_id>/",
        views.ExperienceAfterInvitationView.as_view(),
        name="experience-after-invitation",
    ),
]

# ExperienceInvitation
urlpatterns += [
    # 경험 초대 생성
    path(
        "experiences/invitations/create/",
        views.ExperienceInvitationCreateView.as_view(),
        name="experience-invitation-create",
    ),
    # 경험 초대 수락/거절
    path(
        "experiences/invitations/respond/",
        views.ExperienceInvitationResponseView.as_view(),
        name="experience-invitation-response",
    ),
    path(
        "experiences/invitations/",
        views.ExperienceInvitationListView.as_view(),
        name="experience-invitation-list",
    ),
    path(
        "experiences/invitations/delete/<int:experience_invitation_id>/",
        views.ExperienceInvitationDeleteView.as_view(),
        name="experience-invitation-delete",
    ),
]

# Endorsement
urlpatterns += [
    path(
        "endorsements/",
        views.EndorsementListCreateView.as_view(),
        name="endorsement-list",
    ),
    path(
        "delete-endorsement/<int:pk>/",
        views.EndorsementDeleteView.as_view(),
        name="delete-endorsement",
    ),
]


# Invitation
urlpatterns += [
    path(
        "create-invitation-link/",
        views.CreateInvitationLinkView.as_view(),
        name="create-invitation-link",
    ),
    path(
        "delete-invitation-link/<int:pk>/",
        views.InvitationLinkDelete.as_view(),
        name="delete-invitation-link",
    ),
    path(
        "invitation-links/", views.InvitationLinkList.as_view(), name="invitation-links"
    ),
]


# User Similarity
urlpatterns += [
    path(
        "user-similarity/",
        views.KeywordBasedUserSimilarityView.as_view(),
        name="user-similarity",
    ),
]

# Password
urlpatterns += [
    path(
        "change-password/",
        views.ChangePasswordView.as_view(),
        name="change-password",
    ),
    path(
        "check-password/",
        views.CheckPasswordView.as_view(),
        name="check-password",
    ),
]

# 이메일로 문의 보내기 기능이 구현되어서 삭제해도 되지 않을까..?
# Inquiry
urlpatterns += [
    path("create-inquiry/", views.InquiryCreateView.as_view(), name="create-inquiry"),
]

# Email
urlpatterns += [
    path("send-code-email/", views.SendCodeView.as_view(), name="send_code"),
    path(
        "send-inquiry-email/",
        views.SendInquiryEmailView.as_view(),
        name="send_inquiry_email",
    ),
    path("send-email/", views.SendEmailView.as_view(), name="send_email"),
]


# New User Suggestions (이번주 새로운 회원 소식)
urlpatterns += [
    path(
        "new-user-suggestions/",
        views.NewUserSuggestionView.as_view(),
        name="new-user-suggestions",
    ),
]


# Others
urlpatterns += [
    path("check-email/", views.CheckEmailExistsView.as_view(), name="check-email"),
    path("welcome/", views.WelcomeView.as_view(), name="welcome-view"),
    path("search/", views.SearchUsersAPIView.as_view(), name="search-view"),
    path(
        "search-users/", views.SearchUsersByNameAPIView.as_view(), name="search-by-name"
    ),
    path(
        "get-user-distance/<int:pk>/",
        views.GetUserDistanceAPIView.as_view(),
        name="get-user-distance",
    ),
    path(
        "user-statistics-difference/",
        views.UserStatisticsDifferenceView.as_view(),
        name="user-statistics-difference",
    ),
    path(
        "path/<int:target_user_id>/",
        views.GetUserAllPathsAPIView.as_view(),
        name="get-all-user-paths",
    ),
    path(
        "users/same-major/",
        views.SameMajorUsersListView.as_view(),
        name="same-major-users",
    ),
    path(
        "users/same-degree-year/",
        views.SameAcademicDegreeAndYearView.as_view(),
        name="same-degree-year-users",
    ),
]
