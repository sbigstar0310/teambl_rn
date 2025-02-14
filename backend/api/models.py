from django.db import models
from django.db.models import Q
from django.contrib.auth.models import (
    AbstractBaseUser,
    BaseUserManager,
    PermissionsMixin,
)


class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("The Email field must be set")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)

        return self.create_user(email, password, **extra_fields)


class CustomUser(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=128)
    last_login = models.DateTimeField(null=True, blank=True)
    is_superuser = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    date_joined = models.DateTimeField(auto_now_add=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    objects = CustomUserManager()

    def __str__(self):
        return self.email

    def get_friends(self, user=None):
        # 해당 사용자의 1촌 목록을 가져옵니다.
        # user_id가 주어지면 해당 ID 사용, 그렇지 않으면 self.id 사용
        if user is None:
            user = self

        friends_from = Friend.objects.filter(from_user_id=user.id, status="accepted")
        friends_to = Friend.objects.filter(to_user_id=user.id, status="accepted")

        friends = set()
        for friend in friends_from:
            friends.add(friend.to_user)
        for friend in friends_to:
            friends.add(friend.from_user)

        return friends

    def get_friend_counts(self, user_id=None):
        # user_id가 주어지면 해당 ID 사용, 그렇지 않으면 self.id 사용
        if user_id is None:
            user_id = self.id

        # 1촌 친구 목록을 찾습니다.
        first_degree_friends = Friend.objects.filter(
            (Q(from_user_id=user_id) | Q(to_user_id=user_id)) & Q(status="accepted")
        )

        first_degree_ids = set()
        for friend in first_degree_friends:
            if friend.from_user_id == user_id:
                first_degree_ids.add(friend.to_user.id)
            else:
                first_degree_ids.add(friend.from_user.id)

        # 2촌과 그들을 연결해주는 1촌의 ID 쌍을 저장할 리스트 (중복 제거를 위해 set 사용)
        second_degree_connections = set()

        print("1촌 목록:", first_degree_ids)
        print("현재 사용자 ID:", user_id)  # user_id를 출력해 올바르게 설정되었는지 확인

        # 2촌 찾기
        for friend_id in first_degree_ids:
            second_degree_friends = Friend.objects.filter(
                (Q(from_user_id=friend_id) | Q(to_user_id=friend_id))
                & Q(status="accepted")
            ).exclude(Q(from_user_id=user_id) | Q(to_user_id=user_id))

            print("현재 1촌:", friend_id)

            for friend in second_degree_friends:
                print(
                    f"1촌 {friend_id}의 친구 {friend.from_user_id} - {friend.to_user_id} 조사중.."
                )

                # 2촌 관계에서 나 자신과 1촌들을 제외하고 추가
                if friend.from_user_id == friend_id:
                    target_id = friend.to_user_id
                else:
                    target_id = friend.from_user_id

                print(f"비교: target_id = {target_id}, user_id = {user_id}")

                if target_id not in first_degree_ids and target_id != user_id:
                    second_degree_connections.add((target_id, friend_id))
                    print(f"({target_id}, {friend_id}) 추가")

        # 중복을 제거한 2촌 ID만 반환하기 위해 set을 사용
        second_degree_ids = {conn[0] for conn in second_degree_connections}

        print("second degree connections:", list(second_degree_connections))

        return first_degree_ids, second_degree_ids, list(second_degree_connections)

    def get_related_users_by_keywords(self):
        user_keywords = set(self.profile.keywords.values_list("keyword", flat=True))
        related_profiles = Profile.objects.exclude(user=self)

        user_similarity_list = []

        for profile in related_profiles:
            other_user_keywords = set(
                profile.keywords.values_list("keyword", flat=True)
            )
            common_keywords = user_keywords.intersection(other_user_keywords)

            if len(common_keywords) > 0:  # 공통 키워드가 있는 경우에만 리스트에 추가
                user_similarity_list.append(
                    {
                        "user": profile.user,
                        "common_keywords": list(common_keywords),
                        "similarity": len(
                            common_keywords
                        ),  # 공통 키워드 수를 유사도로 사용
                    }
                )
        # 유사도(공통 키워드 수) 기준으로 정렬
        user_similarity_list.sort(key=lambda x: x["similarity"], reverse=True)

        return user_similarity_list


class Keyword(models.Model):
    keyword = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.keyword


# New 게시물 모델
class Post(models.Model):
    user = models.ForeignKey(
        CustomUser,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="posts",
    )
    project_card = models.ForeignKey(
        "ProjectCard", on_delete=models.CASCADE, related_name="posts", null=True
    )
    content = models.TextField(default="")
    created_at = models.DateTimeField(auto_now_add=True)
    like_count = models.IntegerField(default=0)
    tagged_users = models.ManyToManyField(
        CustomUser, related_name="tagged_posts", blank=True
    )
    liked_users = models.ManyToManyField(
        CustomUser, related_name="liked_posts", blank=True
    )

    def __str__(self):
        return f"Post by {self.user} - {self.content[:30]}..."

    def update_like_count(self):
        """liked_users 수를 기반으로 like_count 업데이트"""
        self.like_count = self.liked_users.count()
        self.save(update_fields=["like_count"])


# New 게시물 이미지 모델
class PostImage(models.Model):
    post = models.ForeignKey("Post", on_delete=models.CASCADE, related_name="images")
    image = models.ImageField(upload_to="post_images/")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Image for {self.post.id}"


# TODO: Old 게시물 모델이므로 삭제하기
class Project(models.Model):
    id = models.AutoField(primary_key=True)
    user = models.ForeignKey(
        CustomUser,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="projects",
    )
    title = models.CharField(max_length=100)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    keywords = models.ManyToManyField(Keyword, blank=True)
    like_count = models.IntegerField(default=0)
    tagged_users = models.ManyToManyField(
        CustomUser, related_name="participating_projects", blank=True
    )
    contact = models.TextField(blank=True, null=True)
    liked_users = models.ManyToManyField(
        CustomUser, related_name="liked_projects", blank=True
    )

    def __str__(self):
        return self.title


# TODO: Old 게시물 이미지 모델이므로 삭제하기
class ProjectImage(models.Model):
    project = models.ForeignKey(
        "Project", on_delete=models.CASCADE, related_name="images"
    )
    image = models.ImageField(upload_to="project_images/")

    def __str__(self):
        return f"Image for {self.project.title}"


class Contact(models.Model):
    project = models.ForeignKey(
        Project, on_delete=models.CASCADE, related_name="contacts"
    )
    contact_info = models.TextField()

    def __str__(self):
        return self.contact_info


class Comment(models.Model):
    user = models.ForeignKey(
        CustomUser,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="comments",
    )
    post = models.ForeignKey(
        Post, on_delete=models.CASCADE, related_name="comments", null=True
    )
    content = models.CharField(max_length=300)
    created_at = models.DateTimeField(auto_now_add=True)
    likes = models.IntegerField(default=0)

    parent_comment = models.ForeignKey(
        "self", null=True, blank=True, related_name="replies", on_delete=models.CASCADE
    )

    def __str__(self):
        return f"Comment by {self.user.email} on {self.project.title}"


class Like(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="likes")
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="likes")
    created_at = models.DateTimeField(auto_now_add=True)  # 좋아요 누른 시간

    class Meta:
        unique_together = (
            "user",
            "project",
        )  # 같은 유저가 같은 프로젝트에 여러 번 좋아요 누르지 못하게 함

    def __str__(self):
        return f"{self.user.email} likes {self.project.title}"


