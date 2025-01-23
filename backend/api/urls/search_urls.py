from django.urls import path
from .. import views

# Search
urlpatterns = [
    path("user/", views.SearchUsersAPIView.as_view(), name="seach-user"),
    path("name/", views.SearchUsersByNameAPIView.as_view(), name="search-name"),
    path(
        "project-card/",
        views.SearchProjectCardsAPIView.as_view(),
        name="search-project-card",
    ),
    path(
        "post/",
        views.SearchPostsAPIView.as_view(),
        name="search-post",
    ),
    path(  # TODO: Old search endpoint, remove
        "project/",
        views.SearchProjectsAPIView.as_view(),
        name="search-project",
    ),
    path(  # TODO: Old search endpoint, remove
        "experience/",
        views.SearchExperienceAPIView.as_view(),
        name="search-experience",
    ),
]
