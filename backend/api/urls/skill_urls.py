from django.urls import path
from .. import views

# Skill
urlpatterns = [
    path("list/", views.SkillListView.as_view(), name="skill-list"),
]
