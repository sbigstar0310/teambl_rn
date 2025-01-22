from datetime import timedelta
from django.utils import timezone
from django.forms import ValidationError
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import (
    CustomUser,
    Project,
    ProjectImage,
    ProjectCard,
    ProjectCardInvitation,
    Keyword,
    Profile,
    InvitationLink,
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
        fields = ["id", "portfolioLink"]


class ProfileCreateSerializer(serializers.ModelSerializer):
    keywords = serializers.ListField(
        child=serializers.CharField(), write_only=True, required=False
    )
    skills = SkillSerializer(many=True, required=False)
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
            "keywords",
            "one_degree_count",
            "introduction",
            "skills",
            "experiences",
            "portfolio_links",
            "image",
        ]

    # def get_keywords(self, obj):
    #     return [keyword.keyword for keyword in obj.keywords.all()]

    def to_representation(self, instance):
        """
        Customize the output to include keywords.
        """
        representation = super().to_representation(instance)
        representation["keywords"] = [
            keyword.keyword for keyword in instance.keywords.all()
        ]
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
    skills = SkillSerializer(many=True, required=False)
    introduction = serializers.CharField(required=False, allow_blank=True)
    experiences = ExperienceSerializer(many=True, required=False)
    experience_detail = ExperienceDetailSerializer(required=False)
    portfolio_links = PortfolioLinkSerializer(many=True, required=False)
    keywords = serializers.SerializerMethodField()
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
            "skills",
            "introduction",
            "experiences",
            "experience_detail",
            "portfolio_links",
            "keywords",
            "image",
        ]

    def get_keywords(self, obj):
        return [keyword.keyword for keyword in obj.keywords.all()]

    def update(self, instance, validated_data):
        # 이미지 추출 (new_image, old_image )
        new_image = validated_data.get("image", None)
        old_image = instance.image

        # skills 추출
        skills_data = validated_data.pop("skills", None)

        # experiences 추출
        experiences_data = validated_data.pop("experiences", None)

        # experience detail 추출
        experience_detail_data = validated_data.pop("experience_detail", None)

        # portfolio_links 추출
        portfolio_links_data = validated_data.pop("portfolio_links", None)

        # 키워드를 initial_data에서 추출
        keywords_data = self.initial_data.get("keywords", None)
        # keywords 필드를 validated_data에서 제거
        validated_data.pop("keywords", None)

        # Update basic fields only if they are provided in the validated_data
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # 기존 이미지 삭제 (새 이미지가 업로드된 경우)
        if new_image and old_image and old_image != new_image:
            if os.path.isfile(old_image.path):
                os.remove(old_image.path)

        # Update skills
        if skills_data is not None:
            # 프로필에 현재 존재하는 스킬들
            existing_skills = set(instance.skills.values_list("skill", flat=True))

            # 새로 전달된 스킬들
            new_skills = set(skill_data["skill"] for skill_data in skills_data)

            # 삭제할 스킬: 기존 스킬 중 새로운 스킬 목록에 없는 것들
            skills_to_remove = existing_skills - new_skills
            # 추가할 스킬: 새로운 스킬 목록 중 기존 스킬 목록에 없는 것들
            skills_to_add = new_skills - existing_skills

            # 스킬 삭제 (스킬명을 기준으로 삭제)
            if skills_to_remove:
                Skill.objects.filter(
                    profile=instance, skill__in=skills_to_remove
                ).delete()

            # 스킬 추가 (중복되지 않은 새 스킬들만 추가)
            for skill_data in skills_to_add:
                Skill.objects.create(profile=instance, skill=skill_data)

        # **Experience 업데이트**
        if experiences_data is not None:
            self.update_experiences(instance, experiences_data)

        # **ExperienceDetail 업데이트**
        if experience_detail_data is not None:
            self.update_experience_detail(instance, experience_detail_data)

        # Update portfolio links
        if portfolio_links_data is not None:
            instance.portfolio_links.all().delete()  # 기존 portfolio links 삭제
            for portfolio_link_data in portfolio_links_data:
                PortfolioLink.objects.create(profile=instance, **portfolio_link_data)

        # Update keywords
        if keywords_data is not None:
            keyword_objs = []
            for keyword in keywords_data:
                keyword_obj, created = Keyword.objects.get_or_create(keyword=keyword)
                keyword_objs.append(keyword_obj)

            # set() 메서드를 사용하여 Many-to-Many 관계 설정
            instance.keywords.set(keyword_objs)

        return instance

    def update_experiences(self, profile_instance, experiences_data):
        """
        주어진 프로필에 연결된 경험들을 업데이트합니다.
        """

        for experience_data in experiences_data:
            experience_id = experience_data.get("id", None)

            # ManyToMany 필드의 객체들을 ID로 변환
            # profiles_ids = [
            #     profile.user.id if isinstance(profile, Profile) else profile
            #     for profile in experience_data.get("profiles", [])
            # ]
            collaborator_ids = [
                user.id if isinstance(user, CustomUser) else user
                for user in experience_data.get("collaborators", [])
            ]
            tag_ids = [
                tag.id if isinstance(tag, Keyword) else tag
                for tag in experience_data.get("tags", [])
            ]
            accepted_users_ids = [
                user.id if isinstance(user, CustomUser) else user
                for user in experience_data.get("accepted_users", [])
            ]

            # ManyToMany 필드들을 ID로 교체
            # experience_data["profiles"] = profiles_ids
            experience_data["collaborators"] = collaborator_ids
            experience_data["tags"] = tag_ids
            experience_data["accepted_users"] = accepted_users_ids

            if experience_id:
                try:
                    # 기존 Experience 객체 가져와 업데이트
                    experience_instance = profile_instance.experiences.get(
                        id=experience_id
                    )
                    experience_serializer = ExperienceSerializer(
                        instance=experience_instance, data=experience_data, partial=True
                    )
                    # if experience_serializer.is_valid(raise_exception=True):
                    #     experience_serializer.save()
                    if not experience_serializer.is_valid():
                        print("Validation Errors:", experience_serializer.errors)
                    experience_serializer.is_valid(raise_exception=True)
                    saved_experience = Experience.objects.filter(
                        id=experience_id
                    ).first()
                    if saved_experience is None:
                        print("Experience not saved in the database!")
                    else:
                        print("Experience successfully saved:", saved_experience)
                except Experience.DoesNotExist:
                    raise serializers.ValidationError(
                        f"Experience with id {experience_id} does not exist."
                    )
            else:
                # 새로운 Experience 생성
                experience_serializer = ExperienceSerializer(data=experience_data)
                if experience_serializer.is_valid(raise_exception=True):
                    new_experience = experience_serializer.save()
                    profile_instance.experiences.add(new_experience)

    def update_experience_detail(self, profile_instance, experience_detail_data):
        """
        주어진 프로필과 경험(Experience)에 연결된 세부 경험(ExperienceDetail)을 업데이트합니다.
        """
        experience_detail_id = experience_detail_data.get("id", None)

        # Experience와 User 객체를 ID로 변환
        experience = experience_detail_data.get("experience")
        user = experience_detail_data.get("user")

        experience_id = (
            experience.id if isinstance(experience, Experience) else experience
        )
        user_id = user.id if isinstance(user, CustomUser) else user

        # Many-to-Many 필드 처리 (skills_used)
        skills_used_ids = [
            skill.id if isinstance(skill, Skill) else skill
            for skill in experience_detail_data.get("skills_used", [])
        ]

        # 필드들을 ID로 교체
        experience_detail_data["experience"] = experience_id
        experience_detail_data["user"] = user_id
        experience_detail_data["skills_used"] = skills_used_ids

        # Experience 객체 가져오기
        try:
            experience_instance = profile_instance.experiences.get(id=experience_id)
        except Experience.DoesNotExist:
            raise serializers.ValidationError(
                f"Experience with id {experience_id} does not exist."
            )

        if experience_detail_id:
            try:
                # 해당 Experience에 연결된 ExperienceDetail 가져오기
                experience_detail_instance = experience_instance.details.get(
                    id=experience_detail_id
                )
                experience_detail_serializer = ExperienceDetailSerializer(
                    instance=experience_detail_instance,
                    data=experience_detail_data,
                    partial=True,
                )
                if experience_detail_serializer.is_valid(raise_exception=True):
                    experience_detail_serializer.save()
            except ExperienceDetail.DoesNotExist:
                raise serializers.ValidationError(
                    f"ExperienceDetail with id {experience_detail_id} does not exist."
                )
        else:
            # 새로운 ExperienceDetail 생성
            experience_detail_serializer = ExperienceDetailSerializer(
                data=experience_detail_data
            )
            if experience_detail_serializer.is_valid(raise_exception=True):
                new_experience_detail = experience_detail_serializer.save()
                # 생성한 ExperienceDetail을 Experience 객체에 연결
                experience_instance.details.add(new_experience_detail)

    def to_representation(self, instance):
        """Return instance data including the keywords as a list of strings."""
        representation = super().to_representation(instance)
        representation["keywords"] = [
            keyword.keyword for keyword in instance.keywords.all()
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
    class Meta:
        model = InvitationLink
        fields = [
            "id",
            "inviter",
            "invitee_name",
            "invitee_id",
            "link",
            "created_at",
            "status",
        ]
        read_only_fields = ["id", "inviter", "created_at"]


class FriendCreateSerializer(serializers.ModelSerializer):
    to_user_id = serializers.IntegerField(
        write_only=True, error_messages={"invalid": "유효한 사용자 ID를 입력해주세요."}
    )
    from_user = CustomUserSerializer(read_only=True)
    to_user = CustomUserSerializer(read_only=True)
    id = serializers.IntegerField(read_only=True)

    class Meta:
        model = Friend
        fields = ["id", "from_user", "to_user", "status", "to_user_id"]
        read_only_fields = ["id", "from_user", "to_user"]

    def validate(self, attrs):
        from_user = self.context["request"].user
        to_user_id = attrs.get("to_user_id")

        # 이메일에 해당하는 사용자가 있는지 확인
        try:
            to_user = CustomUser.objects.get(id=to_user_id)
        except CustomUser.DoesNotExist:
            raise serializers.ValidationError({"message": "해당 ID의 유저가 없습니다."})

        # 자신에게 1촌 신청하는지 확인
        if from_user == to_user:
            raise serializers.ValidationError(
                {"message": "자신에게 1촌 신청할 수 없습니다."}
            )

        # 이미 1촌인 유저인지 확인
        if Friend.objects.filter(
            from_user=from_user, to_user=to_user, status="accepted"
        ).exists():
            raise serializers.ValidationError({"message": "이미 1촌인 유저입니다."})

        # 검증 완료 후 attrs에 추가
        attrs["from_user"] = from_user
        attrs["to_user"] = to_user
        return attrs

    def create(self, validated_data):
        from_user = self.context["request"].user
        to_user = validated_data.pop("to_user")
        return Friend.objects.create(
            from_user=from_user, to_user=to_user, status="pending"
        )


class FriendUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Friend
        fields = ["status"]

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
            "related_project_id",
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
            "project",
            "content",
            "created_at",
            "likes",
            "parent_comment",
            "replies",
        ]
        read_only_fields = ["user", "project", "created_at", "likes"]

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
    creator = CustomUserSerializer(read_only=True)  # 프로젝트 카드 생성자
    accepted_users = serializers.PrimaryKeyRelatedField(
        many=True, queryset=CustomUser.objects.all(), required=False
    )  # 프로젝트 카드에 참여한 사람들
    bookmarked_users = serializers.PrimaryKeyRelatedField(
        many=True, queryset=CustomUser.objects.all(), required=False
    )  # 프로젝트 카드를 북마크한 사람들
    posts = ProjectSerializer(many=True, read_only=True)

    class Meta:
        model = ProjectCard
        fields = [
            "id",
            "title",
            "keywords",  # 프로젝트 카드의 키워드들
            "accepted_users",  # 프로젝트 카드에 참여된 사람들
            "bookmarked_users",  # 프로젝트 카드를 북마크한 사람들
            "creator",
            "created_at",
            "start_date",
            "end_date",
            "description",
            "posts",  # 프로젝트 카드의 게시물들
        ]

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
        keywords_data = validated_data.pop("keywords", [])
        accepted_users_data = validated_data.pop("accepted_users", [])
        bookmarked_users_data = validated_data.pop("bookmarked_users", [])

        # ProjectCard 생성
        project_card = ProjectCard.objects.create(**validated_data)

        # Keywords 처리
        for keyword in keywords_data:
            keyword_obj, created = Keyword.objects.get_or_create(keyword=keyword)
            project_card.keywords.add(keyword_obj)

        # Accepted Users 처리
        for user_id in accepted_users_data:
            try:
                user = CustomUser.objects.get(id=user_id)
                project_card.accepted_users.add(user)
            except CustomUser.DoesNotExist:
                raise serializers.ValidationError(
                    f"User with ID {user_id} does not exist."
                )

        return project_card

    def update(self, instance, validated_data):
        # Keywords 처리
        if "keywords" in validated_data:
            keywords_data = validated_data.pop("keywords")
            instance.keywords.clear()  # 기존 키워드 제거
            for keyword in keywords_data:
                keyword_obj, _ = Keyword.objects.get_or_create(name=keyword)
                instance.keywords.add(keyword_obj)

        # Accepted Users 처리
        if "accepted_users" in validated_data:
            accepted_users_data = validated_data.pop("accepted_users")
            instance.accepted_users.clear()  # 기존 유저 제거
            for user_id in accepted_users_data:
                try:
                    user = CustomUser.objects.get(id=user_id)
                    instance.accepted_users.add(user)
                except CustomUser.DoesNotExist:
                    raise serializers.ValidationError(
                        f"User with ID {user_id} does not exist."
                    )

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
