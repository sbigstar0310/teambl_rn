from django.conf import settings
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from django.urls import reverse
from django.core import mail
import random
from .utils import (
    create_post_with_images,
    create_user_with_profile,
    get_or_create_image_file,
)
from ..models import (
    Friend,
    Profile,
    CustomUser,
    Notification,
    InvitationLink,
)
from django.core.files.uploadedfile import SimpleUploadedFile


class CreateInvitationLinkViewTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = reverse("invitation-link-create")  # Dynamic URL mapping

        # Create a test user
        self.testuser01 = create_user_with_profile(
            email="testuser01@email.com", password="test", user_name="testuser1"
        )

        # Authenticate the user
        self.client.force_authenticate(user=self.testuser01)

    def test_create_invitation_link(self):
        # Test creating an invitation link
        response = self.client.post(self.url, {"name": "testuser2"}, format="json")

        # Check the response
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(InvitationLink.objects.count(), 1)
        self.assertEqual(InvitationLink.objects.get().inviter, self.testuser01)
        self.assertEqual(InvitationLink.objects.get().invitee_name, "testuser2")
        self.assertEqual(InvitationLink.objects.get().invitee_id, None)
        self.assertTrue(
            f"{settings.TEAMBL_URL}welcome?code=" in InvitationLink.objects.get().link
        )


class InvitationLinkDeleteTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Create a test user
        self.testuser01 = create_user_with_profile(
            email="testuser01@email.com", password="test", user_name="testuser1"
        )

        # Create Invitation Link
        self.invitation_link = InvitationLink.objects.create(
            inviter=self.testuser01,
            invitee_name="testuser2",
            invitee_id=None,
            link="http://test.com",
        )

        # Authenticate the user
        self.client.force_authenticate(user=self.testuser01)

    def test_delete_invitation_link(self):
        # Test deleting an invitation link
        response = self.client.delete(
            reverse("invitation-link-delete", kwargs={"pk": self.invitation_link.pk})
        )

        # Check the response
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(InvitationLink.objects.count(), 0)


class InvitationLinkListTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Create a test user
        self.testuser01 = create_user_with_profile(
            email="testuser01@email.com", password="test", user_name="testuser1"
        )
        self.testuser02 = create_user_with_profile(
            email="testuser02@email.com", password="test", user_name="testuser2"
        )

        # Create Invitation Links
        self.invitation_link01 = InvitationLink.objects.create(
            inviter=self.testuser01,
            invitee_name="testuser2",
            invitee_id=None,
            link="http://test01.com",
        )
        self.invitation_link02 = InvitationLink.objects.create(
            inviter=self.testuser01,
            invitee_name="testuser3",
            invitee_id=None,
            link="http://test02.com",
        )
        self.invitation_link03 = InvitationLink.objects.create(
            inviter=self.testuser01,
            invitee_name="testuser2",
            invitee_id=self.testuser02.pk,
            link="http://test03.com",
        )

        # Authenticate the user
        self.client.force_authenticate(user=self.testuser01)

    def test_list_invitation_links(self):
        """
        Ensure we can list invitation links. (list based on the Invitee ID)
        """
        # Test listing invitation links
        response = self.client.get(
            reverse("invitation-link-list"), {"invitee_id": self.testuser02.pk}
        )

        # Check the response
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["inviter"], self.testuser01.pk)
        self.assertEqual(
            response.data[0]["invitee_name"], self.testuser02.profile.user_name
        )

    def test_list_invitation_links_no_invitee_id(self):
        """
        Ensure we can list invitation links. (list based on the Inviter ID)
        """
        # Test listing invitation links
        response = self.client.get(reverse("invitation-link-list"))

        # Check the response
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 3)


class WelcomeViewTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Create a test user
        self.testuser01 = create_user_with_profile(
            email="testuser01@email.com", password="test", user_name="testuser1"
        )

        # Create Invitation Links
        self.invitation_link01 = InvitationLink.objects.create(
            inviter=self.testuser01,
            invitee_name="testuser2",
            invitee_id=None,
            link="http://test01.com/welcome?code=1111",
        )
        self.invitation_link02 = InvitationLink.objects.create(
            inviter=self.testuser01,
            invitee_name="testuser2",
            invitee_id=None,
            link="http://test01.com/welcome?code=2222",
        )
        InvitationLink.objects.filter(id=self.invitation_link02.id).update(
            created_at="2000-01-01 00:00:00"
        )

        self.invitation_link03 = InvitationLink.objects.create(
            inviter=self.testuser01,
            invitee_name="testuser2",
            invitee_id=2,
            link="http://test01.com/welcome?code=3333",
            status="accepted",
        )

        # Authenticate the user
        self.client.force_authenticate(user=self.testuser01)

    def test_welcome_invitation_link_with_valid_code(self):
        """
        Ensure we can get the inviter and invitee names from the invitation link.
        """
        # Test listing invitation links
        response = self.client.get(reverse("invitation-link-welcome"), {"code": "1111"})

        # Check the response
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response.data["inviter_name"], self.testuser01.profile.user_name
        )
        self.assertEqual(response.data["invitee_name"], "testuser2")

    def test_welcome_invitation_link_with_expired_code(self):
        """
        Ensure we can get the inviter and invitee names from the invitation link.
        """
        # Test listing invitation links
        response = self.client.get(reverse("invitation-link-welcome"), {"code": "2222"})

        # Check the response
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["error_type"], "expired")

    def test_welcome_invitation_link_with_used_code(self):
        """
        Ensure we can get the inviter and invitee names from the invitation link.
        """
        # Test listing invitation links
        response = self.client.get(reverse("invitation-link-welcome"), {"code": "3333"})

        # Check the response
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["message"], "Invitation link already used")
