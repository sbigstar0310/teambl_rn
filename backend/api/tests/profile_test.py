from django.conf import settings
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from django.urls import reverse
from django.core import mail
from .utils import (
    create_post_with_images,
    create_user_with_profile,
    delete_s3_file,
    get_image_from_url,
)
from ..models import CustomUser, Friend, Keyword, Post, PostImage, ProjectCard, Skill
from django.core.files.uploadedfile import SimpleUploadedFile


class ProfileUpdateViewTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = reverse("profile-update")  # Dynamic URL mapping

        # Create a test user
        self.testuser01 = create_user_with_profile(
            email="test@email.com", password="test", user_name="testuser1"
        )

        # force authenticate
        self.client.force_authenticate(user=self.testuser01)

    def test_update_profile(self):
        # Prepare valid post data
        data = {
            "user_name": "new name",
            "school": "new school",
            "current_academic_degree": "박사",
            "year": 2020,
            "major1": "수리과학부",
            "major2": "전기및전자공학과",
            "introduction": "new introduction",
            "skills": ["new skill1", "new skill2"],
            "portfolio_links": ["https://new_link.com/"],
            # "image": test_image,
            "keywords": ["new keyword1", "new keyword2"],
        }

        # Perform POST request with multipart/form-data
        response = self.client.patch(self.url, data, format="multipart")

        # Assert the response
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Check updated fields
        self.assertEqual(response.data["user_name"], data["user_name"])
        self.assertEqual(response.data["school"], data["school"])
        self.assertEqual(
            response.data["current_academic_degree"], data["current_academic_degree"]
        )
        self.assertEqual(response.data["keywords"], data["keywords"])
        self.assertEqual(response.data["skills"], data["skills"])
        self.assertEqual(response.data["major1"], data["major1"])

    def test_update_profile_with_image(self):
        # 테스트용 이미지 파일 생성
        test_image = get_image_from_url()
        data = {
            "image": test_image,
        }

        # Perform POST request with multipart/form-data
        response = self.client.patch(self.url, data, format="multipart")
        print(response.data)

        # Assert the response
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # 응답의 'image' 필드가 존재하는지 확인
        image_url = response.data.get("image")
        self.assertIsNotNone(image_url, "🔴 'image' 필드가 응답에 포함되지 않음")

        # 응답의 image URL이 S3 도메인을 포함하는지 확인
        self.assertIn(
            "s3.amazonaws.com", image_url, "🔴 업로드된 이미지가 S3에 저장되지 않음"
        )

        # 테스트 이미지 삭제하기
        self.testuser01.refresh_from_db()
        s3_key = self.testuser01.profile.image.name
        delete_s3_file(s3_key)  # ✅ S3에서 파일 삭제


class RetrieveProfileViewTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Create test user
        self.testuser01 = create_user_with_profile(
            email="test@email.com", password="test", user_name="testuser1"
        )

        self.keyword1 = Keyword.objects.create(keyword="keyword1")
        self.keyword2 = Keyword.objects.create(keyword="keyword2")
        self.testuser01.profile.keywords.set([self.keyword1, self.keyword2])

        self.skill1 = Skill.objects.create(
            profile=self.testuser01.profile, skill="skill1"
        )
        self.skill2 = Skill.objects.create(
            profile=self.testuser01.profile, skill="skill2"
        )

        # Force authenticate
        self.client.force_authenticate(user=self.testuser01)

        # URL 생성
        self.url = reverse("profile-get", args=[self.testuser01.id])

    def test_retrieve_profile(self):
        # Perform GET request
        response = self.client.get(self.url, format="json")

        # Assert response status
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Assert retrived profile is valid
        self.assertEqual(
            response.data.get("user_name"), self.testuser01.profile.user_name
        )


class UpdateOneDegreeCountViewTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Create test user
        self.testuser01 = create_user_with_profile(
            email="test01@email.com", password="test", user_name="testuser1"
        )
        self.testuser02 = create_user_with_profile(
            email="test02@email.com", password="test", user_name="testuser2"
        )

        # Create Friend Relationship
        Friend.objects.create(
            from_user=self.testuser01, to_user=self.testuser02, status="accepted"
        )

        # Force authenticate
        self.client.force_authenticate(user=self.testuser01)

        # URL 생성
        self.url = reverse("profile-update-one-degree-count", args=[self.testuser01.id])

    def test_retrieve_profile(self):
        # Perform GET request
        response = self.client.post(self.url, format="json")

        # Assert response status
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Assert retrived profile is valid
        self.assertEqual(response.data.get("one_degree_count"), 1)
