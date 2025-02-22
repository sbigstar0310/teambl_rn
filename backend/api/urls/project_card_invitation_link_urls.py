from django.urls import path
from .. import views

# Project Card Invitation
urlpatterns = [
    path(
        "create/",
        views.ProjectCardInvitationLinkCreateView.as_view(),
        name="project-card-invitation-link-create",
    ),
    path(
        "retrieve-from-code/",
        views.ProjectCardInvitationLinkRetreiveFromCodeView.as_view(),
        name="project-card-invitation-link-retrieve-from-code",
    ),
    path(
        "<int:pk>/delete/",
        views.ProjectCardInvitationLinkDeleteView.as_view(),
        name="project-card-invitation-link-delete",
    ),
]
