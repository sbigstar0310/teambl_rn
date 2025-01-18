from django.urls import path
from .. import views

# Search History
urlpatterns = [
    path(
        "",
        views.SearchHistoryListCreateView.as_view(),
        name="search-history-list-create",
    ),
    path(
        "<int:pk>/delete/",
        views.SearchHistoryDeleteView.as_view(),
        name="search-history-delete",
    ),
]
