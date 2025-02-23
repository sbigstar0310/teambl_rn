from django.urls import path
from .. import views

# Project Cards
urlpatterns = [
    path("list/", views.ProjectCardListView.as_view(), name="project-card-list"),
    path(
        "list/current/",
        views.ProjectCardCurrentListView.as_view(),
        name="project-card-current-list",
    ),
    path(
        "list/current/bookmarked/",
        views.ProjectCardBookmarkedListView.as_view(),
        name="project-card-bookmarked-list",
    ),
    path(
        "list/<int:user_id>/",
        views.ProjectCardOneDegreeListView.as_view(),
        name="project-card-one-degree-list",
    ),
    path(
        "create/",
        views.ProjectCardCreateView.as_view(),
        name="project-card-create",
    ),
    path(
        "<int:pk>/retrieve/",
        views.ProjectCardRetrieveView.as_view(),
        name="project-card-retrieve",
    ),
    path(
        "<int:pk>/update/",
        views.ProjectCardUpdateView.as_view(),
        name="project-card-update",
    ),
    path(
        "<int:pk>/bookmark-toggle/",
        views.ProjectCardBookmarkToggleView.as_view(),
        name="project-card-bookmark-toggle",
    ),
    path(
        "<int:pk>/leave/",
        views.ProjectCardLeaveView.as_view(),
        name="project-card-leave",
    ),
    path(
        "<int:pk>/delete/",
        views.ProjectCardDestroyView.as_view(),
        name="project-card-delete",
    ),
]

# Project Card Invitation
urlpatterns += [
    path(
        "invitation/create/",
        views.ProjectCardInvitationCreateView.as_view(),
        name="project-card-invitation-create",
    ),
    path(
        "<int:project_card_id>/invitation/<int:invitee_id>/delete/",
        views.ProjectCardInvitationDeleteView.as_view(),
        name="project-card-invitation-delete",
    ),
    path(
        "invitation/<int:pk>/response/",
        views.ProjectCardInvitationResponseView.as_view(),
        name="project-card-invitation-response",
    ),
    path(
        "invitation/response-by-code/",
        views.ProjectCardInvitationResponseByCodeView.as_view(),
        name="project-card-invitation-with-link",
    ),
    path("link/", views.ProjectCardLinkView.as_view(), name="project-card-link"),
]