class Profile(models.Model):
    MAJOR_CHOICES = [
        # 자연과학대학
        #  학사
        ("물리학과", "물리학과"),
        ("수리과학과", "수리과학과"),
        ("화학과", "화학과"),
        #  석사, 박사
        ("나노과학기술대학원", "나노과학기술대학원"),
        ("양자대학원", "양자대학원"),
        # 생명과학기술대학
        #  학사
        ("생명과학과", "생명과학과"),
        ("뇌인지과학과", "뇌인지과학과"),
        #  석사, 박사
        ("의과학대학원", "의과학대학원"),
        ("공학생물학대학원", "공학생물학대학원"),
        ("줄기세포및재생생물학대학원", "줄기세포및재생생물학대학원"),
        # 공과대학
        #  학사
        ("기계공학과", "기계공학과"),
        ("항공우주공학과", "항공우주공학과"),
        ("전기및전자공학부", "전기및전자공학부"),
        ("전산학부", "전산학부"),
        ("건설및환경공학과", "건설및환경공학과"),
        ("바이오및뇌공학과", "바이오및뇌공학과"),
        ("산업디자인학과", "산업디자인학과"),
        ("산업시스템공학과", "산업시스템공학과"),
        ("생명화학공학과", "생명화학공학과"),
        ("신소재공학과", "신소재공학과"),
        ("원자력및양자공학과", "원자력및양자공학과"),
        ("반도체시스템공학과", "반도체시스템공학과"),
        #  석사, 박사
        ("조천식모빌리티대학원", "조천식모빌리티대학원"),
        ("김재철AI대학원", "김재철AI대학원"),
        ("녹색성장지속가능대학원", "녹색성장지속가능대학원"),
        ("반도체공학대학원", "반도체공학대학원"),
        ("인공지능반도체대학원", "인공지능반도체대학원"),
        ("메타버스대학원", "메타버스대학원"),
        ("시스템아키텍트대학원", "시스템아키텍트대학원"),
        # 인문사회융합과학대학
        #  학사
        ("디지털인문사회과학부", "디지털인문사회과학부"),
        #  석사, 박사
        ("문화기술대학원", "문화기술대학원"),
        ("문술미래전략대학원", "문술미래전략대학원"),
        ("과학기술정책대학원", "과학기술정책대학원"),
        # 경영대학
        #  학사
        ("경영공학부", "경영공학부"),
        ("기술경영학부", "기술경영학부"),
        #  석사, 박사
        ("KAIST경영전문대학원", "KAIST경영전문대학원"),
        ("금융전문대학원", "금융전문대학원"),
        ("경영자과정", "경영자과정"),
        ("기술경영전문대학원", "기술경영전문대학원"),
        ("글로벌디지털혁신대학원", "글로벌디지털혁신대학원"),
        ("바이오혁신경영전문대학원", "바이오혁신경영전문대학원"),
        # 융합인재학부
        #  학사
        ("융합인재학부", "융합인재학부"),
        # 안보융합원
        #  석사, 박사
        ("안보과학기술대학원", "안보과학기술대학원"),
        ("사이버안보기술대학원", "사이버안보기술대학원"),
        # 새내기과정
        #  학사
        ("새내기과정학부", "새내기과정학부"),
    ]

    user = models.OneToOneField(
        CustomUser, on_delete=models.CASCADE, related_name="profile", primary_key=True
    )
    user_name = models.CharField(max_length=100)  # 이름
    school = models.CharField(max_length=100)  # 학교
    current_academic_degree = models.CharField(max_length=10)  # 학력
    year = models.IntegerField()  # 입학연도
    major1 = models.CharField(
        max_length=100,
        choices=MAJOR_CHOICES,
    )  # 전공 1
    major2 = models.CharField(
        max_length=100,
        choices=MAJOR_CHOICES,
        blank=True,
        null=True,
    )  # 전공 2
    keywords = models.ManyToManyField(Keyword, blank=True)  # 키워드
    one_degree_count = models.IntegerField(default=0)  # 1촌 수
    introduction = models.TextField(default="", blank=True, max_length=1000)  # 소개
    image = models.ImageField(
        upload_to="profile_images/", blank=True, null=True
    )  # 프로필 이미지

    def __str__(self):
        return self.user_name


