from celery import shared_task
from django.utils import timezone
from .models import Project, CustomUser, Notification

@shared_task
def send_recommendations():
    users = CustomUser.objects.all()
    for user in users:
        user_keywords = set(user.profile.keywords.values_list('keyword', flat=True))
        user_skills = set(user.profile.skills.values_list('skill', flat=True))
        all_tags = user_keywords | user_skills

        # 매칭되는 프로젝트 필터링
        matching_projects = Project.objects.filter(
            keywords__keyword__in=all_tags
        ).distinct()[:5]  # 예시로 상위 5개의 추천 프로젝트 가져옴

        for project in matching_projects:
            # 동일한 추천 알림이 이미 있는지 확인
            if not Notification.objects.filter(
                user=user,
                message__icontains=project.title,
                notification_type="project_profile_keyword"
            ).exists():
                Notification.objects.create(
                    user=user,
                    message=f"당신이 흥미로워 할만한 {project.title} 게시물을 추천해드려요.",
                    notification_type="project_profile_keyword",
                )