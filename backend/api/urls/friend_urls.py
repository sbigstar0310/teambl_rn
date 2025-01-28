from django.urls import path
from .. import views

# Friends
urlpatterns = [
    path("list-or-create/", views.ListCreateFriendView.as_view(), name="friend-list-or-create"),
    path(
        "<int:user_id>/list/",
        views.ListFriendView.as_view(),
        name="friend-list",
    ),
    path(
        "<int:pk>/update/",
        views.FriendUpdateView.as_view(),
        name="friend-update",
    ),
    path(
        "<int:pk>/delete/",
        views.FriendDeleteView.as_view(),
        name="friend-delete",
    ),
    path(
        "one-degree/",
        views.OneDegreeFriendsView.as_view(),
        name="friend-one-degree",
    ),
    path(
        "request-cancel/",
        views.FriendRequestCancelView.as_view(),
        name="friend-request-cancel",
    ),
]