# 스킬 (프로필과 1:N)
class Skill(models.Model):
    skill = models.CharField(max_length=100)
    profile = models.ForeignKey(
        Profile, on_delete=models.CASCADE, related_name="skills"
    )

    def __str__(self):
        return self.skill


# Endorsement (스킬과 1:N)
class Endorsement(models.Model):
    skill = models.ForeignKey(
        Skill, on_delete=models.CASCADE, related_name="endorsements"
    )
    endorsed_by = models.ForeignKey(CustomUser, on_delete=models.CASCADE)  # 추천한 유저
    endorsed_at = models.DateTimeField(auto_now_add=True)  # 추천 날짜

    class Meta:
        unique_together = (
            "skill",
            "endorsed_by",
        )  # 동일한 유저가 같은 스킬을 여러 번 추천하는 것을 방지

    def __str__(self):
        return f"{self.endorsed_by.username} endorsed {self.skill.skill}"


# 프로젝트 카드
class ProjectCard(models.Model):
    title = models.TextField(max_length=100)  # 제목
    keywords = models.ManyToManyField(
        "Keyword", related_name="project_cards", blank=True
    )
    accepted_users = models.ManyToManyField(
        "CustomUser", related_name="project_cards", blank=True
    )
    bookmarked_users = models.ManyToManyField(
        "CustomUser", related_name="bookmarked_project_cards", blank=True
    )
    creator = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name="created_project_cards",
    )  # 관리자(생성자)
    created_at = models.DateTimeField(auto_now_add=True)  # 생성 시간
    start_date = models.DateField(null=True, blank=True)  # 시작 날짜 (선택적)
    end_date = models.DateField(null=True, blank=True)  # 종료 날짜 (선택적)
    description = models.TextField(null=True, blank=True, default="")  # 소개

    def __str__(self):
        return self.title


