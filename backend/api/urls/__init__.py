from django.urls import include, path

# 파일 이름 순서대로 정렬
urlpatterns = [
    path("comment/", include("api.urls.comment_urls")),
    path("friend/", include("api.urls.friend_urls")),
    path("keyword/", include("api.urls.keyword_urls")),
    path("notification/", include("api.urls.notification_urls")),
    path("others/", include("api.urls.others_urls")),  # 남은 것들.
    path("post/", include("api.urls.post_urls")),
    path("profile/", include("api.urls.profile_urls")),
    path("project_card/", include("api.urls.project_card_urls")),
    path("search_history/", include("api.urls.search_history_urls")),
    path("search/", include("api.urls.search_urls")),
    path("skill/", include("api.urls.skill_urls")),
    path("user/", include("api.urls.user_urls")),
]