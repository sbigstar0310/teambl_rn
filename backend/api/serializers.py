from datetime import timedelta
from django.utils import timezone
from django.forms import ValidationError
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.conf import settings
from .models import (
    CustomUser,
    Post,
    PostImage,
    Project,
    ProjectImage,
    ProjectCard,
    ProjectCardInvitation,
    Keyword,
    Profile,
    InvitationLink,
    ProjectCardInvitationLink,
    Friend,
    Skill,
    Endorsement,
    Experience,
    ExperienceDetail,
    ExperienceInvitation,
    PortfolioLink,
    Notification,
    Inquiry,
    SearchHistory,
    Like,
    Comment,
    Contact,
    Conversation,
    Message,
    Report,
)
import os
from django.db import transaction


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # JWT 토큰에 userId를 추가
        token["userId"] = user.id

        return token

    def validate(self, attrs):
        data = super().validate(attrs)

        # 로그인 응답에 userId 추가
        data.update({"userId": self.user.id})

        return data


class KeywordSerializer(serializers.ModelSerializer):
    class Meta:
        model = Keyword
        fields = ["keyword"]


class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ["id", "skill"]


class ExperienceInvitationSerializer(serializers.ModelSerializer):
    experience = serializers.PrimaryKeyRelatedField(queryset=Experience.objects.all())
    inviter = serializers.PrimaryKeyRelatedField(
        queryset=CustomUser.objects.all()
    )  # 초대한 유저
    invitee = serializers.PrimaryKeyRelatedField(
        queryset=CustomUser.objects.all()
    )  # 초대받은 유저

    class Meta:
        model = ExperienceInvitation
        fields = ["id", "experience", "inviter", "invitee", "created_at", "status"]


class ExperienceDetailSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(required=False)  # ID 필드를 명시적으로 정의
    experience = serializers.PrimaryKeyRelatedField(queryset=Experience.objects.all())
    user = serializers.PrimaryKeyRelatedField(queryset=CustomUser.objects.all())
    tags = serializers.ListField(
        child=serializers.CharField(), write_only=True  # 스킬 이름으로 입력 받음
    )
    skills_used = serializers.ListField(
        child=serializers.CharField(), write_only=True  # 스킬 이름으로 입력 받음
    )

    class Meta:
        model = ExperienceDetail
        fields = [
            "id",
            "experience",
            "user",
            "description",
            "tags",
            "skills_used",
            "start_date",
            "end_date",
        ]

    # 생성 함수
    def create(self, validated_data):
        skills = validated_data.pop("skills_used", [])  # 스킬 데이터 추출
        tags = validated_data.pop("tags", [])
        experience_detail = ExperienceDetail.objects.create(**validated_data)

        # 스킬 생성 및 연결
        skill_objects = self._get_or_create_skills(
            skills, validated_data["user"].profile
        )
        experience_detail.skills_used.set(skill_objects)

        # 태그 생성 및 연결
        keyword_obj = self._get_or_create_tags(tags)
        experience_detail.tags.set(keyword_obj)

        return experience_detail

    # 업데이트 함수
    def update(self, instance, validated_data):
        skills = validated_data.pop("skills_used", None)  # ManyToMany 필드 분리
        tags = validated_data.pop("tags", None)

        # 인스턴스의 각 필드 업데이트
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        # ManyToMany 필드 업데이트 (존재할 경우)
        if skills is not None:
            instance.skills_used.set(
                self._get_or_create_skills(skills, instance.user.profile)
            )
        if tags is not None:
            instance.tags.set(self._get_or_create_tags(tags))

        instance.save()
        return instance

    # 삭제 함수 (주로 View에서 사용하지만 추가 가능)
    def delete(self, instance):
        instance.delete()
        return {"detail": "Experience detail deleted successfully"}

    def _get_or_create_skills(self, skills, profile):
        """스킬이 존재하지 않으면 생성, 이미 존재하면 가져오기"""
        skill_objects = []
        for skill_name in skills:
            skill_obj, _ = Skill.objects.get_or_create(
                skill=skill_name, profile=profile
            )
            skill_objects.append(skill_obj)
        return skill_objects

    def _get_or_create_tags(self, tags):
        """태그가 존재하지 않으면 생성, 이미 존재하면 가져오기"""
        keyword_objects = []
        for tag_name in tags:
            keyword_obj, _ = Keyword.objects.get_or_create(keyword=tag_name)
            keyword_objects.append(keyword_obj)
        return keyword_objects

    def to_representation(self, instance):
        """
        기존 skills_used 필드를 스킬 이름으로 변환
        """
        representation = super().to_representation(instance)
        representation["skills_used"] = [
            skill.skill for skill in instance.skills_used.all()
        ]
        representation["tags"] = [tag.keyword for tag in instance.tags.all()]
        return representation


class ExperienceSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(required=False)
    experience_detail = ExperienceDetailSerializer(
        many=True, read_only=True, source="details"
    )
    accepted_users = serializers.PrimaryKeyRelatedField(
        queryset=CustomUser.objects.all(), many=True, required=False
    )
    pending_invitations = ExperienceInvitationSerializer(many=True, required=False)
    creator = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Experience
        fields = [
            "id",
            "title",
            "is_team_project",
            "accepted_users",
            "creator",
            "created_at",
            "experience_detail",
            "pending_invitations",
        ]

    def create(self, validated_data):
        # Many-to-Many 필드를 validated_data에서 분리
        accepted_users = validated_data.pop("accepted_users", [])
        request = self.context.get("request")

        # `creator`를 현재 요청한 사용자로 설정
        if request and request.user:
            validated_data["creator"] = request.user

        # Experience 객체 생성 (Many-to-Many 필드를 제외한 나머지 필드로만 생성)
        experience = Experience.objects.create(**validated_data)

        # Many-to-Many 관계 설정
        experience.accepted_users.set(accepted_users)

        return experience

    def update(self, instance, validated_data):
        accepted_users = validated_data.pop("accepted_users", None)
        pending_invitations = validated_data.pop("pending_invitations", None)

        # 나머지 필드 업데이트
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        # accepted_users 업데이트
        if accepted_users is not None:
            instance.accepted_users.set(accepted_users)

        # pending_invitations 업데이트
        if pending_invitations is not None:
            # 기존 초대 데이터 삭제
            instance.pending_invitations.clear()

            # 새 초대 데이터 추가
            for invitation_data in pending_invitations:
                print(invitation_data)
                invitation_data["experience"] = instance.id  # 경험 ID 설정
                invitation_data["invitee"] = invitation_data["invitee"].id
                invitation_data["inviter"] = invitation_data["inviter"].id

                invitation_serializer = ExperienceInvitationSerializer(
                    data=invitation_data
                )
                invitation_serializer.is_valid(raise_exception=True)
                invitation_instance = invitation_serializer.save(experience=instance)
                instance.pending_invitations.add(invitation_instance)

        instance.save()
        return instance


class PortfolioLinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = PortfolioLink
        fields = ["id", "portfolio_link"]


class ProfileCreateSerializer(serializers.ModelSerializer):
    keywords = serializers.ListField(
        child=serializers.CharField(), write_only=True, required=False
    )
    skills = serializers.ListField(
        child=serializers.CharField(), write_only=True, required=False
    )
    experiences = ExperienceSerializer(many=True, required=False)
    portfolio_links = PortfolioLinkSerializer(many=True, required=False)
    image = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = Profile
        fields = [
            "user_name",
            "school",
            "current_academic_degree",
            "year",
            "major1",
            "major2",
            "one_degree_count",
            "introduction",
            "skills",
            "experiences",
            "portfolio_links",
            "image",
            "keywords",
        ]

    def to_representation(self, instance):
        """
        Customize the output to include keywords.
        """
        representation = super().to_representation(instance)
        representation["keywords"] = [
            keyword.keyword for keyword in instance.keywords.all()
        ]
        representation["skills"] = [skill.skill for skill in instance.skills.all()]
        return representation

    def create(self, validated_data):
        # Extract keywords from validated data
        keywords_data = validated_data.pop("keywords", [])
        skills_data = validated_data.pop("skills", [])

        # Create the profile
        profile = Profile.objects.create(**validated_data)

        # Associate keywords with the profile
        for keyword in keywords_data:
            keyword_obj, created = Keyword.objects.get_or_create(keyword=keyword)
            profile.keywords.add(keyword_obj)

        # Create skills
        for skill_data in skills_data:
            Skill.objects.create(profile=profile, **skill_data)

        return profile


class ProfileUpdateSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(required=False)
    school = serializers.CharField(required=False)
    current_academic_degree = serializers.CharField(required=False)
    year = serializers.IntegerField(required=False)
    major1 = serializers.CharField(required=False)
    major2 = serializers.CharField(required=False, allow_blank=True)
    skills = serializers.ListField(
        child=serializers.CharField(), write_only=True, required=False, allow_empty=True
    )
    introduction = serializers.CharField(required=False, allow_blank=True)
    portfolio_links = serializers.ListField(
        child=serializers.CharField(), write_only=True, required=False, allow_empty=True
    )
    keywords = serializers.ListField(
        child=serializers.CharField(), write_only=True, required=False, allow_empty=True
    )
    image = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = Profile
        fields = [
            "user_name",
            "school",
            "current_academic_degree",
            "year",
            "major1",
            "major2",
            "introduction",
            "skills",
            "portfolio_links",
            "image",
            "keywords",
        ]

    def update(self, instance, validated_data):
        # 이미지 추출 (new_image, old_image )
        new_image = validated_data.get("image", None)
        old_image = instance.image

        # skills 추출
        skills_data = validated_data.pop("skills", None)

        # portfolio_links 추출
        portfolio_links_data = validated_data.pop("portfolio_links", None)

        # 키워드 추출
        keywords_data = validated_data.pop("keywords", None)

        # Update basic fields only if they are provided in the validated_data
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # (1) 유저가 `image` 필드를 보내지 않으면, 기존 이미지 유지
        if "image" not in validated_data:
            pass  # 기존 이미지 유지

        # (2) 유저가 `image: null`을 보냈다면 기존 이미지 삭제
        elif new_image is None:
            if old_image:
                old_image.delete(save=False)  # ✅ S3에서도 이미지 삭제
            instance.image = None

        # (3) 새 이미지가 업로드되면 기존 이미지 삭제 후 새 이미지 저장
        elif new_image and old_image and old_image != new_image:
            if old_image:
                old_image.delete(save=False)  # ✅ 기존 이미지 삭제
            instance.image = new_image  # 새 이미지 저장

        # Update keywords
        if keywords_data is not None:
            keyword_objs = []
            for keyword in keywords_data:
                if keyword:  # 빈 문자열 방지
                    keyword_obj, _ = Keyword.objects.get_or_create(keyword=keyword)
                    keyword_objs.append(keyword_obj)
            instance.keywords.set(keyword_objs)

        # Update skills
        if skills_data is not None:
            instance.skills.all().delete()
            for skill_name in skills_data:
                if skill_name:  # 빈 문자열 방지
                    Skill.objects.create(profile=instance, skill=skill_name)

        # Update portfolio links
        if portfolio_links_data is not None:
            instance.portfolio_links.all().delete()  # 기존 portfolio links 삭제
            for portfolio_link_data in portfolio_links_data:
                PortfolioLink.objects.create(
                    profile=instance, portfolio_link=portfolio_link_data
                )

        return instance

    def to_representation(self, instance):
        """Return instance data including the keywords as a list of strings."""
        representation = super().to_representation(instance)

        # skills 필드
        representation["skills"] = [skill.skill for skill in instance.skills.all()]

        # keywords 필드
        representation["keywords"] = [
            keyword.keyword for keyword in instance.keywords.all()
        ]

        # portfolio_link 필드
        representation["portfolio_links"] = [
            portfolio_link.portfolio_link
            for portfolio_link in instance.portfolio_links.all()
        ]

        return representation