class ProjectCardInvitation(models.Model):
    # 좌: db 저장 형태, 우: 실제 표시 형태
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("accepted", "Accepted"),
        ("rejected", "Rejected"),
    ]
    project_card = models.ForeignKey(
        ProjectCard,
        on_delete=models.CASCADE,
        related_name="invitations",
        blank=True,
        null=True,
    )  # 초대와 연결된 경험
    inviter = models.ForeignKey(
        "CustomUser",
        on_delete=models.CASCADE,
        related_name="sent_projectCard_invitations",
    )  # 초대 한 사람
    invitee = models.ForeignKey(
        "CustomUser",
        on_delete=models.CASCADE,
        related_name="received_projectCard_invitations",
    )  # 초대 받은 사람
    created_at = models.DateTimeField(auto_now_add=True)  # 경험 초대가 생성된 시각
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="pending")

    def __str__(self):
        return f"{self.project_card}, inviter: {self.inviter}, invitee: {self.invitee}, status: {self.status}"


# 경험 (프로필과 M:N)
class Experience(models.Model):
    title = models.TextField()  # 경험 제목
    is_team_project = models.BooleanField(
        default=False, help_text="Check if this is a team project."
    )  # New field to indicate if it's a team project
    accepted_users = models.ManyToManyField(
        "CustomUser", related_name="accepted_users", blank=True
    )
    creator = models.ForeignKey(
        CustomUser,
        on_delete=models.SET_NULL,
        related_name="created_experiences",
        null=True,
    )  # 경험 생성자(소유자)
    created_at = models.DateTimeField(auto_now_add=True)  # 경험 생성 시간

    def __str__(self):
        return self.title


# 각 유저별 경험 (경험과 1:N)
class ExperienceDetail(models.Model):
    experience = models.ForeignKey(
        Experience, on_delete=models.CASCADE, related_name="details"
    )  # 특정 경험과 연결됨
    tags = models.ManyToManyField(
        "Keyword", related_name="experiences", blank=True
    )  # 경험 태그들 (다대다 관계)
    user = models.ForeignKey(
        "CustomUser", on_delete=models.CASCADE, related_name="experience_details"
    )  # 사용자와 연결됨
    description = models.TextField()  # 사용자 별 개별 경험 소개
    skills_used = models.ManyToManyField(
        "Skill", related_name="experience_details", blank=True
    )  # 사용자 별 사용한 스킬들
    start_date = models.DateField(null=True, blank=True)  # 경험 시작 날짜 (선택적)
    end_date = models.DateField(null=True, blank=True)  # 경험 종료 날짜 (선택적)

    def __str__(self):
        return f"{self.user.profile.user_name}'s details for {self.experience.title}"


