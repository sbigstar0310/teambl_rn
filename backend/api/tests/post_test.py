from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from django.urls import reverse
from django.core import mail
from .utils import create_post_with_images, create_user_with_profile
from ..models import CustomUser, Post, PostImage, ProjectCard
from django.core.files.uploadedfile import SimpleUploadedFile


class PostCreateViewTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = reverse("post-create")  # Dynamic URL mapping

        # Create a test user
        self.testuser01 = create_user_with_profile(
            email="test@email.com", password="test", user_name="testuser1"
        )

        # Create a project card (if required by the post)
        self.project_card = ProjectCard.objects.create(
            title="test1",
            creator=self.testuser01,
            start_date="2021-01-01",
            end_date="2021-12-31",
            description="test1",
        )

        # Authenticate the user
        self.client.force_authenticate(user=self.testuser01)

        # Create test image file
        self.test_image = SimpleUploadedFile(
            name="test_image.jpg", content=b"file_content", content_type="image/jpeg"
        )

    def test_create_post_with_images(self):
        # Prepare valid post data
        data = {
            "project_card": self.project_card.id,
            "content": "test content with images",
            "tagged_users": [],
            "liked_users": [],
            "images": [
                self.test_image,
                self.test_image,
            ],  # Add images directly to the data dictionary
        }

        # Perform POST request with multipart/form-data
        response = self.client.post(self.url, data, format="multipart")

        # Assert the response
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # Check response data
        self.assertEqual(len(response.data.get("images")), 2)
        self.assertEqual(response.data.get("content"), "test content with images")

        # Verify database
        post = Post.objects.get(id=response.data.get("id"))
        self.assertEqual(post.images.count(), 2)

    def test_create_post_without_images(self):
        # Valid post data without images
        post_data = {
            "project_card": self.project_card.id,
            "content": "test content without images",
            "tagged_users": [],
            "liked_users": [],
        }
        response = self.client.post(self.url, post_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # Check if the post was created correctly
        self.assertEqual(response.data.get("content"), "test content without images")
        self.assertEqual(response.data.get("project_card"), self.project_card.id)
        self.assertEqual(len(response.data.get("images")), 0)


class PostListViewTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Create a test user
        self.testuser01 = create_user_with_profile(
            email="test@email.com", password="test", user_name="testuser1"
        )

        # Create a project card (if required by the post)
        self.project_card = ProjectCard.objects.create(
            title="test1",
            creator=self.testuser01,
            start_date="2021-01-01",
            end_date="2021-12-31",
            description="test1",
        )

        # Authenticate the user
        self.client.force_authenticate(user=self.testuser01)

        # Create test image file
        self.test_image = SimpleUploadedFile(
            name="test_image.jpg", content=b"file_content", content_type="image/jpeg"
        )

        # Create posts
        self.post1 = create_post_with_images(
            user=self.testuser01, project_card=self.project_card, content="post 1"
        )
        self.post2 = create_post_with_images(
            user=self.testuser01, project_card=self.project_card, content="post 2"
        )

        # URL for the PostListView
        self.url = reverse("post-list")

    def test_list_posts(self):
        """Test listing all posts"""
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_list_posts_by_project_card(self):
        """Test filtering posts by project card"""
        # Add the project_card_id query parameter to the URL
        url_with_query = f"{self.url}?project_card_id={self.project_card.id}"
        response = self.client.get(url_with_query)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_list_posts_unauthenticated(self):
        """Test that unauthenticated users cannot access the post list"""
        self.client.force_authenticate(user=None)  # Logout the client
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class PostUpdateViewTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Create a test user
        self.testuser01 = create_user_with_profile(
            email="test@email.com", password="test", user_name="testuser1"
        )
        self.testuser02 = create_user_with_profile(
            email="test2@email.com", password="test", user_name="testuser2"
        )

        # Create a project card
        self.project_card = ProjectCard.objects.create(
            title="test1",
            creator=self.testuser01,
            start_date="2021-01-01",
            end_date="2021-12-31",
            description="test1",
        )

        # Create a post
        self.post = Post.objects.create(
            user=self.testuser01,
            project_card=self.project_card,
            content="original content",
        )

        # Authenticate the user
        self.client.force_authenticate(user=self.testuser01)

        # URL for update
        self.url = reverse("post-update", args=[self.post.id])

    def test_update_post_success(self):
        data = {"content": "updated content"}
        response = self.client.put(self.url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Check the content was updated
        self.post.refresh_from_db()
        self.assertEqual(self.post.content, "updated content")


class PostDeleteViewTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Create a test user
        self.testuser01 = create_user_with_profile(
            email="test@email.com", password="test", user_name="testuser1"
        )

        # Create a project card
        self.project_card = ProjectCard.objects.create(
            title="test1",
            creator=self.testuser01,
            start_date="2021-01-01",
            end_date="2021-12-31",
            description="test1",
        )

        # Create a post
        self.post = Post.objects.create(
            user=self.testuser01,
            project_card=self.project_card,
            content="original content",
        )

        # Authenticate the user
        self.client.force_authenticate(user=self.testuser01)

        # URL for delete
        self.url = reverse("post-delete", args=[self.post.id])

    def test_delete_post_success(self):
        response = self.client.delete(self.url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

        # Check the post was deleted
        self.assertFalse(Post.objects.filter(id=self.post.id).exists())
