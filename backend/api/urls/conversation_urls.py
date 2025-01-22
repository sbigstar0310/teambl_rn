from django.urls import path
from .. import views

# Conversation & Message
urlpatterns = [
    path(
        "conversations/", views.ConversationListView.as_view(), name="conversation-list"
    ),
    path(
        "conversations/create/",
        views.CreateConversationView.as_view(),
        name="conversation-create",
    ),
    path(
        "conversations/<int:conversation_id>/messages/",
        views.MessageListView.as_view(),
        name="message-list",
    ),
    path(
        "conversations/<int:conversation_id>/last-message/",
        views.LastMessageView.as_view(),
        name="last-message",
    ),
    path(
        "conversations/<int:pk>/delete/",
        views.DeleteConversationView.as_view(),
        name="conversation-delete",
    ),
    path(
        "conversations/<int:pk>/read/",
        views.ConversationReadView.as_view(),
        name="conversation-read",
    ),
    path(
        "messages/<int:conversation_id>/create/",
        views.CreateMessageView.as_view(),
        name="message-create",
    ),
    path(
        "messages/<int:pk>/delete/",
        views.DeleteMessageView.as_view(),
        name="message-delete",
    ),
]