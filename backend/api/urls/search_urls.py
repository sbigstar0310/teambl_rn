from django.urls import path
from .. import views

# Search
urlpatterns = [
    path("user/", views.SearchUsersAPIView.as_view(), name="seach-user"),
    path("name/", views.SearchUsersByNameAPIView.as_view(), name="search-name"),
    path(
        "project/",
        views.SearchProjectsAPIView.as_view(),
        name="search-project",
    ),
    path(
        "experience/",
        views.SearchExperienceAPIView.as_view(),
        name="search-experience",
    ),
]
