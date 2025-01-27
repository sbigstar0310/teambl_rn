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


class CreateUserAloneViewTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = reverse("register-alone")  # Dynamic URL mapping

        # # Create a test user
        # self.testuser01 = create_user_with_profile(
        #     email="test@email.com", password="test", user_name="testuser1"
        # )

        # # force authenticate
        # self.client.force_authenticate(user=self.testuser01)

    def test_create_user(self):
        # Prepare valid post data
        data = {
            "email": "testuser01@email.com",
            "password": "1234",
            "profile": {
                "user_name": "name",
                "school": "school",
                "current_academic_degree": "박사",
                "year": 2020,
                "major1": "수리과학과",
                "major2": "생명과학과",
                "keywords": ["new keyword1", "new keyword2"],
            },
        }

        # Perform POST request with multipart/form-data
        response = self.client.post(self.url, data, format="json")

        # Assert the response
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # Check created fields
        self.assertEqual(response.data.get("email"), data.get("email"))
        self.assertEqual(
            response.data.get("profile").get("user_name"),
            data.get("profile").get("user_name"),
        )
        self.assertEqual(
            response.data.get("profile").get("keywords"),
            data.get("profile").get("keywords"),
        )
