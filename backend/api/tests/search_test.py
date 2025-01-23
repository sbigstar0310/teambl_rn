from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from django.urls import reverse
from django.core import mail
from .utils import create_user_with_profile
from ..models import CustomUser, Post, ProjectCard


class SearchProjectsCardAPIViewTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = reverse("search-project-card")  # URL 이름으로 동적 매핑

        self.testuser01 = create_user_with_profile(
            email="test@email.com", password="test", user_name="testuser1"
        )

        # 로그인
        self.client.force_authenticate(user=self.testuser01)

        # 테스트용 프로젝트카드 생성
        ProjectCard.objects.create(
            title="test1",
            creator=self.testuser01,
            start_date="2021-01-01",
            end_date="2021-12-31",
            description="test1",
        )
        ProjectCard.objects.create(
            title="test2",
            creator=self.testuser01,
            start_date="2021-01-01",
            end_date="2021-12-31",
            description="test2",
        )

    def test_get_project_card_list(self):
        # 프로젝트 카드 검색
        response = self.client.post(self.url, {"q": "test1"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # 제대로 검색 되었는지 확인
        self.assertEqual(response.data["count"], 1)


class SearchPostsAPIViewTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = reverse("search-post")  # URL 이름으로 동적 매핑

        self.testuser01 = create_user_with_profile(
            email="test@email.com", password="test", user_name="testuser1"
        )

        # 로그인
        self.client.force_authenticate(user=self.testuser01)

        # 테스트용 Post 생성
        Post.objects.create(
            user=self.testuser01, project_card=None, content="test1", like_count=0
        )
        Post.objects.create(
            user=self.testuser01, project_card=None, content="test2", like_count=0
        )

    def test_get_post_list(self):
        # 게시글 검색
        response = self.client.post(self.url, {"q": "test1"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # 제대로 검색 되었는지 확인
        self.assertEqual(response.data["count"], 1)
