from django.utils.timezone import now
from ..models import CustomUser, Post, PostImage, Profile
from django.core.files.uploadedfile import SimpleUploadedFile


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
    # Create test image file
    test_image1 = SimpleUploadedFile(
        name="test_image1.jpg", content=b"file_content", content_type="image/jpeg"
    )
    test_image2 = SimpleUploadedFile(
        name="test_image2.jpg", content=b"file_content", content_type="image/jpeg"
    )
    # 게시글 생성
    post = Post.objects.create(
        user=user,
        project_card=project_card,
        content=content,
    )

    # Create test image file and add it to the post
    post_image1 = PostImage.objects.create(post=post, image=test_image1)
    post_image2 = PostImage.objects.create(post=post, image=test_image2)
    post.images.add(post_image1)
    post.images.add(post_image2)

    return post
