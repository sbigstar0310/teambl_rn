from django.urls import path
from .. import views

# Friends
urlpatterns = [
    path("create/", views.FriendCreateView.as_view(), name="friend-create"),
    path(
        "<int:user_id>/list/",
        views.FriendListView.as_view(),
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
        "<int:user_id>/one-degree/",
        views.OneDegreeFriendsView.as_view(),
        name="friend-one-degree",
    ),
    path(
        "<int:pk>/request-cancel/",
        views.FriendRequestCancelView.as_view(),
        name="friend-request-cancel",
    ),
]
