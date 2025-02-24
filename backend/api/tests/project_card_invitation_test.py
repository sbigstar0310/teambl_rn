from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from django.urls import reverse
from django.core import mail
from .utils import create_post_with_images, create_user_with_profile
from ..models import (
    CustomUser,
    Friend,
    Notification,
    Post,
    PostImage,
    ProjectCard,
    ProjectCardInvitation,
)
from django.core.files.uploadedfile import SimpleUploadedFile


class ProjectCardInvitationCreateView(TestCase):
    def setUp(self):
        self.client = APIClient()

        self.url = reverse("project-card-invitation-create")  # Dynamic URL mapping

        # Create a test user
        self.testuser01 = create_user_with_profile(
            email="test@email.com", password="test", user_name="testuser1"
        )
        self.testuser02 = create_user_with_profile(
            email="testuser02@email.com", password="test", user_name="testuser2"
        )

        # Create Project Cards
        self.project_card1 = ProjectCard.objects.create(
            title="Test Project Card 1",
            creator=self.testuser01,
            description="This is a test project card 1.",
            start_date="2022-12-31",
            end_date="2023-01-01",
        )

        # Authenticate the user
        self.client.force_authenticate(user=self.testuser01)

    def test_create_project_card_invitation(self):
        """
        Ensure we can create a new project card invitation object.
        """
        url = reverse("project-card-invitation-create")

        data = {
            "project_card": self.project_card1.id,
            "invitee": self.testuser02.id,
        }

        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(ProjectCardInvitation.objects.count(), 1)


class ProjectCardInvitationCurrentListView(TestCase):
    def setUp(self):
        self.client = APIClient()

        self.url = reverse(
            "project-card-invitation-current-list"
        )  # Dynamic URL mapping

        # Create a test user
        self.testuser01 = create_user_with_profile(
            email="test@email.com", password="test", user_name="testuser1"
        )
        self.testuser02 = create_user_with_profile(
            email="testuser02@email.com", password="test", user_name="testuser2"
        )
        self.testuser03 = create_user_with_profile(
            email="testuser03@email.com", password="test", user_name="testuser3"
        )

        # Create Project Cards
        self.project_card1 = ProjectCard.objects.create(
            title="Test Project Card 1",
            creator=self.testuser01,
            description="This is a test project card 1.",
            start_date="2022-12-31",
            end_date="2023-01-01",
        )
        self.project_card2 = ProjectCard.objects.create(
            title="Test Project Card 2",
            creator=self.testuser02,
            description="This is a test project card 2.",
            start_date="2022-12-31",
            end_date="2023-01-01",
        )

        # Create Project Card Invitations
        self.project_card_invitation1 = ProjectCardInvitation.objects.create(
            project_card=self.project_card1,
            inviter=self.testuser01,
            invitee=self.testuser02,
        )
        self.project_card_invitation2 = ProjectCardInvitation.objects.create(
            project_card=self.project_card1,
            inviter=self.testuser01,
            invitee=self.testuser03,
        )

        # Authenticate the user
        self.client.force_authenticate(user=self.testuser02)

    def test_list_project_card_invitation(self):
        """
        Ensure we can list user's project card invitations.
        """
        response = self.client.get(self.url)

        # Check the response
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["id"], self.project_card_invitation1.id)


class ProjectCardInvitationDeleteView(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Create a test user
        self.testuser01 = create_user_with_profile(
            email="test@email.com", password="test", user_name="testuser1"
        )
        self.testuser02 = create_user_with_profile(
            email="testuser02@email.com", password="test", user_name="testuser2"
        )

        # Create Project Cards
        self.project_card1 = ProjectCard.objects.create(
            title="Test Project Card 1",
            creator=self.testuser01,
            description="This is a test project card 1.",
            start_date="2022-12-31",
            end_date="2023-01-01",
        )
        self.project_card2 = ProjectCard.objects.create(
            title="Test Project Card 2",
            creator=self.testuser02,
            description="This is a test project card 2.",
            start_date="2022-12-31",
            end_date="2023-01-01",
        )

        # Create Project Card Invitation
        self.project_card_invitation1 = ProjectCardInvitation.objects.create(
            project_card=self.project_card1,
            inviter=self.testuser01,
            invitee=self.testuser02,
        )

        # Authenticate the user
        self.client.force_authenticate(user=self.testuser01)

    def test_delete_project_card_invitation(self):
        """
        Ensure we can create a new project card object.
        """
        url = reverse(
            "project-card-invitation-delete",
            kwargs={
                "project_card_id": self.project_card1.id,
                "invitee_id": self.testuser02.id,
            },
        )  # Dynamic URL mapping

        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(
            ProjectCardInvitation.objects.filter(
                id=self.project_card_invitation1.id
            ).exists()
        )


class ProjectCardInvitationResponseView(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Create a test user
        self.testuser01 = create_user_with_profile(
            email="test@email.com", password="test", user_name="testuser1"
        )
        self.testuser02 = create_user_with_profile(
            email="testuser02@email.com", password="test", user_name="testuser2"
        )

        # Create Project Cards
        self.project_card1 = ProjectCard.objects.create(
            title="Test Project Card 1",
            creator=self.testuser01,
            description="This is a test project card 1.",
            start_date="2022-12-31",
            end_date="2023-01-01",
        )

        # Create Project Card Invitations
        self.project_card_invitation1 = ProjectCardInvitation.objects.create(
            project_card=self.project_card1,
            inviter=self.testuser01,
            invitee=self.testuser02,
        )

        # Authenticate the user
        self.client.force_authenticate(user=self.testuser02)

    def test_response_project_card_invitation_accept(self):
        """
        Ensure we can do accept response to a project card invitation.
        """
        url = reverse(
            "project-card-invitation-response",
            kwargs={"pk": self.project_card_invitation1.id},
        )
        data = {
            "status": "accepted",
        }

        response = self.client.patch(url, data, format="json")

        # Check the response
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response.data["status"],
            "accepted",
        )
        self.assertEqual(
            ProjectCardInvitation.objects.get(
                id=self.project_card_invitation1.id
            ).status,
            "accepted",
        )

        # Check the project card accepted users added
        self.assertTrue(
            ProjectCard.objects.get(id=self.project_card1.id)
            .accepted_users.filter(id=self.testuser02.id)
            .exists()
        )

        # Check Notification
        self.assertTrue(Notification.objects.filter(user=self.testuser01).exists())

    def test_response_project_card_invitation_reject(self):
        """
        Ensure we can do reject response to a project card invitation.
        """
        url = reverse(
            "project-card-invitation-response",
            kwargs={"pk": self.project_card_invitation1.id},
        )
        data = {
            "status": "rejected",
        }

        response = self.client.patch(url, data, format="json")

        # Check the response
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response.data["status"],
            "rejected",
        )
        self.assertEqual(
            ProjectCardInvitation.objects.get(
                id=self.project_card_invitation1.id
            ).status,
            "rejected",
        )

        # Check Notification
        self.assertTrue(Notification.objects.filter(user=self.testuser01).exists())
