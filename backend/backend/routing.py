from django.urls import path
from api.consumers import ChatConsumer

websocket_urlpatterns = [
    path('ws/conversations/<int:conversation_id>/', ChatConsumer.as_asgi()),
]