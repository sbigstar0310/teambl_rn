from django.utils.timezone import now
from ..models import CustomUser, Post, PostImage, Profile
from django.core.files.uploadedfile import SimpleUploadedFile
import os
from django.core.files.storage import default_storage
from django.conf import settings


# 유저 생성하는 함수
def create_user_with_profile(
    email,
    password,
    date_joined=None,  # 기본값을 None으로 설정
    user_name="Default User",
    school="KAIST",
    current_academic_degree="학사",
    year=2024,
    major1="전산학부",
    major2=None,  # major2 추가
) -> CustomUser:
    # 기본값으로 현재 시간 설정
    if date_joined is None:
        date_joined = now()

    # 사용자 생성
    user = CustomUser.objects.create_user(
        email=email, password=password, date_joined=date_joined
    )

    # 사용자 date_joined 날짜 반영
    user.date_joined = date_joined
    user.save()

    # 프로필 생성
    Profile.objects.create(
        user=user,
        user_name=user_name,
        school=school,
        current_academic_degree=current_academic_degree,
        year=year,
        major1=major1,
        major2=major2,
    )

    return user


# 게시글을 이미지와 함께 생성하는 함수
def create_post_with_images(
    user,
    content="Default Content",
    project_card=None,
    tagged_users=None,
    liked_users=None,
) -> Post:
    # 상대 경로 (MEDIA_ROOT 하위에 저장될 경로)
    image_dir = "post_images"

    # 이미지 파일 생성 함수 (중복 방지 포함)
    def get_or_create_image_file(file_name, file_content, content_type):
        # 상대 경로 생성
        file_path = os.path.join(image_dir, file_name)

        # 파일이 존재하면 삭제하고 새로 저장
        if default_storage.exists(file_path):
            default_storage.delete(file_path)

        return SimpleUploadedFile(
            name=file_name,
            content=file_content,
            content_type=content_type,
        )

    # 이미지 파일 생성 또는 기존 파일 가져오기
    test_image1 = get_or_create_image_file(
        file_name="test_image1.jpg",
        file_content=b"file_content",  # 실제 이미지 데이터로 변경 가능
        content_type="image/jpeg",
    )
    test_image2 = get_or_create_image_file(
        file_name="test_image2.jpg",
        file_content=b"file_content",  # 실제 이미지 데이터로 변경 가능
        content_type="image/jpeg",
    )

    # 게시글 생성
    post = Post.objects.create(
        user=user,
        project_card=project_card,
        content=content,
    )

    # PostImage 객체 생성 및 연결
    post_image1 = PostImage.objects.create(post=post, image=test_image1)
    post_image2 = PostImage.objects.create(post=post, image=test_image2)
    post.images.add(post_image1)
    post.images.add(post_image2)

    return post
