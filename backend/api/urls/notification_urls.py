from django.urls import path
from .. import views

# Notifications
urlpatterns = [
    path(
        "list/",
        views.NotificationListCreateView.as_view(),
        name="notification-list",
    ),
    path(
        "update/<int:pk>/",
        views.NotificationUpdateView.as_view(),
        name="notification-update",
    ),
    path(
        "delete/<int:pk>/",
        views.NotificationDeleteView.as_view(),
        name="notification-delete",
    ),
    path(
        "unread-count/",
        views.UnreadNotificationCountView.as_view(),
        name="notification-unread-count",
    ),
    path(
        "all-read/",
        views.NotificationAllReadView.as_view(),
        name="notification-all-read",
    ),
]
