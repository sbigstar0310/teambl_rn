from django.urls import path
from .. import views

# Project
urlpatterns = [
    path("create/", views.PostCreateView.as_view(), name="post-create"),
    path("list/", views.PostListView.as_view(), name="post-list"),
    path("<int:project_card_id>/", views.PostByProjectView.as_view(), name="post-by-project-card-id"),
    path("detail/<int:pk>/", views.PostRetrieveView.as_view(), name="post-detail"),
    path("list/liked/", views.PostLikedListView.as_view(), name="post-liked-list"),
    path("<int:pk>/update/", views.PostUpdateView.as_view(), name="post-update"),
    path("<int:pk>/delete/", views.PostDeleteView.as_view(), name="post-delete"),
    path("<int:post_id>/like/", views.PostLikeToggleView.as_view(), name="post-like-toggle"),
    # path("list-current/", views.ProjectListCreate.as_view(), name="post-list-current"),
    # path(
    #     "list-every/",
    #     views.ProjectEveryListCreate.as_view(),
    #     name="post-list-every",
    # ),
    # path(
    #     "<int:pk>/edit/",
    #     views.ProjectUpdateView.as_view(),
    #     name="post-edit",
    # ),
    # path(
    #     "<int:pk>/delete/",
    #     views.ProjectDelete.as_view(),
    #     name="post-delete",
    # ),
    # path("<int:pk>/get/", views.ProjectRetrieveView.as_view(), name="post-get"),
    # path(
    #     "<int:project_id>/like-toggle/",
    #     views.ProjectLikeToggleView.as_view(),
    #     name="post-like-toggle",
    # ),
    # path(
    #     "<int:project_id>/liked-status/",
    #     views.ProjectLikedStatusView.as_view(),
    #     name="post-liked-status",
    # ),
    # path(
    #     "<int:project_id>/tagged-users/",
    #     views.ProjectTaggedUsersListView.as_view(),
    #     name="post-tagged-users",
    # ),
    # path(
    #     "current/liked-list/",
    #     views.ProjectLikedListView.as_view(),
    #     name="post-current-liked-list",
    # ),
]