class ExperienceInvitation(models.Model):
    # 좌: db 저장 형태, 우: 실제 표시 형태
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("accepted", "Accepted"),
        ("rejected", "Rejected"),
    ]
    experience = models.ForeignKey(
        Experience,
        on_delete=models.CASCADE,
        related_name="pending_invitations",
        blank=True,
        null=True,
    )  # 초대와 연결된 경험
    inviter = models.ForeignKey(
        "CustomUser", on_delete=models.CASCADE, related_name="sent_invitations"
    )  # 초대 한 사람
    invitee = models.ForeignKey(
        "CustomUser", on_delete=models.CASCADE, related_name="received_invitations"
    )  # 초대 받은 사람
    created_at = models.DateTimeField(auto_now_add=True)  # 경험 초대가 생성된 시각
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="pending")

    def __str__(self):
        return f"{self.experience}, inviter: {self.inviter}, invitee: {self.invitee}, status: {self.status}"


# 포트폴리오 링크 (프로필과 1:N)
class PortfolioLink(models.Model):
    portfolio_link = models.URLField()
    profile = models.ForeignKey(
        Profile, on_delete=models.CASCADE, related_name="portfolio_links"
    )

    def __str__(self):
        return self.portfolio_link


class InvitationLink(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("accepted", "Accepted"),
        ("expired", "Expired"),
    ]

    inviter = models.ForeignKey(
        CustomUser, on_delete=models.CASCADE, related_name="invitation_links"
    )
    invitee_name = models.CharField(max_length=255)
    invitee_id = models.IntegerField(
        null=True, blank=True
    )  # 나중에 다시 unique=True 해야됨
    link = models.CharField(max_length=255, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default="pending",
    )

    class Meta:
        unique_together = ("inviter", "link")

    def __str__(self):
        return self.link


# 2명의 유저 간 1:1 대화방 = Conversation
class Conversation(models.Model):
    user_1 = models.ForeignKey(
        CustomUser,
        on_delete=models.SET_NULL,  # 유저가 탈퇴해도 데이터는 남김
        null=True,
        related_name="user_1",
    )
    user_2 = models.ForeignKey(
        CustomUser, on_delete=models.SET_NULL, null=True, related_name="user_2"
    )
    deleted_for_user1 = models.BooleanField(default=False)
    deleted_for_user2 = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("user_1", "user_2")

    def __str__(self):
        return f"Conversation between {self.user_1 or '탈퇴한 사용자'} and {self.user_2 or '탈퇴한 사용자'}"


# Conversation과 1:N 관계 (메시지와 발신자를 저장)
class Message(models.Model):
    conversation = models.ForeignKey(
        Conversation, on_delete=models.CASCADE, related_name="messages"
    )
    sender = models.ForeignKey(
        CustomUser,
        on_delete=models.SET_NULL,
        related_name="sender",
        null=True,
        blank=True,
    )
    message = models.TextField(blank=True)
    image = models.ImageField(upload_to="message_images/", null=True, blank=True)
    is_read = models.BooleanField(default=False)
    is_system = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    visible_for_user1 = models.BooleanField(default=True)
    visible_for_user2 = models.BooleanField(default=True)

    def __str__(self):
        return f"Message from {self.sender or '탈퇴한 사용자'} in {self.conversation}"


# user A가 user B에게 1촌 신청해서 수락 된 경우. from_user: A, to_user: B
class Friend(models.Model):
    # 좌: db 저장 형태, 우: 실제 표시 형태
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("accepted", "Accepted"),
        ("rejected", "Rejected"),
    ]
    from_user = models.ForeignKey(
        CustomUser, on_delete=models.CASCADE, related_name="friends_from"
    )
    to_user = models.ForeignKey(
        CustomUser, on_delete=models.CASCADE, related_name="friends_to"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="pending")

    class Meta:
        unique_together = ("to_user", "from_user", "status")

    @classmethod
    def create_or_replace_friendship(cls, from_user, to_user, status="pending"):
        # 거절 상태의 친구 관계는 항상 삭제
        rejected_friendship = cls.objects.filter(
            models.Q(from_user=from_user, to_user=to_user)
            | models.Q(from_user=to_user, to_user=from_user),
            status="rejected",
        ).first()

        if rejected_friendship:
            rejected_friendship.delete()

        # 기존에 친구 관계가 있는지 확인
        any_friendship = cls.objects.filter(
            models.Q(from_user=from_user, to_user=to_user)
            | models.Q(from_user=to_user, to_user=from_user)
        ).first()

        # 기존에 친구 관계가 있다면 상태만 status로 업데이트
        if any_friendship:
            any_friendship.status = status
            any_friendship.save()  # 변경사항 저장
            return any_friendship

        # 기존 친구 관계가 없다면 status 상태로 생성
        new_friendship = cls.objects.create(
            from_user=from_user, to_user=to_user, status=status
        )
        return new_friendship

    def __str__(self):
        return f"{self.from_user.email} is friends with {self.to_user.email}, status: {self.status}"


