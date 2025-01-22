from django.urls import path
from .. import views

# Project Cards
urlpatterns = [
    path("list/", views.ProjectCardListView.as_view(), name="project-card-list"),
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
        "<int:pk>/update/",
        views.ProjectCardUpdateView.as_view(),
        name="project-card-update",
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
        "project-cards/invitation/create/",
        views.ProjectCardInvitationCreateView.as_view(),
        name="project-card-invitation-create",
    ),
    path(
        "project-cards/invitation/<int:pk>/response/",
        views.ProjectCardInvitationResponseView.as_view(),
        name="project-card-invitation-response",
    ),
]
