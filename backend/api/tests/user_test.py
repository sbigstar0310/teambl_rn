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


class CurrentUserViewTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = reverse("user-current")  # Dynamic URL mapping

        # Create a test user
        self.testuser01 = create_user_with_profile(
            email="test01@email.com", password="test", user_name="testuser1"
        )

        # force authenticate
        self.client.force_authenticate(user=self.testuser01)

    def test_get_current_user(self):
        # Perform GET request
        response = self.client.get(self.url)

        # Assert the response
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Check created fields
        self.assertEqual(response.data.get("email"), self.testuser01.email)
        self.assertEqual(
            response.data.get("profile").get("user_name"),
            self.testuser01.profile.user_name,
        )


class DeleteUserViewTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = reverse("user-delete")  # Dynamic URL mapping

        # Create a test user
        self.testuser01 = create_user_with_profile(
            email="test01@email.com", password="test", user_name="testuser1"
        )

        # force authenticate
        self.client.force_authenticate(user=self.testuser01)

    def test_delete_user(self):
        # Perform DELETE request
        response = self.client.delete(self.url)

        # Assert the response
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

        # Check if the user is deleted
        self.assertEqual(CustomUser.objects.filter(id=self.testuser01.id).count(), 0)


class OtherUserViewTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Create a test user
        self.testuser01 = create_user_with_profile(
            email="test01@email.com", password="test", user_name="testuser1"
        )
        self.testuser02 = create_user_with_profile(
            email="test02@email.com", password="test", user_name="testuser2"
        )

        # force authenticate
        self.client.force_authenticate(user=self.testuser01)

    def test_get_other_user(self):
        url = reverse("user-get", kwargs={"id": self.testuser02.id})

        # Perform GET request
        response = self.client.get(url)

        # Assert the response
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Check created fields
        self.assertEqual(response.data.get("email"), self.testuser02.email)
        self.assertEqual(
            response.data.get("profile").get("user_name"),
            self.testuser02.profile.user_name,
        )


class LatestUserIdViewTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = reverse("user-latest")  # Dynamic URL mapping

        # Create a test user
        self.testuser01 = create_user_with_profile(
            email="test01@email.com", password="test", user_name="testuser1"
        )
        self.testuser02 = create_user_with_profile(
            email="test02@email.com", password="test", user_name="testuser2"
        )

        # force authenticate
        self.client.force_authenticate(user=self.testuser01)

    def test_get_latest_user_id(self):
        # Perform GET request
        response = self.client.get(self.url)

        # Assert the response
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Check created fields
        self.assertEqual(response.data.get("user_id"), self.testuser02.id)


class AllUsersViewTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = reverse("user-list")  # Dynamic URL mapping

        # Create a test user
        self.testuser01 = create_user_with_profile(
            email="test01@email.com", password="test", user_name="testuser1"
        )
        self.testuser02 = create_user_with_profile(
            email="test02@email.com", password="test", user_name="testuser2"
        )

        # force authenticate
        self.client.force_authenticate(user=self.testuser01)

    def test_get_all_users(self):
        # Perform GET request
        response = self.client.get(self.url)

        # Assert the response
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Check all users returned
        self.assertEqual(len(response.data), 2)


class CheckUserLoginViewTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = reverse("user-check-login")  # Dynamic URL mapping

        # Create a test user
        self.testuser01 = create_user_with_profile(
            email="test01@email.com", password="test", user_name="testuser1"
        )

    def test_check_user_login(self):
        # force authenticate
        self.client.force_authenticate(user=self.testuser01)

        # Perform GET request
        response = self.client.get(self.url)

        # Assert the response
        self.assertEqual(response.data.get("detail"), True)

    def test_check_user_logout(self):
        # Perform GET request
        response = self.client.get(self.url)

        # Assert the response
        self.assertEqual(response.data.get("detail"), False)


class ChangePasswordViewTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = reverse("change-password")  # Dynamic URL mapping

        # Create a test user
        self.testuser01 = create_user_with_profile(
            email="test01@email.com", password="test", user_name="testuser1"
        )

    def test_change_password_login(self):
        # force authenticate
        self.client.force_authenticate(user=self.testuser01)

        # Prepare valid post data
        data = {
            "new_password": "new_password",
        }

        # Perform POST request
        response = self.client.patch(self.url, data, format="json")

        # Assert the response
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Check if the password is changed
        self.assertTrue(
            CustomUser.objects.get(id=self.testuser01.id).check_password(
                data.get("new_password")
            )
        )

    def test_change_password_logout(self):
        # Prepare valid post data
        data = {
            "email": self.testuser01.email,
            "new_password": "new_password",
        }

        # Perform POST request
        response = self.client.patch(self.url, data, format="json")

        # Assert the response
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Check if the password is changed
        self.assertTrue(
            CustomUser.objects.get(id=self.testuser01.id).check_password(
                data.get("new_password")
            )
        )


class CheckPasswordViewTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = reverse("check-password")  # Dynamic URL mapping

        # Create a test user
        self.testuser01 = create_user_with_profile(
            email="test01@email.com", password="test", user_name="testuser1"
        )

        # force authenticate
        self.client.force_authenticate(user=self.testuser01)

    def test_check_password_correct(self):
        # Prepare valid post data
        data = {
            "password": "test",
        }

        # Perform POST request
        response = self.client.post(self.url, data, format="json")

        # Assert the response
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Check if the password is correct
        self.assertTrue(response.data.get("isSame"))

    def test_check_password_not_correct(self):
        # Prepare valid post data
        data = {
            "password": "wrong_password",
        }

        # Perform POST request
        response = self.client.post(self.url, data, format="json")

        # Assert the response
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Check if the password is not correct
        self.assertFalse(response.data.get("isSame"))
