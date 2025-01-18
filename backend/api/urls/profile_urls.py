from django.urls import path
from .. import views

# Profile
urlpatterns = [
    path("current/update/", views.ProfileUpdateView.as_view(), name="profile-update"),
    path("<int:userid>/get/", views.RetrieveProfileView.as_view(), name="profile-get"),
    path(
        "<int:user_id>/update-one-degree-count/",
        views.UpdateOneDegreeCountView.as_view(),
        name="profile-update-one-degree-count",
    ),
]
