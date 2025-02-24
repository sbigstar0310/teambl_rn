from .models import Friend
from collections import defaultdict, deque
from django.db.models import Q
from hashids import Hashids
from django.conf import settings
import boto3

# Hashids 초기화 (settings에서 키를 가져와 사용)
hashids = Hashids(salt=settings.SECRET_KEY_FERNET, min_length=8)


def get_user_distance(user, target_user, max_distance=3):
    """BFS를 사용하여 user와 target_user 사이의 촌수를 계산합니다."""
    """Target_user와의 거리가 4촌 이상인 경우 None을 return"""
    """ Max Distance를 설정하여 최대 검색 촌수를 사전에 정할 수 있습니다."""
    queue = deque([(user, 0)])
    visited = {user}

    while queue:
        current_user, distance = queue.popleft()

        # 촌수가 4촌 이상이거나, max_distance 이상인 경우 정지
        if distance > 3 or distance > max_distance:
            break

        if current_user == target_user:
            return distance

        friends = Friend.objects.filter(
            (Q(from_user=current_user) & Q(status="accepted"))
            | (Q(to_user=current_user) & Q(status="accepted"))
        )

        for friend in friends:
            friend_user = (
                friend.to_user if friend.from_user == current_user else friend.from_user
            )
            if friend_user not in visited:
                visited.add(friend_user)
                queue.append((friend_user, distance + 1))

    return None  # target_user를 3촌 이내에 찾지 못한 경우


def get_user_distances(user, target_users_id, max_distance=3):
    """BFS를 사용하여 user와 target_users 사이의 촌수를 계산합니다.

    - 모든 친구 관계를 한 번 로드하고 메모리에서 탐색.
    - target_users는 여러 대상 사용자를 포함하는 iterable입니다.
    - 최대 거리(max_distance)를 초과하거나 target_user를 찾을 수 없으면 None 반환.
    """

    # 모든 친구 관계를 메모리에 로드
    friend_data = Friend.objects.filter(status="accepted").values(
        "from_user", "to_user"
    )
    friend_map = defaultdict(set)

    for relation in friend_data:
        friend_map[relation["from_user"]].add(relation["to_user"])
        friend_map[relation["to_user"]].add(relation["from_user"])

    # cache = {}  # key: (user_id, target_user_id), value: Int
    result = {}  # key: target_user_id, value: Int (default None)

    for target_user_id in target_users_id:
        # 캐시에 값이 이미 존재하는 경우
        # if (user.id, target_user_id) in cache:
        #    result[target_user_id] = cache[(user.id, target_user_id)]
        #    continue

        # BFS 초기화
        queue = deque([(user.id, 0)])  # user와 target_user는 ID로 비교
        visited = {user.id}
        found = False

        while queue:
            current_user_id, distance = queue.popleft()
            # cache[(user.id, current_user_id)] = distance  # 캐시에 저장

            # 최대 거리를 초과하는 경우 While 종료
            if distance > 3 or distance > max_distance:
                break

            # 대상 사용자 찾음
            if current_user_id == target_user_id:
                result[target_user_id] = distance
                found = True
                # cache[(user.id, target_user_id)] = distance  # 캐시에 저장
                break  # 루프 종료

            # 친구 추가
            for friend_id in friend_map[current_user_id]:
                if friend_id not in visited:
                    visited.add(friend_id)
                    queue.append((friend_id, distance + 1))

        if not found:
            # 대상 사용자를 찾지 못한 경우
            result[target_user_id] = None
            # cache[(user.id, target_user_id)] = None  # 캐시에 저장

    return result


