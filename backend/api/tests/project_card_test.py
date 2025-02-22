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
)
from django.core.files.uploadedfile import SimpleUploadedFile


class ProjectCardCreateViewTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = reverse("project-card-create")  # Dynamic URL mapping

        # Create a test user
        self.testuser01 = create_user_with_profile(
            email="test@email.com", password="test", user_name="testuser1"
        )
        self.testuser02 = create_user_with_profile(
            email="testuser02@email.com", password="test", user_name="testuser2"
        )

        # Authenticate the user
        self.client.force_authenticate(user=self.testuser01)

    def test_create_project_card(self):
        """
        Ensure we can create a new project card object.
        """
        data = {
            "title": "Test Project Card",
            "keywords": ["test", "project", "card"],
            "accepted_users": [self.testuser02.id],
            "bookmark_users": [],
            "description": "This is a test project card.",
            "start_date": "2022-12-31",
            "end_date": "2023-01-01",
        }

        response = self.client.post(self.url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["pending_invited_users"][0], self.testuser02.id)
        self.assertEqual(ProjectCard.objects.count(), 1)
        self.assertEqual(ProjectCard.objects.get().title, data.get("title"))
        self.assertEqual(
            list(
                ProjectCard.objects.get()
                .keywords.all()
                .values_list("keyword", flat=True)
            ),
            data.get("keywords"),
        )
        self.assertEqual(ProjectCardInvitation.objects.count(), 1)
        self.assertEqual(ProjectCardInvitation.objects.get().inviter, self.testuser01)
        self.assertEqual(ProjectCardInvitation.objects.get().invitee, self.testuser02)
        self.assertEqual(ProjectCardInvitation.objects.get().status, "pending")


class ProjectCardRetrieveViewTestCase(TestCase):
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

        # Authenticate the user
        self.client.force_authenticate(user=self.testuser01)

    def test_retrieve_project_card(self):
        """
        Ensure we can get a specific project card object.
        """
        url = reverse(
            "project-card-retrieve", args=[self.project_card1.pk]
        )  # Dynamic URL mapping
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data.get("id"), self.project_card1.id)


class ProjectCardListViewTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = reverse("project-card-list")  # Dynamic URL mapping

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

        # Authenticate the user
        self.client.force_authenticate(user=self.testuser01)

    def test_get_project_card_list(self):
        """
        Ensure we can get a list of project card objects.
        """
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
        self.assertEqual(response.data[0].get("id"), self.project_card2.id)
        self.assertEqual(response.data[1].get("id"), self.project_card1.id)


class ProjectCardCurrentListViewTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = reverse("project-card-current-list")  # Dynamic URL mapping

        # Create a test user
        self.testuser01 = create_user_with_profile(
            email="testuser01@email.com", password="test", user_name="testuser1"
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
        self.project_card1.accepted_users.set([self.testuser01])
        self.project_card2 = ProjectCard.objects.create(
            title="Test Project Card 2",
            creator=self.testuser02,
            description="This is a test project card 2.",
            start_date="2022-12-31",
            end_date="2023-01-01",
        )
        self.project_card2.accepted_users.set([self.testuser01, self.testuser02])

        # Authenticate the user
        self.client.force_authenticate(user=self.testuser01)

    def test_get_project_card_current_list(self):
        """
        Ensure we can get a list of project card objects
        """
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
        self.assertEqual(response.data[0].get("id"), self.project_card2.id)
        self.assertEqual(response.data[1].get("id"), self.project_card1.id)


class ProjectCardBookmarkedListViewTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = reverse("project-card-bookmarked-list")  # Dynamic URL mapping

        # Create a test user
        self.testuser01 = create_user_with_profile(
            email="testuser01@email.com", password="test", user_name="testuser1"
        )
        self.testuser02 = create_user_with_profile(
            email="testuser02@email.com", password="test", user_name="testuser2"
        )

        # Create Project Cards
        self.project_card1 = ProjectCard.objects.create(
            title="Test Project Card 1",
            creator=self.testuser02,
            description="This is a test project card 1.",
            start_date="2022-12-31",
            end_date="2023-01-01",
        )
        self.project_card1.accepted_users.set([self.testuser02])
        self.project_card2 = ProjectCard.objects.create(
            title="Test Project Card 2",
            creator=self.testuser02,
            description="This is a test project card 2.",
            start_date="2022-12-31",
            end_date="2023-01-01",
        )
        self.project_card2.accepted_users.set([self.testuser02])

        # Authenticate the user
        self.client.force_authenticate(user=self.testuser01)

    def test_get_project_card_bookmarked_list(self):
        """
        Ensure we can get a list of project card objects that the user has bookmarked.
        """
        self.project_card1.bookmarked_users.add(self.testuser01)
        self.project_card2.bookmarked_users.add(self.testuser01)

        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
        self.assertEqual(response.data[0].get("id"), self.project_card1.id)
        self.assertEqual(response.data[1].get("id"), self.project_card2.id)


class ProjectCardOneDegreeListViewTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = reverse(
            "project-card-one-degree-list", args=[1]
        )  # Dynamic URL mapping

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
        self.project_card1.accepted_users.set([self.testuser01])
        self.project_card2 = ProjectCard.objects.create(
            title="Test Project Card 2",
            creator=self.testuser02,
            description="This is a test project card 2.",
            start_date="2022-12-31",
            end_date="2023-01-01",
        )
        self.project_card2.accepted_users.set([self.testuser01, self.testuser02])

        # 일촌관계 정립
        Friend.objects.create(
            from_user=self.testuser01,
            to_user=self.testuser02,
            status="accepted",
        )

        # Authenticate the user
        self.client.force_authenticate(user=self.testuser01)

    def test_get_project_card_one_degree_list(self):
        """
        Ensure we can get a list of project card objects that the user is directly connected to.
        """
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0].get("id"), self.project_card2.id)


class ProjectCardUpdateViewTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Create a test user
        self.testuser01 = create_user_with_profile(
            email="testuser01@email.com", password="test", user_name="testuser1"
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
        self.project_card1.accepted_users.set([self.testuser01, self.testuser02])
        ProjectCardInvitation.objects.create(
            inviter=self.testuser01,
            invitee=self.testuser02,
            project_card=self.project_card1,
        )

        self.project_card2 = ProjectCard.objects.create(
            title="Test Project Card 2",
            creator=self.testuser02,
            description="This is a test project card 2.",
            start_date="2022-12-31",
            end_date="2023-01-01",
        )
        self.project_card2.accepted_users.set([self.testuser01, self.testuser02])

        # Authenticate the user
        self.client.force_authenticate(user=self.testuser01)

    def test_update_project_card(self):
        """
        Ensure we can update a project card object.
        """
        url = reverse("project-card-update", args=[self.project_card1.id])
        data = {
            "title": "Updated Project Card 1",
            "keywords": ["updated", "project", "card"],
            "accepted_users": [self.testuser01.id],
            "bookmark_users": [],
            "description": "This is an updated test project card 1.",
            "start_date": "2022-12-31",
            "end_date": "2023-01-01",
        }

        response = self.client.put(url, data, format="json")
        self.project_card1.refresh_from_db()

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data.get("title"), self.project_card1.title)
        self.assertEqual(len(response.data.get("accepted_users")), 1)
        self.assertEqual(response.data.get("accepted_users")[0], self.testuser01.id)
        self.assertFalse(
            ProjectCardInvitation.objects.filter(
                inviter=self.testuser01,
                invitee=self.testuser02,
                project_card=self.project_card1,
            ).exists()
        )

    def test_update_project_card_creator(self):
        """
        Ensure the only creator can update a project card object.
        """
        url = reverse("project-card-update", args=[self.project_card2.id])
        data = {
            "title": "Updated Project Card 2",
            "keywords": ["updated", "project", "card"],
            "accepted_users": [self.testuser01.id],
            "bookmark_users": [],
            "description": "This is an updated test project card 2.",
            "start_date": "2022-12-31",
            "end_date": "2023-01-01",
        }

        response = self.client.put(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(
            response.data["detail"], "관리자만 프로젝트 카드를 수정할 수 있습니다."
        )


class ProjectCardBookmarkToggleViewTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Create a test user
        self.testuser01 = create_user_with_profile(
            email="testuser01@email.com", password="test", user_name="testuser1"
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
        self.project_card1.accepted_users.set([self.testuser01, self.testuser02])

        self.project_card2 = ProjectCard.objects.create(
            title="Test Project Card 2",
            creator=self.testuser02,
            description="This is a test project card 2.",
            start_date="2022-12-31",
            end_date="2023-01-01",
        )
        self.project_card2.accepted_users.set([self.testuser01, self.testuser02])

        # Authenticate the user
        self.client.force_authenticate(user=self.testuser01)

    def test_bookmark_toggle_add(self):
        """
        Ensure we can bookmark a project card object.
        """
        url = reverse("project-card-bookmark-toggle", args=[self.project_card2.id])
        response = self.client.patch(url, format="json")

        # Refresh project_card2 object from the database
        self.project_card2.refresh_from_db()

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(self.project_card2.bookmarked_users.count(), 1)
        self.assertEqual(self.project_card2.bookmarked_users.first(), self.testuser01)

    def test_bookmark_toggle_remove(self):
        """
        Ensure we can remove a bookmark from a project card object.
        """
        # Add a bookmark
        self.project_card2.bookmarked_users.add(self.testuser01)

        # Remove the bookmark
        url = reverse("project-card-bookmark-toggle", args=[self.project_card2.id])
        response = self.client.patch(url, format="json")

        # Refresh project_card1 object from the database
        self.project_card1.refresh_from_db()

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(self.project_card1.bookmarked_users.count(), 0)


class ProjectCardLeaveViewTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Create a test user
        self.testuser01 = create_user_with_profile(
            email="testuser01@email.com", password="test", user_name="testuser1"
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
        self.project_card1.accepted_users.set([self.testuser01, self.testuser02])

        self.project_card2 = ProjectCard.objects.create(
            title="Test Project Card 2",
            creator=self.testuser02,
            description="This is a test project card 2.",
            start_date="2022-12-31",
            end_date="2023-01-01",
        )
        self.project_card2.accepted_users.set([self.testuser01, self.testuser02])

        # Authenticate the user
        self.client.force_authenticate(user=self.testuser01)

    def test_leave_project_card(self):
        """
        Ensure we can leave a project card object.
        """
        url = reverse("project-card-leave", args=[self.project_card2.id])
        response = self.client.patch(url)

        # Refresh project_card2 object from the database
        self.project_card2.refresh_from_db()

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(self.project_card2.accepted_users.count(), 1)
        self.assertEqual(self.project_card2.accepted_users.first(), self.testuser02)
        self.assertEqual(self.project_card2.creator, self.testuser02)

    def test_creator_leave_project_card(self):
        """
        Ensure the creator can leave a project card object.
        And Creator should be changed to the next user.
        """
        url = reverse("project-card-leave", args=[self.project_card1.id])
        response = self.client.patch(url)

        # Refresh project_card1 object from the database
        self.project_card1.refresh_from_db()

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(self.project_card1.accepted_users.count(), 1)
        self.assertEqual(self.project_card1.accepted_users.first(), self.testuser02)
        self.assertEqual(self.project_card1.creator, self.testuser02)


class ProjectCardDestroyViewTestCase(TestCase):
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
        self.project_card1.accepted_users.set([self.testuser01, self.testuser02])

        self.project_card2 = ProjectCard.objects.create(
            title="Test Project Card 2",
            creator=self.testuser02,
            description="This is a test project card 2.",
            start_date="2022-12-31",
            end_date="2023-01-01",
        )
        self.project_card2.accepted_users.set([self.testuser01, self.testuser02])

        # Authenticate the user
        self.client.force_authenticate(user=self.testuser01)

    def test_destroy_project_card(self):
        """
        Ensure we can destroy a project card object.
        """
        url = reverse("project-card-delete", args=[self.project_card1.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(ProjectCard.objects.count(), 1)
        self.assertEqual(ProjectCard.objects.first().title, "Test Project Card 2")

    def test_destory_project_card_creator(self):
        """
        Ensure the creator can destroy a project card object.
        """
        url = reverse("project-card-delete", args=[self.project_card2.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(ProjectCard.objects.count(), 2)