class CustomUserSerializer(serializers.ModelSerializer):
    profile = ProfileCreateSerializer()
    # code = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = CustomUser
        fields = [
            "id",
            "email",
            "password",
            "last_login",
            "is_superuser",
            "is_staff",
            "is_active",
            "date_joined",
            "profile",
        ]
        extra_kwargs = {
            "password": {"write_only": True},
            "last_login": {"read_only": True},
            "is_superuser": {"read_only": True},
            "is_active": {"read_only": True},
            "date_joined": {"read_only": True},
        }

    def create(self, validated_data):
        profile_data = validated_data.pop("profile", {})
        keywords_data = profile_data.pop("keywords", [])
        skills_data = profile_data.pop("skills", [])
        portfolioLink_data = profile_data.pop("portfolio_links", [])

        try:
            with transaction.atomic():

                # Create CustomUser instance
                user = CustomUser.objects.create_user(
                    email=validated_data["email"],
                    password=validated_data["password"],
                    is_staff=validated_data.get("is_staff", False),
                )

                # Create Profile instance and associate it with the user
                profile = Profile.objects.create(user=user, **profile_data)

                # Associate keywords with the profile
                for keyword in keywords_data:
                    keyword_obj, created = Keyword.objects.get_or_create(
                        keyword=keyword
                    )
                    profile.keywords.add(keyword_obj)

                # Create skills
                print("skills_data: ", skills_data)
                for skill_name in skills_data:
                    Skill.objects.create(profile=profile, skill=skill_name)

                # Create portfolio links
                for link_data in portfolioLink_data:
                    PortfolioLink.objects.create(profile=profile, **link_data)

                return user  # Ensure the created user is returned

        except Exception as e:
            # Log the exception for debugging
            print(f"Error during user/profile creation: {e}")

            # Rollback any partial changes (handled by transaction.atomic)
            raise ValidationError(
                {"detail": "An error occurred while creating the user or profile."}
            )

    def update(self, instance, validated_data):
        if "password" in validated_data:
            instance.set_password(validated_data["password"])
            validated_data.pop("password")
        return super().update(instance, validated_data)


# 검색을 통해 반환하는 유저 시리얼라이저
class CustomUserSearchSerializer(serializers.Serializer):
    user = CustomUserSerializer(source="*")  # CustomUserSerializer를 중첩
    is_new_user = serializers.SerializerMethodField()  # 신규 사용자 여부
    relation_degree = serializers.SerializerMethodField()  # 촌수 정보

    def get_is_new_user(self, obj):
        """
        오늘 날짜를 기준으로 이번 주에 가입했는지 확인
        """
        monday = timezone.now().date() - timedelta(days=timezone.now().date().weekday())
        return obj.date_joined.date() >= monday

    def get_relation_degree(self, obj):
        """
        요청의 컨텍스트에서 유저와 관련된 촌수 정보를 가져옴
        """
        target_user_and_distance_dic = self.context.get(
            "target_user_and_distance_dic", {}
        )
        return target_user_and_distance_dic.get(obj.id, None)

    def to_representation(self, instance):
        """
        사용자 데이터를 중첩된 구조로 반환
        """
        user_data = CustomUserSerializer(
            instance, context=self.context
        ).data  # CustomUserSerializer로 직렬화
        representation = super().to_representation(instance)
        representation["user"] = user_data  # user 하위에 사용자 데이터 포함
        return representation


class ContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contact
        fields = ["contact_info"]


class EndorsementSerializer(serializers.ModelSerializer):
    # endorsed_by는 요청한 유저를 자동으로 설정
    endorsed_by = CustomUserSerializer(read_only=True)

    class Meta:
        model = Endorsement
        fields = ["id", "skill", "endorsed_by", "endorsed_at"]


class PostImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = PostImage
        fields = ["id", "image", "created_at"]
        read_only_fields = ["created_at"]


class PostSerializer(serializers.ModelSerializer):
    project_card = serializers.PrimaryKeyRelatedField(
        queryset=ProjectCard.objects.all(), required=False
    )
    tagged_users = serializers.PrimaryKeyRelatedField(
        many=True, queryset=CustomUser.objects.all(), required=False
    )
    liked_users = serializers.PrimaryKeyRelatedField(
        many=True, queryset=CustomUser.objects.all(), required=False
    )
    images = PostImageSerializer(
        many=True, required=False
    )  # Nested serializer for images
    content = serializers.CharField(required=False)

    class Meta:
        model = Post
        fields = [
            "id",
            "user",
            "project_card",
            "content",
            "created_at",
            "like_count",
            "tagged_users",
            "liked_users",
            "images",
        ]
        read_only_fields = ["like_count", "user"]

    def create(self, validated_data):
        tagged_users_data = validated_data.pop("tagged_users", [])
        liked_users_data = validated_data.pop("liked_users", [])
        images_data = self.context["request"].FILES.getlist(
            "images"
        )  # 이미지 파일 가져오기

        # Create the post
        post = Post.objects.create(**validated_data)

        # Add tagged users
        if tagged_users_data:
            post.tagged_users.set(tagged_users_data)

        # Add liked users
        if liked_users_data:
            post.liked_users.set(liked_users_data)

        # Add images
        for image_data in images_data:
            PostImage.objects.create(post=post, image=image_data)

        # Post가 생성되었으므로, Project Card의 참여자들에게 생성 알림 보내기
        users_in_project_card = post.project_card.accepted_users.all()

        for user in users_in_project_card:
            notification_exists = Notification.objects.filter(
                user=user,
                message=f"{self.context['request'].user.profile.user_name}님이 {post.project_card.title}에 새로운 게시물을 추가했습니다.",
                notification_type="post_create_team",
                related_post_id=post.id,
                related_project_card_id=post.project_card.id,
            ).exists()

            if not notification_exists:
                Notification.objects.create(
                    user=user,
                    message=f"{self.context['request'].user.profile.user_name}님이 {post.project_card.title}에 새로운 게시물을 추가했습니다.",
                    notification_type="post_create_team",
                    related_post_id=post.id,
                    related_project_card_id=post.project_card.id,
                )

        # Post가 생성되었으므로, Project Card의 구독자(저장)들에게 생성 알림 보내기
        bookmarked_users_in_project_card = post.project_card.bookmarked_users.all()

        for user in bookmarked_users_in_project_card:
            notification_exists = Notification.objects.filter(
                user=user,
                message=f"저장한 프로젝트 {post.project_card.title}에 새로운 게시물이 추가되었습니다.",
                notification_type="post_create_save",
                related_post_id=post.id,
                related_project_card_id=post.project_card.id,
            ).exists()

            if not notification_exists:
                Notification.objects.create(
                    user=user,
                    message=f"저장한 프로젝트 {post.project_card.title}에 새로운 게시물이 추가되었습니다.",
                    notification_type="post_create_save",
                    related_post_id=post.id,
                    related_project_card_id=post.project_card.id,
                )

        return post

    def update(self, instance, validated_data):
        tagged_users_data = validated_data.pop("tagged_users", None)
        liked_users_data = validated_data.pop("liked_users", None)
        images_data = self.context["request"].FILES.getlist(
            "images"
        )  # 이미지 파일 가져오기

        # Update post fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Update tagged users
        if tagged_users_data is not None:
            instance.tagged_users.set(tagged_users_data)

        # Update liked users
        if liked_users_data is not None:
            instance.liked_users.set(liked_users_data)

        # 기존 이미지에서 파일명만 가져오기
        existing_images = set(
            image_path.split("/")[-1]
            for image_path in instance.images.values_list("image", flat=True)
        )

        # 새로 추가한 이미지 파일명 가져오기
        new_images = {
            image_data.name for image_data in images_data
        }  # 새로운 파일명 리스트

        # ✅ 삭제해야 할 이미지 식별 후 삭제 (차집합 활용)
        images_to_delete = existing_images - new_images
        for image_to_delete in images_to_delete:
            PostImage.objects.get(image__endswith=image_to_delete).delete()

        # ✅ 추가해야 할 이미지 식별 후 추가 (차집합 활용)
        images_to_add = new_images - existing_images

        print("existing_images", existing_images)
        print("new_images", new_images)
        print("images_to_delete", images_to_delete)
        print("images_to_add", images_to_add)

        for image_data in images_data:
            if image_data.name in images_to_add:
                PostImage.objects.create(post=instance, image=image_data)

        # Update images: Clear existing and add new ones
        # instance.images.all().delete()  # Clear existing images
        # if images_data:
        #     for image_data in images_data:
        #         PostImage.objects.create(post=instance, image=image_data)

        # Update like count
        instance.update_like_count()

        # Post가 수정되었으므로, Project Card의 참여자들에게 수정 알림 보내기
        users_in_project_card = instance.project_card.accepted_users.all()

        for user in users_in_project_card:
            notification_exists = Notification.objects.filter(
                user=user,
                message=f"{self.context['request'].user.profile.user_name}님이 {instance.project_card.title}의 게시물을 수정했습니다.",
                notification_type="post_update_team",
                related_post_id=instance.id,
                related_project_card_id=instance.project_card.id,
            ).exists()

            if not notification_exists:
                Notification.objects.create(
                    user=user,
                    message=f"{self.context['request'].user.profile.user_name}님이 {instance.project_card.title}의 게시물을 수정했습니다.",
                    notification_type="post_update_team",
                    related_post_id=instance.id,
                    related_project_card_id=instance.project_card.id,
                )

        # Post가 수정되었으므로, Project Card의 구독자(저장)들에게 수정 알림 보내기
        bookmarked_users_in_project_card = instance.project_card.bookmarked_users.all()

        for user in bookmarked_users_in_project_card:
            notification_exists = Notification.objects.filter(
                user=user,
                message=f"저장한 프로젝트 {instance.project_card.title}의 게시물이 수정되었습니다.",
                notification_type="post_update_save",
                related_post_id=instance.id,
                related_project_card_id=instance.project_card.id,
            ).exists()

            if not notification_exists:
                Notification.objects.create(
                    user=user,
                    message=f"저장한 프로젝트 {instance.project_card.title}의 게시물이 수정되었습니다.",
                    notification_type="post_update_save",
                    related_post_id=instance.id,
                    related_project_card_id=instance.project_card.id,
                )

        instance.refresh_from_db()  # Refresh the instance to get the updated like count

        return instance


class ProjectImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectImage
        fields = ["id", "image"]


class ProjectSerializer(serializers.ModelSerializer):
    user = CustomUserSerializer(read_only=True)
    keywords = serializers.SerializerMethodField()
    tagged_users = serializers.PrimaryKeyRelatedField(
        many=True, queryset=CustomUser.objects.all(), required=False
    )
    images = ProjectImageSerializer(many=True, read_only=True)
    contacts = ContactSerializer(many=True, required=False)
    liked_users = serializers.PrimaryKeyRelatedField(
        many=True, queryset=CustomUser.objects.all(), required=False
    )

    class Meta:
        model = Project
        fields = [
            "project_id",
            "user",
            "title",
            "content",
            "created_at",
            "keywords",
            "like_count",
            "images",
            "tagged_users",
            "contacts",
            "liked_users",
        ]
        extra_kwargs = {"user": {"read_only": True}}

    def get_keywords(self, obj):
        return [keyword.keyword for keyword in obj.keywords.all()]

    def get_images(self, obj):
        images = obj.images.all()
        # 이미지의 URL이 제대로 나오는지 확인
        image_urls = [image.image.url for image in images if image.image]
        print(
            f"Image URLs for {obj.title}: {image_urls}"
        )  # URL이 실제로 출력되는지 확인
        return image_urls

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation["tagged_users"] = CustomUserSerializer(
            instance.tagged_users.all(), many=True
        ).data
        representation["liked_users"] = CustomUserSerializer(
            instance.liked_users.all(), many=True
        ).data
        return representation

    def create(self, validated_data):
        # Extract keywords and tagged users
        keywords_data = self.initial_data.get("keywords", [])
        tagged_users_data = validated_data.pop("tagged_users", [])
        contacts_data = self.initial_data.get("contacts", [])
        liked_users_data = validated_data.pop("liked_users", [])

        # Create the Project instance
        project = Project.objects.create(**validated_data)

        # Set keywords
        keyword_objs = []
        for keyword in keywords_data:
            keyword_obj, created = Keyword.objects.get_or_create(keyword=keyword)
            keyword_objs.append(keyword_obj)
        project.keywords.set(keyword_objs)

        # Set tagged users
        if tagged_users_data:
            project.tagged_users.set(tagged_users_data)

        # Set contacts
        contact_objs = []
        for contact in contacts_data:
            contact_obj = Contact.objects.create(
                project=project, contact_info=contact["contact_info"]
            )
            contact_objs.append(contact_obj)

        # liked_users 설정
        if liked_users_data:
            project.liked_users.set(liked_users_data)

        return project

    def update(self, instance, validated_data):
        keywords_data = self.initial_data.get("keywords", [])
        tagged_users_data = validated_data.pop("tagged_users", [])
        contacts_data = self.initial_data.get("contacts", [])
        liked_users_data = validated_data.pop("liked_users", [])

        # Update basic fields
        instance.title = validated_data.get("title", instance.title)
        instance.content = validated_data.get("content", instance.content)

        instance.save()

        # Update keywords
        if keywords_data:
            keyword_objs = []
            for keyword in keywords_data:
                keyword_obj, created = Keyword.objects.get_or_create(keyword=keyword)
                keyword_objs.append(keyword_obj)
            instance.keywords.set(keyword_objs)
        else:
            instance.keywords.clear()

        # Update tagged users
        if tagged_users_data:
            instance.tagged_users.set(tagged_users_data)
        else:
            instance.tagged_users.clear()

        # Update contacts
        if contacts_data:
            instance.contacts.all().delete()
            for contact in contacts_data:
                Contact.objects.create(
                    project=instance, contact_info=contact["contact_info"]
                )

        # liked_users 업데이트
        if liked_users_data:
            instance.liked_users.set(liked_users_data)
        else:
            instance.liked_users.clear()

        return instance


class LikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Like
        fields = ["user", "project", "created_at"]


class InvitationLinkSerializer(serializers.ModelSerializer):
    inviter_name = serializers.CharField(
        source="inviter.profile.user_name", read_only=True
    )

    class Meta:
        model = InvitationLink
        fields = [
            "id",
            "inviter",
            "inviter_name",
            "invitee_name",
            "invitee_id",
            "link",
            "created_at",
            "status",
        ]
        read_only_fields = ["id", "inviter", "inviter_name", "created_at"]


class FriendCreateSerializer(serializers.ModelSerializer):
    from_user = serializers.PrimaryKeyRelatedField(
        queryset=CustomUser.objects.all(),
        required=False,
        allow_null=True,
        default=serializers.CurrentUserDefault(),
    )
    to_user = serializers.PrimaryKeyRelatedField(queryset=CustomUser.objects.all())
    status = serializers.CharField(default="pending", required=False)

    class Meta:
        model = Friend
        fields = ["id", "from_user", "to_user", "status", "created_at"]
        read_only_fields = ["id", "created_at"]

    def to_representation(self, instance):
        """✅ 응답 시 to_user를 CustomUserSerializer로 변환"""
        representation = super().to_representation(instance)

        if hasattr(instance, "from_user") and instance.from_user:
            representation["from_user"] = CustomUserSerializer(
                instance.from_user, context=self.context
            ).data

        if hasattr(instance, "to_user") and instance.to_user:
            representation["to_user"] = CustomUserSerializer(
                instance.to_user, context=self.context
            ).data

        return representation


class FriendUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Friend
        fields = ["status", "created_at"]
        read_only_fields = ["created_at"]

    def validate_status(self, value):
        if value not in dict(Friend.STATUS_CHOICES).keys():
            raise serializers.ValidationError("Invalid status")
        return value


class UserSearchSerializer(serializers.Serializer):
    q = serializers.CharField(required=False, allow_blank=True)
    degree = serializers.ListField(child=serializers.IntegerField(), required=False)
    majors = serializers.ListField(child=serializers.CharField(), required=False)


class ProjectSearchSerializer(serializers.Serializer):
    q = serializers.CharField(required=False, allow_blank=True)
    degree = serializers.ListField(child=serializers.IntegerField(), required=False)
    keywords = serializers.ListField(child=serializers.CharField(), required=False)


class ExperienceSearchSerializer(serializers.Serializer):
    q = serializers.CharField(required=False, allow_blank=True)
    degree = serializers.ListField(child=serializers.IntegerField(), required=False)


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = [
            "id",
            "user",
            "message",
            "created_at",
            "is_read",
            "notification_type",
            "related_user_id",
            "related_project_card_id",
        ]
        read_only_fields = ["id", "user", "created_at"]

    def validate_notification_type(self, value):
        if value not in dict(Notification.NOTIFICATION_TYPE_CHOICES).keys():
            raise serializers.ValidationError("Invalid notification type")
        return value


class UserDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ["id", "email", "profile"]


# 사용자와 공통 키워드를 반환
class RelatedUserSerializer(serializers.Serializer):
    user = UserDetailSerializer()
    common_keywords = serializers.ListField(child=serializers.CharField())
    similarity = serializers.IntegerField()


class SecondDegreeProfileSerializer(serializers.Serializer):
    second_degree_profile_id = serializers.IntegerField(help_text="2촌 사용자의 ID")
    connector_friend_id = serializers.IntegerField(
        help_text="2촌과 연결된 1촌 사용자의 ID"
    )


class InquirySerializer(serializers.ModelSerializer):
    class Meta:
        model = Inquiry
        fields = ["id", "user", "text", "created_at"]
        read_only_fields = ["id", "user", "created_at"]


class SearchHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = SearchHistory
        fields = ["id", "user", "keyword", "created_at"]
        read_only_fields = ["id", "user", "created_at"]


class CommentSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(
        source="user.profile.user_name", read_only=True
    )  # 댓글 작성자 이름 추가
    replies = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = [
            "id",
            "user",
            "user_name",
            "post",
            "content",
            "created_at",
            "likes",
            "parent_comment",
            "replies",
        ]
        read_only_fields = ["user", "post", "created_at", "likes"]

    def get_replies(self, obj):
        # Fetching replies related to the current comment
        replies = obj.replies.all()
        return CommentSerializer(replies, many=True).data


# class ConversationSerializer(serializers.ModelSerializer):
#     user_1_username = serializers.SerializerMethodField()
#     user_2_username = serializers.SerializerMethodField()

#     class Meta:
#         model = Conversation
#         fields = [
#             "id",
#             "user_1",
#             "user_1_username",
#             "user_2",
#             "user_2_username",
#             "deleted_for_user1",
#             "deleted_for_user2",
#             "created_at",
#             "updated_at",
#         ]
#         read_only_fields = [
#             "user_1",
#             "user_1_username",
#             "user_2_username",
#             "created_at",
#             "updated_at",
#         ]

