from .models import Friend
from collections import defaultdict, deque
from django.db.models import Q


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
