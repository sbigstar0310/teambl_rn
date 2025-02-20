from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from django.urls import reverse
from django.core import mail
import random
from .utils import (
    create_post_with_images,
    create_user_with_profile,
)
from ..models import (
    Friend,
    Profile,
    CustomUser,
    Notification,
)
from django.core.files.uploadedfile import SimpleUploadedFile


class FriendCreateViewTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = reverse("friend-create")  # Dynamic URL mapping

        # Create a test user
        self.testuser01 = create_user_with_profile(
            email="testuser01@email.com", password="test", user_name="testuser1"
        )
        self.testuser02 = create_user_with_profile(
            email="testuser02@email.com", password="test", user_name="testuser2"
        )

        # Authenticate the user
        self.client.force_authenticate(user=self.testuser01)

    def test_create_friend(self):
        data = {
            "to_user": self.testuser02.id,
        }
        response = self.client.post(self.url, data=data, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_create_friend_with_same_user(self):
        data = {
            "from_user": self.testuser01.id,
            "to_user": self.testuser01.id,
        }
        response = self.client.post(self.url, data=data, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_friend_with_invalid_user(self):
        data = {
            "to_user": 100,
        }
        response = self.client.post(self.url, data=data, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_friend_with_existing_friendship(self):
        # 1. 친구 요청이 진행 중인 경우
        # Create Friend Before
        Friend.create_or_replace_friendship(self.testuser01, self.testuser02)

        # Create Friend Again
        data = {
            "from_user": self.testuser01.id,
            "to_user": self.testuser02.id,
        }
        response = self.client.post(self.url, data=data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        # 2. 이미 친구 관계인 경우
        # update Friend Before
        Friend.create_or_replace_friendship(
            self.testuser01, self.testuser02, status="accepted"
        )

        # Create Friend Again
        data = {
            "from_user": self.testuser01.id,
            "to_user": self.testuser02.id,
        }
        response = self.client.post(self.url, data=data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class FriendListViewTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = reverse("friend-list", args=[1])  # Dynamic URL mapping

        # Create a test user
        self.testuser01 = create_user_with_profile(
            email="testuser01@email.com", password="test", user_name="testuser1"
        )
        self.testuser02 = create_user_with_profile(
            email="testuser02@email.com", password="test", user_name="testuser2"
        )
        self.testuser03 = create_user_with_profile(
            email="testuser03@gmail.com", password="test", user_name="testuser3"
        )

        # Create a friend relationship
        Friend.create_or_replace_friendship(
            self.testuser01, self.testuser02, status="accepted"
        )
        Friend.create_or_replace_friendship(
            self.testuser01, self.testuser03, status="pending"
        )

        # Authenticate the user
        self.client.force_authenticate(user=self.testuser01)

    def test_list_friend(self):
        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)


class FriendUpdateViewTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Create a test user
        self.testuser01 = create_user_with_profile(
            email="testuser01@email.com", password="test", user_name="testuser1"
        )
        self.testuser02 = create_user_with_profile(
            email="testuser02@email.com", password="test", user_name="testuser2"
        )

        # Create a friend relationship
        self.friend01 = Friend.create_or_replace_friendship(
            self.testuser01, self.testuser02, status="pending"
        )

        # Authenticate the user
        self.client.force_authenticate(user=self.testuser01)

    def test_update_friend(self):
        url = reverse("friend-update", args=[self.friend01.id])
        data = {
            "status": "accepted",
        }
        response = self.client.patch(url, data=data, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], "accepted")

    def test_update_friend_with_invalid_status(self):
        url = reverse("friend-update", args=[self.friend01.id])
        data = {
            "status": "invalid_status",
        }
        response = self.client.patch(url, data=data, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class FriendDeleteViewTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Create a test user
        self.testuser01 = create_user_with_profile(
            email="testuser01@email.com", password="test", user_name="testuser1"
        )
        self.testuser02 = create_user_with_profile(
            email="testuser02@email.com", password="test", user_name="testuser2"
        )

        # Create a friend relationship
        self.friend01 = Friend.create_or_replace_friendship(
            self.testuser01, self.testuser02, status="pending"
        )

        # Authenticate the user
        self.client.force_authenticate(user=self.testuser01)

    def test_delete_friend(self):
        url = reverse("friend-delete", args=[self.friend01.id])
        response = self.client.delete(url)

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertIsNone(Friend.objects.filter(id=self.friend01.id).first())


class OneDegreeFriendsViewTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Create a test user
        self.testuser01 = create_user_with_profile(
            email="testuser01@email.com", password="test", user_name="testuser1"
        )
        self.testuser02 = create_user_with_profile(
            email="testuser02@email.com", password="test", user_name="testuser2"
        )
        self.testuser03 = create_user_with_profile(
            email="testuser03@gmail.com", password="test", user_name="testuser3"
        )

        # Create a friend relationship
        Friend.create_or_replace_friendship(
            self.testuser01, self.testuser02, status="accepted"
        )
        Friend.create_or_replace_friendship(
            self.testuser01, self.testuser03, status="pending"
        )

        # Authenticate the user
        self.client.force_authenticate(user=self.testuser01)

    def test_list_friend(self):
        url = self.url = reverse("friend-one-degree", args=[self.testuser01.id])
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)


class FriendRequestCancelViewTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Create a test user
        self.testuser01 = create_user_with_profile(
            email="testuser01@email.com", password="test", user_name="testuser1"
        )
        self.testuser02 = create_user_with_profile(
            email="testuser02@email.com", password="test", user_name="testuser2"
        )

        # Create a friend relationship
        self.friend01 = Friend.create_or_replace_friendship(
            self.testuser01, self.testuser02, status="pending"
        )

        # Authenticate the user
        self.client.force_authenticate(user=self.testuser01)

    def test_cancel_friend_request(self):
        url = reverse("friend-request-cancel", args=[self.testuser01.id])
        response = self.client.delete(url)

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertIsNone(Friend.objects.filter(id=self.friend01.id).first())