#     def get_user_1_username(self, obj):
#         if isinstance(obj, dict):
#             # Handle dict case
#             user_1 = obj.get('user_1')
#             if isinstance(user_1, CustomUser):
#                 return user_1.profile.user_name if user_1 else "탈퇴한 사용자"
#             user_1_obj = CustomUser.objects.filter(id=user_1).first()
#             return user_1_obj.profile.user_name if user_1_obj else "탈퇴한 사용자"
#         # Default for model instance
#         return obj.user_1.profile.user_name if obj.user_1 else "탈퇴한 사용자"

#     def get_user_2_username(self, obj):
#         if isinstance(obj, dict):
#             # Handle dict case
#             user_2 = obj.get('user_2')
#             if isinstance(user_2, CustomUser):
#                 return user_2.profile.user_name if user_2 else "탈퇴한 사용자"
#             user_2_obj = CustomUser.objects.filter(id=user_2).first()
#             return user_2_obj.profile.user_name if user_2_obj else "탈퇴한 사용자"
#         # Default for model instance
#         return obj.user_2.profile.user_name if obj.user_2 else "탈퇴한 사용자"


class ConversationSerializer(serializers.ModelSerializer):
    user_1_username = serializers.SerializerMethodField()
    user_2_username = serializers.SerializerMethodField()
    other_user_profile = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = [
            "id",
            "user_1",
            "user_1_username",
            "user_2",
            "user_2_username",
            "other_user_profile",
            "deleted_for_user1",
            "deleted_for_user2",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "user_1",
            "user_1_username",
            "user_2_username",
            "other_user_profile",
            "created_at",
            "updated_at",
        ]

    def get_user_1_username(self, obj):
        return obj.user_1.profile.user_name if obj.user_1 else "탈퇴한 사용자"

    def get_user_2_username(self, obj):
        return obj.user_2.profile.user_name if obj.user_2 else "탈퇴한 사용자"

    def get_other_user_profile(self, obj):
        """
        현재 요청 사용자를 기준으로 상대방의 프로필 정보를 반환
        """
        request_user = self.context["request"].user

        if obj.user_1 == request_user:
            other_user = obj.user_2
        else:
            other_user = obj.user_1

        if other_user and hasattr(other_user, "profile"):
            return ProfileCreateSerializer(other_user.profile).data
        return None


class MessageSerializer(serializers.ModelSerializer):
    sender_username = serializers.CharField(source="sender.username", read_only=True)
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = [
            "id",
            "conversation",
            "sender",
            "sender_username",
            "message",
            "image",
            "is_read",
            "is_system",
            "image_url",
            "created_at",
        ]
        read_only_fields = [
            "conversation",
            "sender",
            "sender_username",
            "is_read",
            "is_system",
            "created_at",
        ]

    def get_image_url(self, obj):
        if obj.image:
            return obj.image.url  # 이미지 필드가 서버에 저장된 경로 반환
        return None


