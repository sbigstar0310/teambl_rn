from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from django.urls import reverse
from django.core import mail
from .utils import create_post_with_images, create_user_with_profile
from ..models import (
    CustomUser,
    Friend,
    Post,
    PostImage,
    ProjectCard,
    ProjectCardInvitation,
    ProjectCardInvitationLink,
)
from django.core.files.uploadedfile import SimpleUploadedFile


class ProjectCardInvitationLinkCreateViewTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = reverse("project-card-invitation-link-create")  # Dynamic URL mapping

        # Create a test user
        self.testuser01 = create_user_with_profile(
            email="test@email.com", password="test", user_name="testuser1"
        )

        # Craete Project Card
        self.projectCard = ProjectCard.objects.create(
            title="Test Project Card",
            description="This is a test project card.",
            start_date="2022-12-31",
            end_date="2023-12-31",
            creator=self.testuser01,
        )

        # Authenticate the user
        self.client.force_authenticate(user=self.testuser01)

    def test_create_project_card_invitation_link(self):
        """
        Ensure we can create a project card invitation link.
        """

        data = {
            "project_card": self.projectCard.id,
        }

        response = self.client.post(self.url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(ProjectCardInvitationLink.objects.count(), 1)


class ProjectCardInvitationLinkRetreiveFromCodeViewTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Create a test user
        self.testuser01 = create_user_with_profile(
            email="testuser01@email.com", password="test", user_name="testuser1"
        )

        # Create Project Card
        self.projectCard = ProjectCard.objects.create(
            title="Test Project Card",
            description="This is a test project card.",
            start_date="2022-12-31",
            end_date="2023-12-31",
            creator=self.testuser01,
        )

        # Create Invitation Links
        self.invitation_link01 = ProjectCardInvitationLink.objects.create(
            inviter=self.testuser01,
            project_card=self.projectCard,
            link="http://test01.com/welcome?code=1111",
        )
        self.invitation_link02 = ProjectCardInvitationLink.objects.create(
            inviter=self.testuser01,
            project_card=self.projectCard,
            link="http://test01.com/welcome?code=2222",
        )
        ProjectCardInvitationLink.objects.filter(id=self.invitation_link02.id).update(
            created_at="2000-01-01 00:00:00"
        )

        # Authenticate the user
        self.client.force_authenticate(user=self.testuser01)

    def test_project_card_invitation_link_retreive_with_valid_code(self):
        """
        Ensure we can get the project_card_invitation_link object from the code.
        """
        # Test listing invitation links
        response = self.client.get(
            reverse("project-card-invitation-link-retrieve-from-code"), {"code": "1111"}
        )

        # Check the response
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["project_card"]["id"], self.projectCard.id)
        self.assertEqual(response.data["inviter"]["id"], self.testuser01.id)

    def test_project_card_invitation_link_retreive_with_expired_code(self):
        """
        Ensure we can get the project_card_invitation_link object from the expired code
        """
        # Test listing invitation links
        response = self.client.get(
            reverse("project-card-invitation-link-retrieve-from-code"), {"code": "2222"}
        )

        # Check the response
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["error_type"], "expired")


class ProjectCardInvitationLinkDeleteViewTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Create a test user
        self.testuser01 = create_user_with_profile(
            email="testuser01@email.com", password="test", user_name="testuser1"
        )

        # Create Project Card
        self.projectCard = ProjectCard.objects.create(
            title="Test Project Card",
            description="This is a test project card.",
            start_date="2022-12-31",
            end_date="2023-12-31",
            creator=self.testuser01,
        )

        # Create Invitation Links
        self.invitation_link01 = ProjectCardInvitationLink.objects.create(
            inviter=self.testuser01,
            project_card=self.projectCard,
            link="http://test01.com/welcome?code=1111",
        )

        # Authenticate the user
        self.client.force_authenticate(user=self.testuser01)

    def test_delete_project_card_invitation_link(self):
        """
        Ensure we can delete the project_card_invitation_link object.
        """
        response = self.client.delete(
            reverse(
                "project-card-invitation-link-delete",
                kwargs={"pk": self.invitation_link01.id},
            )
        )

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(ProjectCardInvitationLink.objects.count(), 0)
