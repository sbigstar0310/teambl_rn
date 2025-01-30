import api from "@/shared/api";

type RequestParams = {
    status: string; // 업데이트할 상태 (예: "accepted", "rejected")
};

type Response = api.Friend;

// 친구 요청을 받거(accepted)나 거절(rejected)하는 API
const updateFriend = async (
    friend_id: number,
    params: RequestParams
): Promise<api.Friend> => {
    try {
        // PUT 요청으로 친구 관계 업데이트
        const response = await api.put<Response>(
            `friend/${friend_id}/update/`,
            params
        );

        const updatedFriendship = response.data;

        console.log(
            "Friend relationship updated successfully:",
            updatedFriendship
        );

        return updatedFriendship; // 업데이트된 친구 관계 반환
    } catch (error) {
        console.error("Failed to update friend relationship:", error);
        throw error; // 에러 발생 시 호출한 곳에서 처리할 수 있도록 다시 던짐
    }
};

export default updateFriend;
