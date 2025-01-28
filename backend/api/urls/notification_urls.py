from django.urls import path
from .. import views

# Notifications
urlpatterns = [
    path(
        "list/",
        views.NotificationListView.as_view(),
        name="notification-list",
    ),
    path(
        "create/",
        views.NotificationCreateView.as_view(),
        name="notification-create",
    ),
    path(
        "<int:pk>/update/",
        views.NotificationUpdateView.as_view(),
        name="notification-update",
    ),
    path(
        "<int:pk>/delete/",
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
