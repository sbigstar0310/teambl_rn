from django.urls import path
from .. import views

# Invitation Link
urlpatterns = [
    path(
        "create/",
        views.CreateInvitationLinkView.as_view(),
        name="invitation-link-create",
    ),
    path(
        "<int:pk>/delete/",
        views.InvitationLinkDelete.as_view(),
        name="invitation-link-delete",
    ),
    path(
        "list/",
        views.InvitationLinkList.as_view(),
        name="invitation-link-list",
    ),
    path(
        "retrieve-from-code/",
        views.InvitationLinkRetrieveFromCodeView.as_view(),
        name="invitation-link-retrieve-from-code",
    ),
]