# 현재 유저와 특정 촌수에 있는 유저 리스트를 반환
def get_users_by_degree(user, target_degree):
    # 모든 친구 관계를 메모리에 로드
    friend_data = Friend.objects.filter(status="accepted").values(
        "from_user", "to_user"
    )
    friend_map = defaultdict(set)

    for relation in friend_data:
        friend_map[relation["from_user"]].add(relation["to_user"])
        friend_map[relation["to_user"]].add(relation["from_user"])

    # 결과 유저 리스트
    result_list = []

    # Check if target_degree is valid
    if not (1 <= target_degree <= 3):
        return []

    # BFS 초기화
    queue = deque([(user, 0)])
    visited = {user}

    while queue:
        current_user_id, degree = queue.popleft()

        # 최대 거리를 초과하는 경우 While 종료
        if degree > 3:
            break

        # 대상 사용자가 target 촌수인 경우
        if degree == target_degree:
            result_list.append(current_user_id)
            continue

        # 사용자의 친구를 큐에 추가
        for friend_id in friend_map[current_user_id]:
            if friend_id not in visited:
                visited.add(friend_id)
                queue.append((friend_id, degree + 1))

    return result_list


# Friend가 변경될 때 (create, update, delete) Profile 모델의 1촌 수도 같이 업데이트 해주는 함수.
def update_profile_one_degree_count(user):
    profile = user.profile  # User를 통해 Profile에 접근
    profile.one_degree_count = Friend.objects.filter(
        Q(from_user=user) | Q(to_user=user), status="accepted"
    ).count()
    profile.save()


# 암호화 함수
def encrypt_id_short(id_value):
    return hashids.encode(id_value)


# 복호화 함수
def decrypt_id_short(encrypted_id):
    decoded = hashids.decode(encrypted_id)
    if len(decoded) == 0:
        raise ValueError("Invalid ID")
    return decoded[0]


# BFS를 통해 start_user와 target_user의 모든 중간 경로 배열을 반환합니다.
# 만약 경로가 4촌 이상인 경우 빈 리스트를 반환합니다.
# 예시, 성대규와 권대용의 모든 경로 배열이 다음과 같을 때,
# 성대규 -> 카리나 -> 권대용, 성대규 -> 아이유 -> 권대용인 경우.
# 반환값, [[카리나], [아이유]]
def find_paths_to_target_user(start_user, target_user):
    # 모든 친구 관계를 가져옴 (accepted 상태만)
    friend_data = Friend.objects.filter(status="accepted").values(
        "from_user_id", "to_user_id"
    )

    # 친구 관계 맵 생성 (양방향 관계 포함)
    friend_map = defaultdict(set)
    for relation in friend_data:
        friend_map[relation["from_user_id"]].add(relation["to_user_id"])
        friend_map[relation["to_user_id"]].add(relation["from_user_id"])  # 양방향 저장

    # 결과 경로를 저장할 리스트
    result_paths = []

    # Min path length
    min_path_length = 5

    # BFS를 위한 큐 초기화 (시작 사용자, 경로 히스토리 배열)
    queue = deque([(start_user.id, [start_user.id])])

    while queue:
        last_path_user, path_history = queue.popleft()

        # 4촌 이상의 관계라면 중단
        if len(path_history) > 4 or len(path_history) > min_path_length:
            return result_paths

        # 타겟 유저에 도달한 경우
        if last_path_user == target_user.id:
            min_path_length = len(path_history)
            result_paths.append(path_history[1:-1])  # 시작 및 타겟 유저 제외
            continue

        # 친구 목록 가져오기
        for friend in friend_map[last_path_user]:
            if friend not in path_history:  # 중복 경로 방지
                queue.append((friend, path_history + [friend]))

    return result_paths


# ✅ AWS S3 클라이언트 생성
s3_client = boto3.client(
    "s3",
    aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
    aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
    region_name=settings.AWS_S3_REGION_NAME,
)


# AWS S3에 저장되어 있는 이미지를 삭제하는 함수
def delete_images_from_s3(images_to_delete: list):
    """
    주어진 이미지 리스트를 AWS S3에서만 삭제하는 함수.
    (Django DB와 무관)

    :param images_to_delete: 삭제할 이미지 경로 리스트 (예: ["uploads/img1.jpg", "uploads/img2.jpg"])
    """
    for image_path in images_to_delete:
        try:
            # ✅ AWS S3에서 이미지 삭제
            s3_client.delete_object(
                Bucket=settings.AWS_STORAGE_BUCKET_NAME,
                Key=image_path,  # S3에서 직접 삭제
            )
            print(f"✅ Deleted from S3: {image_path}")

        except Exception as e:
            print(f"❌ Error deleting {image_path} from S3: {e}")
