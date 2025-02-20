from django.utils.timezone import now
from ..models import CustomUser, Post, PostImage, Profile
from django.core.files.uploadedfile import SimpleUploadedFile
import os
from django.core.files.storage import default_storage
from django.conf import settings
import io
from django.core.files.uploadedfile import InMemoryUploadedFile
import requests
import boto3


def get_image_from_url(url="https://dummyimage.com/100x100/ff0000/ffffff.jpg"):
    """✅ 외부 URL에서 이미지를 다운로드하여 InMemoryUploadedFile로 변환"""
    response = requests.get(url, stream=True)

    if response.status_code == 200:
        image_bytes = io.BytesIO(response.content)  # 이미지 데이터를 메모리에 저장
        return InMemoryUploadedFile(
            image_bytes,
            None,
            "test_image.jpg",
            "image/jpeg",
            image_bytes.getbuffer().nbytes,
            None,
        )
    else:
        raise ValueError(
            f"Failed to download image, status code: {response.status_code}"
        )


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
    with_image=False,
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
    profile = Profile.objects.create(
        user=user,
        user_name=user_name,
        school=school,
        current_academic_degree=current_academic_degree,
        year=year,
        major1=major1,
        major2=major2,
    )

    # 이미지 추가 로직 (옵션)
    if with_image:
        profile.image = get_image_from_url()
        profile.save()

    return user


# 게시글을 이미지와 함께 생성하는 함수
def create_post_with_images(
    user,
    content="Default Content",
    project_card=None,
    tagged_users=None,
    liked_users=None,
) -> Post:

    # 이미지 파일 생성 또는 기존 파일 가져오기
    test_image1 = get_image_from_url()
    test_image2 = get_image_from_url()

    # 게시글 생성
    post = Post.objects.create(
        user=user,
        project_card=project_card,
        content=content,
    )

    # PostImage 객체 생성 및 연결
    post_image1 = PostImage.objects.create(post=post, image=test_image1)
    post_image2 = PostImage.objects.create(post=post, image=test_image2)

    return post


def delete_s3_file(s3_key):
    """✅ AWS S3에서 특정 파일을 삭제하는 함수"""
    if not s3_key:  # 키값이 없으면 삭제 불필요
        print("⚠️ No S3 key provided. Skipping deletion.")
        return False

    # ✅ AWS S3 클라이언트 생성
    s3_client = boto3.client(
        "s3",
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        region_name=settings.AWS_S3_REGION_NAME,
    )

    try:
        s3_client.delete_object(Bucket=settings.AWS_STORAGE_BUCKET_NAME, Key=s3_key)
        return True  # 삭제 성공
    except Exception as e:
        print(f"❌ Failed to delete file from S3: {e}")
        return False  # 삭제 실패
