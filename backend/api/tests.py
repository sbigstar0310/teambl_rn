from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.core import mail
from .models import (
    CustomUser,
    Profile,
    Project,
    Friend,
    Skill,
    Keyword,
    Experience,
    ExperienceDetail,
)
from django.utils.timezone import now, timedelta
from django.db.models import Q
from datetime import datetime
import pytest

## TEST HELPER FUNCTIONS


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
):
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


## TEST FUNCTIONS


class CreateUserAloneViewTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = reverse("register-alone")  # URL 이름으로 동적 매핑
        self.valid_payload = {
            "email": "testuser01@kaist.ac.kr",
            "password": "securepassword123",
            "profile": {
                "user_name": "유저1",
                "school": "카이스트",
                "current_academic_degree": "학사",
                "year": 2020,
                "major1": "전산학부",
            },
        }

    def test_user_signup_success(self):
        # 정상적인 회원가입
        response = self.client.post(self.url, self.valid_payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # 생성된 사용자가 데이터베이스에 존재하는지 확인
        user = CustomUser.objects.get(email=self.valid_payload["email"])
        self.assertIsNotNone(user)
        self.assertFalse(user.is_staff)  # 일반 사용자로 가입

        # 이메일 발송 여부 확인
        self.assertEqual(len(mail.outbox), 1)  # 이메일이 1개 발송되었는지 확인
        self.assertIn(self.valid_payload["email"], mail.outbox[0].to)

    def test_invalid_signup(self):
        # 잘못된 데이터로 회원가입 시도
        response = self.client.post(self.url, {}, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        # 이메일 발송이 없음을 확인
        self.assertEqual(len(mail.outbox), 0)


class GetUserAllPathsAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()

        # 사용자 생성
        self.user1 = create_user_with_profile(
            "testuser01@kaist.ac.kr", "1234", user_name="유저1"
        )
        self.user2 = create_user_with_profile(
            "testuser02@kaist.ac.kr", "1234", user_name="유저2"
        )
        self.user3 = create_user_with_profile(
            "testuser03@kaist.ac.kr", "1234", user_name="유저3"
        )
        self.user4 = create_user_with_profile(
            "testuser04@kaist.ac.kr", "1234", user_name="유저4"
        )
        self.user5 = create_user_with_profile(
            "testuser05@kaist.ac.kr", "1234", user_name="유저5"
        )
        self.user6 = create_user_with_profile(
            "testuser06@kaist.ac.kr", "1234", user_name="유저6"
        )
        self.user7 = create_user_with_profile(
            "testuser07@kaist.ac.kr", "1234", user_name="유저7"
        )
        self.user8 = create_user_with_profile(
            "testuser08@kaist.ac.kr", "1234", user_name="유저8"
        )
        self.user9 = create_user_with_profile(
            "testuser09@kaist.ac.kr", "1234", user_name="유저9"
        )
        self.user10 = create_user_with_profile(
            "testuser10@kaist.ac.kr", "1234", user_name="유저10"
        )

        # 친구 관계 설정
        Friend.objects.create(
            from_user=self.user1, to_user=self.user2, status="accepted"
        )
        Friend.objects.create(
            from_user=self.user2, to_user=self.user3, status="accepted"
        )
        Friend.objects.create(
            from_user=self.user3, to_user=self.user4, status="accepted"
        )
        Friend.objects.create(
            from_user=self.user1, to_user=self.user5, status="accepted"
        )
        Friend.objects.create(
            from_user=self.user5, to_user=self.user3, status="accepted"
        )

        # API URL 생성
        self.valid_url = reverse(
            "get-all-user-paths", kwargs={"target_user_id": self.user4.id}
        )
        self.invalid_url = reverse(
            "get-all-user-paths", kwargs={"target_user_id": 9999}
        )

    def test_get_paths_success(self):
        # 로그인
        self.client.force_authenticate(user=self.user1)

        # 요청 URL과 반환값
        valid_url_list = [
            reverse("get-all-user-paths", kwargs={"target_user_id": self.user4.id}),
            reverse("get-all-user-paths", kwargs={"target_user_id": self.user3.id}),
            reverse("get-all-user-paths", kwargs={"target_user_id": self.user2.id}),
        ]
        valid_data_list = [
            {
                "paths_name": [["유저2", "유저3"], ["유저5", "유저3"]],
                "paths_id": [[2, 3], [5, 3]],
                "current_user_id": 1,
                "target_user_id": 4,
            },
            {
                "paths_name": [["유저2"], ["유저5"]],
                "paths_id": [[2], [5]],
                "current_user_id": 1,
                "target_user_id": 3,
            },
            {
                "paths_name": [[]],
                "paths_id": [[]],
                "current_user_id": 1,
                "target_user_id": 2,
            },
        ]

        for index, url in enumerate(valid_url_list):
            # 요청 전송
            response = self.client.get(url)

            # 응답 검증
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            data = response.json()
            self.assertEqual(data, valid_data_list[index])

    def test_get_paths_target_not_found(self):
        # 로그인
        self.client.force_authenticate(user=self.user1)

        # 잘못된 타겟 유저 ID 요청
        response = self.client.get(self.invalid_url)

        # 응답 검증
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        data = response.json()
        self.assertIn("error", data)
        self.assertEqual(data["error"], "Target user not found.")

    def test_get_paths_not_authenticated(self):
        # 비인증 요청
        response = self.client.get(self.valid_url)

        # 인증 실패 응답 확인
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class NewUserSuggestionViewTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()

        # API url
        self.url = reverse("new-user-suggestions")

        # 오늘 날짜 및 이번 주 월요일 계산
        self.today = now().date()
        self.monday = self.today - timedelta(days=self.today.weekday())

        # 사용자 생성
        self.user1 = create_user_with_profile(
            email="testuser01@kaist.ac.kr", password="1234", user_name="유저1"
        )
        self.user2 = create_user_with_profile(
            email="testuser02@kaist.ac.kr", password="1234", user_name="유저2"
        )
        self.user3 = create_user_with_profile(
            email="testuser03@kaist.ac.kr", password="1234", user_name="유저3"
        )
        self.user4 = create_user_with_profile(
            email="testuser04@kaist.ac.kr",
            password="1234",
            user_name="유저4",
            date_joined=self.monday - timedelta(days=1),
        )
        self.user5 = create_user_with_profile(
            email="testuser05@kaist.ac.kr", password="1234", user_name="유저5"
        )

        # 친구 관계 설정
        Friend.objects.create(
            from_user=self.user1, to_user=self.user2, status="accepted"
        )
        Friend.objects.create(
            from_user=self.user2, to_user=self.user3, status="accepted"
        )
        Friend.objects.create(
            from_user=self.user3, to_user=self.user4, status="accepted"
        )
        Friend.objects.create(
            from_user=self.user2, to_user=self.user5, status="accepted"
        )

        # 관심사 키워드 생성 및 할당
        self.keyword_python = Keyword.objects.create(keyword="Python")
        self.keyword_django = Keyword.objects.create(keyword="Django")
        self.keyword_drum = Keyword.objects.create(keyword="Drum")

        self.user1.profile.keywords.add(self.keyword_python, self.keyword_drum)
        self.user2.profile.keywords.add(self.keyword_python, self.keyword_django)
        self.user4.profile.keywords.add(self.keyword_drum)
        self.user5.profile.keywords.add(self.keyword_drum)

        # 전공 설정
        self.user1.profile.major1 = "물리학과"
        self.user1.profile.save()
        self.user2.profile.major1 = "물리학과"
        self.user2.profile.save()
        self.user3.profile.major2 = "물리학과"
        self.user3.profile.save()
        self.user4.profile.major2 = "물리학과"
        self.user3.profile.save()

        # 스킬 생성 및 할당
        Skill.objects.create(skill="React", profile=self.user1.profile)
        Skill.objects.create(skill="Swift", profile=self.user1.profile)
        Skill.objects.create(skill="React", profile=self.user2.profile)
        Skill.objects.create(skill="Skill_example1", profile=self.user2.profile)
        Skill.objects.create(skill="react", profile=self.user3.profile)
        Skill.objects.create(skill="Swift", profile=self.user3.profile)
        Skill.objects.create(skill="swift", profile=self.user4.profile)

        # 경험 카드 생성 및 할당
        experience_1 = Experience.objects.create(
            title="Exp_title_1",
            creator=self.user1,
        )
        experience_1.accepted_users.set([self.user1, self.user2])

        experience_2 = Experience.objects.create(
            title="Exp_title_2",
            creator=self.user3,
        )
        experience_2.accepted_users.set([self.user3])

        # 경험 상세 생성 및 할당
        experience_detail_1 = ExperienceDetail.objects.create(
            experience=experience_1,
            user=self.user1,
            description="경험1애 유저1의 경험 상세 내용",
        )
        experience_detail_1.tags.set([self.keyword_django, self.keyword_drum])

        experience_detail_2 = ExperienceDetail.objects.create(
            experience=experience_1,
            user=self.user2,
            description="경험1에 유저2의 경험 상세 내용",
        )
        experience_detail_2.tags.set([self.keyword_django])

        experience_detail_3 = ExperienceDetail.objects.create(
            experience=experience_2,
            user=self.user3,
            description="경험2에 유저3의 경험 상세 내용",
        )
        experience_detail_3.tags.set([self.keyword_drum])

        # 토큰 인증 추가 (로그인)
        self.client.force_authenticate(user=self.user1)

    # 1. 2촌 유저 테스트
    def test_second_degree_users(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # 2촌 유저 검증
        second_degree = response.data["secondDegree"]
        self.assertTrue(len(second_degree) > 0)  # 2촌 유저가 존재해야 함
        self.assertTrue(self.user3.id in [user["id"] for user in second_degree])
        self.assertTrue(self.user5.id in [user["id"] for user in second_degree])

    # 2. 관심사 키워드 테스트
    def test_keyword_matching_users(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        keyword_matches = response.data["keyword"]

        # Python 키워드 검증
        self.assertIn("Python", keyword_matches)
        python_users = keyword_matches["Python"]
        self.assertTrue(len(python_users) > 0)
        self.assertTrue(self.user2.id in [user["id"] for user in python_users])

        # Drum 키워드 검증
        self.assertIn("Drum", keyword_matches)
        drum_users = keyword_matches["Drum"]
        self.assertTrue(len(drum_users) > 0)
        self.assertTrue(self.user5.id in [user["id"] for user in drum_users])

    # 3. 전공 일치 테스트
    def test_major_matching_users(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        major_matches = response.data["major"]

        # 전공 검증
        self.assertIn("물리학과", major_matches)
        cs_users = major_matches["물리학과"]
        self.assertTrue(len(cs_users) > 0)
        self.assertTrue(self.user2.id in [user["id"] for user in cs_users])
        self.assertTrue(self.user3.id in [user["id"] for user in cs_users])

    # 4. 스킬 일치 테스트
    def test_skill_matching_users(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        skill_matches = response.data["skill"]

        # React 스킬 검증
        self.assertIn("React", skill_matches)
        react_users = skill_matches["React"]
        self.assertTrue(len(react_users) > 0)
        self.assertTrue(self.user2.id in [user["id"] for user in react_users])
        self.assertTrue(self.user3.id in [user["id"] for user in react_users])

        # Swift 스킬 검증
        self.assertIn("Swift", skill_matches)
        swift_users = skill_matches["Swift"]
        self.assertTrue(len(swift_users) > 0)
        self.assertTrue(self.user3.id in [user["id"] for user in swift_users])

    # 5. 경험 키워드 일치 테스트
    def test_experience_keyword_matching_users(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        exp_keyword_matches = response.data["experience_keyword"]

        # Python 키워드 검증
        self.assertIn("Django", exp_keyword_matches)
        django_users = exp_keyword_matches["Django"]
        self.assertTrue(len(django_users) > 0)
        self.assertTrue(self.user2.id in [user["id"] for user in django_users])

        # Drum 키워드 검증
        self.assertIn("Drum", exp_keyword_matches)
        drum_users = exp_keyword_matches["Drum"]
        self.assertTrue(len(drum_users) > 0)
        self.assertTrue(self.user3.id in [user["id"] for user in drum_users])

    # 6. 가입일 검증
    def test_user_joined_within_week(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # 모든 추천 유저들이 월요일 이후 가입했는지 확인
        for category in [
            "secondDegree",
            "keyword",
            "major",
            "skill",
            "experience_keyword",
        ]:
            data = response.data[category]
            if isinstance(data, dict):
                # 딕셔너리 (키워드, 전공, 스킬)
                for key, users in data.items():
                    for user in users:
                        self.assertGreaterEqual(user["date_joined"].date(), self.monday)
            else:
                # 리스트 (2촌 유저)
                for user in data:
                    self.assertGreaterEqual(user["date_joined"].date(), self.monday)


class SearchUsersAPIViewTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()

        # API url
        self.url = reverse("user-search")

        # 오늘 날짜 및 이번 주 월요일 계산
        self.today = now().date()
        self.monday = self.today - timedelta(days=self.today.weekday())

        # 사용자 생성
        self.user1 = create_user_with_profile(
            email="testuser01@kaist.ac.kr", password="1234", user_name="유저1"
        )
        self.user2 = create_user_with_profile(
            email="testuser02@kaist.ac.kr", password="1234", user_name="유저2"
        )
        self.user3 = create_user_with_profile(
            email="testuser03@kaist.ac.kr", password="1234", user_name="유저3"
        )
        self.user4 = create_user_with_profile(
            email="testuser04@kaist.ac.kr",
            password="1234",
            user_name="유저4",
            date_joined=self.monday - timedelta(days=1),
        )
        self.user5 = create_user_with_profile(
            email="testuser05@kaist.ac.kr",
            password="1234",
            user_name="유저5",
            date_joined=self.monday - timedelta(days=1),
        )

        # 친구 관계 설정
        Friend.objects.create(
            from_user=self.user1, to_user=self.user2, status="accepted"
        )
        Friend.objects.create(
            from_user=self.user2, to_user=self.user3, status="accepted"
        )
        Friend.objects.create(
            from_user=self.user3, to_user=self.user4, status="accepted"
        )
        Friend.objects.create(
            from_user=self.user2, to_user=self.user5, status="accepted"
        )

        # 유저 프로필 설정
        self.user1.profile.school = "카이스트"
        self.user1.profile.current_academic_degree = "학사"
        self.user1.profile.major1 = "물리학과"
        self.user1.profile.save()

        self.user2.profile.school = "충남대"
        self.user2.profile.current_academic_degree = "학사"
        self.user2.profile.major1 = "물리학과"
        self.user2.profile.save()

        self.user3.profile.school = "카이스트"
        self.user3.profile.current_academic_degree = "석사"
        self.user3.profile.major2 = "물리학과"
        self.user3.profile.save()

        self.user4.profile.school = "카이스트"
        self.user4.profile.current_academic_degree = "박사"
        self.user4.profile.major2 = "물리학과"
        self.user4.profile.save()

        # 관심사 키워드 생성 및 할당
        self.keyword_python = Keyword.objects.create(keyword="Python")
        self.keyword_django = Keyword.objects.create(keyword="Django")
        self.keyword_drum = Keyword.objects.create(keyword="Drum")

        self.user1.profile.keywords.add(self.keyword_python, self.keyword_drum)
        self.user2.profile.keywords.add(self.keyword_python, self.keyword_django)
        self.user3.profile.keywords.add()
        self.user4.profile.keywords.add(self.keyword_drum)
        self.user5.profile.keywords.add(self.keyword_drum)

        # 스킬 생성 및 할당
        self.skill_react_user1 = Skill.objects.create(
            skill="React", profile=self.user1.profile
        )
        self.skill_swift_user1 = Skill.objects.create(
            skill="Swift", profile=self.user1.profile
        )
        self.skill_react_user2 = Skill.objects.create(
            skill="React", profile=self.user2.profile
        )
        self.skill_figma_user2 = Skill.objects.create(
            skill="figma", profile=self.user2.profile
        )
        self.skill_react_user3 = Skill.objects.create(
            skill="react", profile=self.user3.profile
        )
        self.skill_swift_user3 = Skill.objects.create(
            skill="Swift", profile=self.user3.profile
        )
        self.skill_swift_user4 = Skill.objects.create(
            skill="swift", profile=self.user4.profile
        )

        # 토큰 인증 추가 (로그인)
        self.client.force_authenticate(user=self.user1)

    def tearDown(self):
        # 테스트 데이터 초기화
        CustomUser.objects.all().delete()
        Profile.objects.all().delete()

        return super().tearDown()

    # 테스트 1: 검색 쿼리 필터링 (키워드, 이름, 학교, 학력, 전공1, 전공2)
    @pytest.mark.timeout(5)
    def test_user_search_query(self):
        data = {"q": "카이스트", "degree": [], "majors": []}
        response = self.client.post(self.url, data, format="json")
        # print(response.data)

        # 응답 코드 검증
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # 검색 결과 검증
        results = response.data.get("results", [])
        self.assertTrue(len(results) > 0)  # 결과가 비어 있지 않은지 확인

        # 'user' 값 검증
        expected_user_ids = {self.user3.id, self.user4.id}
        result_user_ids = {result["user"]["id"] for result in results}
        self.assertTrue(expected_user_ids.issubset(result_user_ids))
        self.assertEqual(
            expected_user_ids, result_user_ids
        )  # 가입날짜 순서대로 정렬되어 있는지 검증

        # 'new_user' 값 검증
        new_user_ids = {self.user3.id}
        result_new_user_ids = {
            result["user"]["id"] for result in results if result["new_user"]
        }
        self.assertTrue(new_user_ids.issubset(result_new_user_ids))

    # 테스트 2: 촌수 필터링 (1촌, 2촌, 3촌)
    @pytest.mark.timeout(5)
    def test_user_search_degree(self):
        data = {"q": "", "degree": [2], "majors": []}
        response = self.client.post(self.url, data, format="json")
        # print(response.data)

        # 응답 코드 검증
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # 검색 결과 검증
        results = response.data.get("results", [])
        self.assertTrue(len(results) > 0)  # 결과가 비어 있지 않은지 확인

        # 'user' 값 검증
        expected_user_ids = {self.user3.id, self.user5.id}
        result_user_ids = {result["user"]["id"] for result in results}
        self.assertTrue(expected_user_ids.issubset(result_user_ids))
        self.assertEqual(
            expected_user_ids, result_user_ids
        )  # 가입날짜 순서대로 정렬되어 있는지 검증

        # 'new_user' 값 검증
        new_user_ids = {self.user3.id}
        result_new_user_ids = {
            result["user"]["id"] for result in results if result["new_user"]
        }
        self.assertTrue(new_user_ids.issubset(result_new_user_ids))


class SearchProjectsAPIViewTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()

        # API url
        self.url = reverse("project-search")

        # 오늘 날짜 및 이번 주 월요일 계산
        self.today = now().date()
        self.monday = self.today - timedelta(days=self.today.weekday())

        # 사용자 생성
        self.user1 = create_user_with_profile(
            email="testuser01@kaist.ac.kr", password="1234", user_name="유저1"
        )
        self.user2 = create_user_with_profile(
            email="testuser02@kaist.ac.kr", password="1234", user_name="유저2"
        )
        self.user3 = create_user_with_profile(
            email="testuser03@kaist.ac.kr", password="1234", user_name="유저3"
        )
        self.user4 = create_user_with_profile(
            email="testuser04@kaist.ac.kr",
            password="1234",
            user_name="유저4",
            date_joined=self.monday - timedelta(days=1),
        )
        self.user5 = create_user_with_profile(
            email="testuser05@kaist.ac.kr",
            password="1234",
            user_name="유저5",
            date_joined=self.monday - timedelta(days=1),
        )

        # 친구 관계 설정
        Friend.objects.create(
            from_user=self.user1, to_user=self.user2, status="accepted"
        )
        Friend.objects.create(
            from_user=self.user2, to_user=self.user3, status="accepted"
        )
        Friend.objects.create(
            from_user=self.user3, to_user=self.user4, status="accepted"
        )
        Friend.objects.create(
            from_user=self.user2, to_user=self.user5, status="accepted"
        )

        # 관심사 키워드 생성
        self.keyword_python = Keyword.objects.create(keyword="Python")
        self.keyword_django = Keyword.objects.create(keyword="Django")
        self.keyword_drum = Keyword.objects.create(keyword="Drum")

        # 프로젝트 생성 및 할당
        self.project_user1 = Project.objects.create(
            user=self.user1, title="유저1의 게시물 제목", content="유저1의 게시물 내용"
        )
        self.project_user1.keywords.add(self.keyword_python, self.keyword_drum)

        self.project_user2_1 = Project.objects.create(
            user=self.user2, title="유저2의 게시물1 제목", content="유저2의 게시물 내용"
        )
        self.project_user2_1.keywords.add(self.keyword_python)

        self.project_user2_2 = Project.objects.create(
            user=self.user2, title="유저2의 게시물2 제목", content="유저2의 게시물 내용"
        )
        self.project_user2_2.keywords.add(self.keyword_python)

        self.project_user3 = Project.objects.create(
            user=self.user3, title="유저3의 게시물 제목", content="유저3의 게시물 내용"
        )
        self.project_user3.keywords.add(self.keyword_python)

        self.project_user4 = Project.objects.create(
            user=self.user4, title="유저4의 게시물 제목", content="유저4의 게시물 내용"
        )
        self.project_user4.keywords.add(self.keyword_python, self.keyword_drum)

        self.project_user5 = Project.objects.create(
            user=self.user5, title="유저5의 게시물 제목", content="유저5의 게시물 내용"
        )
        self.project_user5.keywords.add(self.keyword_drum)

        # 토큰 인증 추가 (로그인)
        self.client.force_authenticate(user=self.user1)

    def tearDown(self):
        # 테스트 데이터 초기화
        CustomUser.objects.all().delete()
        Profile.objects.all().delete()

        return super().tearDown()

    # 테스트 1: 검색 쿼리 필터링 (제목, 내용, 키워드)
    @pytest.mark.timeout(5)
    def test_user_search_query(self):
        data = {"q": "python", "degree": []}
        response = self.client.post(self.url, data, format="json")
        # print(response.data)

        # 응답 코드 검증
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # 검색 결과 검증
        results = response.data.get("results", [])
        self.assertTrue(len(results) > 0)  # 결과가 비어 있지 않은지 확인

        # project 'id' 값 검증
        expected_project_ids = {
            self.project_user1.project_id,
            self.project_user2_1.project_id,
            self.project_user2_2.project_id,
            self.project_user3.project_id,
            self.project_user4.project_id,
        }
        result_project_ids = {result["project_id"] for result in results}
        self.assertEqual(expected_project_ids, result_project_ids)

    # 테스트 2: 1촌 촌수 필터링 (1촌, 2촌, 3촌)
    @pytest.mark.timeout(5)
    def test_project_search_degree_1(self):
        data = {"q": "게시물", "degree": [1]}
        response = self.client.post(self.url, data, format="json")
        # print(response.data)

        # 응답 코드 검증
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # 검색 결과 검증
        results = response.data.get("results", [])
        self.assertTrue(len(results) > 0)  # 결과가 비어 있지 않은지 확인

        # project 'id' 값 검증
        expected_project_ids = {
            self.project_user2_1.project_id,
            self.project_user2_2.project_id,
        }
        result_project_ids = {result["project_id"] for result in results}
        self.assertEqual(expected_project_ids, result_project_ids)

    # 테스트 2: 2촌 촌수 필터링 (1촌, 2촌, 3촌)
    @pytest.mark.timeout(5)
    def test_project_search_degree_2(self):
        data = {"q": "게시물", "degree": [2]}
        response = self.client.post(self.url, data, format="json")
        # print(response.data)

        # 응답 코드 검증
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # 검색 결과 검증
        results = response.data.get("results", [])
        self.assertTrue(len(results) > 0)  # 결과가 비어 있지 않은지 확인

        # project 'id' 값 검증
        expected_project_ids = {
            self.project_user3.project_id,
            self.project_user5.project_id,
        }
        result_project_ids = {result["project_id"] for result in results}
        self.assertEqual(expected_project_ids, result_project_ids)


class SearchExperienceAPIViewTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()

        # API url
        self.url = reverse("experience-search")

        # 오늘 날짜 및 이번 주 월요일 계산
        self.today = now().date()
        self.monday = self.today - timedelta(days=self.today.weekday())

        # 사용자 생성
        self.user1 = create_user_with_profile(
            email="testuser01@kaist.ac.kr", password="1234", user_name="유저1"
        )
        self.user2 = create_user_with_profile(
            email="testuser02@kaist.ac.kr", password="1234", user_name="유저2"
        )
        self.user3 = create_user_with_profile(
            email="testuser03@kaist.ac.kr", password="1234", user_name="유저3"
        )
        self.user4 = create_user_with_profile(
            email="testuser04@kaist.ac.kr",
            password="1234",
            user_name="유저4",
            date_joined=self.monday - timedelta(days=1),
        )
        self.user5 = create_user_with_profile(
            email="testuser05@kaist.ac.kr",
            password="1234",
            user_name="유저5",
            date_joined=self.monday - timedelta(days=1),
        )

        # 친구 관계 설정
        Friend.objects.create(
            from_user=self.user1, to_user=self.user2, status="accepted"
        )
        Friend.objects.create(
            from_user=self.user2, to_user=self.user3, status="accepted"
        )
        Friend.objects.create(
            from_user=self.user3, to_user=self.user4, status="accepted"
        )
        Friend.objects.create(
            from_user=self.user2, to_user=self.user5, status="accepted"
        )

        # 관심사 키워드 생성 및 할당
        self.keyword_python = Keyword.objects.create(keyword="Python")
        self.keyword_django = Keyword.objects.create(keyword="Django")
        self.keyword_drum = Keyword.objects.create(keyword="Drum")

        # 스킬 생성 및 할당
        self.skill_react_user1 = Skill.objects.create(
            skill="React", profile=self.user1.profile
        )
        self.skill_swift_user1 = Skill.objects.create(
            skill="Swift", profile=self.user1.profile
        )
        self.skill_react_user2 = Skill.objects.create(
            skill="React", profile=self.user2.profile
        )
        self.skill_figma_user2 = Skill.objects.create(
            skill="figma", profile=self.user2.profile
        )
        self.skill_react_user3 = Skill.objects.create(
            skill="react", profile=self.user3.profile
        )
        self.skill_swift_user3 = Skill.objects.create(
            skill="Swift", profile=self.user3.profile
        )
        self.skill_swift_user4 = Skill.objects.create(
            skill="swift", profile=self.user4.profile
        )

        # 경험 카드 생성 및 할당
        experience_1 = Experience.objects.create(
            title="Exp_title_1",
            creator=self.user1,
        )
        experience_1.accepted_users.set([self.user1, self.user2])

        experience_2 = Experience.objects.create(
            title="Exp_title_2",
            creator=self.user3,
        )
        experience_2.accepted_users.set(
            [self.user2, self.user3, self.user4, self.user5]
        )

        # 경험 상세 생성 및 할당
        experience_detail_1 = ExperienceDetail.objects.create(
            experience=experience_1,
            user=self.user1,
            description="경험1에서 유저1의 경험 상세 내용",
        )
        experience_detail_1.tags.set([self.keyword_django, self.keyword_drum])
        experience_detail_1.skills_used.set(
            [self.skill_react_user1, self.skill_swift_user1]
        )

        experience_detail_2_1 = ExperienceDetail.objects.create(
            experience=experience_1,
            user=self.user2,
            description="경험1에 유저2의 경험 상세 내용",
        )
        experience_detail_2_1.tags.set([self.keyword_django])
        experience_detail_2_1.skills_used.set([self.skill_react_user2])

        experience_detail_2_2 = ExperienceDetail.objects.create(
            experience=experience_1,
            user=self.user2,
            description="경험2에 유저2의 경험 상세 내용",
        )
        experience_detail_2_2.tags.set([self.keyword_django])
        experience_detail_2_2.skills_used.set([self.skill_react_user2])

        experience_detail_3 = ExperienceDetail.objects.create(
            experience=experience_2,
            user=self.user3,
            description="경험2에 유저3의 경험 상세 내용",
        )
        experience_detail_3.tags.set([self.keyword_drum])
        experience_detail_3.skills_used.set([self.skill_react_user3])

        experience_detail_4 = ExperienceDetail.objects.create(
            experience=experience_2,
            user=self.user4,
            description="경험2에 유저4의 경험 상세 내용",
        )
        experience_detail_4.tags.set([self.keyword_drum])

        experience_detail_5 = ExperienceDetail.objects.create(
            experience=experience_2,
            user=self.user5,
            description="경험2에 유저5의 경험 상세 내용",
        )
        experience_detail_5.tags.set([self.keyword_drum])

        # 토큰 인증 추가 (로그인)
        self.client.force_authenticate(user=self.user1)

    # 테스트 1: 제목 검색 (정상 응답 코드 및 데이터 포함 여부 확인)
    @pytest.mark.timeout(5)
    def test_experience_search_title(self):
        data = {"q": "title", "degree": []}  # 검색어: Django
        response = self.client.post(self.url, data, format="json")
        # print(response.data)

        # 응답 코드 검증
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # 검색 결과 검증
        results = response.data.get("results", [])
        self.assertTrue(len(results) > 0)  # 결과가 비어 있지 않은지 확인

        # 'user' 값 검증
        expected_user_ids = {self.user2.id, self.user3.id, self.user4.id, self.user5.id}
        result_user_ids = {result["user"]["id"] for result in results}
        self.assertTrue(expected_user_ids.issubset(result_user_ids))
        self.assertEqual(
            expected_user_ids, result_user_ids
        )  # 가입날짜 순서대로 정렬되어 있는지 검증

        # 'new_user' 값 검증
        new_user_ids = {self.user2.id, self.user3.id}
        result_new_user_ids = {
            result["user"]["id"] for result in results if result["new_user"]
        }
        self.assertTrue(new_user_ids.issubset(result_new_user_ids))

    # 테스트 2: 키워드 검색
    @pytest.mark.timeout(5)
    def test_experience_search_keyword(self):
        data = {"q": "Drum", "degree": []}  # 검색어: Drum
        response = self.client.post(self.url, data, format="json")

        # 응답 코드 검증
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # 검색 결과 검증
        results = response.data.get("results", [])
        self.assertTrue(len(results) > 0)  # 결과가 비어 있지 않은지 확인

        # 'user' 값 검증
        expected_user_ids = {self.user3.id, self.user4.id, self.user5.id}
        result_user_ids = {result["user"]["id"] for result in results}
        self.assertTrue(expected_user_ids.issubset(result_user_ids))

        # 'new_user' 값 검증
        new_user_ids = {self.user3.id}
        result_new_user_ids = {
            result["user"]["id"] for result in results if result["new_user"]
        }
        self.assertTrue(new_user_ids.issubset(result_new_user_ids))

    # 테스트 3: 스킬 검색
    @pytest.mark.timeout(5)
    def test_experience_search_skill(self):
        data = {"q": "React", "degree": []}  # 검색어: swift
        response = self.client.post(self.url, data, format="json")

        # 응답 코드 검증
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # 검색 결과 검증
        results = response.data.get("results", [])
        self.assertTrue(len(results) > 0)  # 결과가 비어 있지 않은지 확인

        # 'user' 값 검증
        expected_user_ids = {self.user2.id, self.user3.id}
        result_user_ids = {result["user"]["id"] for result in results}
        self.assertTrue(expected_user_ids.issubset(result_user_ids))

        # 'new_user' 값 검증
        new_user_ids = {self.user2.id, self.user3.id}
        result_new_user_ids = {
            result["user"]["id"] for result in results if result["new_user"]
        }
        self.assertTrue(new_user_ids.issubset(result_new_user_ids))

    # 테스트 4: 빈 검색어 입력 (잘못된 요청)
    @pytest.mark.timeout(5)
    def test_experience_search_empty_query(self):
        data = {}  # 빈 데이터
        response = self.client.post(self.url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    # 테스트 5: 결과 없음 (유효한 요청이지만 결과가 없는 경우)
    @pytest.mark.timeout(5)
    def test_experience_search_no_results(self):
        data = {"q": "UNKOWN_QUERY", "degree": []}  # 존재하지 않는 키워드
        response = self.client.post(self.url, data, format="json")

        # 응답 코드 검증
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # 검색 결과 검증
        results = response.data.get("results", [])
        self.assertEqual(len(results), 0)  # 결과가 비어 있지 않은지 확인

    # 테스트 6: 1촌 촌수 필터링 (1촌, 2촌, 3촌)
    @pytest.mark.timeout(5)
    def test_experience_search_degree_1(self):
        data = {"q": "경험", "degree": [1]}
        response = self.client.post(self.url, data, format="json")
        # print(response.data)

        # 응답 코드 검증
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # 검색 결과 검증
        results = response.data.get("results", [])
        self.assertTrue(len(results) > 0)  # 결과가 비어 있지 않은지 확인

        # 'user' 값 검증
        expected_user_ids = {self.user2.id}
        result_user_ids = {result["user"]["id"] for result in results}
        self.assertTrue(expected_user_ids.issubset(result_user_ids))

        # 'new_user' 값 검증
        new_user_ids = {self.user2.id}
        result_new_user_ids = {
            result["user"]["id"] for result in results if result["new_user"]
        }
        self.assertTrue(new_user_ids.issubset(result_new_user_ids))

    # 테스트 7: 2촌 촌수 필터링 (1촌, 2촌, 3촌)
    @pytest.mark.timeout(5)
    def test_experience_search_degree_2(self):
        data = {"q": "경험", "degree": [2]}
        response = self.client.post(self.url, data, format="json")
        # print(response.data)

        # 응답 코드 검증
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # 검색 결과 검증
        results = response.data.get("results", [])
        self.assertTrue(len(results) > 0)  # 결과가 비어 있지 않은지 확인

        # 'user' 값 검증
        expected_user_ids = {self.user3.id, self.user5.id}
        result_user_ids = {result["user"]["id"] for result in results}
        self.assertTrue(expected_user_ids.issubset(result_user_ids))

        # 'new_user' 값 검증
        new_user_ids = {self.user3.id}
        result_new_user_ids = {
            result["user"]["id"] for result in results if result["new_user"]
        }
        self.assertTrue(new_user_ids.issubset(result_new_user_ids))
