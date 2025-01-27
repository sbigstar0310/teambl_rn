from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from django.urls import reverse
from django.core import mail
from .utils import (
    create_post_with_images,
    create_user_with_profile,
    get_or_create_image_file,
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
        # 테스트용 이미지 파일 생성
        test_image = get_or_create_image_file(
            file_name="test_image.jpg",
            file_content=b"file_content_here",
            content_type="image/jpeg",
            image_dir="profile_images",
        )

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

        # check profile is updated
        print(response.status_code)
        print(response.data)

        # Check updated fields
        self.assertEqual(response.data["user_name"], data["user_name"])
        self.assertEqual(response.data["school"], data["school"])
        self.assertEqual(
            response.data["current_academic_degree"], data["current_academic_degree"]
        )
        self.assertEqual(response.data["keywords"], data["keywords"])
        self.assertEqual(response.data["skills"], data["skills"])
        self.assertEqual(response.data["major1"], data["major1"])


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
