from django.urls import path
from .. import views

# Report
urlpatterns = [
    path("create/", views.ReportCreateView.as_view(), name="report-create"),
]