class ProjectCardSerializer(serializers.ModelSerializer):
    keywords = serializers.SerializerMethodField()  # 프로젝트 카드의 키워드들
    # keywords = serializers.ListField(child=serializers.CharField(), required=True)
    creator = CustomUserSerializer(read_only=True)  # 프로젝트 카드 생성자
    accepted_users = serializers.PrimaryKeyRelatedField(
        many=True, queryset=CustomUser.objects.all(), required=False
    )  # 프로젝트 카드에 참여한 사람들
    bookmarked_users = serializers.PrimaryKeyRelatedField(
        many=True, queryset=CustomUser.objects.all(), required=False
    )  # 프로젝트 카드를 북마크한 사람들
    pending_invited_users = (
        serializers.SerializerMethodField()
    )  # 프로젝트 카드에 초대되었지만 아직 수락하지 않은 유저들
    posts = PostSerializer(many=True, read_only=True)  # 프로젝트 카드의 게시글들

    class Meta:
        model = ProjectCard
        fields = [
            "id",
            "title",
            "keywords",  # 프로젝트 카드의 키워드들
            "accepted_users",  # 프로젝트 카드에 참여된 사람들
            "bookmarked_users",  # 프로젝트 카드를 북마크한 사람들
            "pending_invited_users",  # 프로젝트 카드에 초대되었지만 아직 수락하지 않은 유저들
            "creator",
            "created_at",
            "start_date",
            "end_date",
            "description",
            "posts",  # 프로젝트 카드의 게시물들
        ]

    def get_pending_invited_users(self, obj):
        """
        프로젝트 카드에 초대되었지만 아직 수락하지 않은 유저들의 ID 리스트 반환
        """
        return list(
            ProjectCardInvitation.objects.filter(
                project_card=obj, status="pending"
            ).values_list("invitee_id", flat=True)
        )

    def get_keywords(self, obj):
        return [keyword.keyword for keyword in obj.keywords.all()]

    def validate_keywords(self, keywords):
        # 키워드 개수 검증
        if len(keywords) < 2:
            raise serializers.ValidationError(
                "프로젝트 카드의 키워드 개수는 2개 이상이어야 합니다."
            )
        return keywords

    def create(self, validated_data):
        # Keywords, accepted_users, bookmarked_users는 별도로 처리
        keywords_data = self.initial_data.get("keywords", [])
        accepted_users_data = validated_data.pop("accepted_users", [])
        bookmarked_users_data = validated_data.pop("bookmarked_users", [])
        print("Keywords data:", keywords_data)
        print("Accepted users data:", accepted_users_data)
        print("Bookmarked users data:", bookmarked_users_data)

        # ProjectCard 생성
        project_card = ProjectCard.objects.create(**validated_data)

        # Keywords 처리
        for keyword in keywords_data:
            keyword_obj, created = Keyword.objects.get_or_create(keyword=keyword)
            project_card.keywords.add(keyword_obj)

        # Accepted Users 처리
        # 새로 추가된 유저의 경우 ProjectCardInvitation 생성
        old_accepted_users = project_card.accepted_users.all()
        new_accepted_users = list(set(accepted_users_data) - set(old_accepted_users))
        for new_user in new_accepted_users:
            ProjectCardInvitation.objects.create(
                project_card=project_card,
                inviter=project_card.creator,
                invitee=new_user,
            )

        return project_card

    def update(self, instance, validated_data):
        # Keywords, accepted_users, bookmarked_users는 별도로 처리
        keywords_data = self.initial_data.get("keywords", [])
        accepted_users_data = validated_data.pop("accepted_users", [])
        bookmarked_users_data = validated_data.pop("bookmarked_users", [])
        print("Keywords data:", keywords_data)
        print("Accepted users data:", accepted_users_data)
        print("Bookmarked users data:", bookmarked_users_data)

        # Keywords 처리
        if keywords_data:
            instance.keywords.clear()  # 기존 키워드 제거
            for keyword in keywords_data:
                keyword_obj, _ = Keyword.objects.get_or_create(keyword=keyword)
                instance.keywords.add(keyword_obj)

        # Accepted Users 처리
        if accepted_users_data:
            old_accepted_users = instance.accepted_users.all()  # 기존 accepted_users
            new_added_accepted_users = list(
                set(accepted_users_data) - set(old_accepted_users)
            )  # 새로 추가된 유저
            new_deleted_accepted_users = list(
                set(old_accepted_users) - set(accepted_users_data)
            )  # 새로 삭제된 유저

            # 새로 추가된 유저의 경우 ProjectCardInvitation 생성
            for new_user in new_added_accepted_users:
                invitation, created = ProjectCardInvitation.objects.get_or_create(
                    project_card=instance,
                    invitee=new_user,
                    defaults={"inviter": instance.creator, "status": "pending"},
                )

                # 기존에 있던 초대라면 status를 pending으로 업데이트
                if not created:
                    invitation.status = "pending"
                    invitation.save()

            # 삭제된 유저의 경우 기존 accepted_users에서 제외하기
            instance.accepted_users.remove(*new_deleted_accepted_users)
            # 삭제된 유저의 초대 정보 삭제
            ProjectCardInvitation.objects.filter(
                project_card=instance, invitee__in=new_deleted_accepted_users
            ).delete()

        # Bookmark Users 처리
        if bookmarked_users_data:
            instance.bookmarked_users.clear()
            for bookmarked_user in bookmarked_users_data:
                instance.bookmarked_users.add(bookmarked_user)

        # 기타 필드 업데이트
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()
        return instance


class ProjectCardInvitationSerializer(serializers.ModelSerializer):
    project_card = ProjectCardSerializer()
    inviter = serializers.PrimaryKeyRelatedField(
        queryset=CustomUser.objects.all()
    )  # 초대한 유저
    invitee = serializers.PrimaryKeyRelatedField(
        queryset=CustomUser.objects.all()
    )  # 초대받은 유저

    class Meta:
        model = ProjectCardInvitation
        fields = [
            "id",
            "project_card",
            "inviter",
            "invitee",
            "created_at",
            "status",
        ]
        read_only_fields = ["id", "created_at"]


class ProjectCardInvitationLinkSerializer(serializers.ModelSerializer):
    project_card = serializers.PrimaryKeyRelatedField(
        queryset=ProjectCard.objects.all()
    )
    inviter = serializers.PrimaryKeyRelatedField(
        read_only=True,
    )  # 초대한 유저
    invitee = serializers.PrimaryKeyRelatedField(
        queryset=CustomUser.objects.all(),
        required=False,
        allow_null=True,
    )  # 초대받은 유저
    link = serializers.CharField(read_only=True)  # 초대 링크

    class Meta:
        model = ProjectCardInvitationLink
        fields = [
            "id",
            "project_card",
            "inviter",
            "invitee",
            "link",
            "created_at",
            "status",
        ]
        read_only_fields = ["id", "inviter", "link", "created_at"]

    def to_representation(self, instance):
        representation = super().to_representation(instance)

        # project_card 처리
        if instance.project_card is not None:
            representation["project_card"] = ProjectCardSerializer(
                instance.project_card
            ).data
        else:
            representation["project_card"] = None

        # inviter 처리
        if instance.inviter is not None:
            representation["inviter"] = CustomUserSerializer(instance.inviter).data
        else:
            representation["inviter"] = None

        # invitee 처리 (🔥 핵심)
        if instance.invitee is not None:
            representation["invitee"] = CustomUserSerializer(instance.invitee).data
        else:
            representation["invitee"] = None

        return representation


class ReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Report
        fields = [
            "id",
            "user",
            "content",
            "created_at",
            "related_project_card_id",
            "related_post_id",
            "related_comment_id",
            "related_user_id",
        ]
        read_only_fields = [
            "id",
            "user",
            "created_at",
        ]  # 생성 시 자동으로 설정되는 필드
