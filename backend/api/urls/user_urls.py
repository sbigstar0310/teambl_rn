from django.urls import path
from .. import views

# User
urlpatterns = [
    path("register-link/", views.CreateUserView.as_view(), name="register-link"),
    path("register-alone/", views.CreateUserAloneView.as_view(), name="register-alone"),
    path(
        "register-experience/",
        views.CreateUserByExperienceView.as_view(),
        name="register-experience",
    ),
    path("current/", views.CurrentUserView.as_view(), name="user-current"),
    path("current/delete/", views.DeleteUserView.as_view(), name="user-delete"),
    path("<int:id>/get/", views.OtherUserView.as_view(), name="user-get"),
    path("latest/", views.LatestUserIdView.as_view(), name="user-latest"),
    path("list/", views.AllUsersView.as_view(), name="user-list"),
    path("check-login/", views.CheckUserLoginView.as_view(), name="user-check-login"),
    path(
        "change-password/",
        views.ChangePasswordView.as_view(),
        name="change-password",
    ),
    path(
        "check-password/",
        views.CheckPasswordView.as_view(),
        name="check-password",
    ),
]