class Notification(models.Model):
    NOTIFICATION_TYPE_CHOICES = [
        # 초대한 사람이 가입, 초대링크 만료
        ("invitation_register", "Invitation Register"), # done
        ("invitation_expired", "Invitation Expired"), # done
        
        # 일촌 신청 수락, 거절, 요청
        ("friend_accept", "Friend Accept"), # done
        ("friend_reject", "Friend Reject"), # done
        ("friend_request", "Friend Request"), # done
        
        # Project Card 초대, 수락, 거절, 수정, 매칭 추천
        ("project_card_invite", "ProjectCard Invite"),
        ("project_card_accept", "ProjectCard Accept"),
        ("project_card_reject", "ProjectCard Reject"),
        ("project_card_update", "ProjectCard Update"),
        ("project_card_recommend", "ProjectCard Recommend"),
        
        # Post 추가(팀원), 수정(팀원), 추가(저장), 수정(저장), 좋아요(생성자)
        ("post_create_team", "Post Create Team"), # postserializer, done
        ("post_update_team", "Post Update Team"), # postserializer, done
        ("post_create_save", "Post Create Save"), # postserializer, done
        ("post_update_save", "Post Update Save"), # postserializer, done
        ("post_like", "Post Like"),
        
        # Comment 추가(생성자), 대댓글 추가(댓글작성자), 수정(생성자), 대댓글 수정(댓글작성자)
        ("comment_create", "Comment Create"),
        ("comment_child_create", "Comment Child Create"),
        ("comment_update", "Comment Update"),
        ("comment_child_update", "Comment Child Update"),
        
        # Conversation (todo)
        ("new_message", "New Message"),
    ]

    user = models.ForeignKey(
        CustomUser, on_delete=models.CASCADE, related_name="notifications"
    )
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)
    notification_type = models.CharField(
        max_length=30, choices=NOTIFICATION_TYPE_CHOICES
    )
    related_user_id = models.IntegerField(null=True, blank=True)
    related_post_id = models.IntegerField(null=True, blank=True)
    related_project_card_id = models.IntegerField(null=True, blank=True)

    def __str__(self):
        return f"Notification for {self.user.email} - {self.message}"


class Inquiry(models.Model):
    user = models.ForeignKey(
        CustomUser, on_delete=models.CASCADE, related_name="inquiries"
    )
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Inquiry from {self.user.username} at {self.created_at}"


class SearchHistory(models.Model):
    user = models.ForeignKey(
        CustomUser, on_delete=models.CASCADE, related_name="search_histories"
    )
    keyword = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return (
            f'Search by {self.user.username} for "{self.keyword}" at {self.created_at}'
        )


class Report(models.Model):
    user = models.ForeignKey(
        CustomUser, on_delete=models.CASCADE, related_name="reports"
    )
    content = models.CharField(max_length=100)  # 신고 내용
    created_at = models.DateTimeField(auto_now_add=True)  # 생성 시간

    related_project_card_id = models.IntegerField(blank=True, null=True)
    related_post_id = models.IntegerField(blank=True, null=True)
    related_comment_id = models.IntegerField(blank=True, null=True)
    related_user_id = models.IntegerField(blank=True, null=True)

    def __str__(self):
        return f"Report by {self.user.email} - {self.content[:30]}..."
