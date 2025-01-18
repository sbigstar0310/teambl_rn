from django.urls import path
from .. import views

# Keyword
urlpatterns = [
    path("list/", views.KeywordListView.as_view(), name="keyword-list"),
]
