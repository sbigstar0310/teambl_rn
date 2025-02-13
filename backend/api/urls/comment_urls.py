from django.urls import path
from .. import views

# Comment
urlpatterns = [
    path(
        "<int:post_id>/list/",
        views.CommentListView.as_view(),
        name="comment-list",
    ),
    path(
        "<int:post_id>/create/",
        views.CommentCreateView.as_view(),
        name="comment-create",
    ),
    path(
        "<int:pk>/edit/",
        views.CommentUpdateView.as_view(),
        name="comment-edit",
    ),
    path(
        "<int:pk>/delete/",
        views.CommentDeleteView.as_view(),
        name="comment-delete",
    ),
]
