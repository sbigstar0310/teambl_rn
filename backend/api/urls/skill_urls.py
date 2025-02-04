from django.urls import path
from .. import views

# Skill
urlpatterns = [
    path("list/", views.SkillListView.as_view(), name="skill-list"),
    path("search/", views.SkillSearchView.as_view(), name="skill-search"),
    path("recommendations/", views.RecommendedSkillsView.as_view(), name="skill-recommendations"),
    path("add/", views.SkillAddView.as_view(), name="skill-add"),
    path("delete/<int:pk>/", views.SkillDeleteView.as_view(), name="skill-delete"),
]
