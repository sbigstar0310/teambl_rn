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
    CustomUser,
    Notification,
)
from django.core.files.uploadedfile import SimpleUploadedFile


class NotificationListViewTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = reverse("notification-list")  # Dynamic URL mapping

        # Create a test user
        self.testuser01 = create_user_with_profile(
            email="test@email.com", password="test", user_name="testuser1"
        )

        # create notifications
        Notification.objects.create(
            user=self.testuser01,
            message="test message1",
            notification_type=random.choice(Notification.NOTIFICATION_TYPE_CHOICES)[0],
        )
        Notification.objects.create(
            user=self.testuser01,
            message="test message2",
            notification_type=random.choice(Notification.NOTIFICATION_TYPE_CHOICES)[0],
        )

        # Authenticate the user
        self.client.force_authenticate(user=self.testuser01)

    def test_list_notification(self):
        response = self.client.get(self.url, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)


class NotificationCreateViewTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = reverse("notification-create")  # Dynamic URL mapping

        # Create a test user
        self.testuser01 = create_user_with_profile(
            email="test@email.com", password="test", user_name="testuser1"
        )

        # Authenticate the user
        self.client.force_authenticate(user=self.testuser01)

    def test_create_notification(self):
        notificationType = random.choice(Notification.NOTIFICATION_TYPE_CHOICES)[0]

        data = {
            "message": "test message",
            "notification_type": notificationType,
            "related_user_id": None,
            "related_project_car_id": None,
        }

        response = self.client.post(self.url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data.get("message"), "test message")
        self.assertEqual(response.data.get("notification_type"), notificationType)


class NotificationUpdateViewTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Create a test user
        self.testuser01 = create_user_with_profile(
            email="test@email.com", password="test", user_name="testuser1"
        )

        # create notification
        Notification.objects.create(
            user=self.testuser01,
            message="test message1",
            notification_type=random.choice(Notification.NOTIFICATION_TYPE_CHOICES)[0],
        )

        # Authenticate the user
        self.client.force_authenticate(user=self.testuser01)

    def test_update_notification(self):
        notification = Notification.objects.first()

        # update data
        data = {
            "message": "updated message",
            "is_read": True,
            "notification_type": notification.notification_type,
        }

        # get url
        url = reverse("notification-update", kwargs={"pk": notification.id})

        # make request
        response = self.client.put(url, data, format="json")

        # check response
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data.get("message"), "updated message")
        self.assertEqual(response.data.get("is_read"), True)


class NotificationDeleteViewTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Create a test user
        self.testuser01 = create_user_with_profile(
            email="test@email.com", password="test", user_name="testuser1"
        )

        # create notification
        self.notification = Notification.objects.create(
            user=self.testuser01,
            message="test message1",
            notification_type=random.choice(Notification.NOTIFICATION_TYPE_CHOICES)[0],
        )

        # Authenticate the user
        self.client.force_authenticate(user=self.testuser01)

    def test_delete_notification(self):
        # get url
        url = reverse("notification-delete", kwargs={"pk": self.notification.id})

        # make request
        response = self.client.delete(url, format="json")

        # check response
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Notification.objects.count(), 0)


class UnreadNotificationCountViewTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Create a test user
        self.testuser01 = create_user_with_profile(
            email="test@email.com", password="test", user_name="testuser1"
        )

        # create notifications
        self.notification1 = Notification.objects.create(
            user=self.testuser01,
            message="test message1",
            notification_type=random.choice(Notification.NOTIFICATION_TYPE_CHOICES)[0],
        )
        self.notification2 = Notification.objects.create(
            user=self.testuser01,
            message="test message2",
            notification_type=random.choice(Notification.NOTIFICATION_TYPE_CHOICES)[0],
        )

        # Authenticate the user
        self.client.force_authenticate(user=self.testuser01)

    def test_unread_notification_count(self):
        # get url
        url = reverse("notification-unread-count")

        # make request
        response = self.client.get(url, format="json")

        # check response
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data.get("unread_count"), 2)


class NotificationAllReadViewTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Create a test user
        self.testuser01 = create_user_with_profile(
            email="test@email.com", password="test", user_name="testuser1"
        )

        # create notifications
        self.notification1 = Notification.objects.create(
            user=self.testuser01,
            message="test message1",
            notification_type=random.choice(Notification.NOTIFICATION_TYPE_CHOICES)[0],
        )
        self.notification2 = Notification.objects.create(
            user=self.testuser01,
            message="test message2",
            notification_type=random.choice(Notification.NOTIFICATION_TYPE_CHOICES)[0],
        )

        # Authenticate the user
        self.client.force_authenticate(user=self.testuser01)

    def test_all_read_notification(self):
        # get url
        url = reverse("notification-all-read")

        # make request
        response = self.client.post(url, format="json")

        # check response
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            Notification.objects.filter(user=self.testuser01, is_read=False).count(), 0
        )
