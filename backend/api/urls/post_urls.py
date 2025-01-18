from django.urls import path
from .. import views

# Project
# TODO: Change name to Post
urlpatterns = [
    path("list-current/", views.ProjectListCreate.as_view(), name="post-list-current"),
    path(
        "list-every/",
        views.ProjectEveryListCreate.as_view(),
        name="post-list-every",
    ),
    path(
        "<int:pk>/edit/",
        views.ProjectUpdateView.as_view(),
        name="post-edit",
    ),
    path(
        "<int:pk>/delete/",
        views.ProjectDelete.as_view(),
        name="post-delete",
    ),
    path("<int:pk>/get/", views.ProjectRetrieveView.as_view(), name="post-get"),
    path(
        "<int:project_id>/like-toggle/",
        views.ProjectLikeToggleView.as_view(),
        name="post-like-toggle",
    ),
    path(
        "<int:project_id>/liked-status/",
        views.ProjectLikedStatusView.as_view(),
        name="post-liked-status",
    ),
    path(
        "<int:project_id>/tagged-users/",
        views.ProjectTaggedUsersListView.as_view(),
        name="post-tagged-users",
    ),
    path(
        "current/liked-list/",
        views.ProjectLikedListView.as_view(),
        name="post-current-liked-list",
    ),
]
